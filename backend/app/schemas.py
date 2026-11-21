from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class ReportCreate(BaseModel):
    kind: str = Field(pattern="^(lost|found)$")
    title: str
    category: str
    color: str | None = None
    brand: str | None = None
    location: str
    event_time: datetime
    description: str | None = None
    private_detail: str | None = None
    reporter_name: str
    reporter_email: str


class ReportPublic(BaseModel):
    """Public view: private_detail and reporter_email are deliberately left out."""
    id: int
    kind: str
    title: str
    category: str
    color: str | None
    brand: str | None
    location: str
    event_time: datetime
    description: str | None
    status: str
    model_config = {"from_attributes": True}


class MatchOut(BaseModel):
    id: int
    score: float
    status: str
    lost: ReportPublic
    found: ReportPublic
    model_config = {"from_attributes": True}


class ClaimCreate(BaseModel):
    claimant_answer: str
