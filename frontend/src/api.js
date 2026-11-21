const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function req(path, options = {}) {
  let res;
  try {
    let adminKey = "";
    try { adminKey = sessionStorage.getItem("lf_admin_key") || ""; } catch { /* ignore */ }
    res = await fetch(BASE + path, { headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey }, ...options });
  } catch {
    throw new Error("Can't reach the server. Check that the backend is running on " + BASE);
  }
  if (!res.ok) {
    let msg = "Something went wrong. Please try again.";
    try {
      const j = await res.json();
      msg = typeof j.detail === "string" ? j.detail : "Some fields are missing or invalid. Check the form and try again.";
    } catch { /* keep default */ }
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  listReports: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return req("/reports" + (q ? "?" + q : ""));
  },
  createReport: (data) => req("/reports", { method: "POST", body: JSON.stringify(data) }),
  matches: (id) => req(`/reports/${id}/matches`),
  claim: (matchId, answer) =>
    req(`/matches/${matchId}/claim`, { method: "POST", body: JSON.stringify({ claimant_answer: answer }) }),
  stats: () => req("/stats"),
  adminClaims: () => req("/admin/claims"),
  decide: (claimId, decision) => req(`/admin/claims/${claimId}/${decision}`, { method: "POST" }),
};

export const CATEGORIES = ["ID Card", "Electronics", "Bag", "Keys", "Wallet", "Books & Notes", "Clothing", "Water Bottle", "Other"];
export const LOCATIONS = ["Library", "Study Hall 2", "Cafeteria", "Main Block", "Auditorium", "Sports Ground", "Hostel", "Parking", "Other"];
export const STATUS_LABEL = {
  open: "Searching",
  potential_match: "Possible match",
  claim_pending: "Claim under review",
  resolved: "Returned",
};

// Reports the visitor posted from this browser, so they can find their matches later.
export const myReports = {
  all: () => { try { return JSON.parse(localStorage.getItem("lf_reports") || "[]"); } catch { return []; } },
  add: (r) => {
    const list = [{ id: r.id, kind: r.kind, title: r.title }, ...myReports.all().filter((x) => x.id !== r.id)];
    try { localStorage.setItem("lf_reports", JSON.stringify(list.slice(0, 20))); } catch { /* ignore */ }
  },
};
