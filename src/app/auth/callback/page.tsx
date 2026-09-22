"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const code = params.get("code");

    async function run() {
      if (!code) {
        setError("Missing sign-in code in link.");
        return;
      }
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/onboarding");
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="fl-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="fl-panel" style={{ padding: 24, maxWidth: 380, textAlign: "center" }}>
        {error ? (
          <>
            <p className="fl-body-strong" style={{ marginBottom: 8 }}>Sign-in link problem</p>
            <p className="fl-caption">{error}</p>
          </>
        ) : (
          <p className="fl-body">Signing you in…</p>
        )}
      </div>
    </main>
  );
}

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}