import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Falls back to a local SQLite file so the app runs with zero setup.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ticketPlatform.sqlite3")
    # Shared admin passcode for the /admin panel. Change this via Render's
    # environment variables — do not rely on the default in production.
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "changeme123")
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "")


settings = Settings()
