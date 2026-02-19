"use client";

import React from "react";
import { s } from "../styles";

export default function ProfileModal({
  open,
  onClose,
  profileLoading,
  profileForm,
  setProfileForm,
  profileError,
  onSave,
  profileSaving,
}: {
  open: boolean;
  onClose: () => void;
  profileLoading: boolean;
  profileForm: { name: string; photoUrl: string };
  setProfileForm: (p: { name: string; photoUrl: string }) => void;
  profileError: string;
  onSave: (e: React.FormEvent) => Promise<void> | void;
  profileSaving: boolean;
}) {
  if (!open) return null;

  return (
    <div
      style={s.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={s.modal}>
        <div style={s.modalTitle}>Profile Settings</div>
        <div style={s.modalSub}>
          Update your name and photo so recruiters can easily identify you.
        </div>

        {profileLoading ? (
          <div
            style={{ padding: "24px", textAlign: "center", color: "#5a6080" }}
          >
            Loading…
          </div>
        ) : (
          <form onSubmit={onSave}>
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
              style={{ fontSize: "11px", color: "#5a6080", marginTop: "6px" }}
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

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button type="button" style={s.btnCancel} onClick={onClose}>
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
  );
}
