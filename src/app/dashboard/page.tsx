"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────

interface AppRow {
  id: string;
  company: string;
  role: string;
  language: string;
  token: string;
  interview_date: string | null;
  created_at: string;
  response_id: string | null;
  q3_reason: string | null;
  q4_future: string | null;
  q5_rating: number | null;
  submitted_at: string | null;
}

interface Stats {
  total_applications: number;
  total_responses: number;
  avg_rating: number | null;
  response_rate_pct: number | null;
  reconsider_pct: number | null;
}

interface RejectionReason {
  reason: string;
  count: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

function Stars({ rating }: { rating: number | null }) {
  if (!rating)
    return <span style={{ color: "#3a3f55", fontSize: "13px" }}>—</span>;
  return (
    <span style={{ color: "#e8b86d", fontSize: "13px", letterSpacing: "1px" }}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

function StatusBadge({ row }: { row: AppRow }) {
  if (row.response_id) {
    return (
      <span
        style={{
          ...badge,
          background: "rgba(94,196,131,0.1)",
          color: "#5ec483",
        }}
      >
        ● Received
      </span>
    );
  }
  return (
    <span
      style={{
        ...badge,
        background: "rgba(232,184,109,0.1)",
        color: "#e8b86d",
      }}
    >
      ◌ Pending
    </span>
  );
}

const badge: React.CSSProperties = {
  display: "inline-block",
  borderRadius: "20px",
  padding: "3px 10px",
  fontSize: "11px",
  fontFamily: "monospace",
  whiteSpace: "nowrap",
};

const reasonLabels: Record<string, string> = {
  stronger: "Stronger candidate",
  skill: "Missing skill",
  culture: "Culture fit",
  over: "Overqualified",
  internal: "Internal hire",
  other: "Other",
};

// ── Main component ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<AppRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [reasons, setReasons] = useState<RejectionReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [newLink, setNewLink] = useState<string | null>(null);
  const [form, setForm] = useState({
    company: "",
    role: "",
    language: "en",
    interview_date: "",
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", photoUrl: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard", { credentials: "same-origin" });
      if (res.status === 401) {
        setLoading(false);
        router.push("/login");
        return;
      }
      const json = await res.json();
      if (json.data) {
        setApplications(json.data.applications);
        setStats(json.data.stats);
        setReasons(json.data.rejectionReasons);
      }
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    router.push("/login");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setCreating(true);
    setNewLink(null);

    const res = await fetch("/api/applications", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: form.company,
        role: form.role,
        language: form.language,
        interview_date: form.interview_date || undefined,
      }),
    });

    const json = await res.json();
    setCreating(false);

    if (!res.ok) {
      setFormError(json.error ?? "Something went wrong");
      return;
    }

    setNewLink(json.data.feedback_url);
    setForm({ company: "", role: "", language: "en", interview_date: "" });
    load();
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  async function openProfileModal() {
    setProfileModalOpen(true);
    setProfileError("");
    setProfileLoading(true);
    try {
      const res = await fetch("/api/profile", { credentials: "same-origin" });
      const json = await res.json();
      if (json.data) {
        setProfileForm({
          name: json.data.name ?? "",
          photoUrl: json.data.photoUrl ?? "",
        });
      }
    } catch (err) {
      setProfileError("Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name,
          photoUrl: profileForm.photoUrl || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setProfileError(json.error ?? "Failed to save profile");
        return;
      }

      setProfileModalOpen(false);
    } catch (err) {
      setProfileError("Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  }

  const maxReasonCount = Math.max(...reasons.map((r) => r.count), 1);

  if (loading) {
    return (
      <div
        style={{
          ...s.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#5a6080",
            fontFamily: "monospace",
            fontSize: "13px",
          }}
        >
          Loading…
        </span>
      </div>
    );
  }

  return (
    <div style={s.bg}>
      {/* SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoMark}>Klarhet</div>
          <div style={s.logoSub}>Feedback tool</div>
        </div>
        <nav style={s.nav}>
          <div style={{ ...s.navItem, ...s.navActive }}>◈ Dashboard</div>
        </nav>
        <div style={s.sidebarFooter}>
          <button onClick={openProfileModal} style={s.profileBtn}>
            ⚙ Profile
          </button>
          <button onClick={handleLogout} style={s.logoutBtn}>
            ← Log out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={s.main}>
        {/* TOPBAR */}
        <div style={s.topbar}>
          <div style={s.topbarTitle}>Dashboard</div>
          <button
            style={s.btnNew}
            onClick={() => {
              setModalOpen(true);
              setNewLink(null);
              setFormError("");
            }}
          >
            + New application link
          </button>
        </div>

        <div style={s.content}>
          {/* STATS */}
          <div style={s.statsRow}>
            {[
              {
                label: "Total sent",
                value: stats?.total_applications ?? 0,
                color: "#e8b86d",
                sub: "links generated",
              },
              {
                label: "Responses",
                value: stats?.total_responses ?? 0,
                color: "#5ec483",
                sub: `${stats?.response_rate_pct ?? 0}% response rate`,
              },
              {
                label: "Avg rating",
                value: stats?.avg_rating ? `${stats.avg_rating}/5` : "—",
                color: "#6db3e8",
                sub: "across all interviews",
              },
              {
                label: "Reconsidered",
                value: stats?.reconsider_pct ? `${stats.reconsider_pct}%` : "—",
                color: "#e8b86d",
                sub: "would consider again",
              },
            ].map((card) => (
              <div key={card.label} style={s.statCard}>
                <div style={s.statLabel}>{card.label}</div>
                <div style={{ ...s.statValue, color: card.color }}>
                  {card.value}
                </div>
                <div style={s.statSub}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* APPLICATIONS TABLE */}
          <div style={s.sectionHeader}>
            <div style={s.sectionTitle}>Applications</div>
          </div>

          <div style={s.tableWrap}>
            {/* Header */}
            <div style={{ ...s.tableRow, ...s.tableHeader }}>
              <div style={s.th}>Company</div>
              <div style={s.th}>Role</div>
              <div style={s.th}>Status</div>
              <div style={s.th}>Rating</div>
              <div style={s.th}>Lang</div>
              <div style={s.th}>Date</div>
              <div style={s.th}></div>
            </div>

            {applications.length === 0 && (
              <div style={s.emptyRow}>
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>◎</div>
                <div
                  style={{
                    color: "#5a6080",
                    fontSize: "14px",
                    fontStyle: "italic",
                  }}
                >
                  No applications yet — create your first link above.
                </div>
              </div>
            )}

            {applications.map((app) => (
              <div key={app.id} style={s.tableRow}>
                <div style={s.tdCompany}>{app.company}</div>
                <div style={s.tdRole}>{app.role}</div>
                <div>
                  <StatusBadge row={app} />
                </div>
                <div>
                  <Stars rating={app.q5_rating} />
                </div>
                <div style={s.tdLang}>{app.language.toUpperCase()}</div>
                <div style={s.tdDate}>
                  {app.created_at
                    ? new Date(app.created_at).toLocaleDateString("sv-SE", {
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </div>
                <div>
                  <button
                    style={s.iconBtn}
                    title="Copy feedback link"
                    onClick={() => copyLink(`${APP_URL}/f/${app.token}`)}
                  >
                    {copied === `${APP_URL}/f/${app.token}` ? "✓" : "⧉"}
                  </button>
                </div>
                <div>
                  <button
                    style={{ ...s.iconBtn, width: 72, fontSize: 12 }}
                    title="View responses"
                    onClick={() => router.push(`/dashboard/${app.id}`)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* INSIGHTS */}
          {reasons.length > 0 && (
            <>
              <div style={s.sectionHeader}>
                <div style={s.sectionTitle}>Why not selected</div>
              </div>
              <div style={s.insightCard}>
                {reasons.map((r) => (
                  <div key={r.reason} style={s.barRow}>
                    <div style={s.barLabel}>
                      {reasonLabels[r.reason] ?? r.reason}
                    </div>
                    <div style={s.barTrack}>
                      <div
                        style={{
                          ...s.barFill,
                          width: `${(r.count / maxReasonCount) * 100}%`,
                        }}
                      />
                    </div>
                    <div style={s.barCount}>{r.count}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div
          style={s.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div style={s.modal}>
            <div style={s.modalTitle}>New application link</div>
            <div style={s.modalSub}>
              Fill in the details and we&apos;ll generate a unique link to send
              to the recruiter.
            </div>

            <form onSubmit={handleCreate}>
              <label style={s.label}>Company</label>
              <input
                style={s.input}
                type="text"
                placeholder="e.g. Spotify"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                required
              />

              <label style={s.label}>Role / position</label>
              <input
                style={s.input}
                type="text"
                placeholder="e.g. Senior Product Manager"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label style={s.label}>Language</label>
                  <select
                    style={s.input}
                    value={form.language}
                    onChange={(e) =>
                      setForm({ ...form, language: e.target.value })
                    }
                  >
                    <option value="en">English</option>
                    <option value="sv">Svenska</option>
                  </select>
                </div>
                <div>
                  <label style={s.label}>Interview date</label>
                  <input
                    style={s.input}
                    type="date"
                    value={form.interview_date}
                    onChange={(e) =>
                      setForm({ ...form, interview_date: e.target.value })
                    }
                  />
                </div>
              </div>

              {formError && <div style={s.error}>{formError}</div>}

              {newLink && (
                <div style={s.linkBox}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#5ec483",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      marginBottom: "10px",
                    }}
                  >
                    ✓ Link ready
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "#0d0f14",
                      borderRadius: "6px",
                      padding: "10px 12px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "12px",
                        color: "#e8b86d",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {newLink}
                    </span>
                    <button
                      type="button"
                      style={s.copyBtn}
                      onClick={() => copyLink(newLink)}
                    >
                      {copied === newLink ? "Copied ✓" : "Copy"}
                    </button>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#5a6080",
                      marginTop: "8px",
                      fontStyle: "italic",
                    }}
                  >
                    Send this link directly to the recruiter.
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button
                  type="button"
                  style={s.btnCancel}
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </button>
                <button type="submit" style={s.btnGenerate} disabled={creating}>
                  {creating
                    ? "Generating…"
                    : newLink
                      ? "Generate another →"
                      : "Generate link →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {profileModalOpen && (
        <div
          style={s.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setProfileModalOpen(false);
          }}
        >
          <div style={s.modal}>
            <div style={s.modalTitle}>Profile Settings</div>
            <div style={s.modalSub}>
              Update your name and photo so recruiters can easily identify you.
            </div>

            {profileLoading ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "#5a6080",
                }}
              >
                Loading…
              </div>
            ) : (
              <form onSubmit={handleProfileSave}>
                <label style={s.label}>Your name</label>
                <input
                  style={s.input}
                  type="text"
                  placeholder="e.g. John Doe"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  required
                />

                <label style={s.label}>Photo URL</label>
                <input
                  style={s.input}
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={profileForm.photoUrl}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, photoUrl: e.target.value })
                  }
                />
                <div
                  style={{
                    fontSize: "11px",
                    color: "#5a6080",
                    marginTop: "6px",
                  }}
                >
                  Leave empty for a default avatar with your initials.
                </div>

                {profileForm.photoUrl && (
                  <div style={{ marginTop: "12px" }}>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#5a6080",
                        marginBottom: "8px",
                      }}
                    >
                      Preview:
                    </div>
                    <img
                      src={profileForm.photoUrl}
                      alt="Profile"
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1px solid #252936",
                      }}
                    />
                  </div>
                )}

                {profileError && <div style={s.error}>{profileError}</div>}

                <div
                  style={{ display: "flex", gap: "10px", marginTop: "24px" }}
                >
                  <button
                    type="button"
                    style={s.btnCancel}
                    onClick={() => setProfileModalOpen(false)}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    style={s.btnGenerate}
                    disabled={profileSaving}
                  >
                    {profileSaving ? "Saving…" : "Save profile →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

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
  navActive: { background: "rgba(232,184,109,0.1)", color: "#e8b86d" },
  sidebarFooter: { padding: "20px 16px", borderTop: "1px solid #252936" },
  profileBtn: {
    width: "100%",
    background: "none",
    border: "1px solid #252936",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#7a82a0",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "inherit",
    marginBottom: "8px",
    transition: "all 0.2s ease",
  },
  logoutBtn: {
    width: "100%",
    background: "none",
    border: "none",
    color: "#5a6080",
    fontSize: "13px",
    cursor: "pointer",
    padding: "10px 12px",
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
  btnNew: {
    background: "#e8b86d",
    color: "#0d0f14",
    border: "none",
    borderRadius: "8px",
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
  content: { padding: "28px" },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
    marginBottom: "28px",
  },
  statCard: {
    background: "#13161d",
    border: "1px solid #252936",
    borderRadius: "12px",
    padding: "20px 22px",
  },
  statLabel: {
    fontSize: "10px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#5a6080",
    fontFamily: "monospace",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "30px",
    fontWeight: 800,
    lineHeight: 1,
    marginBottom: "4px",
  },
  statSub: { fontSize: "11px", color: "#3a3f55", fontFamily: "monospace" },
  sectionHeader: { marginBottom: "12px" },
  sectionTitle: {
    fontSize: "11px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#5a6080",
    fontWeight: 700,
  },
  tableWrap: {
    background: "#13161d",
    border: "1px solid #252936",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "24px",
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr 110px 100px 50px 70px 44px",
    alignItems: "center",
    padding: "0 18px",
    borderBottom: "1px solid #1a1e28",
  },
  tableHeader: {
    background: "#1a1e28",
    paddingTop: "12px",
    paddingBottom: "12px",
  },
  th: {
    fontSize: "10px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#3a3f55",
    fontFamily: "monospace",
  },
  tdCompany: { fontSize: "14px", fontWeight: 700, padding: "16px 0" },
  tdRole: {
    fontSize: "13px",
    color: "#7a82a0",
    fontStyle: "italic",
    padding: "16px 0",
  },
  tdLang: { fontSize: "11px", color: "#5a6080", fontFamily: "monospace" },
  tdDate: { fontSize: "11px", color: "#5a6080", fontFamily: "monospace" },
  iconBtn: {
    background: "none",
    border: "1px solid #252936",
    borderRadius: "6px",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    color: "#7a82a0",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyRow: { padding: "48px", textAlign: "center" },
  insightCard: {
    background: "#13161d",
    border: "1px solid #252936",
    borderRadius: "12px",
    padding: "22px",
    marginBottom: "24px",
  },
  barRow: {
    display: "grid",
    gridTemplateColumns: "160px 1fr 28px",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
  },
  barLabel: {
    fontSize: "12px",
    color: "#7a82a0",
    fontFamily: "monospace",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  barTrack: {
    height: "6px",
    background: "#1a1e28",
    borderRadius: "6px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    background: "#e8b86d",
    borderRadius: "6px",
    transition: "width 0.8s ease",
  },
  barCount: {
    fontSize: "11px",
    color: "#5a6080",
    fontFamily: "monospace",
    textAlign: "right",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(4px)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  modal: {
    background: "#13161d",
    border: "1px solid #2f3447",
    borderRadius: "16px",
    padding: "36px",
    width: "100%",
    maxWidth: "460px",
  },
  modalTitle: { fontSize: "20px", fontWeight: 800, marginBottom: "6px" },
  modalSub: {
    fontSize: "13px",
    color: "#7a82a0",
    marginBottom: "24px",
    fontStyle: "italic",
    lineHeight: 1.5,
  },
  label: {
    display: "block",
    fontSize: "10px",
    color: "#5a6080",
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginTop: "14px",
    marginBottom: "6px",
    fontFamily: "monospace",
  },
  input: {
    width: "100%",
    background: "#1a1e28",
    border: "1px solid #252936",
    borderRadius: "8px",
    padding: "11px 13px",
    fontSize: "14px",
    color: "#e8eaf0",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  error: {
    background: "rgba(232,112,112,0.1)",
    border: "1px solid rgba(232,112,112,0.3)",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#e87070",
    marginTop: "12px",
  },
  linkBox: {
    background: "#1a1e28",
    border: "1px solid rgba(94,196,131,0.3)",
    borderRadius: "10px",
    padding: "16px",
    marginTop: "16px",
  },
  copyBtn: {
    background: "none",
    border: "1px solid #252936",
    borderRadius: "5px",
    padding: "5px 12px",
    color: "#7a82a0",
    fontFamily: "monospace",
    fontSize: "11px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnCancel: {
    flex: 1,
    background: "none",
    border: "1px solid #252936",
    borderRadius: "8px",
    padding: "12px",
    color: "#7a82a0",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnGenerate: {
    flex: 2,
    background: "#e8b86d",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    color: "#0d0f14",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
};
