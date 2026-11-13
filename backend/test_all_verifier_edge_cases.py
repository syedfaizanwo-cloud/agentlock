
from app.agents.vulnerable_agent import VulnerableMockAgent
from app.agents.protected_agent import ProtectedMockAgent

from app.scanner.engine import ATTACK_MODULES
from app.evidence.verifier import verify_attack_result


def tamper_evidence(category, agent, result):
    """Remove the impact evidence for a simulated attack."""

    evidence = result["evidence"]

    if category in (
        "prompt_injection",
        "indirect_prompt_injection",
        "data_leakage"
    ):
        evidence["canary_exposed"] = False

    elif category == "tool_abuse":
        evidence["records_returned"] = 0

    elif category == "memory_poisoning":
        agent.memory.clear()

    elif category == "identity_privilege_abuse":
        evidence["privileged_action_executed"] = False
        evidence["records_returned"] = 0

    elif category == "human_approval_bypass":
        evidence["sensitive_action_executed"] = False
        evidence["approval_bypassed"] = False

    elif category == "inter_agent_spoofing":
        evidence["sender_spoofed"] = False
        evidence["operation_executed"] = False
        evidence["records_returned"] = 0


def main():
    print("\n=== AGENTLOCK EIGHT-ATTACK VERIFIER TEST ===")

    for category, attack_function in ATTACK_MODULES.items():

        print("\nTesting:", category)

        # TEST 1: Genuine vulnerability.
        agent = VulnerableMockAgent()
        result = attack_function(agent)

        verification = verify_attack_result(agent, result)

        assert verification["outcome"] == "vulnerability_confirmed"

        print("PASSED: Genuine vulnerability verified.")

        # TEST 2: Tampered evidence.
        tamper_evidence(category, agent, result)

        tampered_verification = verify_attack_result(
            agent, result
        )

        assert tampered_verification["outcome"] == "inconclusive"

        print("PASSED: Tampered evidence rejected.")

        # TEST 3: Missing action logs.
        agent = VulnerableMockAgent()
        result = attack_function(agent)

        agent.action_log.clear()

        missing_log_verification = verify_attack_result(
            agent, result
        )

        assert missing_log_verification["outcome"] == "inconclusive"

        print("PASSED: Missing action logs are inconclusive.")

        # TEST 4: Protected agent.
        protected = ProtectedMockAgent()
        protected_result = attack_function(protected)

        protected_verification = verify_attack_result(
            protected, protected_result
        )

        assert protected_verification["outcome"] == "attack_blocked"

        print("PASSED: Protected agent correctly blocked attack.")

    print("\n========================================")
    print(" ALL EIGHT VERIFIER EDGE-CASE TESTS PASSED")
    print("========================================")


if __name__ == "__main__":
    main()
