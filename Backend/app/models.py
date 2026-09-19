from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone


class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    date: datetime
    venueName: Optional[str] = None
    venueLocation: Optional[str] = None
    status: str = Field(default="On Sale")
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TicketType(SQLModel, table=True):
    """A category of ticket for an event — e.g. 'General Admission' or
    'VIP Floor Section A' — with its own price and inventory. This is the
    unit admins add/edit to manage seats, sections, and pricing."""

    id: Optional[int] = Field(default=None, primary_key=True)
    eventId: int = Field(foreign_key="event.id")
    name: str
    price: float
    quantityTotal: int
    quantityAvailable: int
