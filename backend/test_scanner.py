
from app.agents.vulnerable_agent import VulnerableMockAgent
from app.agents.protected_agent import ProtectedMockAgent
from app.scanner.engine import run_scan


def display_results(scan):
    print("\nAgent:", scan["agent_name"])
    print("Scan status:", scan["scan_status"])
    print("Summary:", scan["summary"])

    for result in scan["results"]:
        print(
            f'{result["attack_type"]}: '
            f'{result["status"]}'
        )


def main():
    print("\n================================")
    print(" AGENTLOCK COMPLETE SECURITY SCAN")
    print("================================")

    # Scan vulnerable agent
    print("\n--- VULNERABLE AGENT SCAN ---")

    vulnerable = VulnerableMockAgent()
    vulnerable_scan = run_scan(vulnerable)

    display_results(vulnerable_scan)

    assert vulnerable_scan["scan_status"] == "completed"
    assert vulnerable_scan["summary"]["vulnerabilities_found"] == 4
    assert vulnerable_scan["summary"]["attacks_blocked"] == 0
    assert vulnerable_scan["summary"]["inconclusive"] == 0

    print("\nPASSED: All four simulated vulnerabilities verified.")

    # Scan protected agent
    print("\n--- PROTECTED AGENT SCAN ---")

    protected = ProtectedMockAgent()
    protected_scan = run_scan(protected)

    display_results(protected_scan)

    assert protected_scan["scan_status"] == "completed"
    assert protected_scan["summary"]["vulnerabilities_found"] == 0
    assert protected_scan["summary"]["attacks_blocked"] == 4
    assert protected_scan["summary"]["inconclusive"] == 0

    print("\nPASSED: All four simulated attacks blocked.")

    print("\n================================")
    print(" ALL AGENTLOCK SCANNER TESTS PASSED")
    print("================================")


if __name__ == "__main__":
    main()
