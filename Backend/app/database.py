from sqlmodel import SQLModel, create_engine, Session, select
from datetime import datetime, timezone
from app.config import settings
from app.models import Event, TicketType

engine = create_engine(settings.DATABASE_URL, echo=False)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


def img(seed: str) -> str:
    # Deterministic placeholder photography — distinct per event, no
    # reliance on any real artist's copyrighted promotional photo.
    return f"https://picsum.photos/seed/{seed}/1200/800"


def seed_initial_data():
    """Seeds a handful of real, publicly announced event dates (as of
    Sept 2026) plus example ticket types, so the admin panel has real
    data to edit from the start instead of an empty database. Only runs
    once — never overwrites data you add or edit afterward."""
    with Session(engine) as session:
        existing = session.exec(select(Event)).first()
        if existing:
            return

        events_data = [
            {
                "name": "Olivia Rodrigo - The Unraveled Tour",
                "description": "Olivia Rodrigo kicks off The Unraveled Tour in support of her third studio album.",
                "imageUrl": img("olivia-rodrigo-hartford"),
                "date": datetime(2026, 9, 25, 19, 0, tzinfo=timezone.utc),
                "venueName": "PeoplesBank Arena",
                "venueLocation": "Hartford, CT",
                "status": "On Sale",
            },
            {
                "name": "Bruno Mars - The Romantic Tour",
                "description": "Bruno Mars brings The Romantic Tour to SoFi Stadium with special guest Anderson .Paak as DJ Pee .Wee.",
                "imageUrl": img("bruno-mars-sofi"),
                "date": datetime(2026, 9, 30, 19, 0, tzinfo=timezone.utc),
                "venueName": "SoFi Stadium",
                "venueLocation": "Inglewood, CA",
                "status": "On Sale",
            },
            {
                "name": "Olivia Rodrigo - The Unraveled Tour",
                "description": "The Unraveled Tour continues with a multi-night stand at Chicago's United Center.",
                "imageUrl": img("olivia-rodrigo-chicago"),
                "date": datetime(2026, 10, 11, 19, 0, tzinfo=timezone.utc),
                "venueName": "United Center",
                "venueLocation": "Chicago, IL",
                "status": "On Sale",
            },
            {
                "name": "Bruno Mars - The Romantic Tour",
                "description": "The Romantic Tour heads north for a stadium show at BC Place, Vancouver.",
                "imageUrl": img("bruno-mars-vancouver"),
                "date": datetime(2026, 10, 14, 19, 0, tzinfo=timezone.utc),
                "venueName": "BC Place",
                "venueLocation": "Vancouver, BC",
                "status": "On Sale",
            },
            {
                "name": "Harry Styles - Together, Together",
                "description": "Harry Styles' Madison Square Garden residency, part of his Together, Together world tour.",
                "imageUrl": img("harry-styles-msg"),
                "date": datetime(2026, 10, 2, 20, 0, tzinfo=timezone.utc),
                "venueName": "Madison Square Garden",
                "venueLocation": "New York, NY",
                "status": "On Sale",
            },
        ]

        for e in events_data:
            event = Event(**e)
            session.add(event)
            session.commit()
            session.refresh(event)

            # Example ticket types per event — admins can edit/add/remove
            # these freely from the admin panel afterward.
            session.add(
                TicketType(
                    eventId=event.id,
                    name="General Admission",
                    price=89.00,
                    quantityTotal=2000,
                    quantityAvailable=2000,
                )
            )
            session.add(
                TicketType(
                    eventId=event.id,
                    name="VIP Floor",
                    price=349.00,
                    quantityTotal=200,
                    quantityAvailable=200,
                )
            )
            session.commit()
