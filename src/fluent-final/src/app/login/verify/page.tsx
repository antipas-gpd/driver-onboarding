"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function VerifyForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <main className="fl-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div className="fl-panel" style={{ padding: 24 }}>
          <h1 className="fl-title" style={{ marginBottom: 4 }}>Check your email</h1>
          <p className="fl-caption" style={{ marginBottom: 20 }}>
            Enter the code sent to <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{email}</span>.
          </p>

          <form onSubmit={handleVerify}>
            <div className="fl-field" style={{ marginBottom: 16 }}>
              <label className="fl-label" htmlFor="code">Verification code</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                required
                maxLength={10}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                className="fl-input"
                style={{ textAlign: "center", letterSpacing: "0.15em", fontSize: 16 }}
              />
            </div>

            {error && (
              <div className="fl-message fl-message-error" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="fl-btn fl-btn-primary" style={{ width: "100%" }}>
              {loading ? "Verifying…" : "Verify"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
