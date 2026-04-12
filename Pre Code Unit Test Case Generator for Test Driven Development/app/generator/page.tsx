"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { HistoryPanel } from "@/components/HistoryPanel";
import { InputForm } from "@/components/InputForm";
import { AuthButton } from "@/components/AuthButton";
import { createClient } from "@/lib/supabase/client";
import type { FormInputs, GenerateResponse, SessionRecord } from "@/types";

const initialFormInputs: FormInputs = {
  functionName: "",
  programmingLanguage: "Python",
  description: "",
  parameters: "",
  expectedBehavior: "",
  boundaryConditions: "",
  returnType: "",
  notes: "",
};

export default function GeneratorPage() {
  const router = useRouter();
  const [formInputs, setFormInputs] = useState<FormInputs>(initialFormInputs);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/auth/login");
      } else {
        setUserEmail(data.user.email ?? "");
        setLoadingAuth(false);
      }
    });
  }, [router]);

  if (loadingAuth) {
    return (
      <div className="gen-page" style={{ justifyContent: "center", alignItems: "center" }}>
        <span className="gen-spinner" />
      </div>
    );
  }

  const updateFormInput = (field: keyof FormInputs, value: string) => {
    setFormInputs((c) => ({ ...c, [field]: value }));
  };

  const handleGenerate = async () => {
    setIsSubmitting(true);
    setError("");
    setStatus("Generating test cases...");

    // populate description from expectedBehavior if empty
    const payload: FormInputs = {
      ...formInputs,
      description: formInputs.description || formInputs.expectedBehavior,
    };

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formInputs: payload }),
      });
      const data = (await response.json()) as { error?: string } & Partial<GenerateResponse>;

      if (!response.ok || !data.session) {
        throw new Error(data.error || "Unable to generate test cases.");
      }

      setStatus(`${data.session.testCases.length} test cases generated. Opening results...`);
      router.push(`/results/${data.session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate test cases.");
      setStatus("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadSession = (saved: SessionRecord) => {
    setFormInputs(saved.formInputs);
    setError("");
    setStatus(`Loaded session for ${saved.functionName}. Generate again to open fresh results.`);
  };

  const resetForm = () => {
    setFormInputs(initialFormInputs);
    setError("");
    setStatus("");
  };

  return (
    <div className="gen-page">

      {/* Navbar */}
      <nav className="ld-nav">
        <div className="ld-nav-logo">
          <div className="ld-nav-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" fill="white"/>
            </svg>
          </div>
          <span className="ld-nav-brand">TestGen<strong>AI</strong></span>
        </div>
        <div className="ld-nav-links">
          <Link className="ld-nav-link" href="/">Home</Link>
          <span className="ld-nav-link ld-nav-link--active">Generator</span>
          <Link className="ld-nav-link" href="/history">History</Link>
          <Link className="ld-nav-link" href="/#footer">About</Link>
        </div>
        <div style={{ marginLeft: "12px" }}>
          <AuthButton email={userEmail} />
        </div>
      </nav>

      {/* Hero */}
      <section className="gen-hero is-visible" style={{ zIndex: 10, position: "relative" }}>
        <div className="ld-badge">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L8.5 4.5H12.5L9.5 6.5L10.5 10.5L7 8.5L3.5 10.5L4.5 6.5L1.5 4.5H5.5L7 1Z" fill="#a78bfa"/>
          </svg>
          AI Test Case Generator
        </div>
        <h1 className="gen-hero-title" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
          Build Bulletproof <span className="ld-h1-accent">Test Cases</span>
        </h1>
        <p className="gen-hero-sub" style={{ fontSize: "1.1rem" }}>
          Describe your function, define its boundaries, and let Google Gemini construct a comprehensive testing suite for you in seconds.
        </p>
      </section>

      {/* Form */}
      <div className="gen-form-wrap is-visible" style={{ zIndex: 10, position: "relative", animationDelay: "0.1s" }}>
        <InputForm
          formInputs={formInputs}
          isSubmitting={isSubmitting}
          onChange={updateFormInput}
          onSubmit={() => void handleGenerate()}
          onReset={resetForm}
        />
      </div>

      <div className="gen-results-wrap">
        {error && (
          <div className="gen-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: "middle", marginRight: 8 }}>
              <circle cx="8" cy="8" r="7" stroke="#f87171" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 11v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}
        {status && !error && (
          <div className="gen-status">
            {isSubmitting && (
              <span className="gen-spinner" aria-hidden="true" />
            )}
            {status}
          </div>
        )}
        {!error && !status && (
          <div className="gen-results-note">
            <div className="gen-results-note-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="3" y="2" width="12" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6 6h6M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3 className="gen-results-note-title">Results open on a dedicated page</h3>
              <p className="gen-results-note-copy">
                After submitting, you&apos;ll be taken to a full results workspace with filtering, inline editing, copy, and Excel export.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* History */}
      <div className="gen-history-wrap">
        <HistoryPanel mode="compact" onLoadSession={loadSession} />
      </div>

      {/* Footer */}
      <footer className="gen-footer">
        <div className="gen-footer-inner">
          <div className="gen-footer-brand">
            <div className="gen-footer-logo">
              <div className="ld-nav-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" fill="white"/>
                </svg>
              </div>
              <span className="ld-nav-brand">TestGen<strong>AI</strong></span>
            </div>
            <p className="gen-footer-desc">
              The Pre-Code Unit Test Case Generator. Automate your TDD workflow with AI-powered test case generation using Google Gemini.
            </p>
            <div className="gen-footer-socials">
              <a href="#" className="gen-social" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M12.6 1h2.4L9.8 6.8 16 15h-4.7l-3.8-5-4.3 5H.8l5.5-6.4L0 1h4.8l3.4 4.6L12.6 1zm-.8 12.6h1.3L4.3 2.3H2.9l8.9 11.3z"/>
                </svg>
              </a>
              <a href="#" className="gen-social" aria-label="Email">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="1" y="3" width="14" height="10" rx="2"/>
                  <path d="M1 5l7 5 7-5"/>
                </svg>
              </a>
              <a href="#" className="gen-social" aria-label="Website">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="8" cy="8" r="7"/>
                  <path d="M8 1c-2 2-3 4-3 7s1 5 3 7M8 1c2 2 3 4 3 7s-1 5-3 7M1 8h14"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="gen-footer-bar">
          <span>© 2026 TestGenAI. All rights reserved.</span>
          <span>Powered by <span className="gen-footer-gemini">Google Gemini AI</span></span>
        </div>
      </footer>
    </div>
  );
}
