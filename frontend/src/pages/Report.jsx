import { useState } from "react";
import { api, myReports, CATEGORIES, LOCATIONS } from "../api.js";

const blank = { title: "", category: "", color: "", brand: "", location: "", event_time: "", description: "", private_detail: "", reporter_name: "", reporter_email: "" };

export default function Report({ onSaved }) {
  const [kind, setKind] = useState("lost");
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const lost = kind === "lost";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    const body = { ...f, kind };
    ["color", "brand", "description", "private_detail"].forEach((k) => { if (!body[k].trim()) body[k] = null; });
    try {
      const saved = await api.createReport(body);
      myReports.add(saved);
      onSaved(saved.id);
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <div className="page narrow">
      <h1>{lost ? "Report a lost item" : "Report a found item"}</h1>
      <div className="kind-pick" role="group" aria-label="Report type">
        <button type="button" className={"lost" + (lost ? " on" : "")} aria-pressed={lost} onClick={() => setKind("lost")}>I lost something</button>
        <button type="button" className={"found" + (!lost ? " on" : "")} aria-pressed={!lost} onClick={() => setKind("found")}>I found something</button>
      </div>

      <form className="form" onSubmit={submit}>
        <label>Item name
          <input required maxLength={120} placeholder="e.g. Black JBL headphones" value={f.title} onChange={set("title")} />
        </label>
        <div className="grid2">
          <label>Category
            <select required value={f.category} onChange={set("category")}>
              <option value="">Choose one</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Color <small>optional</small>
            <input placeholder="e.g. Black" value={f.color} onChange={set("color")} />
          </label>
          <label>Brand <small>optional, leave blank if unknown</small>
            <input placeholder="e.g. JBL" value={f.brand} onChange={set("brand")} />
          </label>
          <label>{lost ? "Where did you lose it?" : "Where did you find it?"}
            <select required value={f.location} onChange={set("location")}>
              <option value="">Choose a place</option>
              {LOCATIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <label>{lost ? "When did you lose it?" : "When did you find it?"}
          <input required type="datetime-local" value={f.event_time} onChange={set("event_time")} />
        </label>
        <label>Public description <small>optional</small>
          <textarea rows={3} placeholder="Size, case, condition. Anyone can read this." value={f.description} onChange={set("description")} />
        </label>
        <label className="private">
          {lost ? "A detail only the owner would know" : "A detail to check the owner against"}
          <small>Never shown publicly. {lost ? "Examples: lock screen, name inside, a scratch." : "Keep one detail out of the listing, such as the name on the ID or a sticker on the back."}</small>
          <textarea rows={2} value={f.private_detail} onChange={set("private_detail")} />
        </label>
        <div className="grid2">
          <label>Your name
            <input required value={f.reporter_name} onChange={set("reporter_name")} />
          </label>
          <label>Your email
            <input required type="email" value={f.reporter_email} onChange={set("reporter_email")} />
          </label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button className={"btn primary " + kind} disabled={busy}>{busy ? "Posting…" : lost ? "Post lost report" : "Post found report"}</button>
      </form>
    </div>
  );
}
