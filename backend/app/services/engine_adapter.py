from app.agents.vulnerable_agent import VulnerableMockAgent
from app.agents.protected_agent import ProtectedMockAgent
from app.scanner.engine import run_scan


# API category -> Faizan's canonical engine category.
# The two legacy names remain supported for frontend compatibility.
API_TO_ENGINE_CATEGORY = {
    "prompt_injection": "prompt_injection",
    "sensitive_data_leakage": "data_leakage",
    "data_leakage": "data_leakage",
    "unauthorized_tool_usage": "tool_abuse",
    "tool_abuse": "tool_abuse",
    "memory_poisoning": "memory_poisoning",
    "indirect_prompt_injection": "indirect_prompt_injection",
    "identity_privilege_abuse": "identity_privilege_abuse",
    "human_approval_bypass": "human_approval_bypass",
    "inter_agent_spoofing": "inter_agent_spoofing",
}

# Canonical engine category -> canonical API category.
ENGINE_TO_API_CATEGORY = {
    value: value
    for value in API_TO_ENGINE_CATEGORY.values()
}


def create_mock_agent(agent_type: str):
    """Select an explicitly configured synthetic mock agent."""

    if agent_type == "vulnerable_mock":
        return VulnerableMockAgent()

    if agent_type == "protected_mock":
        return ProtectedMockAgent()

    if agent_type == "mock":
        raise ValueError(
            "Generic mock agent is ambiguous. "
            "Use vulnerable_mock or protected_mock."
        )

    raise ValueError(
        f"Unsupported engine agent type: {agent_type}"
    )


def execute_engine_scan(
    agent_type: str,
    attack_categories: list[str],
) -> dict:
    """
    Execute Faizan's scanner through a backend-owned boundary.
    The adapter does not access the database.
    """

    if not attack_categories:
        raise ValueError("At least one attack category is required.")

    unknown = [
        category
        for category in attack_categories
        if category not in API_TO_ENGINE_CATEGORY
    ]

    if unknown:
        raise ValueError(
            f"Unsupported backend attack categories: {unknown}"
        )

    if len(attack_categories) != len(set(attack_categories)):
        raise ValueError("Duplicate attack categories are not allowed.")

    engine_categories = [
        API_TO_ENGINE_CATEGORY[category]
        for category in attack_categories
    ]

    # Different legacy API names must not execute the same
    # engine attack twice in one scan.
    if len(engine_categories) != len(set(engine_categories)):
        raise ValueError(
            "Duplicate semantic attack categories are not allowed. "
            "Use only one API name for each attack."
        )

    requested_api_by_engine = dict(
        zip(engine_categories, attack_categories)
    )

    agent = create_mock_agent(agent_type)

    engine_output = run_scan(
        agent,
        attack_categories=engine_categories,
    )

    if not isinstance(engine_output, dict):
        raise RuntimeError("Engine returned an invalid response.")

    engine_results = engine_output.get("results")

    if not isinstance(engine_results, list):
        raise RuntimeError("Engine results must be a list.")

    if len(engine_results) != len(engine_categories):
        raise RuntimeError(
            "Engine result count does not match requested attack count."
        )

    normalized_results = []
    received_categories = set()

    for item in engine_results:

        if not isinstance(item, dict):
            raise RuntimeError("Engine returned an invalid result item.")

        engine_category = item.get("attack_type")

        if engine_category not in requested_api_by_engine:
            raise RuntimeError(
                f"Engine returned an unexpected category: {engine_category}"
            )

        if engine_category in received_categories:
            raise RuntimeError(
                f"Engine returned duplicate category: {engine_category}"
            )

        received_categories.add(engine_category)

        backend_category = requested_api_by_engine[engine_category]
        vulnerability_status = item.get("status")

        if vulnerability_status not in {
            "vulnerable",
            "blocked",
            "inconclusive",
        }:
            raise RuntimeError(
                f"Unexpected engine outcome: {vulnerability_status}"
            )

        verification = item.get("verification") or {}
        evidence = item.get("evidence") or {}

        if not isinstance(verification, dict):
            raise RuntimeError("Engine returned invalid verification data.")

        if not isinstance(evidence, dict):
            raise RuntimeError("Engine returned invalid evidence.")

        normalized_results.append({
            "category": backend_category,
            "vulnerability_status": vulnerability_status,
            "severity": item.get("severity", "unrated"),
            "attack_input": item.get("attack_input"),
            "impact": item.get("impact"),
            "remediation": item.get("remediation"),
            "verified": item.get("verified") is True,
            "verification_summary": verification.get("proof"),
            "evidence": evidence,
            "risk_score": item.get("risk_score"),
            "risk_rationale": item.get("risk_rationale"),
            "engine_error": item.get("error"),
        })

    if received_categories != set(engine_categories):
        raise RuntimeError(
            "Engine did not return every requested attack category."
        )

    scan_status = engine_output.get("scan_status")

    if scan_status not in {"completed", "completed_with_errors"}:
        raise RuntimeError(f"Unexpected engine scan status: {scan_status}")

    summary = engine_output.get("summary")

    if not isinstance(summary, dict):
        raise RuntimeError("Engine returned an invalid summary.")

    return {
        "scan_status": scan_status,
        "agent_name": engine_output.get("agent_name", agent.name),
        "summary": summary,
        "results": normalized_results,
    }