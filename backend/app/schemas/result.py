from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_serializer


class EvidenceRead(BaseModel):
    id: int
    evidence_type: str
    content: str
    source: str | None
    is_redacted: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("content")
    def redact_sensitive_content(self, value):
        if self.is_redacted:
            return "[REDACTED]"
        return value


class AttackResultRead(BaseModel):
    id: int
    scan_id: int
    category: str
    vulnerability_status: str
    severity: str
    risk_score: float | None = None
    risk_rationale: str | None = None
    attack_input: str | None
    impact: str | None
    remediation: str | None
    retest_status: str
    verified: bool
    verification_summary: str | None
    created_at: datetime
    evidence: list[EvidenceRead] = []

    model_config = ConfigDict(from_attributes=True)
