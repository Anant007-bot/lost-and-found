from datetime import datetime
from sqlalchemy import String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


class Report(Base):
    __tablename__ = "reports"
    id: Mapped[int] = mapped_column(primary_key=True)
    kind: Mapped[str] = mapped_column(String(10), index=True)  # "lost" | "found"
    title: Mapped[str] = mapped_column(String(120))
    category: Mapped[str] = mapped_column(String(40), index=True)
    color: Mapped[str | None] = mapped_column(String(40), nullable=True)
    brand: Mapped[str | None] = mapped_column(String(60), nullable=True)
    location: Mapped[str] = mapped_column(String(80), index=True)
    event_time: Mapped[datetime] = mapped_column(DateTime)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Never exposed publicly: used for claim verification (e.g. "name on the ID", "wallpaper")
    private_detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    reporter_name: Mapped[str] = mapped_column(String(80))
    reporter_email: Mapped[str] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(String(20), default="open")  # open | potential_match | claim_pending | resolved
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Match(Base):
    __tablename__ = "matches"
    id: Mapped[int] = mapped_column(primary_key=True)
    lost_id: Mapped[int] = mapped_column(ForeignKey("reports.id"))
    found_id: Mapped[int] = mapped_column(ForeignKey("reports.id"))
    score: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default="potential")  # potential | claim_pending | confirmed | rejected
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    lost: Mapped[Report] = relationship(foreign_keys=[lost_id])
    found: Mapped[Report] = relationship(foreign_keys=[found_id])


class Claim(Base):
    __tablename__ = "claims"
    id: Mapped[int] = mapped_column(primary_key=True)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id"))
    claimant_answer: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | approved | rejected
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
