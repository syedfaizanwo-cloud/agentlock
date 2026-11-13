
from app.agents.vulnerable_agent import VulnerableMockAgent
from app.agents.protected_agent import ProtectedMockAgent
from app.scanner.engine import run_scan, ATTACK_MODULES


EXPECTED_ATTACKS = [
    "prompt_injection",
    "indirect_prompt_injection",
    "data_leakage",
    "tool_abuse",
    "memory_poisoning",
    "identity_privilege_abuse",
    "human_approval_bypass",
    "inter_agent_spoofing"
]


def print_scan_results(scan):
    print("\nAgent:", scan["agent_name"])
    print("Scan status:", scan["scan_status"])
    print("Summary:", scan["summary"])

    for result in scan["results"]:
        print(
            result["attack_type"],
            "|", result["status"],
            "|", result["verification"]["outcome"],
            "|", result["risk_score"],
            "|", result["severity"]
        )


def main():
    print("\n========================================")
    print(" AGENTLOCK EIGHT-ATTACK SECURITY TEST")
    print("========================================")

    # Confirm all eight categories are registered.
    assert list(ATTACK_MODULES.keys()) == EXPECTED_ATTACKS

    print("\nPASSED: All eight attack modules registered.")

    # Test deliberately vulnerable agent.
    print("\n--- VULNERABLE AGENT ---")

    vulnerable = VulnerableMockAgent()
    vulnerable_scan = run_scan(vulnerable)

    print_scan_results(vulnerable_scan)

    v_summary = vulnerable_scan["summary"]

    assert vulnerable_scan["scan_status"] == "completed"
    assert v_summary["total_attacks"] == 8
    assert v_summary["vulnerabilities_found"] == 8
    assert v_summary["attacks_blocked"] == 0
    assert v_summary["inconclusive"] == 0

    for result in vulnerable_scan["results"]:
        assert result["status"] == "vulnerable"
        assert result["verification"]["outcome"] == (
            "vulnerability_confirmed"
        )
        assert result["verified"] is True
        assert result["risk_score"] is not None
        assert result["severity"] in (
            "high", "critical"
        )

    print("\nPASSED: All eight simulated vulnerabilities verified.")

    # Test protected agent.
    print("\n--- PROTECTED AGENT ---")

    protected = ProtectedMockAgent()
    protected_scan = run_scan(protected)

    print_scan_results(protected_scan)

    p_summary = protected_scan["summary"]

    assert protected_scan["scan_status"] == "completed"
    assert p_summary["total_attacks"] == 8
    assert p_summary["vulnerabilities_found"] == 0
    assert p_summary["attacks_blocked"] == 8
    assert p_summary["inconclusive"] == 0

    for result in protected_scan["results"]:
        assert result["status"] == "blocked"
        assert result["verification"]["outcome"] == "attack_blocked"
        assert result["verified"] is True
        assert result["risk_score"] == 0
        assert result["severity"] == "none"

    print("\nPASSED: All eight simulated attacks blocked.")

    print("\n========================================")
    print(" ALL EIGHT-ATTACK TESTS PASSED")
    print("========================================")


if __name__ == "__main__":
    main()
