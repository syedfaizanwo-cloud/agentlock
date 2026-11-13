from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database.models import (
    Agent,
    Scan,
    AttackResult,
    Evidence,
)


def count_records(db: Session, model, *conditions) -> int:
    statement = select(func.count()).select_from(model)

    if conditions:
        statement = statement.where(*conditions)

    return db.scalar(statement) or 0


def get_dashboard_stats(db: Session) -> dict:

    # Agent statistics
    total_agents = count_records(db, Agent)
    active_agents = count_records(
        db, Agent, Agent.status == "active"
    )

    # Scan statistics
    scan_statuses = ["pending", "running", "completed", "failed"]

    scan_stats = {
        "total": count_records(db, Scan)
    }

    for scan_status in scan_statuses:
        scan_stats[scan_status] = count_records(
            db, Scan, Scan.status == scan_status
        )

    # Attack-result statistics
    total_results = count_records(db, AttackResult)

    verified_condition = AttackResult.verified.is_(True)

    verified_findings = count_records(
        db, AttackResult, verified_condition
    )

    # Severity distribution considers verified findings only.
    severity_rows = db.execute(
        select(
            AttackResult.severity,
            func.count(AttackResult.id),
        )
        .where(verified_condition)
        .group_by(AttackResult.severity)
    ).all()

    findings_by_severity = {
        severity: count
        for severity, count in severity_rows
    }

    # Attack-category distribution considers verified findings only.
    category_rows = db.execute(
        select(
            AttackResult.category,
            func.count(AttackResult.id),
        )
        .where(verified_condition)
        .group_by(AttackResult.category)
    ).all()

    findings_by_category = {
        category: count
        for category, count in category_rows
    }

    # Evidence records
    evidence_count = count_records(db, Evidence)

    return {
        "agents": {
            "total": total_agents,
            "active": active_agents,
        },
        "scans": scan_stats,
        "results": {
            "total": total_results,
            "verified_findings": verified_findings,
            "by_severity": findings_by_severity,
            "by_category": findings_by_category,
        },
        "evidence_records": evidence_count,
    }
