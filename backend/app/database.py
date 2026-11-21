import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# MySQL for the real project:  mysql+pymysql://user:password@localhost:3306/lostfound
# Defaults to SQLite so you can run and test immediately.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./lostfound.db")
# Hosts like Neon/Render hand out "postgres://..." or "postgresql://..."; SQLAlchemy wants the psycopg2 driver name.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("postgres://"):]
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("postgresql://"):]

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    pool_pre_ping=True,  # free DBs drop idle connections
)
SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
