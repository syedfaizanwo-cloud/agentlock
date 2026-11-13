
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


def display_results(scan):
    print("\nAgent:", scan["agent_name"])
    print("Scan status:", scan["scan_status"])
    print("Summary:", scan["summary"])

    for result in scan["results"]:
        print(
            result["attack_type"],
            "|", result["status"],
            "|", result["verification"]["outcome"],
            "| Score:", result["risk_score"],
            "| Severity:", result["severity"]
        )


def expect_value_error(function, description):
    try:
        function()
    except ValueError:
        print("PASSED:", description)
        return

    raise AssertionError(
        "Expected ValueError was not raised: " + description
    )


def main():
    print("\n========================================")
    print(" AGENTLOCK SCANNER REGRESSION TESTS")
    print("========================================")

    # TEST 1: Verify all eight attack modules.
    assert list(ATTACK_MODULES.keys()) == EXPECTED_ATTACKS

    print("\nPASSED: All eight attack modules registered.")

    # TEST 2: Scan vulnerable agent.
    print("\n--- VULNERABLE AGENT SCAN ---")

    vulnerable = VulnerableMockAgent()
    vulnerable_scan = run_scan(vulnerable)

    display_results(vulnerable_scan)

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

    print("\nPASSED: All eight simulated vulnerabilities verified.")

    # TEST 3: Scan protected agent.
    print("\n--- PROTECTED AGENT SCAN ---")

    protected = ProtectedMockAgent()
    protected_scan = run_scan(protected)

    display_results(protected_scan)

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

    # TEST 4: Single attack selection.
    print("\n--- SINGLE ATTACK SELECTION ---")

    single_scan = run_scan(
        VulnerableMockAgent(),
        ["data_leakage"]
    )

    assert single_scan["summary"]["total_attacks"] == 1
    assert single_scan["summary"]["vulnerabilities_found"] == 1

    print("PASSED: Single attack selection works.")

    # TEST 5: Multiple selected attacks.
    print("\n--- MULTIPLE ATTACK SELECTION ---")

    selected_categories = [
        "prompt_injection",
        "inter_agent_spoofing"
    ]

    selected_scan = run_scan(
        VulnerableMockAgent(),
        selected_categories
    )

    assert selected_scan["summary"]["total_attacks"] == 2
    assert selected_scan["summary"]["vulnerabilities_found"] == 2

    print("PASSED: Multiple attack selection works.")

    # TEST 6: Invalid attack category.
    expect_value_error(
        lambda: run_scan(
            VulnerableMockAgent(),
            ["unknown_attack"]
        ),
        "Unknown attack category rejected."
    )

    # TEST 7: Empty attack selection.
    expect_value_error(
        lambda: run_scan(
            VulnerableMockAgent(),
            []
        ),
        "Empty attack selection rejected."
    )

    # TEST 8: Duplicate attack category.
    expect_value_error(
        lambda: run_scan(
            VulnerableMockAgent(),
            ["data_leakage", "data_leakage"]
        ),
        "Duplicate attack categories rejected."
    )

    # TEST 9: One failed attack must not stop other attacks.
    print("\n--- ATTACK FAILURE HANDLING ---")

    class BrokenPromptAgent(VulnerableMockAgent):

        def process_prompt(self, prompt):
            raise RuntimeError(
                "Simulated prompt execution failure."
            )

    failure_scan = run_scan(
        BrokenPromptAgent(),
        ["prompt_injection", "data_leakage"]
    )

    failure_results = failure_scan["results"]

    assert failure_results[0]["status"] == "inconclusive"
    assert failure_results[1]["status"] == "vulnerable"

    assert failure_scan["scan_status"] == "completed_with_errors"
    assert failure_scan["summary"]["total_attacks"] == 2
    assert failure_scan["summary"]["inconclusive"] == 1
    assert failure_scan["summary"]["vulnerabilities_found"] == 1

    print("PASSED: Failed attack did not stop the remaining scan.")

    print("\n========================================")
    print(" ALL SCANNER REGRESSION TESTS PASSED")
    print("========================================")


if __name__ == "__main__":
    main()
