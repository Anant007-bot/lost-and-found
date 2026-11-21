import { useEffect, useState } from "react";
import Browse from "./pages/Browse.jsx";
import Report from "./pages/Report.jsx";
import Matches from "./pages/Matches.jsx";
import Admin from "./pages/Admin.jsx";

const PAGES = [
  { id: "browse", label: "Browse" },
  { id: "report", label: "Report an item" },
  { id: "matches", label: "My matches" },
  { id: "admin", label: "Admin" },
];

export default function App() {
  const read = () => (PAGES.some((p) => p.id === location.hash.slice(1)) ? location.hash.slice(1) : "browse");
  const [page, setPage] = useState(read);
  const [focusId, setFocusId] = useState(null);

  useEffect(() => {
    const onHash = () => setPage(read());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const saved = (id) => { setFocusId(id); location.hash = "matches"; };

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#browse">
          <span className="brand-hole" aria-hidden="true" />
          Campus Lost &amp; Found
        </a>
        <nav aria-label="Main">
          {PAGES.map((p) => (
            <a key={p.id} href={"#" + p.id} className={page === p.id ? "active" : ""} aria-current={page === p.id ? "page" : undefined}>
              {p.label}
            </a>
          ))}
        </nav>
      </header>
      <main>
        {page === "browse" && <Browse />}
        {page === "report" && <Report onSaved={saved} />}
        {page === "matches" && <Matches focusId={focusId} />}
        {page === "admin" && <Admin />}
      </main>
    </>
  );
}
