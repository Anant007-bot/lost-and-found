import { useEffect, useState } from "react";
import { api, CATEGORIES, LOCATIONS } from "../api.js";
import ReportCard from "../components/ReportCard.jsx";

export default function Browse() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [f, setF] = useState({ q: "", category: "", location: "", kind: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.stats().then(setStats).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api.listReports({ q: f.q, category: f.category, location: f.location })
        .then((d) => { setReports(d); setError(""); })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [f.q, f.category, f.location]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const lost = reports.filter((r) => r.kind === "lost");
  const found = reports.filter((r) => r.kind === "found");
  const cols = [
    { key: "lost", title: "Lost", items: lost, empty: "Nobody has reported this lost yet." },
    { key: "found", title: "Found", items: found, empty: "Nothing found matching this yet." },
  ].filter((c) => !f.kind || f.kind === c.key);

  return (
    <div className="page">
      <section className="intro">
        <h1>Lost something? Found something?<br />Post it once and we'll connect the two.</h1>
        {stats && (
          <ul className="stats" aria-label="Campus totals">
            <li><b>{stats.lost}</b> lost</li>
            <li><b>{stats.found}</b> found</li>
            <li><b>{stats.potential_matches}</b> possible matches</li>
            <li><b>{stats.returned}</b> returned</li>
          </ul>
        )}
      </section>

      <div className="filters" role="search">
        <input type="search" placeholder="Search by item name, e.g. headphones" aria-label="Search items" value={f.q} onChange={set("q")} />
        <select aria-label="Category" value={f.category} onChange={set("category")}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select aria-label="Location" value={f.location} onChange={set("location")}>
          <option value="">All locations</option>
          {LOCATIONS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="seg" role="group" aria-label="Show">
          {[["", "Both"], ["lost", "Lost"], ["found", "Found"]].map(([v, l]) => (
            <button key={v} type="button" className={f.kind === v ? "on" : ""} aria-pressed={f.kind === v} onClick={() => setF({ ...f, kind: v })}>{l}</button>
          ))}
        </div>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {loading && !reports.length && !error && <p className="muted">Loading reports…</p>}

      <div className={"board" + (cols.length === 1 ? " single" : "")}>
        {cols.map((c) => (
          <section key={c.key} className={"col " + c.key} aria-label={c.title + " reports"}>
            <h2>{c.title} <span>{c.items.length}</span></h2>
            {c.items.length === 0 && !loading && (
              <p className="empty">{c.empty} <a href="#report">Report an item</a></p>
            )}
            {c.items.map((r) => <ReportCard key={r.id} r={r} />)}
          </section>
        ))}
      </div>
    </div>
  );
}
