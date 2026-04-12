"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AuthButton } from "@/components/AuthButton";
import { createClient } from "@/lib/supabase/client";

/* ── simple intersection-observer hook for scroll-in animations ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── animated counter ── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref as React.RefObject<HTMLSpanElement>}>{count}{suffix}</span>;
}

const features = [
  {
    icon: "⚡",
    iconBg: "linear-gradient(135deg,#7c5cff,#5b3fe0)",
    title: "AI-Powered Generation",
    desc: "Google Gemini AI reasons about your function and generates comprehensive, structured unit test cases intelligently.",
  },
  {
    icon: "⊞",
    iconBg: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    title: "Editable Table View",
    desc: "All generated test cases are displayed in a clean, editable table so you can review and refine them before export.",
  },
  {
    icon: "📄",
    iconBg: "linear-gradient(135deg,#10b981,#059669)",
    title: "Excel Export (.xlsx)",
    desc: "Export your complete test case suite as a professionally formatted Excel file, ready for corporate use.",
  },
  {
    icon: "🚀",
    iconBg: "linear-gradient(135deg,#f59e0b,#d97706)",
    title: "Instant Results",
    desc: "Generate full sets of test cases in seconds — what used to take hours of manual spreadsheet work.",
  },
  {
    icon: "◎",
    iconBg: "linear-gradient(135deg,#ec4899,#be185d)",
    title: "Boundary Conditions",
    desc: "Automatically identifies edge cases, boundary conditions, and exception scenarios you might miss manually.",
  },
  {
    icon: "🕐",
    iconBg: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
    title: "TDD Ready",
    desc: "Designed specifically for Test-Driven Development workflows — define tests before writing implementation code.",
  },
];

const steps = [
  {
    num: 1,
    icon: "</>",
    title: "Describe Your Function",
    desc: "Enter your function name, parameters, expected behaviour, and any boundary conditions you want to test.",
  },
  {
    num: 2,
    icon: "🧠",
    title: "AI Generates Test Cases",
    desc: "Google Gemini AI analyses your function description and generates a comprehensive set of structured unit test cases.",
  },
  {
    num: 3,
    icon: "⊞",
    title: "Review & Edit",
    desc: "All test cases are displayed in an interactive, editable table. Add, remove, or refine any test case as needed.",
  },
  {
    num: 4,
    icon: "↓",
    title: "Export to Excel",
    desc: "Download your complete, professionally formatted test case suite as an .xlsx file ready for your team.",
  },
];

export default function LandingPage() {
  /* hero word animation */
  const words = ["Before You Code", "For Every Function", "In Seconds"];
  const [wordIdx, setWordIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? "");
    });

    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % words.length);
        setFade(true);
      }, 400);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  const problemRef = useInView();
  const featuresRef = useInView();
  const stepsRef = useInView();
  const ctaRef = useInView();

  return (
    <div className="landing">
      {/* ── Navbar ── */}
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
          <span className="ld-nav-link ld-nav-link--active">Home</span>
          <Link className="ld-nav-link" href="/generator">Generator</Link>
          {userEmail && <Link className="ld-nav-link" href="/history">History</Link>}
          <Link className="ld-nav-link" href="#footer">About</Link>
        </div>
        {userEmail ? (
          <div style={{ marginLeft: "12px" }}>
            <AuthButton email={userEmail} />
          </div>
        ) : (
          <div className="ld-nav-ctas">
            <Link href="/auth/login" className="ld-nav-signin">Sign In</Link>
            <Link href="/auth/signup" className="ld-nav-cta">Try It Free</Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="ld-hero ld-hero--anim">
        <div className="ld-badge">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L8.5 4.5H12.5L9.5 6.5L10.5 10.5L7 8.5L3.5 10.5L4.5 6.5L1.5 4.5H5.5L7 1Z" fill="#a78bfa" />
          </svg>
          Powered by Google Gemini AI
        </div>
        <h1 className="ld-h1">
          Generate Unit Tests<br />
          <span className="ld-h1-accent" style={{ opacity: fade ? 1 : 0, transition: "opacity 0.4s ease" }}>
            {words[wordIdx]}
          </span>
        </h1>
        <p className="ld-subtitle">
          The Pre-Code Unit Test Case Generator automates your TDD documentation.
          Describe a function — get a complete, structured set of test cases ready
          to export as Excel in seconds.
        </p>
        <div className="ld-ctas">
          <Link href="/auth/signup" className="ld-btn-primary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L8.5 4.5H12.5L9.5 6.5L10.5 10.5L7 8.5L3.5 10.5L4.5 6.5L1.5 4.5H5.5L7 1Z" fill="white" />
            </svg>
            Start Free →
          </Link>
          <Link href="/generator" className="ld-btn-ghost">Try Generator ›</Link>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="ld-stats">
        <div className="ld-stat">
          <span className="ld-stat-value"><AnimatedCounter target={10} suffix="x" /></span>
          <span className="ld-stat-label">Faster than manual</span>
        </div>
        <div className="ld-stat">
          <span className="ld-stat-value"><AnimatedCounter target={12} suffix="+" /></span>
          <span className="ld-stat-label">Test cases per function</span>
        </div>
        <div className="ld-stat">
          <span className="ld-stat-value">100%</span>
          <span className="ld-stat-label">TDD compliant</span>
        </div>
        <div className="ld-stat">
          <span className="ld-stat-value">.xlsx</span>
          <span className="ld-stat-label">Export ready</span>
        </div>
      </div>

      {/* ── Problem / Solution ── */}
      <section
        className={`ld-ps-section${problemRef.inView ? " is-visible" : ""}`}
        ref={problemRef.ref as React.RefObject<HTMLElement>}
      >
        <div className="ld-ps-card ld-ps-card--problem">
          <span className="ld-ps-tag ld-ps-tag--problem">THE PROBLEM</span>
          <h2 className="ld-ps-title">Manual Process is Broken</h2>
          <ul className="ld-ps-list">
            {[
              "Developers manually create Excel spreadsheets for each test case",
              "Time-consuming, repetitive, and prone to human error",
              "Inconsistent documentation across development teams",
              "Reduced productivity during pre-coding analysis phase",
              "Tendency to skip or oversimplify test case definition",
            ].map((item) => (
              <li key={item} className="ld-ps-item ld-ps-item--problem">
                <span className="ld-ps-dot ld-ps-dot--problem" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="ld-ps-card ld-ps-card--solution">
          <span className="ld-ps-tag ld-ps-tag--solution">THE SOLUTION</span>
          <h2 className="ld-ps-title">AI Automates Everything</h2>
          <ul className="ld-ps-list">
            {[
              "Describe your function — AI generates complete test cases instantly",
              "Covers input parameters, expected outputs, and test categories",
              "Automatically identifies boundary conditions and edge cases",
              "Consistent, professional documentation every single time",
              "Export to formatted .xlsx files ready for corporate use",
            ].map((item) => (
              <li key={item} className="ld-ps-item ld-ps-item--solution">
                <svg className="ld-ps-check" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="8.25" stroke="#10b981" strokeWidth="1.5" />
                  <path d="M5.5 9.5l2.5 2.5 4.5-5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        className={`ld-features-section${featuresRef.inView ? " is-visible" : ""}`}
        ref={featuresRef.ref as React.RefObject<HTMLElement>}
      >
        <div className="ld-section-label">Features</div>
        <h2 className="ld-section-title">Everything You Need for <span className="ld-h1-accent">Better TDD</span></h2>
        <p className="ld-section-sub">A complete AI-powered toolkit designed for software developers who care about test quality and documentation consistency.</p>
        <div className="ld-features-grid">
          {features.map((f, i) => (
            <div className="ld-feature-card" key={f.title} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="ld-feature-icon" style={{ background: f.iconBg }}>{f.icon}</div>
              <h3 className="ld-feature-title">{f.title}</h3>
              <p className="ld-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className={`ld-steps-section${stepsRef.inView ? " is-visible" : ""}`}
        ref={stepsRef.ref as React.RefObject<HTMLElement>}
      >
        <div className="ld-section-label">How It Works</div>
        <h2 className="ld-section-title">Four Simple Steps to <span className="ld-h1-accent">Test Coverage</span></h2>
        <div className="ld-steps-grid">
          {steps.map((s, i) => (
            <div className="ld-step-card" key={s.num} style={{ animationDelay: `${i * 100}ms` }}>
              <div className="ld-step-icon-wrap">
                <span className="ld-step-num">{s.num}</span>
                <div className="ld-step-icon">{s.icon}</div>
              </div>
              <h3 className="ld-step-title">{s.title}</h3>
              <p className="ld-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        className={`ld-cta-banner${ctaRef.inView ? " is-visible" : ""}`}
        ref={ctaRef.ref as React.RefObject<HTMLElement>}
      >
        <div className="ld-cta-banner-inner">
          <div className="ld-cta-icon">✦</div>
          <h2 className="ld-cta-title">Ready to Automate Your <span className="ld-h1-accent">Test Cases?</span></h2>
          <p className="ld-cta-sub">Join developers who have transformed their TDD workflow. Generate your first test case suite in under 30 seconds.</p>
          <Link href="/auth/signup" className="ld-btn-primary ld-btn-primary--lg">
            ✦ Launch the Generator →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="ld-footer">
        <div className="ld-footer-inner">
          <div className="ld-footer-brand">
            <div className="ld-nav-logo">
              <div className="ld-nav-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" fill="white" />
                </svg>
              </div>
              <span className="ld-nav-brand">TestGen<strong>AI</strong></span>
            </div>
            <p className="ld-footer-desc">The Pre-Code Unit Test Case Generator. Automate your TDD workflow with AI-powered test case generation using Google Gemini.</p>
            <div className="gen-footer-socials">
              <a href="#" className="gen-social" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12.6 1h2.4L9.8 6.8 16 15h-4.7l-3.8-5-4.3 5H.8l5.5-6.4L0 1h4.8l3.4 4.6L12.6 1zm-.8 12.6h1.3L4.3 2.3H2.9l8.9 11.3z"/></svg>
              </a>
              <a href="#" className="gen-social" aria-label="Email">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="3" width="14" height="10" rx="2"/><path d="M1 5l7 5 7-5"/></svg>
              </a>
              <a href="#" className="gen-social" aria-label="Website">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="7"/><path d="M8 1c-2 2-3 4-3 7s1 5 3 7M8 1c2 2 3 4 3 7s-1 5-3 7M1 8h14"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="ld-footer-bar">
          <span>© 2026 TestGenAI. All rights reserved.</span>
          <span>Powered by <span style={{ color: "#7c5cff", fontWeight: 600 }}>Google Gemini AI</span></span>
        </div>
      </footer>
    </div>
  );
}
