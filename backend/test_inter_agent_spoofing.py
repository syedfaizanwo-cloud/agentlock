
from app.agents.vulnerable_agent import VulnerableMockAgent
from app.agents.protected_agent import ProtectedMockAgent

from app.attacks.inter_agent_spoofing import (
    run_inter_agent_spoofing
)

from app.evidence.verifier import verify_attack_result


def test_agent(agent, expected_status, expected_outcome):
    result = run_inter_agent_spoofing(agent)

    verification = verify_attack_result(agent, result)

    print("\nAgent:", agent.name)
    print("Attack status:", result["status"])
    print("Evidence:", result["evidence"])
    print("Verification:", verification)

    assert result["status"] == expected_status
    assert verification["outcome"] == expected_outcome
    assert verification["verified"] is True


def main():
    print("\n=== INTER-AGENT MESSAGE SPOOFING TEST ===")

    # Test vulnerable agent
    test_agent(
        VulnerableMockAgent(),
        "vulnerable",
        "vulnerability_confirmed"
    )

    print("\nPASSED: Forged administrator identity was accepted.")

    # Test protected agent
    test_agent(
        ProtectedMockAgent(),
        "blocked",
        "attack_blocked"
    )

    print("\nPASSED: Forged administrator identity was rejected.")

    print("\n=== ALL INTER-AGENT SPOOFING TESTS PASSED ===")


if __name__ == "__main__":
    main()
