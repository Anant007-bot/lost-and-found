import { useState } from "react";
import { api } from "../api.js";

export default function ClaimModal({ match, onClose, onDone }) {
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try { await api.claim(match.id, answer); onDone(); }
    catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="claim-title" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2 id="claim-title">Prove it's yours</h2>
        <p className="muted">
          Describe something about “{match.found.title}” that isn't in the public listing, such as a name inside,
          a sticker, a scratch, or the lock screen. An admin compares it with what the finder recorded.
        </p>
        <label>
          Your answer
          <textarea required rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="row end">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy || !answer.trim()}>{busy ? "Sending…" : "Send claim"}</button>
        </div>
      </form>
    </div>
  );
}
