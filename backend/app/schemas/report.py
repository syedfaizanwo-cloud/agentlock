from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReportCreate(BaseModel):
    scan_id: int = Field(gt=0)


class ReportRead(BaseModel):
    id: int
    scan_id: int
    status: str
    file_name: str | None
    created_at: datetime
    generated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)
