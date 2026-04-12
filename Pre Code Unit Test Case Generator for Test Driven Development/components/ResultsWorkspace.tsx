"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExportButton } from "@/components/ExportButton";
import { TestCaseTable } from "@/components/TestCaseTable";
import type { SessionRecord, TestCase, TestCategory } from "@/types";

interface ResultsWorkspaceProps {
  session: SessionRecord;
}

const categoryLabels: Record<TestCategory, string> = {
  "happy-path": "Normal Flow",
  boundary: "Boundary",
  negative: "Error Handling",
  edge: "Edge Cases",
};

type FilterKey = "all" | TestCategory;

function countByCategory(testCases: TestCase[]) {
  return testCases.reduce<Record<TestCategory, number>>(
    (counts, testCase) => {
      counts[testCase.category] += 1;
      return counts;
    },
    {
      "happy-path": 0,
      boundary: 0,
      negative: 0,
      edge: 0,
    },
  );
}

function buildCopyText(functionName: string, testCases: TestCase[]) {
  return [
    `Generated Test Cases for ${functionName}`,
    "",
    ...testCases.map((testCase, index) => [
      `Test Case ${index + 1}`,
      `Category: ${testCase.category}`,
      `Title: ${testCase.title}`,
      `Input: ${testCase.input}`,
      `Preconditions: ${testCase.preconditions}`,
      `Steps: ${testCase.steps}`,
      `Expected Result: ${testCase.expectedResult}`,
      `Priority: ${testCase.priority}`,
      "",
    ].join("\n")),
  ].join("\n");
}

export function ResultsWorkspace({ session }: ResultsWorkspaceProps) {
  const [testCases, setTestCases] = useState<TestCase[]>(session.testCases);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [copyStatus, setCopyStatus] = useState("Copy All");
  const [showContext, setShowContext] = useState(false);

  const counts = useMemo(() => countByCategory(testCases), [testCases]);
  const visibleCases = useMemo(
    () => testCases.filter((testCase) => activeFilter === "all" || testCase.category === activeFilter),
    [activeFilter, testCases],
  );

  const updateTestCase = (id: string, field: keyof Omit<TestCase, "id">, value: string) => {
    setTestCases((current) =>
      current.map((testCase) => (testCase.id === id ? { ...testCase, [field]: value } : testCase)),
    );
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(buildCopyText(session.functionName, testCases));
      setCopyStatus("Copied");
      window.setTimeout(() => setCopyStatus("Copy All"), 1500);
    } catch {
      setCopyStatus("Copy Failed");
      window.setTimeout(() => setCopyStatus("Copy All"), 1500);
    }
  };

  const filters: Array<{ key: FilterKey; label: string; count: number }> = [
    { key: "all", label: "All Cases", count: testCases.length },
    { key: "happy-path", label: categoryLabels["happy-path"], count: counts["happy-path"] },
    { key: "edge", label: categoryLabels.edge, count: counts.edge },
    { key: "negative", label: categoryLabels.negative, count: counts.negative },
    { key: "boundary", label: categoryLabels.boundary, count: counts.boundary },
  ];

  return (
    <div className="results-shell">
      {/* ── Hero ─────────────────────────────── */}
      <section className="results-hero">
        <div className="results-hero-copy">
          <div className="results-badge">Generated Session</div>
          <h1 className="results-title">{session.functionName}</h1>
          <p className="results-subtitle">
            Review, refine, copy, and export your generated test cases in one dedicated workspace.
          </p>
        </div>
        <div className="results-meta-grid">
          <div className="results-meta-card">
            <span className="results-meta-label">Language</span>
            <strong>{session.formInputs.programmingLanguage}</strong>
          </div>
          <div className="results-meta-card">
            <span className="results-meta-label">Total Cases</span>
            <strong>{testCases.length}</strong>
          </div>
          <div className="results-meta-card">
            <span className="results-meta-label">Normal Flow</span>
            <strong>{counts["happy-path"]}</strong>
          </div>
          <div className="results-meta-card">
            <span className="results-meta-label">Edge Cases</span>
            <strong>{counts.edge}</strong>
          </div>
          <div className="results-meta-card">
            <span className="results-meta-label">Error Handling</span>
            <strong>{counts.negative}</strong>
          </div>
          <div className="results-meta-card">
            <span className="results-meta-label">Created</span>
            <strong>{new Date(session.createdAt).toLocaleDateString()}</strong>
          </div>
        </div>
      </section>

      {/* ── Context / Understanding Requirements ── */}
      <section className="results-context-wrap">
        <button 
          className="results-context-toggle" 
          onClick={() => setShowContext((v) => !v)}
          aria-expanded={showContext}
        >
          <span className="results-context-icon">ℹ️</span>
          <span className="results-context-label">
            {showContext ? "Hide function context" : "View original function context & requirements"}
          </span>
          <svg 
            className="results-context-chevron" 
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ transform: showContext ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {showContext && (
          <div className="results-context-panel">
            <div className="results-context-grid">
              <div className="results-context-item">
                <h4>Description & Behavior</h4>
                <p>{session.formInputs.expectedBehavior || session.formInputs.description || "Not provided."}</p>
              </div>
              <div className="results-context-item">
                <h4>Parameters</h4>
                <p className="results-context-code">{session.formInputs.parameters || "None"}</p>
              </div>
              <div className="results-context-item">
                <h4>Boundary / Edge Cases Requested</h4>
                <p>{session.formInputs.boundaryConditions || "None specified."}</p>
              </div>
              {session.formInputs.notes && (
                <div className="results-context-item results-context-item--full">
                  <h4>Additional Notes</h4>
                  <p>{session.formInputs.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Panel ────────────────────────────── */}
      <section className="results-panel">
        {/* Toolbar */}
        <div className="results-toolbar">
          <div>
            <div className="results-panel-title-row">
              <span className="results-step">&#10003;</span>
              <h2 className="results-panel-title">Generated Test Cases</h2>
              <span className="results-count-pill">{testCases.length} cases</span>
            </div>
            <p className="results-panel-copy">
              Filter the list, edit details inline, then copy or export the final set.
            </p>
          </div>

          <div className="results-actions">
            <Link href="/generator" className="gen-btn-ghost">
              Generate Another
            </Link>
            <button type="button" className="gen-btn-secondary" onClick={() => void copyAll()}>
              {copyStatus}
            </button>
            <ExportButton functionName={session.functionName} testCases={testCases} />
          </div>
        </div>

        {/* Filter bar */}
        <div className="results-filter-bar">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={activeFilter === filter.key ? "results-filter is-active" : "results-filter"}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
              <span>{filter.count}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <TestCaseTable testCases={visibleCases} onChange={updateTestCase} />
      </section>
    </div>
  );
}
