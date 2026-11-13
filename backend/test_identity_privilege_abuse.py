
from app.agents.vulnerable_agent import VulnerableMockAgent
from app.agents.protected_agent import ProtectedMockAgent
from app.attacks.identity_privilege_abuse import (
    run_identity_privilege_abuse
)
from app.evidence.verifier import verify_attack_result
from app.risk.scoring import calculate_risk


def test_agent(agent, expected_status, expected_outcome,
               expected_score, expected_severity):

    result = run_identity_privilege_abuse(agent)
    verification = verify_attack_result(agent, result)
    risk = calculate_risk(
        "identity_privilege_abuse", verification
    )

    print("\nAgent:", agent.name)
    print("Attack status:", result["status"])
    print("Verification:", verification["outcome"])
    print("Risk:", risk)

    assert result["status"] == expected_status
    assert verification["outcome"] == expected_outcome
    assert risk["risk_score"] == expected_score
    assert risk["severity"] == expected_severity


def main():
    print("\n=== IDENTITY & PRIVILEGE ABUSE TEST ===")

    test_agent(
        VulnerableMockAgent(),
        "vulnerable",
        "vulnerability_confirmed",
        9,
        "critical"
    )

    print("\nPASSED: Unauthorized privilege escalation verified.")

    test_agent(
        ProtectedMockAgent(),
        "blocked",
        "attack_blocked",
        0,
        "none"
    )

    print("\nPASSED: Unauthorized privilege escalation blocked.")

    print("\n=== ALL IDENTITY ABUSE TESTS PASSED ===")


if __name__ == "__main__":
    main()
