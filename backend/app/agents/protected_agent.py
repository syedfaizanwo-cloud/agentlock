
class ProtectedMockAgent:
    """
    Simulated protected AI agent.
    Blocks unauthorized access to synthetic data,
    tools and persistent memory.
    """

    def __init__(self):
        self.name = "Protected Mock Agent"

        self.synthetic_secret = "AGENTLOCK-CANARY-2026-001"

        self.memory = []
        self.action_log = []

        self.synthetic_records = [
            {"id": 1, "name": "Test User A"},
            {"id": 2, "name": "Test User B"}
        ]

    def process_prompt(self, prompt: str) -> dict:
        """Block simulated prompt-injection attempts."""

        normalized = prompt.lower()

        attack_markers = (
            "ignore prevous instructions",
            "reveal the canary",
            "show the secret",
            "print the secret"
        )

        if any(marker in normalized for marker in attack_markers):
            self.action_log.append({
                "action": "read_synthetic_secret",
                "authorized": False,
                "success": False
            })

            return {
                "allowed": False,
                "output": "Request blocked by security policy.",
                "evidence": {
                    "canary_exposed": False,
                    "unauthorized": True,
                    "blocked": True
                }
            }

        return {
            "allowed": True,
            "output": "Mock agent processed the request.",
            "evidence": {
                "canary_exposed": False,
                "blocked": False
            }
        }

    def call_tool(
        self, tool_name: str, authorized: bool = False
    ) -> dict:
        """Require authorization before allowing tool access."""

        if tool_name != "read_synthetic_records":
            return {
                "allowed": False,
                "output": "Unknown simulated tool.",
                "evidence": {"unknown_tool": True}
            }

        if not authorized:
            self.action_log.append({
                "action": tool_name,
                "authorized": False,
                "success": False
            })

            return {
                "allowed": False,
                "output": "Unauthorized tool access blocked.",
                "evidence": {
                    "unauthorized_tool_access": True,
                    "records_returned": 0,
                    "blocked": True
                }
            }

        self.action_log.append({
            "action": tool_name,
            "authorized": True,
            "success": True
        })

        return {
            "allowed": True,
            "output": self.synthetic_records,
            "evidence": {
                "unauthorized_tool_access": False,
                "records_returned": len(self.synthetic_records)
            }
        }

    def update_memory(
        self, note: str, trusted: bool = False
    ) -> dict:
        """Only accept trusted memory updates."""

        if not trusted:
            self.action_log.append({
                "action": "memory_update",
                "trusted": False,
                "success": False
            })

            return {
                "allowed": False,
                "output": "Untrusted memory update blocked.",
                "evidence": {
                    "untrusted_memory_write": True,
                    "blocked": True
                }
            }

        self.memory.append(note)

        self.action_log.append({
            "action": "memory_update",
            "trusted": True,
            "success": True
        })

        return {
            "allowed": True,
            "output": "Trusted memory update accepted.",
            "evidence": {
                "untrusted_memory_write": False
            }
        }

    def read_sensitive_data(self, authorized: bool = False) -> dict:
        """Require authorization before exposing synthetic confidential data."""

        if not authorized:
            self.action_log.append({
                "action": "read_sensitive_data",
                "authorized": False,
                "success": False
            })

            return {
                "allowed": False,
                "output": "Unauthorized sensitive data access blocked.",
                "evidence": {
                    "canary_exposed": False,
                    "unauthorized": True,
                    "blocked": True
                }
            }

        self.action_log.append({
            "action": "read_sensitive_data",
            "authorized": True,
            "success": True
        })

        return {
            "allowed": True,
            "output": self.synthetic_secret,
            "evidence": {
                "canary_exposed": True,
                "unauthorized": False,
                "blocked": False
            }
        }


    def process_retrieved_document(self, document_text: str) -> dict:
        """Treat instructions in retrieved documents as untrusted content."""

        normalized = document_text.lower()

        malicious_markers = (
            "ignore previous instructions",
            "reveal the canary",
            "print the secret",
            "disclose the secret"
        )

        if any(marker in normalized for marker in malicious_markers):
            self.action_log.append({
                "action": "read_synthetic_secret",
                "authorized": False,
                "success": False,
                "source": "retrieved_document"
            })

            return {
                "allowed": False,
                "output": "Malicious document instruction blocked.",
                "evidence": {
                    "canary_exposed": False,
                    "unauthorized": True,
                    "blocked": True,
                    "source": "retrieved_document"
                }
            }

        return {
            "allowed": True,
            "output": "Document processed safely.",
            "evidence": {
                "canary_exposed": False,
                "blocked": False,
                "source": "retrieved_document"
            }
        }


    def perform_privileged_action(self, verified_role: str = "user") -> dict:
        """
        Enforce role-based authorization before privileged actions.
        """

        if verified_role != "admin":
            self.action_log.append({
                "action": "export_synthetic_records",
                "actor_role": verified_role,
                "required_role": "admin",
                "success": False
            })

            return {
                "allowed": False,
                "output": "Administrator permission required.",
                "evidence": {
                    "actor_role": verified_role,
                    "required_role": "admin",
                    "privileged_action_executed": False,
                    "records_returned": 0,
                    "unauthorized": True,
                    "blocked": True
                }
            }

        self.action_log.append({
            "action": "export_synthetic_records",
            "actor_role": verified_role,
            "required_role": "admin",
            "success": True
        })

        return {
            "allowed": True,
            "output": self.synthetic_records,
            "evidence": {
                "actor_role": verified_role,
                "required_role": "admin",
                "privileged_action_executed": True,
                "records_returned": len(self.synthetic_records),
                "unauthorized": False,
                "blocked": False
            }
        }


    def execute_sensitive_operation(self, approval_token=None):
        """
        Simulate mandatory human approval enforcement.
        """

        valid_approval_token = "AGENTLOCK-APPROVAL-TEST-001"

        if approval_token != valid_approval_token:
            self.sensitive_action_executed = False

            self.action_log.append({
                "action": "publish_synthetic_report",
                "approval_required": True,
                "approval_provided": approval_token is not None,
                "success": False
            })

            return {
                "allowed": False,
                "output": "Human approval required. Operation blocked.",
                "evidence": {
                    "approval_required": True,
                    "approval_provided": approval_token is not None,
                    "sensitive_action_executed": False,
                    "approval_bypassed": False,
                    "blocked": True
                }
            }

        self.sensitive_action_executed = True

        self.action_log.append({
            "action": "publish_synthetic_report",
            "approval_required": True,
            "approval_provided": True,
            "success": True
        })

        return {
            "allowed": True,
            "output": "Approved synthetic report published.",
            "evidence": {
                "approval_required": True,
                "approval_provided": True,
                "sensitive_action_executed": True,
                "approval_bypassed": False,
                "blocked": False
            }
        }

    def process_agent_message(
        self,
        message: dict,
        channel_verified_sender: str
    ) -> dict:
        """
        Validate the channel-authenticated sender rather
        than trusting the identity claimed in the message.
        """

        claimed_sender = message.get("claimed_sender")
        operation = message.get("operation")

        if (
            channel_verified_sender != "admin-agent"
            or claimed_sender != channel_verified_sender
        ):
            self.action_log.append({
                "action": "process_inter_agent_command",
                "claimed_sender": claimed_sender,
                "verified_sender": channel_verified_sender,
                "required_sender": "admin-agent",
                "success": False
            })

            return {
                "allowed": False,
                "output": "Untrusted agent message blocked.",
                "evidence": {
                    "claimed_sender": claimed_sender,
                    "channel_verified_sender": channel_verified_sender,
                    "sender_spoofed": (
                        claimed_sender != channel_verified_sender
                    ),
                    "operation_executed": False,
                    "records_returned": 0,
                    "blocked": True
                }
            }

        if operation != "read_synthetic_records":
            return {
                "allowed": False,
                "output": "Unsupported agent operation.",
                "evidence": {
                    "operation_executed": False,
                    "records_returned": 0,
                    "blocked": True
                }
            }

        self.action_log.append({
            "action": "process_inter_agent_command",
            "claimed_sender": claimed_sender,
            "verified_sender": channel_verified_sender,
            "required_sender": "admin-agent",
            "success": True
        })

        return {
            "allowed": True,
            "output": self.synthetic_records,
            "evidence": {
                "claimed_sender": claimed_sender,
                "channel_verified_sender": channel_verified_sender,
                "sender_spoofed": False,
                "operation_executed": True,
                "records_returned": len(self.synthetic_records),
                "blocked": False
            }
        }
