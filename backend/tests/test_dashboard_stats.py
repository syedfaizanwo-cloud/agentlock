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


def register_agent(client, agent_type):
    response = client.post(
        "/api/agents",
        json={
            "name": f"Dashboard Test {agent_type}",
            "description": "Isolated dashboard integration test",
            "agent_type": agent_type,
        },
    )

    assert response.status_code == 201, response.text
    return response.json()


def run_eight_attack_scan(client, agent):
    response = client.post(
        "/api/scans",
        json={
            "agent_id": agent["id"],
            "attack_categories": ATTACKS,
        },
    )

    assert response.status_code == 201, response.text
    assert response.json()["status"] == "completed"

    return response.json()


def test_dashboard_two_agent_statistics(client):
    print("\n===== REGISTERING TWO DEMO AGENTS =====")

    vulnerable = register_agent(client, "vulnerable_mock")
    protected = register_agent(client, "protected_mock")

    print("Registered vulnerable and protected agents.")

    print("\n===== EXECUTING EIGHT-ATTACK SCANS =====")

    vulnerable_scan = run_eight_attack_scan(client, vulnerable)
    protected_scan = run_eight_attack_scan(client, protected)

    print("Vulnerable scan:", vulnerable_scan["id"])
    print("Protected scan:", protected_scan["id"])

    print("\n===== FETCHING DASHBOARD STATISTICS =====")

    response = client.get("/api/dashboard/stats")

    assert response.status_code == 200, response.text

    stats = response.json()

    # Agent statistics
    assert stats["agents"]["total"] == 2
    assert stats["agents"]["active"] == 2
    assert stats["agents"]["vulnerable"] == 1
    assert stats["agents"]["protected"] == 1

    # Scan statistics
    assert stats["scans"]["total"] == 2
    assert stats["scans"]["completed"] == 2
    assert stats["scans"]["failed"] == 0

    # Attack result statistics
    assert stats["results"]["total"] == 16
    assert stats["results"]["verified_results"] == 16
    assert stats["results"]["verified_findings"] == 8
    assert stats["results"]["confirmed_vulnerabilities"] == 8
    assert stats["results"]["blocked_attacks"] == 8
    assert stats["results"]["inconclusive"] == 0

    # Severity distribution: seven high and one critical.
    assert stats["results"]["by_severity"] == {
        "high": 7,
        "critical": 1,
    }

    # Each of the eight categories should produce one vulnerability.
    assert stats["results"]["by_category"] == {
        category: 1 for category in ATTACKS
    }

    # Evidence and provisional risk statistics
    assert stats["evidence_records"] == 16
    assert stats["risk"]["confirmed_findings_score_sum"] == 63.0
    assert stats["risk"]["highest_confirmed_finding_score"] == 9.0

    print("\n===== DASHBOARD ASSERTIONS PASSED =====")
    print("Total agents: 2")
    print("Completed scans: 2")
    print("Attack results: 16")
    print("Confirmed vulnerabilities: 8")
    print("Verified blocked attacks: 8")
    print("Inconclusive results: 0")
    print("Evidence records: 16")
    print("Risk score sum: 63")
    print("Highest finding score: 9")

    print("\nALL DASHBOARD INTEGRATION TESTS PASSED.")
def test_dashboard_comparison_endpoint(client):
    vulnerable = register_agent(client, "vulnerable_mock")
    protected = register_agent(client, "protected_mock")

    vulnerable_scan = run_eight_attack_scan(client, vulnerable)
    protected_scan = run_eight_attack_scan(client, protected)

    # Test automatic selection of latest completed scans.
    response = client.get("/api/dashboard/comparison")

    assert response.status_code == 200, response.text
    data = response.json()

    assert data["scans"]["vulnerable"]["scan_id"] == vulnerable_scan["id"]
    assert data["scans"]["protected"]["scan_id"] == protected_scan["id"]

    assert data["summaries"]["vulnerable"]["confirmed_vulnerabilities"] == 8
    assert data["summaries"]["protected"]["confirmed_vulnerabilities"] == 0

    assert data["summaries"]["vulnerable"]["blocked_attacks"] == 0
    assert data["summaries"]["protected"]["blocked_attacks"] == 8

    assert data["comparison_summary"]["categories_compared"] == 8
    assert (
        data["comparison_summary"]["vulnerability_blocked_in_protected"]
        == 8
    )

    assert len(data["attack_comparisons"]) == 8

    for item in data["attack_comparisons"]:
        assert item["outcome"] == "vulnerability_blocked_in_protected"
        assert item["vulnerable_agent"]["status"] == "vulnerable"
        assert item["protected_agent"]["status"] == "blocked"
        assert item["risk_score_delta"] is not None

    # Test explicit scan IDs.
    explicit_response = client.get(
        "/api/dashboard/comparison",
        params={
            "vulnerable_scan_id": vulnerable_scan["id"],
            "protected_scan_id": protected_scan["id"],
        },
    )

    assert explicit_response.status_code == 200

    # A vulnerable scan ID must not be accepted as a protected scan.
    wrong_type_response = client.get(
        "/api/dashboard/comparison",
        params={
            "vulnerable_scan_id": vulnerable_scan["id"],
            "protected_scan_id": vulnerable_scan["id"],
        },
    )

    assert wrong_type_response.status_code == 409

    # A nonexistent scan ID must return 404.
    missing_response = client.get(
        "/api/dashboard/comparison",
        params={
            "vulnerable_scan_id": 999999,
            "protected_scan_id": protected_scan["id"],
        },
    )

    assert missing_response.status_code == 404

    print("\n===== TWO-AGENT COMPARISON TEST PASSED =====")
    print("Compared attack categories: 8")
    print("Vulnerabilities blocked in protected agent: 8")
    print("Wrong agent scan rejected: 409")
    print("Missing scan rejected: 404")
