"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      router.push("/generator");
      router.refresh();
    }, 1500);
  };

  const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  );
  const EyeOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );

  if (success) {
    return (
      <div className="auth-page-dark">
        <div className="auth-blob auth-blob--1" />
        <div className="auth-blob auth-blob--2" />
        <div className="auth-card-dark auth-card-dark--success">
          <div className="auth-success-icon">✓</div>
          <h2 className="auth-title-dark">Account Created!</h2>
          <p className="auth-subtitle-dark">Redirecting you to the generator…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-dark">
      {/* Navbar */}
      <nav className="ld-nav">
        <div className="ld-nav-logo">
          <div className="ld-nav-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" fill="white" />
            </svg>
          </div>
          <span className="ld-nav-brand">TestGen<strong>AI</strong></span>
        </div>
        <div className="ld-nav-links">
          <Link className="ld-nav-link" href="/">Home</Link>
          <Link className="ld-nav-link" href="/generator">Generator</Link>
          <Link className="ld-nav-link" href="/#features">Features</Link>
          <Link className="ld-nav-link" href="/#how-it-works">How It Works</Link>
          <Link className="ld-nav-link" href="/#footer">About</Link>
        </div>
        <div className="ld-nav-ctas">
          <Link href="/auth/login" className="ld-nav-signin">Sign In</Link>
          <span className="ld-nav-cta">Try It Free</span>
        </div>
      </nav>

      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />

      <div className="auth-card-dark">
        <h1 className="auth-title-dark">Create your account</h1>
        <p className="auth-subtitle-dark">Start generating AI-powered test cases in seconds</p>

        <form onSubmit={(e) => void handleSignup(e)} className="auth-form-dark">
          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-email">Email address</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M1 5.5l7 5 7-5" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
              <input
                id="signup-email"
                type="email"
                className="auth-input-dark"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-password">Password <span className="auth-label-hint">(min. 6 characters)</span></label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="7" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                id="signup-password"
                type={showPw ? "text" : "password"}
                className="auth-input-dark auth-input-dark--pw"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPw((v) => !v)} tabIndex={-1}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {/* Password strength bar */}
            {password.length > 0 && (
              <div className="auth-pw-strength">
                <div
                  className={`auth-pw-bar auth-pw-bar--${password.length < 6 ? "weak" : password.length < 10 ? "medium" : "strong"}`}
                  style={{ width: `${Math.min(100, (password.length / 12) * 100)}%` }}
                />
                <span className="auth-pw-label">
                  {password.length < 6 ? "Too short" : password.length < 10 ? "Medium" : "Strong"}
                </span>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-confirm">Confirm Password</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="7" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                id="signup-confirm"
                type={showPw ? "text" : "password"}
                className={`auth-input-dark auth-input-dark--pw${confirm && confirm !== password ? " auth-input-dark--error" : ""}`}
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            {confirm && confirm !== password && (
              <span className="auth-field-hint auth-field-hint--error">Passwords do not match</span>
            )}
            {confirm && confirm === password && password.length >= 6 && (
              <span className="auth-field-hint auth-field-hint--ok">✓ Passwords match</span>
            )}
          </div>

          {error && (
            <div className="auth-error-dark">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6.25" stroke="#f87171" strokeWidth="1.5"/><path d="M7 4.5v3M7 9.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/></svg>
              {error}
            </div>
          )}

          <button type="submit" className="auth-submit-dark" disabled={loading}>
            {loading ? (
              <><span className="gen-spinner" />Creating account...</>
            ) : (
              "Create Account →"
            )}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <p className="auth-switch-dark">
          Already have an account?{" "}
          <Link href="/auth/login" className="auth-link-dark">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
