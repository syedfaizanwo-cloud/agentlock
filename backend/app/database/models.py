from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Float,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    agent_type: Mapped[str] = mapped_column(String(50), default="mock")

    # Target configuration is provisional pending engine coordination.
    endpoint_url: Mapped[str | None] = mapped_column(
        String(2048), nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(20), default="active", index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    scans: Mapped[list[Scan]] = relationship(back_populates="agent")


class Scan(Base):
    __tablename__ = "scans"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    agent_id: Mapped[int | None] = mapped_column(
        ForeignKey("agents.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20), default="pending", index=True
    )

    attack_categories: Mapped[list[str]] = mapped_column(
        JSON, default=list, nullable=False
    )

    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    agent: Mapped[Agent | None] = relationship(back_populates="scans")

    results: Mapped[list[AttackResult]] = relationship(
        back_populates="scan",
        cascade="all, delete-orphan",
    )

    reports: Mapped[list[Report]] = relationship(
        back_populates="scan",
        cascade="all, delete-orphan",
    )


class AttackResult(Base):
    __tablename__ = "attack_results"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    scan_id: Mapped[int] = mapped_column(
        ForeignKey("scans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    category: Mapped[str] = mapped_column(String(80), nullable=False)

    vulnerability_status: Mapped[str] = mapped_column(
        String(30), default="inconclusive", index=True
    )

    severity: Mapped[str] = mapped_column(
        String(20), default="informational", index=True
    )

    attack_input: Mapped[str | None] = mapped_column(Text, nullable=True)
    impact: Mapped[str | None] = mapped_column(Text, nullable=True)
    remediation: Mapped[str | None] = mapped_column(Text, nullable=True)
    risk_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    risk_rationale: Mapped[str | None] = mapped_column(Text, nullable=True)

    retest_status: Mapped[str] = mapped_column(
        String(30), default="not_tested"
    )

    verified: Mapped[bool] = mapped_column(Boolean, default=False)

    verification_summary: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    scan: Mapped[Scan] = relationship(back_populates="results")

    evidence: Mapped[list[Evidence]] = relationship(
        back_populates="attack_result",
        cascade="all, delete-orphan",
    )


class Evidence(Base):
    __tablename__ = "evidence"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    attack_result_id: Mapped[int] = mapped_column(
        ForeignKey("attack_results.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    evidence_type: Mapped[str] = mapped_column(
        String(50), default="text"
    )

    content: Mapped[str] = mapped_column(Text, nullable=False)

    source: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )

    is_redacted: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    attack_result: Mapped[AttackResult] = relationship(
        back_populates="evidence"
    )


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    scan_id: Mapped[int] = mapped_column(
        ForeignKey("scans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20), default="pending", index=True
    )

    file_name: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )

    storage_path: Mapped[str | None] = mapped_column(
        String(1000), nullable=True
    )

    error_message: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    generated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    scan: Mapped[Scan] = relationship(back_populates="reports")
