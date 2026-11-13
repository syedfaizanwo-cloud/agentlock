import json

import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app as fastapi_app
from app.database.connection import Base, get_db
import app.database.models


ATTACKS = [
    "prompt_injection",
    "indirect_prompt_injection",
    "data_leakage",
    "tool_abuse",
    "memory_poisoning",
    "identity_privilege_abuse",
    "human_approval_bypass",
    "inter_agent_spoofing",
]


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(connection, record):
        cursor = connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    TestingSession = sessionmaker(
        bind=engine,
        autoflush=False,
        expire_on_commit=False,
    )

    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    fastapi_app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(fastapi_app) as test_client:
            yield test_client
    finally:
        fastapi_app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def register_demo_agent(client, agent_type):
    response = client.post(
        "/api/agents",
        json={
            "name": f"API Test {agent_type}",
            "description": "Isolated eight-attack API integration test",
            "agent_type": agent_type,
        },
    )

    assert response.status_code == 201, response.text
    return response.json()


@pytest.mark.parametrize(
    ("agent_type", "expected_status"),
    [
        ("vulnerable_mock", "vulnerable"),
        ("protected_mock", "blocked"),
    ],
)
def test_complete_eight_attack_api_workflow(
    client,
    agent_type,
    expected_status,
):
    print(f"\n===== TESTING {agent_type.upper()} =====")

    # 1. Register the target agent.
    agent = register_demo_agent(client, agent_type)

    # 2. Start a scan through the actual FastAPI endpoint.
    scan_response = client.post(
        "/api/scans",
        json={
            "agent_id": agent["id"],
            "attack_categories": ATTACKS,
        },
    )

    assert scan_response.status_code == 201, scan_response.text

    scan = scan_response.json()

    assert scan["status"] == "completed"
    assert scan["agent_id"] == agent["id"]

    scan_id = scan["id"]

    print("PASSED: Agent registered and scan executed.")
    print("Scan ID:", scan_id)

    # 3. Retrieve persisted attack results.
    results_response = client.get(
        f"/api/scans/{scan_id}/results"
    )

    assert results_response.status_code == 200

    results = results_response.json()

    assert len(results) == 8
    assert {item["category"] for item in results} == set(ATTACKS)

    # 4. Verify every finding and its persisted evidence.
    for item in results:
        assert item["vulnerability_status"] == expected_status
        assert item["verified"] is True
        assert item["verification_summary"]
        assert item["risk_rationale"]

        assert len(item["evidence"]) == 1

        evidence_record = item["evidence"][0]

        assert evidence_record["evidence_type"] == "json"
        assert evidence_record["source"] == "faizan_attack_engine"

        evidence_data = json.loads(evidence_record["content"])

        assert isinstance(evidence_data, dict)
        assert evidence_data

        if expected_status == "vulnerable":
            assert item["risk_score"] is not None
            assert item["risk_score"] > 0
        else:
            assert item["risk_score"] == 0

        print(
            "VERIFIED:",
            item["category"],
            "|",
            item["vulnerability_status"],
            "| Risk:",
            item["risk_score"],
        )

    print("PASSED: All eight results and evidence persisted.")

    # 5. Verify scan history.
    detail_response = client.get(f"/api/scans/{scan_id}")

    assert detail_response.status_code == 200
    assert detail_response.json()["status"] == "completed"

    print("PASSED: Scan history retrieval.")


def test_api_rejects_unknown_attack_category(client):
    response = client.post(
        "/api/scans",
        json={
            "agent_id": 1,
            "attack_categories": ["unknown_attack"],
        },
    )

    assert response.status_code == 422

    print("PASSED: Unknown attack category rejected.")


def test_legacy_attack_category_aliases(client):
    agent = register_demo_agent(client, "vulnerable_mock")

    for category in [
        "sensitive_data_leakage",
        "unauthorized_tool_usage",
    ]:
        response = client.post(
            "/api/scans",
            json={
                "agent_id": agent["id"],
                "attack_categories": [category],
            },
        )

        assert response.status_code == 201, response.text

        scan_id = response.json()["id"]

        results = client.get(
            f"/api/scans/{scan_id}/results"
        ).json()

        assert len(results) == 1
        assert results[0]["category"] == category
        assert results[0]["vulnerability_status"] == "vulnerable"
        assert results[0]["verified"] is True

    print("PASSED: Both legacy API category aliases.")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])