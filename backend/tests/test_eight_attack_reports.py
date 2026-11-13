import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app as fastapi_app
from app.database.connection import Base, get_db
import app.database.models

from app.services import report_service


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
def client(tmp_path):
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

    report_service.REPORT_DIR = tmp_path

    try:
        with TestClient(fastapi_app) as test_client:
            yield test_client, tmp_path
    finally:
        fastapi_app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def register_agent(client, agent_type):
    response = client.post(
        "/api/agents",
        json={
            "name": f"AgentLock PDF {agent_type}",
            "description": "Eight-attack report verification",
            "agent_type": agent_type,
        },
    )

    assert response.status_code == 201, response.text
    return response.json()


def test_two_agent_pdf_reports(client):
    test_client, report_dir = client

    report_ids = []
    report_files = []

    scenarios = [
        ("vulnerable_mock", 8, 0),
        ("protected_mock", 0, 8),
    ]

    for agent_type, expected_vulnerabilities, expected_blocked in scenarios:

        print(f"\n===== {agent_type.upper()} PDF TEST =====")

        # Register agent.
        agent = register_agent(test_client, agent_type)

        # Execute all eight attacks.
        scan_response = test_client.post(
            "/api/scans",
            json={
                "agent_id": agent["id"],
                "attack_categories": ATTACKS,
            },
        )

        assert scan_response.status_code == 201, scan_response.text

        scan = scan_response.json()
        scan_id = scan["id"]

        assert scan["status"] == "completed"

        # Generate PDF using the actual report API.
        report_response = test_client.post(
            f"/api/scans/{scan_id}/report"
        )

        assert report_response.status_code == 201, report_response.text

        report = report_response.json()

        assert report["status"] == "completed"
        assert report["file_name"]

        report_ids.append(report["id"])

        file_path = report_dir / report["file_name"]

        assert file_path.is_file()
        assert file_path.stat().st_size > 500

        report_files.append(file_path)

        # Download using the actual report download endpoint.
        download = test_client.get(
            f"/api/reports/{report['id']}/pdf"
        )

        assert download.status_code == 200
        assert download.headers["content-type"] == "application/pdf"
        assert download.content.startswith(b"%PDF-")

        assert download.content == file_path.read_bytes()

        print("Agent:", agent["name"])
        print("Scan ID:", scan_id)
        print("Report ID:", report["id"])
        print("Report file:", report["file_name"])
        print("PDF size:", len(download.content), "bytes")
        print("PDF signature: VALID")

        # Verify summary counts from the stored scan results.
        results = test_client.get(
            f"/api/scans/{scan_id}/results"
        ).json()

        assert len(results) == 8

        confirmed = sum(
            r["verified"] and r["vulnerability_status"] == "vulnerable"
            for r in results
        )

        blocked = sum(
            r["verified"] and r["vulnerability_status"] == "blocked"
            for r in results
        )

        assert confirmed == expected_vulnerabilities
        assert blocked == expected_blocked

        print("Confirmed vulnerabilities:", confirmed)
        print("Verified blocked attacks:", blocked)
        print("PASSED:", agent_type)

    # Verify reports are separate.
    assert len(set(report_ids)) == 2
    assert len(set(report_files)) == 2

    assert len(list(report_dir.glob("*.pdf"))) == 2

    print("\nALL TWO-AGENT PDF REPORT TESTS PASSED")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])