import os
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db
from .matcher import score_pair, MATCH_THRESHOLD

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Smart Campus Lost & Found")
# Comma-separated list, e.g. "https://yourname.github.io". Localhost is always allowed for development.
_origins = ["http://localhost:5173", "http://127.0.0.1:5173"] + [
    o.strip().rstrip("/") for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()
]
app.add_middleware(CORSMiddleware, allow_origins=_origins, allow_methods=["*"], allow_headers=["*"])

# Admin endpoints require this key (sent as X-Admin-Key). Unset = open, which is fine only on your own machine.
ADMIN_KEY = os.getenv("ADMIN_KEY", "")


def require_admin(x_admin_key: str = Header(default="")):
    if ADMIN_KEY and x_admin_key != ADMIN_KEY:
        raise HTTPException(401, "Wrong or missing admin key.")


@app.get("/")
def health():
    return {"ok": True}


@app.post("/reports", response_model=schemas.ReportPublic)
def create_report(data: schemas.ReportCreate, db: Session = Depends(get_db)):
    report = models.Report(**data.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)

    # Run the matcher against all open reports of the opposite kind
    other_kind = "found" if report.kind == "lost" else "lost"
    candidates = db.query(models.Report).filter(
        models.Report.kind == other_kind,
        models.Report.status.in_(["open", "potential_match"]),
    ).all()
    for other in candidates:
        lost, found = (report, other) if report.kind == "lost" else (other, report)
        score = score_pair(lost, found)
        if score >= MATCH_THRESHOLD:
            db.add(models.Match(lost_id=lost.id, found_id=found.id, score=score))
            lost.status = found.status = "potential_match"
    db.commit()
    db.refresh(report)
    return report


@app.get("/reports", response_model=list[schemas.ReportPublic])
def list_reports(kind: str | None = None, category: str | None = None,
                 location: str | None = None, q: str | None = None,
                 db: Session = Depends(get_db)):
    query = db.query(models.Report)
    if kind:
        query = query.filter(models.Report.kind == kind)
    if category:
        query = query.filter(models.Report.category == category)
    if location:
        query = query.filter(models.Report.location == location)
    if q:
        query = query.filter(models.Report.title.ilike(f"%{q}%"))
    return query.order_by(models.Report.created_at.desc()).all()


@app.get("/reports/{report_id}/matches", response_model=list[schemas.MatchOut])
def report_matches(report_id: int, db: Session = Depends(get_db)):
    return db.query(models.Match).filter(
        (models.Match.lost_id == report_id) | (models.Match.found_id == report_id)
    ).order_by(models.Match.score.desc()).all()


@app.post("/matches/{match_id}/claim")
def claim(match_id: int, data: schemas.ClaimCreate, db: Session = Depends(get_db)):
    match = db.get(models.Match, match_id)
    if not match:
        raise HTTPException(404, "Match not found")
    db.add(models.Claim(match_id=match_id, claimant_answer=data.claimant_answer))
    match.status = "claim_pending"
    match.lost.status = match.found.status = "claim_pending"
    db.commit()
    return {"status": "claim_pending"}


# ---- Admin (protected by ADMIN_KEY) ----
@app.get("/admin/claims", dependencies=[Depends(require_admin)])
def admin_claims(db: Session = Depends(get_db)):
    """Admin sees the finder's private_detail next to the claimant's answer."""
    out = []
    for c in db.query(models.Claim).filter_by(status="pending").all():
        m = db.get(models.Match, c.match_id)
        out.append({"claim_id": c.id, "match_id": m.id, "claimant_answer": c.claimant_answer,
                    "finder_private_detail": m.found.private_detail})
    return out


@app.post("/admin/claims/{claim_id}/{decision}", dependencies=[Depends(require_admin)])
def decide(claim_id: int, decision: str, db: Session = Depends(get_db)):
    if decision not in ("approve", "reject"):
        raise HTTPException(400, "decision must be approve or reject")
    c = db.get(models.Claim, claim_id)
    if not c:
        raise HTTPException(404, "Claim not found")
    m = db.get(models.Match, c.match_id)
    if decision == "approve":
        c.status, m.status = "approved", "confirmed"
        m.lost.status = m.found.status = "resolved"
    else:
        c.status, m.status = "rejected", "rejected"
        m.lost.status = m.found.status = "open"
    db.commit()
    return {"claim": c.status, "match": m.status}


@app.get("/stats")
def stats(db: Session = Depends(get_db)):
    r = db.query(models.Report)
    return {
        "total": r.count(),
        "lost": r.filter_by(kind="lost").count(),
        "found": r.filter_by(kind="found").count(),
        "potential_matches": db.query(models.Match).filter_by(status="potential").count(),
        "returned": r.filter_by(status="resolved", kind="lost").count(),
        "pending_claims": db.query(models.Claim).filter_by(status="pending").count(),
    }
