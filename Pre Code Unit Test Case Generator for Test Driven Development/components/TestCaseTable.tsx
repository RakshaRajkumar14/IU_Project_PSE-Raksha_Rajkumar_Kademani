"use client";

import type { ChangeEvent } from "react";
import type { TestCase } from "@/types";

interface TestCaseTableProps {
  testCases: TestCase[];
  onChange: (
    id: string,
    field: keyof Omit<TestCase, "id">,
    value: string,
  ) => void;
}

const priorityBadgeClass: Record<string, string> = {
  high: "rts-badge rts-badge--high",
  medium: "rts-badge rts-badge--medium",
  low: "rts-badge rts-badge--low",
};

function getPriorityClass(priority: string) {
  return priorityBadgeClass[priority.toLowerCase()] ?? "rts-badge rts-badge--medium";
}

export function TestCaseTable({ testCases, onChange }: TestCaseTableProps) {
  const createHandler =
    (id: string, field: keyof Omit<TestCase, "id">) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      onChange(id, field, event.target.value);
    };

  if (!testCases.length) {
    return (
      <div className="gen-empty">
        <div className="gen-empty-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="4" y="3" width="20" height="22" rx="4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
            <path d="M9 9h10M9 14h10M9 19h6" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="gen-empty-title">No test cases match this filter.</p>
        <p className="gen-empty-sub">Try selecting <span className="gen-empty-highlight">All Cases</span> to see every generated test.</p>
      </div>
    );
  }

  return (
    <div className="rts-wrap">
      <table className="rts-table">
        <thead>
          <tr>
            <th className="rts-num">#</th>
            <th className="rts-th" style={{ minWidth: 100 }}>Category</th>
            <th className="rts-th" style={{ minWidth: 200 }}>Title</th>
            <th className="rts-th" style={{ minWidth: 180 }}>Input</th>
            <th className="rts-th" style={{ minWidth: 180 }}>Preconditions</th>
            <th className="rts-th" style={{ minWidth: 250 }}>Steps</th>
            <th className="rts-th" style={{ minWidth: 250 }}>Expected Result</th>
            <th className="rts-th" style={{ minWidth: 110 }}>Priority</th>
          </tr>
        </thead>
        <tbody>
          {testCases.map((tc, index) => (
            <tr key={tc.id}>
              <td className="rts-num">{index + 1}</td>
              <td className="rts-td">
                <input
                  className="rts-input"
                  value={tc.category}
                  onChange={createHandler(tc.id, "category")}
                  title="Category"
                />
                <span className="rts-badge rts-badge--cat" style={{ marginTop: 6 }}>
                  {tc.category}
                </span>
              </td>
              <td className="rts-td">
                <textarea
                  className="rts-textarea"
                  value={tc.title}
                  onChange={createHandler(tc.id, "title")}
                  title="Title"
                  rows={3}
                />
              </td>
              <td className="rts-td">
                <textarea
                  className="rts-textarea"
                  value={tc.input}
                  onChange={createHandler(tc.id, "input")}
                  title="Input"
                  rows={3}
                />
              </td>
              <td className="rts-td">
                <textarea
                  className="rts-textarea"
                  value={tc.preconditions}
                  onChange={createHandler(tc.id, "preconditions")}
                  title="Preconditions"
                  rows={3}
                />
              </td>
              <td className="rts-td">
                <textarea
                  className="rts-textarea"
                  value={tc.steps}
                  onChange={createHandler(tc.id, "steps")}
                  title="Steps"
                  rows={3}
                />
              </td>
              <td className="rts-td">
                <textarea
                  className="rts-textarea"
                  value={tc.expectedResult}
                  onChange={createHandler(tc.id, "expectedResult")}
                  title="Expected Result"
                  rows={3}
                />
              </td>
              <td className="rts-td">
                <span className={getPriorityClass(tc.priority)}>
                  {tc.priority}
                </span>
                <br />
                <input
                  className="rts-input"
                  value={tc.priority}
                  onChange={createHandler(tc.id, "priority")}
                  title="Priority"
                  style={{ marginTop: 6 }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
