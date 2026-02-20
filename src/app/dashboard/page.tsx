"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
// IconButton used by child components
import { s, badge, reasonLabels } from "./styles";
import StatCard from "./StatCard";
import FeedbackRequestRowItem from "./components/FeedbackRequestRow";
import NewLinkModal from "./components/NewLinkModal";
import ProfileModal from "./components/ProfileModal";
import ResponseModal from "./components/ResponseModal";
import type { FeedbackRequestRow, Stats, RejectionReason } from "./types";

export default function DashboardPage() {
  const router = useRouter();
  const [feedbackRequests, setFeedbackRequests] = useState<
    FeedbackRequestRow[]
  >([]);
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
        setFeedbackRequests(json.data.feedbackRequests);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setCreating(true);
    // Don't clear newLink here; let modal show previous link until replaced
    const res = await fetch("/api/feedback-requests", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) {
      setFormError(json.error ?? "Failed to create feedback request");
      setCreating(false);
      return;
    }
    const apiLink = json.data?.link ?? null;
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      (typeof window !== "undefined" ? window.location.origin : "");
    const fallbackLink = json.data?.token
      ? `${baseUrl}/f/${json.data.token}`
      : null;
    const normalizedApiLink =
      typeof apiLink === "string" &&
      !apiLink.startsWith("undefined/") &&
      !apiLink.startsWith("null/")
        ? apiLink
        : null;
    setNewLink(normalizedApiLink ?? fallbackLink);
    setCreating(false);
    load();
    // Modal stays open, link is shown in modal
  };

  // When opening modal, clear form and link
  const openNewLinkModal = useCallback(() => {
    setModalOpen(true);
    setNewLink(null);
    setFormError("");
    setForm({ company: "", role: "", language: "en", interview_date: "" });
  }, []);
  const copyLink = useCallback((link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(link);
    setTimeout(() => setCopied(null), 1200);
  }, []);

  const openProfileModal = useCallback(() => {
    setProfileModalOpen(true);
    setProfileError("");
    setProfileLoading(true);
    fetch("/api/profile", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setProfileForm(json.data);
      })
      .catch(() => setProfileError("Failed to load profile"))
      .finally(() => setProfileLoading(false));
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
          body: JSON.stringify(profileForm),
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

  const openResponseModal = useCallback(async (feedbackRequestId: string) => {
    setResponseModalOpen(true);
    setResponseLoading(true);
    setResponseData(null);
    try {
      const res = await fetch(`/api/responses/${feedbackRequestId}`, {
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
          <button style={s.btnNew} onClick={openNewLinkModal}>
            + New feedback request
          </button>
        </div>

        <div style={s.content}>
          {/* STATS */}
          <div style={s.statsRow}>
            <StatCard
              label="Total sent"
              value={stats?.total_feedback_requests ?? 0}
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

          {/* FEEDBACK REQUESTS TABLE */}
          <div style={s.sectionHeader}>
            <div style={s.sectionTitle}>Feedback Requests</div>
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

            {feedbackRequests.length === 0 && (
              <div style={s.emptyRow}>
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>◎</div>
                <div
                  style={{
                    color: "#5a6080",
                    fontSize: "14px",
                    fontStyle: "italic",
                  }}
                >
                  No feedback requests yet — create your first link above.
                </div>
              </div>
            )}

            {feedbackRequests.map((feedbackRequest) => (
              <FeedbackRequestRowItem
                key={feedbackRequest.id}
                feedbackRequest={feedbackRequest}
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

      {/* NEW LINK MODAL */}
      <NewLinkModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        form={form}
        setForm={setForm}
        formError={formError}
        creating={creating}
        newLink={newLink}
        copied={copied}
        onCopy={copyLink}
        onSubmit={handleCreate}
      />

      {/* PROFILE MODAL */}
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profileForm={profileForm}
        setProfileForm={setProfileForm}
        profileLoading={profileLoading}
        profileError={profileError}
        profileSaving={profileSaving}
        onSave={handleProfileSave}
      />

      {/* RESPONSE MODAL */}
      <ResponseModal
        open={responseModalOpen}
        onClose={() => setResponseModalOpen(false)}
        responseLoading={responseLoading}
        responseData={responseData}
      />
    </div>
  );
}
