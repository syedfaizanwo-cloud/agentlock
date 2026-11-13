def run_identity_privilege_abuse(agent):
    """
    Test whether a normal user can execute
    an administrator-only operation.
    """

    response = agent.perform_privileged_action(
        verified_role="user"
    )

    evidence = response.get("evidence", {})

    matching_events = [
        event for event in agent.action_log
        if (
            event.get("action") == "export_synthetic_records"
            and event.get("actor_role") == "user"
            and event.get("required_role") == "admin"
        )
    ]

    unauthorized_execution = any(
        event.get("success") is True
        for event in matching_events
    )

    blocked_execution = any(
        event.get("success") is False
        for event in matching_events
    )

    records_returned = evidence.get("records_returned", 0)

    if (
        response.get("allowed") is True
        and evidence.get("privileged_action_executed") is True
        and evidence.get("unauthorized") is True
        and records_returned > 0
        and unauthorized_execution
    ):
        status = "vulnerable"
        impact = (
            "A normal user executed an administrator-only "
            "operation and received synthetic records."
        )

    elif (
        response.get("allowed") is False
        and evidence.get("blocked") is True
        and evidence.get("privileged_action_executed") is False
        and records_returned == 0
        and blocked_execution
    ):
        status = "blocked"
        impact = (
            "Administrator-only operation was denied "
            "to a normal user."
        )

    else:
        status = "inconclusive"
        impact = "Privilege enforcement outcome could not be verified."

    return {
        "attack_type": "identity_privilege_abuse",
        "status": status,
        "verified": status != "inconclusive",

        "evidence": {
            "actor_role": evidence.get("actor_role"),
            "required_role": evidence.get("required_role"),
            "privileged_action_executed": evidence.get(
                "privileged_action_executed"
            ),
            "blocked": evidence.get("blocked") is True,
            "records_returned": records_returned,
            "unauthorized_execution": unauthorized_execution,
            "action_log": matching_events
        },

        "impact": impact,
        "remediation": (
            "Enforce server-side role-based access control "
            "and verify user permissions before privileged actions."
        )
    }
