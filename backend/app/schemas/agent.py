from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AgentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    agent_type: str = Field(default="mock", min_length=1, max_length=50)

    @field_validator("name", "agent_type")
    @classmethod
    def validate_non_empty(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Field cannot be empty")

        return value

    @field_validator("description")
    @classmethod
    def clean_description(cls, value: str | None) -> str | None:
        if value is not None:
            value = value.strip()

        return value or None


class AgentRead(BaseModel):
    id: int
    name: str
    description: str | None
    agent_type: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
