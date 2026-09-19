from fastapi import APIRouter, Depends, HTTPException, Header
from sqlmodel import Session, select
from typing import Optional, List
from datetime import datetime
from app.database import get_session
from app.models import Event, TicketType
from app.config import settings

router = APIRouter()


def require_admin(x_admin_password: Optional[str] = Header(default=None)):
    """Simple shared-passcode gate for admin write endpoints. Not meant as
    real multi-user auth — it's a lightweight lock for a single-operator
    admin panel, checked against the ADMIN_PASSWORD env var."""
    if not x_admin_password or x_admin_password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin passcode")
    return True


def _coerce_datetime(value):
    """SQLite's DateTime column rejects anything that isn't already a
    Python datetime/date object. Normally FastAPI/Pydantic parses an ISO
    string into a real datetime before this point, but coerce defensively
    here too so a raw string can never reach the database layer."""
    if isinstance(value, str):
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    return value


@router.post("/admin/login")
def admin_login(x_admin_password: Optional[str] = Header(default=None)):
    if not x_admin_password or x_admin_password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin passcode")
    return {"ok": True}


# ---------- Public: Events ----------


@router.get("/events", response_model=List[Event], tags=["Events"])
def list_events(session: Session = Depends(get_session)):
    return session.exec(select(Event).order_by(Event.date)).all()


@router.get("/events/{event_id}", tags=["Events"])
def get_event(event_id: int, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    ticket_types = session.exec(
        select(TicketType).where(TicketType.eventId == event_id)
    ).all()
    return {**event.dict(), "ticketTypes": ticket_types}


# ---------- Admin: Events ----------


@router.post("/admin/events", response_model=Event, tags=["Admin"])
def create_event(
    event: Event,
    session: Session = Depends(get_session),
    _: bool = Depends(require_admin),
):
    event.id = None
    event.date = _coerce_datetime(event.date)
    event.createdAt = datetime.utcnow()
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


@router.put("/admin/events/{event_id}", response_model=Event, tags=["Admin"])
def update_event(
    event_id: int,
    event: Event,
    session: Session = Depends(get_session),
    _: bool = Depends(require_admin),
):
    existing = session.get(Event, event_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    # createdAt is server-managed and never updated by the client; excluding
    # it here also sidesteps any stale/odd value the client might echo back.
    data = event.dict(exclude_unset=True, exclude={"id", "createdAt"})
    if "date" in data:
        data["date"] = _coerce_datetime(data["date"])
    for key, value in data.items():
        setattr(existing, key, value)
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing


@router.delete("/admin/events/{event_id}", tags=["Admin"])
def delete_event(
    event_id: int,
    session: Session = Depends(get_session),
    _: bool = Depends(require_admin),
):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    ticket_types = session.exec(
        select(TicketType).where(TicketType.eventId == event_id)
    ).all()
    for tt in ticket_types:
        session.delete(tt)
    session.delete(event)
    session.commit()
    return {"message": "Event deleted"}


# ---------- Admin: Ticket Types (seats/sections/pricing/inventory) ----------


@router.post(
    "/admin/events/{event_id}/ticket-types",
    response_model=TicketType,
    tags=["Admin"],
)
def create_ticket_type(
    event_id: int,
    ticket_type: TicketType,
    session: Session = Depends(get_session),
    _: bool = Depends(require_admin),
):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    ticket_type.id = None
    ticket_type.eventId = event_id
    session.add(ticket_type)
    session.commit()
    session.refresh(ticket_type)
    return ticket_type


@router.put(
    "/admin/ticket-types/{ticket_type_id}",
    response_model=TicketType,
    tags=["Admin"],
)
def update_ticket_type(
    ticket_type_id: int,
    ticket_type: TicketType,
    session: Session = Depends(get_session),
    _: bool = Depends(require_admin),
):
    existing = session.get(TicketType, ticket_type_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Ticket type not found")
    for key, value in ticket_type.dict(
        exclude_unset=True, exclude={"id", "eventId"}
    ).items():
        setattr(existing, key, value)
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing


@router.delete("/admin/ticket-types/{ticket_type_id}", tags=["Admin"])
def delete_ticket_type(
    ticket_type_id: int,
    session: Session = Depends(get_session),
    _: bool = Depends(require_admin),
):
    ticket_type = session.get(TicketType, ticket_type_id)
    if not ticket_type:
        raise HTTPException(status_code=404, detail="Ticket type not found")
    session.delete(ticket_type)
    session.commit()
    return {"message": "Ticket type deleted"}


# ---------- Admin: list everything (for the dashboard) ----------


@router.get("/admin/events", tags=["Admin"])
def admin_list_events(
    session: Session = Depends(get_session), _: bool = Depends(require_admin)
):
    events = session.exec(select(Event).order_by(Event.date)).all()
    result = []
    for event in events:
        ticket_types = session.exec(
            select(TicketType).where(TicketType.eventId == event.id)
        ).all()
        result.append({**event.dict(), "ticketTypes": ticket_types})
    return result
