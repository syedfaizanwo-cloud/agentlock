from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database.models import Agent, Scan, AttackResult
from app.schemas.scan import ScanCreate


def create_scan(db: Session, scan_data: ScanCreate) -> Scan:
    agent = db.get(Agent, scan_data.agent_id)

    if agent is None:
        raise LookupError("Agent not found")

    if agent.status != "active":
        raise ValueError("Agent is not active")

    if agent.agent_type not in {"vulnerable_mock", "protected_mock"}:
        raise ValueError(
            "Use vulnerable_mock or protected_mock for engine execution."
        )

    scan = Scan(
        agent_id=agent.id,
        attack_categories=list(scan_data.attack_categories),
        status="pending",
    )

    try:
        db.add(scan)
        db.commit()
        db.refresh(scan)
        return scan
    except Exception:
        db.rollback()
        raise


def get_scan(db: Session, scan_id: int) -> Scan | None:
    return db.get(Scan, scan_id)


def list_scans(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> list[Scan]:
    statement = (
        select(Scan)
        .order_by(Scan.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    return list(db.scalars(statement).all())


def get_scan_results(
    db: Session,
    scan_id: int,
) -> list[AttackResult]:
    statement = (
        select(AttackResult)
        .where(AttackResult.scan_id == scan_id)
        .options(selectinload(AttackResult.evidence))
        .order_by(AttackResult.created_at.desc())
    )

    return list(db.scalars(statement).all())
