import { useEffect, useState } from "react";
import { api, myReports } from "../api.js";
import ReportCard from "../components/ReportCard.jsx";
import ClaimModal from "../components/ClaimModal.jsx";

export default function Matches({ focusId }) {
  const mine = myReports.all();
  const [id, setId] = useState(focusId || mine[0]?.id || "");
  const [manual, setManual] = useState("");
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState(null);
  const [sent, setSent] = useState(false);

  const load = (rid) => {
    if (!rid) return;
    setMatches(null); setError("");
    api.matches(rid).then(setMatches).catch((e) => setError(e.message));
  };
  useEffect(() => { load(id); }, [id]);

  return (
    <div className="page">
      <h1>My matches</h1>
      {focusId && <p className="notice">Report #{focusId} is posted. We compare it with every open report of the opposite kind.</p>}
      {sent && <p className="notice">Claim sent. An admin will compare your answer and get back to you.</p>}

      <div className="row wrap gap">
        {mine.length > 0 && (
          <label className="inline">Your report
            <select value={id} onChange={(e) => setId(e.target.value)}>
              {mine.map((r) => <option key={r.id} value={r.id}>#{r.id} · {r.kind} · {r.title}</option>)}
            </select>
          </label>
        )}
        <form className="inline" onSubmit={(e) => { e.preventDefault(); setId(manual); }}>
          <label>Or look up by report number
            <input inputMode="numeric" pattern="[0-9]*" value={manual} onChange={(e) => setManual(e.target.value)} />
          </label>
          <button className="btn ghost" disabled={!manual}>Look up</button>
        </form>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {!id && <p className="empty">You haven't posted a report from this browser. <a href="#report">Report an item</a> or look one up by number.</p>}
      {matches && matches.length === 0 && (
        <p className="empty">No matches yet. Every new report is checked against open ones, so check back after others post.</p>
      )}

      <div className="matches">
        {matches?.map((m) => (
          <section key={m.id} className="match" aria-label={`Match with score ${Math.round(m.score)} percent`}>
            <ReportCard r={m.lost} />
            <div className="link">
              <span className="line" aria-hidden="true" />
              <div className="score" style={{ "--p": m.score }}><b>{Math.round(m.score)}%</b><small>match</small></div>
              <span className="line" aria-hidden="true" />
              {m.status === "potential" && (
                <button className="btn primary" onClick={() => setClaiming(m)}>This is mine</button>
              )}
              {m.status !== "potential" && <span className={"chip " + (m.status === "confirmed" ? "resolved" : "claim_pending")}>{m.status === "confirmed" ? "Returned" : m.status === "rejected" ? "Claim rejected" : "Claim under review"}</span>}
            </div>
            <ReportCard r={m.found} />
          </section>
        ))}
      </div>

      {claiming && (
        <ClaimModal match={claiming} onClose={() => setClaiming(null)}
          onDone={() => { setClaiming(null); setSent(true); load(id); }} />
      )}
    </div>
  );
}
