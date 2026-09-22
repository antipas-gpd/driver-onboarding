"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  id_number: string;
  id_document_url: string | null;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_plate: string;
  vehicle_registration_url: string | null;
  drivers_license_url: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }
    const { data } = await supabase
      .from("driver_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setProfiles((data as Profile[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setStatus(id: string, status: "approved" | "rejected") {
    await supabase.from("driver_profiles").update({ status }).eq("id", id);
    load();
  }

  if (loading) {
    return (
      <main className="fl-page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="fl-body" style={{ color: "var(--text-secondary)" }}>Loading…</p>
      </main>
    );
  }

  return (
    <main className="fl-page" style={{ padding: "24px 16px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 className="fl-title" style={{ marginBottom: 4 }}>Driver applications</h1>
        <p className="fl-caption" style={{ marginBottom: 20 }}>
          Review submitted test profiles and approve or reject.
        </p>

        {profiles.length === 0 && (
          <div className="fl-panel" style={{ padding: 24, textAlign: "center" }}>
            <p className="fl-body" style={{ color: "var(--text-secondary)" }}>No applications yet.</p>
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {profiles.map((p) => (
            <div key={p.id} className="fl-panel" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <p className="fl-body-strong">{p.full_name}</p>
                  <p className="fl-caption">{p.phone}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>

              <hr className="fl-divider" style={{ marginBottom: 12 }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px", marginBottom: 12, fontSize: 14 }}>
                <Row label="Address" value={p.address} />
                <Row label="ID number" value={p.id_number} />
                <Row label="Vehicle" value={`${p.vehicle_make} ${p.vehicle_model} (${p.vehicle_year})`} />
                <Row label="Plate" value={p.vehicle_plate} />
              </div>

              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                {p.id_document_url && <a href={p.id_document_url} target="_blank" className="fl-link fl-caption">ID document</a>}
                {p.vehicle_registration_url && <a href={p.vehicle_registration_url} target="_blank" className="fl-link fl-caption">Registration</a>}
                {p.drivers_license_url && <a href={p.drivers_license_url} target="_blank" className="fl-link fl-caption">License</a>}
              </div>

              {p.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setStatus(p.id, "approved")} className="fl-btn fl-btn-primary">
                    Approve
                  </button>
                  <button onClick={() => setStatus(p.id, "rejected")} className="fl-btn fl-btn-danger">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}:</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: Profile["status"] }) {
  const cls = { pending: "fl-badge-pending", approved: "fl-badge-approved", rejected: "fl-badge-rejected" }[status];
  return <span className={`fl-badge ${cls}`}>{status}</span>;
}