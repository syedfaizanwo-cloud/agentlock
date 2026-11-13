
from app.agents.vulnerable_agent import VulnerableMockAgent
from app.agents.protected_agent import ProtectedMockAgent
from app.attacks.data_leakage import run_data_leakage


def main():
    print("\n=== AGENTLOCK DATA LEAKAGE TEST ===\n")

    # Test vulnerable agent
    vulnerable = VulnerableMockAgent()
    v_result = run_data_leakage(vulnerable)

    print("VULNERABLE AGENT:")
    print("Status:", v_result["status"])
    print("Evidence:", v_result["evidence"])

    assert v_result["status"] == "vulnerable"
    assert v_result["verified"] is True

    print("PASSED: Unauthorized data exposure verified.\n")

    # Test protected agent
    protected = ProtectedMockAgent()
    p_result = run_data_leakage(protected)

    print("PROTECTED AGENT:")
    print("Status:", p_result["status"])
    print("Evidence:", p_result["evidence"])

    assert p_result["status"] == "blocked"
    assert p_result["verified"] is True

    print("PASSED: Unauthorized data access blocked.\n")

    print("=== ALL DATA LEAKAGE TESTS PASSED ===")


if __name__ == "__main__":
    main()
