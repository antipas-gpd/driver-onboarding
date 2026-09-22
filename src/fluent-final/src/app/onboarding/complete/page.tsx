export default function CompletePage() {
  return (
    <main className="fl-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="fl-panel" style={{ maxWidth: 380, padding: 32, textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--success-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="fl-subtitle" style={{ marginBottom: 8 }}>Application submitted</h1>
        <p className="fl-body" style={{ color: "var(--text-secondary)" }}>
          Thanks for applying to become a TakeOFF driver. Your application is now under review —
          we&apos;ll notify you by email once it has been reviewed.
        </p>
      </div>
    </main>
  );
}
