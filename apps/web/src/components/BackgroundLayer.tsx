"use client";
import * as React from "react";

/**
 * Fixed, global background for the neon dark system.
 * Renders a gradient + optional subtle noise.
 */
export default function BackgroundLayer() {
  return (
    <>
      <div
        className="sv-bg-root"
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background:
            "linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 100%)",
        }}
      />
      <div
        className="sv-bg-noise"
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          opacity: 0.05,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
          mixBlendMode: "overlay",
        }}
      />
    </>
  );
}
