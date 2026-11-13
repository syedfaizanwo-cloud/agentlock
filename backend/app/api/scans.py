import logging

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.scan import ScanCreate, ScanRead
from app.schemas.result import AttackResultRead
from app.services import scan_service
from app.services.scan_execution_service import (
    execute_and_persist_scan,
    ScanExecutionError,
)


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/scans",
    tags=["Scans"],
)


@router.post(
    "",
    response_model=ScanRead,
    status_code=status.HTTP_201_CREATED,
)
def create_new_scan(
    payload: ScanCreate,
    db: Session = Depends(get_db),
):
    try:
        scan = scan_service.create_scan(db, payload)

        # Execute Faizan's engine and persist verified results.
        return execute_and_persist_scan(db, scan)

    except LookupError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        )

    except ScanExecutionError:
        logger.exception("Scan execution failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Scan execution failed. Check backend logs.",
        )


@router.get("", response_model=list[ScanRead])
def get_scans(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return scan_service.list_scans(db, skip=skip, limit=limit)


@router.get("/{scan_id}", response_model=ScanRead)
def get_scan_details(
    scan_id: int = Path(gt=0),
    db: Session = Depends(get_db),
):
    scan = scan_service.get_scan(db, scan_id)

    if scan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found",
        )

    return scan


@router.get(
    "/{scan_id}/results",
    response_model=list[AttackResultRead],
)
def get_scan_results(
    scan_id: int = Path(gt=0),
    db: Session = Depends(get_db),
):
    scan = scan_service.get_scan(db, scan_id)

    if scan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found",
        )

    return scan_service.get_scan_results(db, scan_id)
