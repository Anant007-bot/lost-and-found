import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Admin() {
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const askKey = () => {
    const k = window.prompt("Admin key:");
    if (k) { try { sessionStorage.setItem("lf_admin_key", k); } catch { /* ignore */ } load(); }
  };

  const load = () => {
    setError("");
    api.adminClaims().then(setClaims).catch((e) => setError(e.message));
    api.stats().then(setStats).catch(() => {});
  };
  useEffect(load, []);

  const decide = async (id, d) => {
    try { await api.decide(id, d); load(); } catch (e) { setError(e.message); }
  };

  return (
    <div className="page">
      <h1>Admin: claims to review</h1>
      <p className="notice">Staff only. <button className="btn ghost" onClick={askKey}>Enter admin key</button></p>
      {stats && (
        <ul className="stats" aria-label="Totals">
          <li><b>{stats.total}</b> reports</li>
          <li><b>{stats.potential_matches}</b> possible matches</li>
          <li><b>{stats.pending_claims}</b> claims waiting</li>
          <li><b>{stats.returned}</b> returned</li>
        </ul>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      {claims.length === 0 && <p className="empty">No claims waiting for review.</p>}
      {claims.map((c) => (
        <section key={c.claim_id} className="claim">
          <div>
            <h3>Claimant says</h3>
            <p>{c.claimant_answer}</p>
          </div>
          <div>
            <h3>Finder recorded</h3>
            <p>{c.finder_private_detail || "The finder left no private detail. Verify in person."}</p>
          </div>
          <div className="row end">
            <button className="btn ghost" onClick={() => decide(c.claim_id, "reject")}>Reject claim</button>
            <button className="btn primary" onClick={() => decide(c.claim_id, "approve")}>Approve handover</button>
          </div>
        </section>
      ))}
    </div>
  );
}
