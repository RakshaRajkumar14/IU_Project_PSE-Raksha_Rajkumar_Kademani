import Link from "next/link";
import { notFound } from "next/navigation";
import { ResultsWorkspace } from "@/components/ResultsWorkspace";
import { AuthButton } from "@/components/AuthButton";
import { getSessionById } from "@/lib/sessionRepository";
import { createClient } from "@/lib/supabase/server";

interface ResultsPageProps {
  params: {
    id: string;
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) notFound();

    const session = await getSessionById(params.id, user.id);

    return (
      <main className="gen-page">
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
            <Link className="ld-nav-link" href="/history">History</Link>
            <Link className="ld-nav-link" href="/#footer">About</Link>
            <span className="ld-nav-link ld-nav-link--active">Results</span>
          </div>
          <div style={{ marginLeft: "12px" }}>
            <AuthButton email={user.email ?? ""} />
          </div>
        </nav>

        <div className="results-page-wrap">
          <ResultsWorkspace session={session} />
        </div>

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
      </main>
    );
  } catch {
    notFound();
  }
}
