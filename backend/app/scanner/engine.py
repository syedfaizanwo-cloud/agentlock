
from app.attacks.prompt_injection import run_prompt_injection
from app.attacks.indirect_prompt_injection import (
    run_indirect_prompt_injection
)
from app.attacks.data_leakage import run_data_leakage
from app.attacks.tool_abuse import run_tool_abuse
from app.attacks.memory_poisoning import run_memory_poisoning
from app.attacks.identity_privilege_abuse import (
    run_identity_privilege_abuse
)
from app.attacks.human_approval_bypass import (
    run_human_approval_bypass
)
from app.attacks.inter_agent_spoofing import (
    run_inter_agent_spoofing
)

from app.evidence.verifier import verify_attack_result
from app.risk.scoring import calculate_risk


# Central registry of all supported attack modules.
ATTACK_MODULES = {
    "prompt_injection": run_prompt_injection,
    "indirect_prompt_injection": run_indirect_prompt_injection,
    "data_leakage": run_data_leakage,
    "tool_abuse": run_tool_abuse,
    "memory_poisoning": run_memory_poisoning,
    "identity_privilege_abuse": run_identity_privilege_abuse,
    "human_approval_bypass": run_human_approval_bypass,
    "inter_agent_spoofing": run_inter_agent_spoofing
}


def run_scan(agent, attack_categories=None):
    """
    Run selected security attacks against an authorized
    mock agent.

    Pipeline:
    Attack execution
        -> Evidence verification
        -> Risk scoring
        -> Final scan summary
    """

    if attack_categories is None:
        attack_categories = list(ATTACK_MODULES.keys())

    if not attack_categories:
        raise ValueError(
            "At least one attack category is required."
        )

    if len(attack_categories) != len(set(attack_categories)):
        raise ValueError(
            "Duplicate attack categories are not allowed."
        )

    unknown_categories = [
        category
        for category in attack_categories
        if category not in ATTACK_MODULES
    ]

    if unknown_categories:
        raise ValueError(
            f"Unsupported attack categories: {unknown_categories}"
        )

    results = []

    for category in attack_categories:
        try:
            # Stage 1: Execute the selected attack.
            attack_function = ATTACK_MODULES[category]
            result = attack_function(agent)

            # Stage 2: Independently verify its impact.
            verification = verify_attack_result(agent, result)

            # Stage 3: Calculate risk from the verified outcome.
            risk = calculate_risk(category, verification)

            outcome_mapping = {
                "vulnerability_confirmed": "vulnerable",
                "attack_blocked": "blocked",
                "inconclusive": "inconclusive"
            }

            final_status = outcome_mapping.get(
                verification.get("outcome"),
                "inconclusive"
            )

            # Stage 4: Build the standardized result.
            result.update({
                "status": final_status,
                "verified": verification.get("verified", False),
                "verification": verification,
                "risk_score": risk["risk_score"],
                "severity": risk["severity"],
                "risk_rationale": risk["risk_rationale"]
            })

            results.append(result)

        except Exception as error:
            # One failed attack should not stop other tests.
            results.append({
                "attack_type": category,
                "status": "inconclusive",
                "verified": False,
                "verification": {
                    "verified": False,
                    "outcome": "inconclusive",
                    "proof": "Attack execution or verification failed."
                },
                "risk_score": None,
                "severity": "unrated",
                "risk_rationale": "Unable to assess risk.",
                "evidence": {},
                "impact": "Attack could not be completed.",
                "error": str(error)
            })

    # Calculate summary from independently verified outcomes.
    vulnerable = sum(
        result["status"] == "vulnerable"
        for result in results
    )

    blocked = sum(
        result["status"] == "blocked"
        for result in results
    )

    inconclusive = sum(
        result["status"] == "inconclusive"
        for result in results
    )

    return {
        "scan_status": (
            "completed_with_errors"
            if inconclusive
            else "completed"
        ),
        "agent_name": agent.name,
        "summary": {
            "total_attacks": len(results),
            "vulnerabilities_found": vulnerable,
            "attacks_blocked": blocked,
            "inconclusive": inconclusive
        },
        "results": results
    }
