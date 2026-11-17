from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.security import require_internal_api_key
from app.api.agents import router as agents_router
from app.api.scans import router as scans_router
from app.api.dashboard import router as dashboard_router
from app.api.reports import router as reports_router


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "AgentLock - AI Agent Vulnerability Scanner "
        "and Automated Red Teaming Platform."
    ),
    # The API schema can disclose endpoint and data structure details.
    # Keep it off by default instead of exposing unauthenticated docs.
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Accept", "Content-Type", "X-AgentLock-API-Key"],
)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers["Cache-Control"] = "no-store"
    return response


# All data and mutation APIs require the server-to-server key.
# Health remains public and returns no customer or scan data.
protected_api = [Depends(require_internal_api_key)]
app.include_router(agents_router, prefix="/api", dependencies=protected_api)
app.include_router(scans_router, prefix="/api", dependencies=protected_api)
app.include_router(dashboard_router, prefix="/api", dependencies=protected_api)
app.include_router(reports_router, prefix="/api", dependencies=protected_api)


@app.get("/", tags=["System"])
def root():
    return {
        "message": "Welcome to AgentLock API",
        "service": settings.app_name,
        "version": settings.app_version,
    }


@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
    }
