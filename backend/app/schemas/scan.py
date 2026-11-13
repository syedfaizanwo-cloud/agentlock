from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


AttackCategory = Literal[
    "prompt_injection",
    "sensitive_data_leakage",
    "unauthorized_tool_usage",
    "memory_poisoning",
]


class ScanCreate(BaseModel):
    agent_id: int = Field(gt=0)
    attack_categories: list[AttackCategory] = Field(min_length=1)

    @field_validator("attack_categories")
    @classmethod
    def validate_categories(cls, categories):
        if len(categories) != len(set(categories)):
            raise ValueError("Duplicate attack categories are not allowed")
        return categories


class ScanRead(BaseModel):
    id: int
    agent_id: int | None
    status: str
    attack_categories: list[str]
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
