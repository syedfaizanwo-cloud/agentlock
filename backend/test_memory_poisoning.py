
from app.agents.vulnerable_agent import VulnerableMockAgent
from app.agents.protected_agent import ProtectedMockAgent
from app.attacks.memory_poisoning import run_memory_poisoning


def main():
    print("\n=== AGENTLOCK MEMORY POISONING TEST ===\n")

    # Test vulnerable agent
    vulnerable = VulnerableMockAgent()
    v_result = run_memory_poisoning(vulnerable)

    print("VULNERABLE AGENT:")
    print("Status:", v_result["status"])
    print("Evidence:", v_result["evidence"])

    assert v_result["status"] == "vulnerable"
    assert v_result["verified"] is True

    print("PASSED: Untrusted memory modification verified.\n")

    # Test protected agent
    protected = ProtectedMockAgent()
    p_result = run_memory_poisoning(protected)

    print("PROTECTED AGENT:")
    print("Status:", p_result["status"])
    print("Evidence:", p_result["evidence"])

    assert p_result["status"] == "blocked"
    assert p_result["verified"] is True

    print("PASSED: Untrusted memory modification blocked.\n")

    print("=== ALL MEMORY POISONING TESTS PASSED ===")


if __name__ == "__main__":
    main()
