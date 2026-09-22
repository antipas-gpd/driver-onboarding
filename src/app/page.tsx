"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="fl-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 16, minHeight: "100vh" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div className="fl-panel" style={{ padding: 32, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <svg width="72" height="44" viewBox="0 0 72 44" fill="none">
              <path
                d="M7 30 L11 16 Q13 11 19 11 H53 Q59 11 61 16 L65 30"
                stroke="var(--accent)"
                strokeWidth="2.2"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
              <rect x="4" y="28" width="64" height="10" rx="3" stroke="var(--accent)" strokeWidth="2.2" fill="none" />
              <circle cx="18" cy="38" r="5" stroke="var(--text-primary)" strokeWidth="2.2" fill="var(--surface)" />
              <circle cx="54" cy="38" r="5" stroke="var(--text-primary)" strokeWidth="2.2" fill="var(--surface)" />
              <line x1="24" y1="16" x2="24" y2="27" stroke="var(--accent)" strokeWidth="2" />
              <line x1="48" y1="16" x2="48" y2="27" stroke="var(--accent)" strokeWidth="2" />
            </svg>
          </div>

          <h1 className="fl-title" style={{ marginBottom: 4 }}>TakeOFF Driver Onboarding</h1>
          <p className="fl-caption" style={{ marginBottom: 24 }}>
            Choose how you&apos;d like to continue.
          </p>

          <div style={{ display: "grid", gap: 12 }}>
            <Link href="/login?role=driver" className="fl-btn fl-btn-primary" style={{ width: "100%", height: 40 }}>
              Continue as Driver
            </Link>
            <Link href="/login?role=admin" className="fl-btn fl-btn-secondary" style={{ width: "100%", height: 40 }}>
              Continue as Admin
            </Link>
          </div>
        </div>

        <p className="fl-caption" style={{ textAlign: "center", marginTop: 12 }}>
          TakeOFF Driver Onboarding
        </p>
      </div>
    </main>
  );
}