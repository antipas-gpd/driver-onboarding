"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type FormData = {
  fullName: string;
  phone: string;
  address: string;
  idNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePlate: string;
};

const STEPS = ["Personal details", "Identity", "Vehicle", "Documents", "Review"];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    address: "",
    idNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehiclePlate: "",
  });

  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [vehicleRegistration, setVehicleRegistration] = useState<File | null>(null);
  const [driversLicense, setDriversLicense] = useState<File | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
      } else {
        setUserEmail(data.user.email ?? null);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handlePhoneChange(value: string) {
    // digits, spaces, leading + and dashes only
    const cleaned = value.replace(/[^0-9+\-\s]/g, "");
    update("phone", cleaned);
  }

  function handleYearChange(value: string) {
    const cleaned = value.replace(/[^0-9]/g, "").slice(0, 4);
    update("vehicleYear", cleaned);
  }

  function handlePlateChange(value: string) {
    const cleaned = value.replace(/[^a-zA-Z0-9\s]/g, "").toUpperCase();
    update("vehiclePlate", cleaned);
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (!form.fullName.trim()) return "Enter your full name.";
      if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 7)
        return "Enter a valid phone number.";
      if (!form.address.trim()) return "Enter your residential address.";
    }
    if (step === 1) {
      if (!form.idNumber.trim()) return "Enter your national ID number.";
      if (!idDocument) return "Upload your ID document.";
    }
    if (step === 2) {
      if (!form.vehicleMake.trim()) return "Enter the vehicle make.";
      if (!form.vehicleModel.trim()) return "Enter the vehicle model.";
      if (form.vehicleYear.length !== 4) return "Enter a valid 4-digit year.";
      if (!form.vehiclePlate.trim()) return "Enter the number plate.";
    }
    if (step === 3) {
      if (!vehicleRegistration) return "Upload the vehicle registration book.";
      if (!driversLicense) return "Upload the driver's license.";
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function uploadDoc(file: File | null, prefix: string, userId: string) {
    if (!file) return null;
    const path = `${userId}/${prefix}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("driver-documents").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("driver-documents").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not signed in");

      const [idUrl, regUrl, licenseUrl] = await Promise.all([
        uploadDoc(idDocument, "id", userId),
        uploadDoc(vehicleRegistration, "registration", userId),
        uploadDoc(driversLicense, "license", userId),
      ]);

      const { error: insertError } = await supabase.from("driver_profiles").insert({
        user_id: userId,
        full_name: form.fullName,
        phone: form.phone,
        address: form.address,
        id_number: form.idNumber,
        id_document_url: idUrl,
        vehicle_make: form.vehicleMake,
        vehicle_model: form.vehicleModel,
        vehicle_year: form.vehicleYear,
        vehicle_plate: form.vehiclePlate,
        vehicle_registration_url: regUrl,
        drivers_license_url: licenseUrl,
        status: "pending",
      });

      if (insertError) throw insertError;

      router.push("/onboarding/complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <main className="fl-page" style={{ padding: "24px 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}>
          <p className="fl-caption" style={{ marginBottom: 8 }}>Signed in as {userEmail}</p>

          <div className="fl-step-track">
            <div className="fl-step-fill" style={{ width: `${progressPct}%`, transition: "width 0.15s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {STEPS.map((label, i) => (
              <span
                key={label}
                className="fl-caption"
                style={{
                  color: i === step ? "var(--accent)" : "var(--text-disabled)",
                  fontWeight: i === step ? 600 : 400,
                  fontSize: 11,
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="fl-panel" style={{ padding: 24 }}>
          {step === 0 && (
            <div>
              <h2 className="fl-subtitle" style={{ marginBottom: 16 }}>Personal &amp; contact details</h2>
              <div style={{ display: "grid", gap: 16 }}>
                <Field label="Full name">
                  <input className="fl-input" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
                </Field>
                <Field label="Phone number">
                  <input
                    className="fl-input"
                    type="tel"
                    inputMode="tel"
                    placeholder="e.g. +263 77 123 4567"
                    value={form.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                  />
                </Field>
                <Field label="Residential address">
                  <input className="fl-input" value={form.address} onChange={(e) => update("address", e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="fl-subtitle" style={{ marginBottom: 16 }}>Identity verification</h2>
              <div style={{ display: "grid", gap: 16 }}>
                <Field label="National ID number">
                  <input className="fl-input" value={form.idNumber} onChange={(e) => update("idNumber", e.target.value)} />
                </Field>
                <FileField
                  label="Upload ID document (photo/scan)"
                  file={idDocument}
                  onChange={setIdDocument}
                />
              </div>
              <p className="fl-caption" style={{ marginTop: 12 }}>Use test data only — no real identity documents.</p>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="fl-subtitle" style={{ marginBottom: 16 }}>Vehicle details</h2>
              <div style={{ display: "grid", gap: 16 }}>
                <Field label="Make">
                  <input className="fl-input" value={form.vehicleMake} onChange={(e) => update("vehicleMake", e.target.value)} />
                </Field>
                <Field label="Model">
                  <input className="fl-input" value={form.vehicleModel} onChange={(e) => update("vehicleModel", e.target.value)} />
                </Field>
                <Field label="Year">
                  <input
                    className="fl-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 2018"
                    value={form.vehicleYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                  />
                </Field>
                <Field label="Number plate">
                  <input
                    className="fl-input"
                    value={form.vehiclePlate}
                    onChange={(e) => handlePlateChange(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="fl-subtitle" style={{ marginBottom: 16 }}>Vehicle &amp; driver documents</h2>
              <div style={{ display: "grid", gap: 16 }}>
                <FileField
                  label="Vehicle registration book"
                  file={vehicleRegistration}
                  onChange={setVehicleRegistration}
                />
                <FileField
                  label="Driver's license"
                  file={driversLicense}
                  onChange={setDriversLicense}
                />
              </div>
              <p className="fl-caption" style={{ marginTop: 12 }}>Use test data only — no real documents.</p>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="fl-subtitle" style={{ marginBottom: 16 }}>Review your application</h2>
              <div>
                <ReviewRow label="Full name" value={form.fullName} />
                <ReviewRow label="Phone" value={form.phone} />
                <ReviewRow label="Address" value={form.address} />
                <ReviewRow label="ID number" value={form.idNumber} />
                <ReviewRow label="ID document" value={idDocument?.name ?? "Not uploaded"} />
                <ReviewRow label="Vehicle" value={`${form.vehicleMake} ${form.vehicleModel} (${form.vehicleYear})`} />
                <ReviewRow label="Plate" value={form.vehiclePlate} />
                <ReviewRow label="Registration doc" value={vehicleRegistration?.name ?? "Not uploaded"} />
                <ReviewRow label="License doc" value={driversLicense?.name ?? "Not uploaded"} last />
              </div>
              {error && (
                <div className="fl-message fl-message-error" style={{ marginTop: 16 }}>{error}</div>
              )}
            </div>
          )}

          {stepError && (
            <div className="fl-message fl-message-error" style={{ marginTop: 16 }}>{stepError}</div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            <button onClick={back} disabled={step === 0} className="fl-btn fl-btn-subtle">
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button onClick={next} className="fl-btn fl-btn-primary">
                Continue
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="fl-btn fl-btn-primary">
                {submitting ? "Submitting…" : "Submit application"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="fl-field">
      <span className="fl-label">{label}</span>
      {children}
    </label>
  );
}

function FileField({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fl-field">
      <span className="fl-label">{label}</span>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          border: "1.5px dashed var(--stroke-strong)",
          borderRadius: "var(--radius-control)",
          padding: "16px",
          textAlign: "center",
          cursor: "pointer",
          background: "var(--surface-alt)",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-secondary)"
          strokeWidth={1.6}
          style={{ margin: "0 auto 6px" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14" />
        </svg>
        <p className="fl-body" style={{ margin: 0 }}>
          {file ? file.name : "Click to browse or drop a file"}
        </p>
        <p className="fl-caption" style={{ marginTop: 2 }}>JPG, PNG or PDF</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        style={{ display: "none" }}
      />
    </div>
  );
}

function ReviewRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: last ? "none" : "1px solid var(--divider)",
        fontSize: 14,
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}
