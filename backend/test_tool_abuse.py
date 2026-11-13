
from app.agents.vulnerable_agent import VulnerableMockAgent
from app.agents.protected_agent import ProtectedMockAgent
from app.attacks.tool_abuse import run_tool_abuse


def main():
    print("\n=== AGENTLOCK TOOL ABUSE TEST ===\n")

    # Test vulnerable agent
    vulnerable = VulnerableMockAgent()
    v_result = run_tool_abuse(vulnerable)

    print("VULNERABLE AGENT:")
    print("Status:", v_result["status"])
    print("Evidence:", v_result["evidence"])

    assert v_result["status"] == "vulnerable"
    assert v_result["verified"] is True

    print("PASSED: Unauthorized tool execution verified.\n")

    # Test protected agent
    protected = ProtectedMockAgent()
    p_result = run_tool_abuse(protected)

    print("PROTECTED AGENT:")
    print("Status:", p_result["status"])
    print("Evidence:", p_result["evidence"])

    assert p_result["status"] == "blocked"
    assert p_result["verified"] is True

    print("PASSED: Unauthorized tool execution blocked.\n")

    print("=== ALL TOOL ABUSE TESTS PASSED ===")


if __name__ == "__main__":
    main()
