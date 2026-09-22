"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get("role") === "admin" ? "admin" : "driver";

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/login/verify?email=${encodeURIComponent(email)}&role=${role}`);
  }

  return (
    <main className="fl-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div className="fl-panel" style={{ padding: 24 }}>
          <h1 className="fl-title" style={{ marginBottom: 4 }}>
            {role === "admin" ? "Admin sign-in" : "Driver sign-in"}
          </h1>
          <p className="fl-caption" style={{ marginBottom: 20 }}>
            Enter your email to receive a one-time verification code.
          </p>

          <form onSubmit={handleSendCode}>
            <div className="fl-field" style={{ marginBottom: 16 }}>
              <label className="fl-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="fl-input"
              />
            </div>

            {error && (
              <div className="fl-message fl-message-error" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="fl-btn fl-btn-primary" style={{ width: "100%" }}>
              {loading ? "Sending code…" : "Send verification code"}
            </button>
          </form>
        </div>

        <p className="fl-caption" style={{ textAlign: "center", marginTop: 12 }}>
          TakeOFF Driver Onboarding
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}