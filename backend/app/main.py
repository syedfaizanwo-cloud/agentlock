from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
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
    docs_url="/docs",
    redoc_url="/redoc",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers
app.include_router(agents_router, prefix="/api")
app.include_router(scans_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(reports_router, prefix="/api")


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



