import Link from "next/link";
import { HistoryPanel } from "@/components/HistoryPanel";
import { AuthButton } from "@/components/AuthButton";
import { createClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
          <span className="ld-nav-link ld-nav-link--active">History</span>
          <Link className="ld-nav-link" href="/#footer">About</Link>
        </div>
        <div style={{ marginLeft: "12px" }}>
          <AuthButton email={user?.email ?? ""} />
        </div>
      </nav>

      <section className="gen-hero">
        <div className="ld-badge">Saved Sessions</div>
        <h1 className="gen-hero-title">Browse Your <span className="ld-h1-accent">History</span></h1>
        <p className="gen-hero-sub">
          Browse all saved generations, search by function name, filter by test
          category, and re-download each workbook on demand.
        </p>
      </section>

      <div className="gen-history-page-wrap">
        <HistoryPanel mode="page" />
      </div>
    </main>
  );
}
