"use client";

import React from "react";
import { s } from "../app/dashboard/styles";

export default function IconButton({
  title,
  onClick,
  children,
  style,
}: {
  title?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{ ...s.iconBtn, ...(style || {}) }}
    >
      {children}
    </button>
  );
}
