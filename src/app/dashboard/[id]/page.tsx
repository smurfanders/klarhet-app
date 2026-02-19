"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface ResponsePayload {
  application: {
    id: string;
    company: string;
    role: string;
    language: string;
    interview_date: string | null;
    created_at: string;
  };
  response: Record<string, any> | null;
}

export default function ApplicationDetail() {
  const router = useRouter();
  const params = useParams();
  const id = (params as any)?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ResponsePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/responses/${id}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((json) => {
        if (!json.data) {
          setError(json.error ?? "Not found");
          setData(null);
          return;
        }
        setData(json.data as ResponsePayload);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) return <div style={{ padding: 28 }}>Invalid application id</div>;
  if (loading) return <div style={{ padding: 28 }}>Loading…</div>;
  if (error) return <div style={{ padding: 28 }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: 28 }}>No data</div>;

  const app = data.application;
  const resp = data.response;

  return (
    <div style={s.bg}>
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoMark}>Klarhet</div>
          <div style={s.logoSub}>Feedback tool</div>
        </div>
        <nav style={s.nav}>
          <div
            style={{ ...s.navItem }}
            onClick={() => router.push("/dashboard")}
          >
            ◈ Dashboard
          </div>
        </nav>
        <div style={s.sidebarFooter}>
          <button onClick={() => router.push("/dashboard")} style={s.logoutBtn}>
            ← Back
          </button>
        </div>
      </aside>

      <div style={s.main}>
        <div style={s.topbar}>
          <div style={s.topbarTitle}>Application</div>
        </div>

        <div style={s.content}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{app.company}</div>
            <div style={{ color: "#7a82a0", fontStyle: "italic" }}>
              {app.role}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: "#5a6080" }}>
              Created: {new Date(app.created_at).toLocaleString()} • Language:{" "}
              {app.language}
            </div>
          </div>

          <div
            style={{
              background: "#13161d",
              border: "1px solid #252936",
              borderRadius: 12,
              padding: 18,
            }}
          >
            {resp ? (
              <div>
                <h3 style={{ marginTop: 0 }}>Response</h3>

                <div style={{ marginTop: 12 }}>
                  <strong>Q1 — Match:</strong>
                  <div style={{ color: "#7a82a0" }}>{resp.q1_match ?? "—"}</div>
                  {resp.q1_detail && (
                    <div
                      style={{
                        marginTop: 6,
                        background: "#0d0f14",
                        padding: 10,
                        borderRadius: 8,
                      }}
                    >
                      {resp.q1_detail}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 12 }}>
                  <strong>Q2 — Communication:</strong>
                  <div style={{ color: "#7a82a0" }}>
                    {resp.q2_communication ?? "—"}
                  </div>
                  {resp.q2_checkboxes && Array.isArray(resp.q2_checkboxes) && (
                    <div style={{ marginTop: 6 }}>
                      {resp.q2_checkboxes.map((cb: string) => (
                        <div
                          key={cb}
                          style={{
                            display: "inline-block",
                            marginRight: 8,
                            background: "#0d0f14",
                            padding: "6px 8px",
                            borderRadius: 6,
                          }}
                        >
                          {cb}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 12 }}>
                  <strong>Q3 — Reason:</strong>
                  <div style={{ color: "#7a82a0" }}>
                    {resp.q3_reason ?? "—"}
                  </div>
                  {resp.q3_detail && (
                    <div style={{ marginTop: 6 }}>{resp.q3_detail}</div>
                  )}
                </div>

                <div style={{ marginTop: 12 }}>
                  <strong>Q4 — Future consideration:</strong>
                  <div style={{ color: "#7a82a0" }}>
                    {resp.q4_future ?? "—"}
                  </div>
                  {resp.q4_detail && (
                    <div style={{ marginTop: 6 }}>{resp.q4_detail}</div>
                  )}
                </div>

                <div style={{ marginTop: 12 }}>
                  <strong>Q5 — Rating:</strong>
                  <div style={{ color: "#e8b86d" }}>
                    {resp.q5_rating ? "★".repeat(resp.q5_rating) : "—"}
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <strong>Q6 — Suggestion:</strong>
                  <div style={{ marginTop: 6 }}>{resp.q6_profile ?? "—"}</div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <strong>Q7 — Interview notes:</strong>
                  <div style={{ marginTop: 6 }}>{resp.q7_interview ?? "—"}</div>
                  {resp.q7_other && (
                    <div style={{ marginTop: 6, fontStyle: "italic" }}>
                      {resp.q7_other}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 18, fontSize: 12, color: "#5a6080" }}>
                  Submitted: {resp.submitted_at ?? "—"}
                </div>
              </div>
            ) : (
              <div style={{ color: "#5a6080" }}>No response yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  bg: {
    display: "flex",
    minHeight: "100vh",
    background: "#0d0f14",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: "#e8eaf0",
  },
  sidebar: {
    width: "220px",
    flexShrink: 0,
    background: "#13161d",
    borderRight: "1px solid #252936",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  sidebarLogo: { padding: "28px 24px 20px", borderBottom: "1px solid #252936" },
  logoMark: {
    fontFamily: "serif",
    fontSize: "20px",
    fontWeight: 700,
    color: "#e8b86d",
    letterSpacing: "-0.5px",
  },
  logoSub: {
    fontSize: "10px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#3a3f55",
    marginTop: "2px",
    fontFamily: "monospace",
  },
  nav: { flex: 1, padding: "16px 12px" },
  navItem: {
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#5a6080",
    cursor: "pointer",
  },
  sidebarFooter: { padding: "20px 16px", borderTop: "1px solid #252936" },
  logoutBtn: {
    background: "none",
    border: "none",
    color: "#5a6080",
    fontSize: "13px",
    cursor: "pointer",
    padding: 0,
    fontFamily: "inherit",
  },
  main: { flex: 1, display: "flex", flexDirection: "column" },
  topbar: {
    height: "64px",
    borderBottom: "1px solid #252936",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    background: "#13161d",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  topbarTitle: { fontSize: "15px", fontWeight: 700 },
  content: { padding: "28px" },
};
