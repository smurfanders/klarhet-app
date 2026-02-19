"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
// IconButton used by child components
import { s, badge, reasonLabels } from "./styles";
import StatCard from "./StatCard";
import ApplicationRow from "./ApplicationRow";
import type { AppRow, Stats, RejectionReason } from "./types";

// ── Types ──────────────────────────────────────────────────────────────────

// types moved to ./types.ts

// ── Helpers ────────────────────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

// Helpers extracted to ./helpers.tsx

// ── Main component ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  // (IconButton extracted to components/IconButton)
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
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [responseLoading, setResponseLoading] = useState(false);

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

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    router.push("/login");
  }, [router]);

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

  const copyLink = useCallback((url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  const openProfileModal = useCallback(async () => {
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
  }, []);

  const handleProfileSave = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [profileForm],
  );

  const openResponseModal = useCallback(async (appId: string) => {
    setResponseModalOpen(true);
    setResponseLoading(true);
    setResponseData(null);
    try {
      const res = await fetch(`/api/responses/${appId}`, {
        credentials: "same-origin",
      });
      const json = await res.json();
      if (json.data) setResponseData(json.data);
    } catch (err) {
      console.error("Failed to load response", err);
    } finally {
      setResponseLoading(false);
    }
  }, []);

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
            <StatCard
              label="Total sent"
              value={stats?.total_applications ?? 0}
              color="#e8b86d"
              sub="links generated"
            />
            <StatCard
              label="Responses"
              value={stats?.total_responses ?? 0}
              color="#5ec483"
              sub={`${stats?.response_rate_pct ?? 0}% response rate`}
            />
            <StatCard
              label="Avg rating"
              value={stats?.avg_rating ? `${stats.avg_rating}/5` : "—"}
              color="#6db3e8"
              sub="across all interviews"
            />
            <StatCard
              label="Reconsidered"
              value={stats?.reconsider_pct ? `${stats.reconsider_pct}%` : "—"}
              color="#e8b86d"
              sub="would consider again"
            />
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
              <ApplicationRow
                key={app.id}
                app={app}
                copied={copied}
                onCopy={copyLink}
                onView={openResponseModal}
              />
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
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
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

      {/* RESPONSE MODAL */}
      {responseModalOpen && (
        <div
          style={s.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setResponseModalOpen(false);
          }}
        >
          <div style={{ ...s.modal, maxWidth: "600px" }}>
            <div style={s.modalTitle}>Response Details</div>

            {responseLoading ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "#5a6080",
                }}
              >
                Loading…
              </div>
            ) : responseData ? (
              <div>
                <div
                  style={{
                    background: "#1a1e28",
                    borderRadius: "10px",
                    padding: "16px",
                    marginBottom: "16px",
                    fontSize: "12px",
                    color: "#7a82a0",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: "8px" }}>
                    {responseData.application.company} •{" "}
                    {responseData.application.role}
                  </div>
                  <div>
                    Submitted:{" "}
                    {responseData.response?.submitted_at
                      ? new Date(
                          responseData.response.submitted_at,
                        ).toLocaleString("sv-SE")
                      : "—"}
                  </div>
                </div>

                {responseData.response ? (
                  <div style={{ fontSize: "13px" }}>
                    {responseData.response.q1_match && (
                      <div style={{ marginBottom: "14px" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: "4px",
                            color: "#e8b86d",
                          }}
                        >
                          Experience match
                        </div>
                        <div style={{ color: "#7a82a0" }}>
                          {responseData.response.q1_match}
                        </div>
                        {responseData.response.q1_detail && (
                          <div
                            style={{
                              marginTop: "6px",
                              padding: "8px",
                              background: "#0d0f14",
                              borderRadius: "6px",
                              fontSize: "12px",
                            }}
                          >
                            {responseData.response.q1_detail}
                          </div>
                        )}
                      </div>
                    )}

                    {responseData.response.q2_communication && (
                      <div style={{ marginBottom: "14px" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: "4px",
                            color: "#e8b86d",
                          }}
                        >
                          Communication
                        </div>
                        <div style={{ color: "#7a82a0" }}>
                          {responseData.response.q2_communication}
                        </div>
                        {responseData.response.q2_checkboxes && (
                          <div
                            style={{
                              marginTop: "6px",
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "6px",
                            }}
                          >
                            {(
                              responseData.response.q2_checkboxes as string[]
                            ).map((cb) => (
                              <span key={cb} style={s.badge}>
                                {cb}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {responseData.response.q3_reason && (
                      <div style={{ marginBottom: "14px" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: "4px",
                            color: "#e8b86d",
                          }}
                        >
                          Reason not selected
                        </div>
                        <div style={{ color: "#7a82a0" }}>
                          {responseData.response.q3_reason}
                        </div>
                        {responseData.response.q3_detail && (
                          <div
                            style={{
                              marginTop: "6px",
                              padding: "8px",
                              background: "#0d0f14",
                              borderRadius: "6px",
                              fontSize: "12px",
                            }}
                          >
                            {responseData.response.q3_detail}
                          </div>
                        )}
                      </div>
                    )}

                    {responseData.response.q4_future && (
                      <div style={{ marginBottom: "14px" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: "4px",
                            color: "#e8b86d",
                          }}
                        >
                          Consider for future roles
                        </div>
                        <div style={{ color: "#7a82a0" }}>
                          {responseData.response.q4_future}
                        </div>
                        {responseData.response.q4_detail && (
                          <div
                            style={{
                              marginTop: "6px",
                              padding: "8px",
                              background: "#0d0f14",
                              borderRadius: "6px",
                              fontSize: "12px",
                            }}
                          >
                            {responseData.response.q4_detail}
                          </div>
                        )}
                      </div>
                    )}

                    {responseData.response.q5_rating && (
                      <div style={{ marginBottom: "14px" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: "4px",
                            color: "#e8b86d",
                          }}
                        >
                          Interview rating
                        </div>
                        <div style={{ color: "#e8b86d", fontSize: "14px" }}>
                          {"★".repeat(responseData.response.q5_rating)}
                          {"☆".repeat(5 - responseData.response.q5_rating)}
                        </div>
                      </div>
                    )}

                    {responseData.response.q6_profile && (
                      <div style={{ marginBottom: "14px" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: "4px",
                            color: "#e8b86d",
                          }}
                        >
                          What could strengthen your profile
                        </div>
                        <div
                          style={{
                            padding: "8px",
                            background: "#0d0f14",
                            borderRadius: "6px",
                            fontSize: "12px",
                            color: "#7a82a0",
                          }}
                        >
                          {responseData.response.q6_profile}
                        </div>
                      </div>
                    )}

                    {(responseData.response.q7_interview ||
                      responseData.response.q7_other) && (
                      <div style={{ marginBottom: "14px" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: "4px",
                            color: "#e8b86d",
                          }}
                        >
                          Interview feedback
                        </div>
                        {responseData.response.q7_interview && (
                          <div
                            style={{
                              padding: "8px",
                              background: "#0d0f14",
                              borderRadius: "6px",
                              fontSize: "12px",
                              color: "#7a82a0",
                              marginBottom: "8px",
                            }}
                          >
                            {responseData.response.q7_interview}
                          </div>
                        )}
                        {responseData.response.q7_other && (
                          <div
                            style={{
                              padding: "8px",
                              background: "#0d0f14",
                              borderRadius: "6px",
                              fontSize: "12px",
                              color: "#7a82a0",
                            }}
                          >
                            {responseData.response.q7_other}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: "#5a6080" }}>No response yet.</div>
                )}

                <div
                  style={{ display: "flex", gap: "10px", marginTop: "24px" }}
                >
                  <button
                    style={{ ...s.btnCancel, flex: 1 }}
                    onClick={() => setResponseModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ color: "#5a6080" }}>Failed to load response.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
