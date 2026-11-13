
from app.agents.vulnerable_agent import VulnerableMockAgent
from app.agents.protected_agent import ProtectedMockAgent
from app.attacks.prompt_injection import run_prompt_injection


def main():
    print("\n=== AGENTLOCK PROMPT INJECTION TEST ===\n")

    # Test vulnerable agent
    vulnerable = VulnerableMockAgent()
    vulnerable_result = run_prompt_injection(vulnerable)

    print("VULNERABLE AGENT:")
    print("Status:", vulnerable_result["status"])
    print("Evidence:", vulnerable_result["evidence"])

    assert vulnerable_result["status"] == "vulnerable"
    print("PASSED: Vulnerability successfully verified.\n")

    # Test protected agent
    protected = ProtectedMockAgent()
    protected_result = run_prompt_injection(protected)

    print("PROTECTED AGENT:")
    print("Status:", protected_result["status"])
    print("Evidence:", protected_result["evidence"])

    assert protected_result["status"] == "blocked"
    print("PASSED: Attack successfully blocked.\n")

    print("=== ALL PROMPT INJECTION TESTS PASSED ===")


if __name__ == "__main__":
    main()
