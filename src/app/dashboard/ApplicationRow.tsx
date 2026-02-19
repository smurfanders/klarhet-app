"use client";

import React from "react";
import IconButton from "../../components/IconButton";
import { Stars, StatusBadge } from "./helpers";
import { s } from "./styles";
import type { AppRow } from "./types";

export default function ApplicationRow({
  app,
  copied,
  onCopy,
  onView,
}: {
  app: AppRow;
  copied: string | null;
  onCopy: (url: string) => void;
  onView: (id: string) => void;
}) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div style={s.tableRow}>
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
      <div style={{ display: "flex", gap: "6px" }}>
        <IconButton
          title="Copy feedback link"
          onClick={() => onCopy(`${APP_URL}/f/${app.token}`)}
          style={s.iconBtn}
        >
          {copied === `${APP_URL}/f/${app.token}` ? "✓" : "⧉"}
        </IconButton>
        {app.response_id && (
          <IconButton
            title="View response"
            onClick={() => onView(app.id)}
            style={{ ...s.iconBtn, width: "30px" }}
          >
            👁
          </IconButton>
        )}
      </div>
    </div>
  );
}
