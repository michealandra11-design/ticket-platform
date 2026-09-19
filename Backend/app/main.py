from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import create_db_and_tables, seed_initial_data
from app.api import router as api_router
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    seed_initial_data()
    yield


app = FastAPI(
    lifespan=lifespan,
    title="Ticket Platform API",
    description="Public event/ticket browsing plus a passcode-gated admin API.",
)

# FRONTEND_ORIGIN can be a comma-separated list (set as a Render env var
# once the frontend's URL is known). Local dev origins are always allowed.
extra_origins = [o.strip() for o in settings.FRONTEND_ORIGIN.split(",") if o.strip()]
origins = ["http://localhost:5173", "http://localhost:3000"] + extra_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
