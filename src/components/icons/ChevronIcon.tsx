import React from "react";

export default function ChevronIcon({
  size = 14,
  open = false,
}: {
  size?: number;
  open?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform .2s",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
