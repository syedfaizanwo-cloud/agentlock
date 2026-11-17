from __future__ import annotations

import secrets
from typing import Annotated

from fastapi import Header, HTTPException, status

from app.core.config import settings


async def require_internal_api_key(
    presented_key: Annotated[
        str | None,
        Header(alias="X-AgentLock-API-Key"),
    ] = None,
) -> None:
    expected_key = settings.agentlock_api_key.get_secret_value()

    # Fail closed: missing configuration must never expose stored scan data.
    if len(expected_key) < 32:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Backend access is not configured.",
        )

    if presented_key is None or not secrets.compare_digest(
        presented_key,
        expected_key,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
