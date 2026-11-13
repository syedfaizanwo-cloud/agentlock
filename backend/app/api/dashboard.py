from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.services.dashboard_service import get_dashboard_stats
from app.services.comparison_service import (
    get_agent_comparison,
    ComparisonNotFoundError,
    ComparisonConflictError,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    return get_dashboard_stats(db)


@router.get("/comparison")
def dashboard_comparison(
    vulnerable_scan_id: int | None = Query(default=None, gt=0),
    protected_scan_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
):
    try:
        return get_agent_comparison(
            db,
            vulnerable_scan_id=vulnerable_scan_id,
            protected_scan_id=protected_scan_id,
        )

    except ComparisonNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except ComparisonConflictError as error:
        raise HTTPException(
            status_code=409,
            detail=str(error),
        )