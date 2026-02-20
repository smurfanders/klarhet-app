"use client";
import React from "react";
import { s } from "../styles";

interface ResponseModalProps {
  open: boolean;
  onClose: () => void;
  responseLoading: boolean;
  responseData: any;
}

export default function ResponseModal({
  open,
  onClose,
  responseLoading,
  responseData,
}: ResponseModalProps) {
  const target = responseData?.feedbackRequest;
  if (!open) return null;
  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalTitle}>Response details</div>
        {responseLoading ? (
          <div
            style={{ padding: "24px", textAlign: "center", color: "#5a6080" }}
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
                {target?.company} • {target?.role}
              </div>
              <div>
                Submitted:{" "}
                {responseData.response?.submitted_at
                  ? new Date(responseData.response.submitted_at).toLocaleString(
                      "sv-SE",
                    )
                  : "—"}
              </div>
            </div>
            {responseData.response ? (
              <div style={{ fontSize: "13px" }}>
                {/* Experience match */}
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
                {/* Communication */}
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
                        {(responseData.response.q2_checkboxes as string[]).map(
                          (cb) => (
                            <span key={cb} style={s.badge}>
                              {cb}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                )}
                {/* Reason not selected */}
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
                {/* Consider for future roles */}
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
                {/* Interview rating */}
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
                {/* What could strengthen your profile */}
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
                {/* Interview feedback */}
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
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button style={{ ...s.btnCancel, flex: 1 }} onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <div style={{ color: "#5a6080" }}>Failed to load response.</div>
        )}
      </div>
    </div>
  );
}
