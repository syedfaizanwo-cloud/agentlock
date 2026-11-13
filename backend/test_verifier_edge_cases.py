
from app.agents.vulnerable_agent import VulnerableMockAgent
from app.agents.protected_agent import ProtectedMockAgent

from app.attacks.prompt_injection import run_prompt_injection
from app.evidence.verifier import verify_attack_result


def main():
    print("\n=== AGENTLOCK EVIDENCE EDGE-CASE TESTS ===\n")

    # Test 1: Genuine simulated vulnerability.
    agent = VulnerableMockAgent()
    result = run_prompt_injection(agent)

    verification = verify_attack_result(agent, result)

    assert verification["outcome"] == "vulnerability_confirmed"
    print("PASSED: Genuine evidence confirms vulnerability.")

    # Test 2: Missing impact evidence.
    agent = VulnerableMockAgent()
    result = run_prompt_injection(agent)

    result["evidence"]["canary_exposed"] = False

    verification = verify_attack_result(agent, result)

    assert verification["outcome"] == "inconclusive"
    print("PASSED: Missing impact evidence is inconclusive.")

    # Test 3: Contradictory evidence.
    agent = ProtectedMockAgent()
    result = run_prompt_injection(agent)

    result["status"] = "vulnerable"
    result["evidence"]["canary_exposed"] = True

    verification = verify_attack_result(agent, result)

    assert verification["outcome"] == "inconclusive"
    print("PASSED: Contradictory evidence is not confirmed.")

    # Test 4: Missing action logs.
    agent = VulnerableMockAgent()
    result = run_prompt_injection(agent)

    agent.action_log.clear()

    verification = verify_attack_result(agent, result)

    assert verification["outcome"] == "inconclusive"
    print("PASSED: Missing action logs cannot confirm impact.")

    # Test 5: Unknown attack category.
    result = {
        "attack_type": "unknown_attack",
        "status": "vulnerable",
        "evidence": {}
    }

    verification = verify_attack_result(
        VulnerableMockAgent(), result
    )

    assert verification["outcome"] == "inconclusive"
    print("PASSED: Unknown attack category rejected.")

    print("\n========================================")
    print(" ALL EVIDENCE EDGE-CASE TESTS PASSED")
    print("========================================")


if __name__ == "__main__":
    main()

