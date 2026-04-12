"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExportButton } from "@/components/ExportButton";
import type { SessionRecord } from "@/types";

interface HistoryPanelProps {
  mode?: "compact" | "page";
  onLoadSession?: (session: SessionRecord) => void;
}

export function HistoryPanel({
  mode = "page",
  onLoadSession,
}: HistoryPanelProps) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [status, setStatus] = useState("Loading session history...");
  const [error, setError] = useState("");

  const loadSessions = async () => {
    setError("");
    setStatus("Loading session history...");

    try {
      const response = await fetch(
        `/api/sessions?q=${encodeURIComponent(query)}&category=${encodeURIComponent(
          category,
        )}&sort=${encodeURIComponent(sort)}`,
      );
      const payload = (await response.json()) as {
        error?: string;
        sessions?: SessionRecord[];
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load history.");
      }

      setSessions(payload.sessions || []);
      setStatus(
        payload.sessions?.length
          ? `Showing ${payload.sessions.length} saved sessions.`
          : "No sessions matched your filters.",
      );
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to load history.";

      setError(message);
      setStatus("");
    }
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  const removeSession = async (id: string) => {
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to delete session.");
      }

      setSessions((current) => current.filter((session) => session.id !== id));
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete session.";
      setError(message);
    }
  };

  return (
    <section className="gen-history-panel">
      <div className="gen-history-panel-inner">
        <div className="gen-history-copy">
          <h2 className="gen-history-title">
            {mode === "compact" ? "Recent History" : "History Library"}
          </h2>
          <p className="gen-history-subtitle">
            Search by function name, filter by category, preview saved sessions,
            reload them into the form, or download Excel again.
          </p>
        </div>

        <div className="gen-history-filters">
          <div className="gen-field">
            <label className="gen-label" htmlFor="history-query">
              Search function
            </label>
            <input
              id="history-query"
              className="gen-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="calculateDiscount"
            />
          </div>
          <div className="gen-field">
            <label className="gen-label" htmlFor="history-category">
              Category
            </label>
            <select
              id="history-category"
              className="gen-select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">All categories</option>
              <option value="happy-path">happy-path</option>
              <option value="boundary">boundary</option>
              <option value="negative">negative</option>
              <option value="edge">edge</option>
            </select>
          </div>
          <div className="gen-field">
            <label className="gen-label" htmlFor="history-sort">
              Sort
            </label>
            <select
              id="history-sort"
              className="gen-select"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        <div className="gen-actions">
          <button
            type="button"
            className="gen-btn-primary"
            onClick={() => void loadSessions()}
          >
            Refresh History
          </button>
        </div>

        <div className={`gen-history-status ${error ? "is-error" : ""}`}>
          {error || status}
        </div>

        {sessions.length ? (
          <div className="gen-history-list">
            {sessions.map((session) => (
              <article className="gen-session-card" key={session.id}>
                <header className="gen-session-header">
                  <div>
                    <h3 className="gen-session-title">{session.functionName}</h3>
                    <div className="gen-session-meta">
                      {new Date(session.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span className="gen-session-tag">{session.testCases.length} cases</span>
                </header>

                <div className="gen-session-preview">
                  Preview: {session.testCases.slice(0, 2).map((item) => item.title).join(" • ")}
                </div>

                <div className="gen-actions">
                  <Link href={`/results/${session.id}`} className="gen-btn-secondary">
                    View Results
                  </Link>
                  {onLoadSession ? (
                    <button
                      type="button"
                      className="gen-btn-primary"
                      onClick={() => onLoadSession(session)}
                    >
                      Load Session
                    </button>
                  ) : null}
                  <ExportButton
                    functionName={session.functionName}
                    sessionId={session.id}
                    testCases={session.testCases}
                  />
                  <button
                    type="button"
                    className="gen-btn-danger"
                    onClick={() => void removeSession(session.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="gen-empty">
            Saved sessions will appear here once generations are persisted.
          </div>
        )}
      </div>
    </section>
  );
}
