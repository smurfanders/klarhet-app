"use client";

import React from "react";
import IconButton from "../../../components/IconButton";
import { Stars, StatusBadge } from "../helpers";
import { s } from "../styles";
import type { FeedbackRequestRow } from "../types";

export default function FeedbackRequestRowItem({
  feedbackRequest,
  copied,
  onCopy,
  onView,
}: {
  feedbackRequest: FeedbackRequestRow;
  copied: string | null;
  onCopy: (url: string) => void;
  onView: (id: string) => void;
}) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div style={s.tableRow}>
      <div style={s.tdCompany}>{feedbackRequest.company}</div>
      <div style={s.tdRole}>{feedbackRequest.role}</div>
      <div>
        <StatusBadge row={feedbackRequest} />
      </div>
      <div>
        <Stars rating={feedbackRequest.q5_rating} />
      </div>
      <div style={s.tdLang}>{feedbackRequest.language.toUpperCase()}</div>
      <div style={s.tdDate}>
        {feedbackRequest.created_at
          ? new Date(feedbackRequest.created_at).toLocaleDateString("sv-SE", {
              month: "short",
              day: "numeric",
            })
          : "—"}
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        <IconButton
          title="Copy feedback link"
          onClick={() => onCopy(`${APP_URL}/f/${feedbackRequest.token}`)}
          style={s.iconBtn}
        >
          {copied === `${APP_URL}/f/${feedbackRequest.token}` ? "✓" : "⧉"}
        </IconButton>
        {feedbackRequest.response_id && (
          <IconButton
            title="View response"
            onClick={() => onView(feedbackRequest.id)}
            style={{ ...s.iconBtn, width: "30px" }}
          >
            👁
          </IconButton>
        )}
      </div>
    </div>
  );
}
