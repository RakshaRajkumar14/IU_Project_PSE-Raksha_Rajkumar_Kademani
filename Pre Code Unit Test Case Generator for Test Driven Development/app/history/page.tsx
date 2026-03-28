import Link from "next/link";
import { HistoryPanel } from "@/components/HistoryPanel";

export default function HistoryPage() {
  return (
    <main className="shell">
      <section className="hero">
        <nav>
          <Link className="nav-link" href="/">
            Generator
          </Link>
          <span className="nav-link primary">History Library</span>
        </nav>
        <div>
          <h1>History Library</h1>
        </div>
        <p>
          Browse all saved generations, search by function name, filter by test
          category, and re-download each workbook on demand.
        </p>
      </section>

      <HistoryPanel mode="page" />
    </main>
  );
}
