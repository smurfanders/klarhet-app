"use client";
import React from "react";
import { s } from "../styles";

interface NewLinkModalProps {
  open: boolean;
  onClose: () => void;
  form: {
    company: string;
    role: string;
    language: string;
    interview_date: string;
  };
  setForm: (form: any) => void;
  formError: string;
  creating: boolean;
  newLink: string | null;
  copied: string | null;
  onCopy: (link: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function NewLinkModal({
  open,
  onClose,
  form,
  setForm,
  formError,
  creating,
  newLink,
  copied,
  onCopy,
  onSubmit,
}: NewLinkModalProps) {
  if (!open) return null;
  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalTitle}>New application link</div>
        <div style={s.modalSub}>
          Generate a unique feedback link for each application. Send it to the
          recruiter after your interview.
        </div>
        <form onSubmit={onSubmit}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={s.label}>Language</label>
              <select
                style={s.input}
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
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
          <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
            <button type="button" style={s.btnCancel} onClick={onClose}>
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
                onClick={() => onCopy(newLink)}
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
      </div>
    </div>
  );
}
