
from app.attacks.prompt_injection import run_prompt_injection
from app.attacks.data_leakage import run_data_leakage
from app.attacks.tool_abuse import run_tool_abuse
from app.attacks.memory_poisoning import run_memory_poisoning

from app.evidence.verifier import verify_attack_result
from app.risk.scoring import calculate_risk


ATTACK_MODULES = {
    "prompt_injection": run_prompt_injection,
    "data_leakage": run_data_leakage,
    "tool_abuse": run_tool_abuse,
    "memory_poisoning": run_memory_poisoning
}


def run_scan(agent, attack_categories=None):
    """
    Execute attacks, independently verify their impact,
    and calculate risk for each result.
    """

    if attack_categories is None:
        attack_categories = list(ATTACK_MODULES.keys())

    if not attack_categories:
        raise ValueError("At least one attack category is required.")

    unknown = [
        category for category in attack_categories
        if category not in ATTACK_MODULES
    ]

    if unknown:
        raise ValueError(f"Unsupported attack categories: {unknown}")

    results = []

    for category in attack_categories:
        try:
            # Stage 1: Execute attack.
            attack_function = ATTACK_MODULES[category]
            result = attack_function(agent)

            # Stage 2: Independently verify actual impact.
            verification = verify_attack_result(agent, result)

            # Stage 3: Calculate risk from verified outcome.
            risk = calculate_risk(category, verification)

            outcome_mapping = {
                "vulnerability_confirmed": "vulnerable",
                "attack_blocked": "blocked",
                "inconclusive": "inconclusive"
            }

            final_status = outcome_mapping.get(
                verification["outcome"],
                "inconclusive"
            )

            # Stage 4: Build standardized result.
            result.update({
                "status": final_status,
                "verified": verification["verified"],
                "verification": verification,
                "risk_score": risk["risk_score"],
                "severity": risk["severity"],
                "risk_rationale": risk["risk_rationale"]
            })

            results.append(result)

        except Exception as error:
            results.append({
                "attack_type": category,
                "status": "inconclusive",
                "verified": False,
                "verification": {
                    "verified": False,
                    "outcome": "inconclusive",
                    "proof": "Verification or execution failed."
                },
                "risk_score": None,
                "severity": "unrated",
                "risk_rationale": "Unable to assess risk.",
                "evidence": {},
                "impact": "Attack could not be completed.",
                "error": str(error)
            })

    # Calculate summary from final verified outcomes.
    vulnerable = sum(
        r["status"] == "vulnerable" for r in results
    )

    blocked = sum(
        r["status"] == "blocked" for r in results
    )

    inconclusive = sum(
        r["status"] == "inconclusive" for r in results
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
