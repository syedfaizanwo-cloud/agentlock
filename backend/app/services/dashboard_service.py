from sqlalchemy import func, or_, select
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
    # ==========================================
    # AGENT STATISTICS
    # ==========================================

    total_agents = count_records(db, Agent)

    active_agents = count_records(
        db, Agent, Agent.status == "active"
    )

    agent_type_rows = db.execute(
        select(
            Agent.agent_type,
            func.count(Agent.id),
        ).group_by(Agent.agent_type)
    ).all()

    agents_by_type = {
        agent_type: count
        for agent_type, count in agent_type_rows
    }

    # ==========================================
    # SCAN STATISTICS
    # ==========================================

    scan_statuses = [
        "pending",
        "running",
        "completed",
        "completed_with_errors",
        "failed",
    ]

    scan_stats = {
        "total": count_records(db, Scan)
    }

    for scan_status in scan_statuses:
        scan_stats[scan_status] = count_records(
            db, Scan, Scan.status == scan_status
        )

    # ==========================================
    # ATTACK RESULT STATISTICS
    # ==========================================

    total_results = count_records(db, AttackResult)

    verified_condition = AttackResult.verified.is_(True)

    confirmed_condition = (
        verified_condition
        & (AttackResult.vulnerability_status == "vulnerable")
    )

    blocked_condition = (
        verified_condition
        & (AttackResult.vulnerability_status == "blocked")
    )

    inconclusive_condition = or_(
        AttackResult.vulnerability_status == "inconclusive",
        AttackResult.verified.is_(False),
    )

    confirmed_vulnerabilities = count_records(
        db, AttackResult, confirmed_condition
    )

    verified_blocked = count_records(
        db, AttackResult, blocked_condition
    )

    inconclusive = count_records(
        db, AttackResult, inconclusive_condition
    )

    verified_results = count_records(
        db, AttackResult, verified_condition
    )

    # ==========================================
    # SEVERITY DISTRIBUTION
    # Confirmed vulnerabilities only.
    # ==========================================

    severity_rows = db.execute(
        select(
            AttackResult.severity,
            func.count(AttackResult.id),
        )
        .where(confirmed_condition)
        .group_by(AttackResult.severity)
    ).all()

    findings_by_severity = {
        severity: count
        for severity, count in severity_rows
    }

    # ==========================================
    # ATTACK CATEGORY DISTRIBUTION
    # Confirmed vulnerabilities only.
    # ==========================================

    category_rows = db.execute(
        select(
            AttackResult.category,
            func.count(AttackResult.id),
        )
        .where(confirmed_condition)
        .group_by(AttackResult.category)
    ).all()

    findings_by_category = {
        category: count
        for category, count in category_rows
    }

    # ==========================================
    # RISK INFORMATION
    # Do not invent a composite score.
    # ==========================================

    risk_sum = db.scalar(
        select(func.sum(AttackResult.risk_score))
        .where(
            confirmed_condition,
            AttackResult.risk_score.is_not(None),
        )
    )

    highest_risk = db.scalar(
        select(func.max(AttackResult.risk_score))
        .where(
            confirmed_condition,
            AttackResult.risk_score.is_not(None),
        )
    )

    # ==========================================
    # EVIDENCE STATISTICS
    # ==========================================

    evidence_count = count_records(db, Evidence)

    # ==========================================
    # RESPONSE
    # Preserve verified_findings for compatibility.
    # Its meaning is now confirmed vulnerabilities.
    # ==========================================

    return {
        "agents": {
            "total": total_agents,
            "active": active_agents,
            "vulnerable": agents_by_type.get("vulnerable_mock", 0),
            "protected": agents_by_type.get("protected_mock", 0),
            "by_type": agents_by_type,
        },
        "scans": scan_stats,
        "results": {
            "total": total_results,
            "verified_results": verified_results,
            "verified_findings": confirmed_vulnerabilities,
            "confirmed_vulnerabilities": confirmed_vulnerabilities,
            "blocked_attacks": verified_blocked,
            "inconclusive": inconclusive,
            "by_severity": findings_by_severity,
            "by_category": findings_by_category,
        },
        "risk": {
            "confirmed_findings_score_sum": float(risk_sum or 0),
            "highest_confirmed_finding_score": (
                float(highest_risk)
                if highest_risk is not None
                else None
            ),
            "score_scale": "AgentLock 0-10 provisional ratings",
        },
        "evidence_records": evidence_count,
    }