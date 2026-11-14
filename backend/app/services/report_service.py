from datetime import datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database.models import Scan, AttackResult, Report


BACKEND_DIR = Path(__file__).resolve().parents[2]
REPORT_DIR = BACKEND_DIR / "reports"


def safe_paragraph(value, style):
    return Paragraph(escape(str(value)), style)


def generate_report(db: Session, scan_id: int) -> Report:
    statement = (
        select(Scan)
        .where(Scan.id == scan_id)
        .options(
            selectinload(Scan.agent),
            selectinload(Scan.results).selectinload(
                AttackResult.evidence
            ),
        )
    )

    scan = db.scalar(statement)

    if scan is None:
        raise LookupError("Scan not found")

    report = Report(
        scan_id=scan.id,
        status="generating",
    )

    file_path = None

    try:
        db.add(report)
        db.flush()

        REPORT_DIR.mkdir(parents=True, exist_ok=True)

        file_name = f"agentlock_scan_{scan.id}_report_{report.id}.pdf"
        file_path = REPORT_DIR / file_name

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "AgentLockTitle",
            parent=styles["Title"],
            alignment=TA_CENTER,
            textColor=colors.HexColor("#17365D"),
            fontSize=20,
            spaceAfter=12,
        )

        section_style = styles["Heading2"]
        body_style = styles["BodyText"]

        warning_style = ParagraphStyle(
            "AgentLockWarning",
            parent=body_style,
            textColor=colors.darkred,
            backColor=colors.HexColor("#FFF1F0"),
            borderPadding=8,
            spaceAfter=10,
        )

        story = [
            Paragraph("AgentLock Security Assessment Report", title_style),
            Spacer(1, 8 * mm),
        ]

        story.append(
            Paragraph(
                f"<b>Report ID:</b> {report.id}",
                body_style,
            )
        )

        story.append(
            Paragraph(
                f"<b>Scan ID:</b> {scan.id}",
                body_style,
            )
        )

        agent_name = (
            scan.agent.name if scan.agent else "Agent no longer registered"
        )

        story.append(
            Paragraph(
                f"<b>Agent:</b> {escape(agent_name)}",
                body_style,
            )
        )

        story.append(
            Paragraph(
                f"<b>Agent ID:</b> {scan.agent_id}",
                body_style,
            )
        )

        story.append(
            Paragraph(
                f"<b>Scan Status:</b> {escape(scan.status.upper())}",
                body_style,
            )
        )

        if scan.status != "completed":
            story.append(Spacer(1, 5 * mm))
            story.append(
                Paragraph(
                    "<b>INCOMPLETE ASSESSMENT:</b> "
                    "This scan has not reached completed status. "
                    "This document must not be interpreted as a "
                    "completed security assessment.",
                    warning_style,
                )
            )

        story.append(Spacer(1, 5 * mm))
        story.append(Paragraph("Scan Summary", section_style))

        categories = scan.attack_categories or []

        confirmed_vulnerabilities = sum(
            1 for result in scan.results
            if result.verified
            and result.vulnerability_status == "vulnerable"
        )

        verified_blocked = sum(
            1 for result in scan.results
            if result.verified
            and result.vulnerability_status == "blocked"
        )

        inconclusive_results = sum(
            1 for result in scan.results
            if (
                result.vulnerability_status == "inconclusive"
                or not result.verified
            )
        )

        summary_data = [
            ["Metric", "Recorded value"],
            ["Attack categories", str(len(categories))],
            ["Attack results", str(len(scan.results))],
            ["Confirmed vulnerabilities", str(confirmed_vulnerabilities)],
            ["Verified blocked attacks", str(verified_blocked)],
            ["Inconclusive / unverified", str(inconclusive_results)],
        ]

        summary_table = Table(
            summary_data,
            colWidths=[65 * mm, 85 * mm],
        )

        summary_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17365D")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("PADDING", (0, 0), (-1, -1), 7),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ])
        )

        story.append(summary_table)
        story.append(Spacer(1, 5 * mm))

        story.append(Paragraph("Attack Categories", section_style))

        for category in categories:
            story.append(safe_paragraph(category, body_style))

        story.append(Spacer(1, 5 * mm))
        story.append(Paragraph("Attack Results and Evidence", section_style))

        if not scan.results:
            story.append(
                safe_paragraph(
                    "No attack results are recorded for this scan.",
                    body_style,
                )
            )

        for index, result in enumerate(scan.results, start=1):
            story.append(
                Paragraph(f"Result {index}", styles["Heading3"])
            )

            fields = [
                ("Category", result.category),
                ("Vulnerability status", result.vulnerability_status),
                ("Severity", result.severity),
                (
                    "Risk score",
                    str(result.risk_score)
                    if result.risk_score is not None
                    else "Unrated"
                ),
                ("Risk rationale", result.risk_rationale or "Not recorded"),
                ("Verified", "Yes" if result.verified else "No"),
                ("Attack input", result.attack_input or "Not recorded"),
                ("Impact", result.impact or "Not recorded"),
                ("Remediation", result.remediation or "Not recorded"),
                (
                    "Verification summary",
                    result.verification_summary or "Not recorded",
                ),
                ("Retest status", result.retest_status),
            ]

            for label, value in fields:
                story.append(
                    Paragraph(
                        f"<b>{escape(label)}:</b> {escape(str(value))}",
                        body_style,
                    )
                )

            story.append(Spacer(1, 3 * mm))
            story.append(Paragraph("Evidence", styles["Heading4"]))

            if not result.evidence:
                story.append(
                    safe_paragraph("No evidence recorded.", body_style)
                )

            for evidence in result.evidence:
                evidence_content = (
                    "[REDACTED]"
                    if evidence.is_redacted
                    else (evidence.content or "")[:5000]
                )

                story.append(
                    Paragraph(
                        f"<b>{escape(evidence.evidence_type)}:</b> "
                        f"{escape(evidence_content)}",
                        body_style,
                    )
                )

            story.append(Spacer(1, 5 * mm))

        story.append(Spacer(1, 5 * mm))
        story.append(
            Paragraph("Report Integrity and Limitations", section_style)
        )

        story.append(
            safe_paragraph(
                "This report reflects records stored in AgentLock at "
                "the time of generation. Verified status reflects the "
                "stored backend verification flag. An empty result set "
                "does not prove that an agent is secure. Pending or "
                "running scans are incomplete assessments. Risk scores "
                "are provisional AgentLock ratings, not CVSS scores.",
                body_style,
            )
        )

        document = SimpleDocTemplate(
            str(file_path),
            pagesize=A4,
            rightMargin=18 * mm,
            leftMargin=18 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm,
            title=f"AgentLock Scan {scan.id} Report",
            author="AgentLock",
        )

        document.build(story)

        report.file_name = file_name
        report.storage_path = str(file_path.resolve())
        report.status = "completed"
        report.generated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(report)

        return report

    except Exception:
        db.rollback()

        if file_path is not None and file_path.exists():
            file_path.unlink()

        raise


def get_report(db: Session, report_id: int) -> Report | None:
    return db.get(Report, report_id)


def get_report_file_path(report: Report) -> Path:
    if not report.storage_path:
        raise FileNotFoundError("Report file path is missing")

    path = Path(report.storage_path).resolve()
    expected_directory = REPORT_DIR.resolve()

    # Only allow files generated inside the dedicated reports directory.
    if path.parent != expected_directory:
        raise ValueError("Invalid report storage path")

    return path

