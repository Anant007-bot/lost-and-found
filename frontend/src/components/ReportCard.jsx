import { STATUS_LABEL } from "../api.js";

export function formatTime(iso) {
  return new Date(iso).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

// A report drawn as a luggage tag: punched hole, coloured by lost / found.
export default function ReportCard({ r }) {
  return (
    <article className={"tag " + r.kind}>
      <div className="tag-head">
        <h3>{r.title}</h3>
        <span className={"chip " + r.status}>{STATUS_LABEL[r.status] || r.status}</span>
      </div>
      <dl>
        <div><dt>Where</dt><dd>{r.location}</dd></div>
        <div><dt>When</dt><dd>{formatTime(r.event_time)}</dd></div>
        <div><dt>Type</dt><dd>{r.category}</dd></div>
        {r.color && <div><dt>Color</dt><dd>{r.color}</dd></div>}
        {r.brand && <div><dt>Brand</dt><dd>{r.brand}</dd></div>}
      </dl>
      {r.description && <p className="desc">{r.description}</p>}
    </article>
  );
}
