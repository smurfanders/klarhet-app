"use client";

import React from "react";

export default function StatCard({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  color?: string;
  sub?: string;
}) {
  const s = {
    statCard: {
      background: "#13161d",
      border: "1px solid #252936",
      borderRadius: "12px",
      padding: "20px 22px",
    } as React.CSSProperties,
    statLabel: {
      fontSize: "10px",
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "#5a6080",
      fontFamily: "monospace",
      marginBottom: "8px",
    } as React.CSSProperties,
    statValue: {
      fontSize: "30px",
      fontWeight: 800,
      lineHeight: 1,
      marginBottom: "4px",
    } as React.CSSProperties,
    statSub: {
      fontSize: "11px",
      color: "#3a3f55",
      fontFamily: "monospace",
    } as React.CSSProperties,
  };

  return (
    <div style={s.statCard}>
      <div style={s.statLabel}>{label}</div>
      <div style={{ ...s.statValue, color: color || "#e8b86d" }}>{value}</div>
      <div style={s.statSub}>{sub}</div>
    </div>
  );
}
