"use client";

import React from "react";
import { badge as badgeStyle } from "./styles";

export function Stars({ rating }: { rating: number | null }) {
  if (!rating)
    return <span style={{ color: "#3a3f55", fontSize: "13px" }}>—</span>;
  return (
    <span style={{ color: "#e8b86d", fontSize: "13px", letterSpacing: "1px" }}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export function StatusBadge({ row }: { row: { response_id?: string } }) {
  if (row.response_id) {
    return (
      <span
        style={{
          ...badgeStyle,
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
        ...badgeStyle,
        background: "rgba(232,184,109,0.1)",
        color: "#e8b86d",
      }}
    >
      ◌ Pending
    </span>
  );
}
