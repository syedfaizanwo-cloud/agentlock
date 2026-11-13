import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app as fastapi_app
from app.database.connection import Base, get_db
import app.database.models

from app.services import report_service


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


def register_agent(client):
    response = client.post(
        "/api/agents",
        json={
            "name": "Automated Test Agent",
            "description": "Synthetic regression test",
            "agent_type": "mock",
        },
    )

    assert response.status_code == 201
    return response.json()


def test_agent_crud(client):
    agent = register_agent(client)
    agent_id = agent["id"]

    assert agent["status"] == "active"

    assert client.get("/api/agents").status_code == 200

    assert client.get(
        f"/api/agents/{agent_id}"
    ).status_code == 200

    assert client.delete(
        f"/api/agents/{agent_id}"
    ).status_code == 204

    assert client.get(
        f"/api/agents/{agent_id}"
    ).status_code == 404


def test_agent_validation(client):
    response = client.post(
        "/api/agents",
        json={
            "name": "",
            "agent_type": "mock",
        },
    )

    assert response.status_code == 422


def test_scan_creation_and_results(client):
    agent = register_agent(client)

    response = client.post(
        "/api/scans",
        json={
            "agent_id": agent["id"],
            "attack_categories": [
                "prompt_injection",
                "sensitive_data_leakage",
                "unauthorized_tool_usage",
                "memory_poisoning",
            ],
        },
    )

    assert response.status_code == 201

    scan = response.json()
    scan_id = scan["id"]

    assert scan["status"] == "pending"

    assert client.get(
        f"/api/scans/{scan_id}"
    ).status_code == 200

    results = client.get(
        f"/api/scans/{scan_id}/results"
    )

    assert results.status_code == 200
    assert results.json() == []


def test_scan_rejects_missing_agent(client):
    response = client.post(
        "/api/scans",
        json={
            "agent_id": 999999,
            "attack_categories": ["prompt_injection"],
        },
    )

    assert response.status_code == 404


def test_dashboard_statistics(client):
    agent = register_agent(client)

    client.post(
        "/api/scans",
        json={
            "agent_id": agent["id"],
            "attack_categories": ["prompt_injection"],
        },
    )

    response = client.get("/api/dashboard/stats")

    assert response.status_code == 200

    data = response.json()

    assert data["agents"]["total"] == 1
    assert data["scans"]["total"] == 1
    assert data["scans"]["pending"] == 1
    assert data["results"]["verified_findings"] == 0


def test_pdf_generation_and_download(client, tmp_path, monkeypatch):
    monkeypatch.setattr(
        report_service,
        "REPORT_DIR",
        tmp_path,
    )

    agent = register_agent(client)

    scan_response = client.post(
        "/api/scans",
        json={
            "agent_id": agent["id"],
            "attack_categories": ["prompt_injection"],
        },
    )

    scan_id = scan_response.json()["id"]

    report_response = client.post(
        f"/api/scans/{scan_id}/report"
    )

    assert report_response.status_code == 201

    report = report_response.json()
    report_id = report["id"]

    assert report["status"] == "completed"

    download_response = client.get(
        f"/api/reports/{report_id}/pdf"
    )

    assert download_response.status_code == 200
    assert download_response.content.startswith(b"%PDF-")

    # Generating a report must not falsely complete the scan.
    scan = client.get(
        f"/api/scans/{scan_id}"
    ).json()

    assert scan["status"] == "pending"

