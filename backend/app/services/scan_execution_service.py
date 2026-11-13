import json
from datetime import datetime, timezone
from math import isfinite

from sqlalchemy.orm import Session

from app.database.models import (
    Agent,
    Scan,
    AttackResult,
    Evidence,
)
from app.services.engine_adapter import execute_engine_scan


class ScanExecutionError(RuntimeError):
    pass


def execute_and_persist_scan(db: Session, scan: Scan) -> Scan:
    scan_id = scan.id

    agent = db.get(Agent, scan.agent_id)

    if agent is None or agent.status != "active":
        raise LookupError("Active scan agent not found.")

    if agent.agent_type not in {"vulnerable_mock", "protected_mock"}:
        raise ValueError(
            "Select an explicit vulnerable_mock or protected_mock agent."
        )

    if scan.status != "pending":
        raise ValueError("Only pending scans can be executed.")

    # Mark the scan as running before executing the engine.
    scan.status = "running"
    scan.started_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(scan)

    try:
        output = execute_engine_scan(
            agent_type=agent.agent_type,
            attack_categories=list(scan.attack_categories),
        )

        engine_status = output["scan_status"]

        if engine_status not in {"completed", "completed_with_errors"}:
            raise RuntimeError(
                f"Unexpected engine status: {engine_status}"
            )

        for item in output["results"]:

            category = item["category"]
            outcome = item["vulnerability_status"]
            verified = item["verified"] is True

            if outcome not in {"vulnerable", "blocked", "inconclusive"}:
                raise ValueError(f"Invalid attack outcome: {outcome}")

            # An outcome without independent verification cannot
            # be stored as a confirmed vulnerability or blocked attack.
            if outcome in {"vulnerable", "blocked"} and not verified:
                outcome = "inconclusive"

            risk_score = item.get("risk_score")

            if risk_score is not None:
                if (
                    isinstance(risk_score, bool)
                    or not isinstance(risk_score, (int, float))
                    or not isfinite(risk_score)
                    or not 0 <= risk_score <= 10
                ):
                    raise ValueError("Invalid engine risk score.")

                risk_score = float(risk_score)

            if outcome != "vulnerable":
                risk_score = 0.0 if outcome == "blocked" else None

            result = AttackResult(
                scan_id=scan_id,
                category=category,
                vulnerability_status=outcome,
                severity=item["severity"],
                attack_input=item.get("attack_input"),
                impact=item.get("impact"),
                remediation=item.get("remediation"),
                retest_status="not_tested",
                verified=verified,
                verification_summary=item.get("verification_summary"),
                risk_score=risk_score,
                risk_rationale=item.get("risk_rationale"),
            )

            db.add(result)
            db.flush()

            # Preserve structured evidence as JSON instead of
            # converting it to an unstructured string representation.
            evidence_data = item.get("evidence") or {}

            if not isinstance(evidence_data, dict):
                raise ValueError("Engine returned invalid evidence.")

            db.add(
                Evidence(
                    attack_result_id=result.id,
                    evidence_type="json",
                    content=json.dumps(
                        evidence_data,
                        ensure_ascii=False,
                        sort_keys=True,
                    ),
                    source="faizan_attack_engine",
                    is_redacted=False,
                )
            )

        scan.status = (
            "completed"
            if engine_status == "completed"
            else "completed_with_errors"
        )

        scan.completed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(scan)

        return scan

    except Exception as error:
        db.rollback()

        failed_scan = db.get(Scan, scan_id)

        if failed_scan is not None:
            failed_scan.status = "failed"
            failed_scan.completed_at = datetime.now(timezone.utc)
            db.commit()

        raise ScanExecutionError(
            f"Scan execution or result persistence failed: {error}"
        ) from error
