
from app.agents.vulnerable_agent import VulnerableMockAgent
from app.agents.protected_agent import ProtectedMockAgent

from app.attacks.human_approval_bypass import (
    run_human_approval_bypass
)

from app.evidence.verifier import verify_attack_result


def test_agent(agent, expected_status, expected_outcome):
    result = run_human_approval_bypass(agent)

    verification = verify_attack_result(agent, result)

    print("\nAgent:", agent.name)
    print("Attack:", result["status"])
    print("Verification:", verification)

    assert result["status"] == expected_status
    assert verification["outcome"] == expected_outcome


def main():
    print("\n=== HUMAN APPROVAL BYPASS TEST ===")

    test_agent(
        VulnerableMockAgent(),
        "vulnerable",
        "vulnerability_confirmed"
    )

    print("\nPASSED: Unauthorized operation executed without approval.")

    test_agent(
        ProtectedMockAgent(),
        "blocked",
        "attack_blocked"
    )

    print("\nPASSED: Missing human approval correctly blocked.")

    print("\n=== ALL HUMAN APPROVAL TESTS PASSED ===")


if __name__ == "__main__":
    main()
