from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database.models import Agent, Scan, AttackResult


class ComparisonNotFoundError(Exception):
    pass


class ComparisonConflictError(Exception):
    pass


CATEGORY_ALIASES = {
    "sensitive_data_leakage": "data_leakage",
    "unauthorized_tool_usage": "tool_abuse",
}


def _category_key(category: str) -> str:
    return CATEGORY_ALIASES.get(category, category)


def _load_options():
    return (
        selectinload(Scan.agent),
        selectinload(Scan.results).selectinload(AttackResult.evidence),
    )


def _get_completed_scan(
    db: Session,
    agent_type: str,
    scan_id: int | None,
) -> Scan:
    if scan_id is not None:
        statement = (
            select(Scan)
            .where(Scan.id == scan_id)
            .options(*_load_options())
        )
        scan = db.scalar(statement)

        if scan is None:
            raise ComparisonNotFoundError(
                f"Scan {scan_id} was not found."
            )

        if scan.agent is None or scan.agent.agent_type != agent_type:
            raise ComparisonConflictError(
                f"Scan {scan_id} does not belong to a {agent_type} agent."
            )

        if scan.status != "completed":
            raise ComparisonConflictError(
                f"Scan {scan_id} is not completed. Current status: {scan.status}."
            )

        return scan

    statement = (
        select(Scan)
        .join(Agent, Scan.agent_id == Agent.id)
        .where(
            Agent.agent_type == agent_type,
            Scan.status == "completed",
        )
        .order_by(Scan.completed_at.desc(), Scan.id.desc())
        .limit(1)
        .options(*_load_options())
    )

    scan = db.scalar(statement)

    if scan is None:
        raise ComparisonNotFoundError(
            f"No completed scan found for agent type {agent_type}."
        )

    return scan


def _result_status(result: AttackResult | None) -> str | None:
    if result is None:
        return None

    if not result.verified:
        return "inconclusive"

    if result.vulnerability_status in ("vulnerable", "blocked"):
        return result.vulnerability_status

    return "inconclusive"


def _result_map(scan: Scan) -> dict[str, AttackResult]:
    mapped = {}

    for result in scan.results:
        mapped[_category_key(result.category)] = result

    return mapped


def _summarize_scan(scan: Scan) -> dict:
    results = list(scan.results)

    vulnerable = [
        result for result in results
        if _result_status(result) == "vulnerable"
    ]

    blocked = [
        result for result in results
        if _result_status(result) == "blocked"
    ]

    inconclusive = [
        result for result in results
        if _result_status(result) == "inconclusive"
    ]

    severity_counts = {}

    for result in vulnerable:
        severity = result.severity
        severity_counts[severity] = severity_counts.get(severity, 0) + 1

    risk_scores = [
        float(result.risk_score)
        for result in vulnerable
        if result.risk_score is not None
    ]

    return {
        "total_attack_results": len(results),
        "verified_results": sum(
            1 for result in results if result.verified
        ),
        "confirmed_vulnerabilities": len(vulnerable),
        "blocked_attacks": len(blocked),
        "inconclusive": len(inconclusive),
        "by_severity": severity_counts,
        "risk_score_sum": round(sum(risk_scores), 2),
        "highest_finding_risk_score": (
            max(risk_scores) if risk_scores else None
        ),
        "evidence_records": sum(
            len(result.evidence) for result in results
        ),
    }


def _scan_metadata(scan: Scan) -> dict:
    return {
        "scan_id": scan.id,
        "agent_id": scan.agent.id,
        "agent_name": scan.agent.name,
        "agent_type": scan.agent.agent_type,
        "status": scan.status,
        "created_at": scan.created_at,
        "completed_at": scan.completed_at,
    }


def _project_result(result: AttackResult | None) -> dict | None:
    if result is None:
        return None

    return {
        "category": _category_key(result.category),
        "status": _result_status(result),
        "severity": result.severity,
        "verified": result.verified,
        "risk_score": result.risk_score,
        "verification_summary": result.verification_summary,
        "remediation": result.remediation,
        "evidence_count": len(result.evidence),
    }


def _comparison_outcome(
    vulnerable_status: str | None,
    protected_status: str | None,
) -> str:
    if vulnerable_status is None or protected_status is None:
        return "missing_result"

    if vulnerable_status == "vulnerable" and protected_status == "blocked":
        return "vulnerability_blocked_in_protected"

    if vulnerable_status == "vulnerable" and protected_status == "vulnerable":
        return "vulnerable_in_both"

    if vulnerable_status == "blocked" and protected_status == "blocked":
        return "blocked_in_both"

    if vulnerable_status == "blocked" and protected_status == "vulnerable":
        return "vulnerability_only_in_protected"

    return "inconclusive_or_mixed"


def get_agent_comparison(
    db: Session,
    vulnerable_scan_id: int | None = None,
    protected_scan_id: int | None = None,
) -> dict:
    vulnerable_scan = _get_completed_scan(
        db,
        "vulnerable_mock",
        vulnerable_scan_id,
    )

    protected_scan = _get_completed_scan(
        db,
        "protected_mock",
        protected_scan_id,
    )

    vulnerable_results = _result_map(vulnerable_scan)
    protected_results = _result_map(protected_scan)

    categories = sorted(
        set(vulnerable_results) | set(protected_results)
    )

    attack_comparisons = []

    outcome_counts = {
        "vulnerability_blocked_in_protected": 0,
        "vulnerable_in_both": 0,
        "blocked_in_both": 0,
        "vulnerability_only_in_protected": 0,
        "inconclusive_or_mixed": 0,
        "missing_result": 0,
    }

    for category in categories:
        vulnerable_result = vulnerable_results.get(category)
        protected_result = protected_results.get(category)

        vulnerable_status = _result_status(vulnerable_result)
        protected_status = _result_status(protected_result)

        outcome = _comparison_outcome(
            vulnerable_status,
            protected_status,
        )

        outcome_counts[outcome] += 1

        vulnerable_score = (
            vulnerable_result.risk_score
            if vulnerable_result is not None
            else None
        )

        protected_score = (
            protected_result.risk_score
            if protected_result is not None
            else None
        )

        risk_score_delta = None

        if (
            vulnerable_score is not None
            and protected_score is not None
        ):
            risk_score_delta = round(
                float(vulnerable_score) - float(protected_score),
                2,
            )

        attack_comparisons.append({
            "category": category,
            "vulnerable_agent": _project_result(vulnerable_result),
            "protected_agent": _project_result(protected_result),
            "outcome": outcome,
            "risk_score_delta": risk_score_delta,
        })

    return {
        "scans": {
            "vulnerable": _scan_metadata(vulnerable_scan),
            "protected": _scan_metadata(protected_scan),
        },
        "summaries": {
            "vulnerable": _summarize_scan(vulnerable_scan),
            "protected": _summarize_scan(protected_scan),
        },
        "comparison_summary": {
            "categories_compared": len(categories),
            **outcome_counts,
        },
        "attack_comparisons": attack_comparisons,
        "risk_score_scale": "AgentLock provisional 0-10 ratings; not CVSS.",
    }