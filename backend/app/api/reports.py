import logging

from fastapi import APIRouter, Depends, HTTPException, Path
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.report import ReportRead
from app.services.report_service import (
    generate_report,
    get_report,
    get_report_file_path,
)


logger = logging.getLogger(__name__)

router = APIRouter(tags=["Reports"])


@router.post(
    "/scans/{scan_id}/report",
    response_model=ReportRead,
    status_code=201,
)
def create_scan_report(
    scan_id: int = Path(gt=0),
    db: Session = Depends(get_db),
):
    try:
        return generate_report(db, scan_id)

    except LookupError:
        raise HTTPException(
            status_code=404,
            detail="Scan not found",
        )

    except Exception:
        logger.exception("Report generation failed for scan %s", scan_id)
        raise HTTPException(
            status_code=500,
            detail="Report generation failed",
        )


@router.get("/reports/{report_id}/pdf")
def download_report(
    report_id: int = Path(gt=0),
    db: Session = Depends(get_db),
):
    report = get_report(db, report_id)

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    if report.status != "completed":
        raise HTTPException(
            status_code=409,
            detail="Report is not ready for download",
        )

    try:
        file_path = get_report_file_path(report)

    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Report file not found",
        )

    except ValueError:
        logger.exception("Invalid storage path for report %s", report_id)
        raise HTTPException(
            status_code=500,
            detail="Invalid report storage configuration",
        )

    if not file_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Report file not found",
        )

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=report.file_name or file_path.name,
    )
