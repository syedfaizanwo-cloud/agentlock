
from app.agents.vulnerable_agent import VulnerableMockAgent
from app.agents.protected_agent import ProtectedMockAgent
from app.attacks.indirect_prompt_injection import (
    run_indirect_prompt_injection
)


def main():
    print("\n=== AGENTLOCK INDIRECT PROMPT INJECTION TEST ===\n")

    # Test vulnerable agent
    vulnerable = VulnerableMockAgent()
    v_result = run_indirect_prompt_injection(vulnerable)

    print("VULNERABLE AGENT:")
    print("Status:", v_result["status"])
    print("Evidence:", v_result["evidence"])

    assert v_result["status"] == "vulnerable"
    assert v_result["evidence"]["canary_exposed"] is True

    print("PASSED: Malicious document instruction caused exposure.\n")

    # Test protected agent
    protected = ProtectedMockAgent()
    p_result = run_indirect_prompt_injection(protected)

    print("PROTECTED AGENT:")
    print("Status:", p_result["status"])
    print("Evidence:", p_result["evidence"])

    assert p_result["status"] == "blocked"
    assert p_result["evidence"]["canary_exposed"] is False

    print("PASSED: Malicious document instruction was blocked.\n")

    print("=== ALL INDIRECT PROMPT INJECTION TESTS PASSED ===")


if __name__ == "__main__":
    main()
