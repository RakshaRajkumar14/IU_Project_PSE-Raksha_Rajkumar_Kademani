"use client";

import Link from "next/link";
import { useState } from "react";
import { ExportButton } from "@/components/ExportButton";
import { HistoryPanel } from "@/components/HistoryPanel";
import { InputForm } from "@/components/InputForm";
import { TestCaseTable } from "@/components/TestCaseTable";
import type { FormInputs, GenerateResponse, SessionRecord, TestCase } from "@/types";

const initialFormInputs: FormInputs = {
  functionName: "",
  description: "",
  parameters: "",
  expectedBehavior: "",
  boundaryConditions: "",
  returnType: "",
  notes: "",
};

export default function HomePage() {
  const [formInputs, setFormInputs] = useState<FormInputs>(initialFormInputs);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(
    "Describe the function, generate a structured case set, then fine-tune any cells inline.",
  );
  const [error, setError] = useState("");

  const updateFormInput = (field: keyof FormInputs, value: string) => {
    setFormInputs((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateTestCase = (
    id: string,
    field: keyof Omit<TestCase, "id">,
    value: string,
  ) => {
    setTestCases((current) =>
      current.map((testCase) =>
        testCase.id === id ? { ...testCase, [field]: value } : testCase,
      ),
    );
  };

  const handleGenerate = async () => {
    setIsSubmitting(true);
    setError("");
    setStatus("Generating test cases and saving the session...");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formInputs }),
      });
      const payload = (await response.json()) as {
        error?: string;
      } & Partial<GenerateResponse>;

      if (!response.ok || !payload.session) {
        throw new Error(payload.error || "Unable to generate test cases.");
      }

      setSession(payload.session);
      setTestCases(payload.session.testCases);
      setStatus(
        `Generated ${payload.session.testCases.length} test cases and saved the session history.`,
      );
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to generate test cases.";

      setError(message);
      setStatus("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadSession = (savedSession: SessionRecord) => {
    setSession(savedSession);
    setFormInputs(savedSession.formInputs);
    setTestCases(savedSession.testCases);
    setError("");
    setStatus(`Reloaded session for ${savedSession.functionName}.`);
  };

  const resetForm = () => {
    setFormInputs(initialFormInputs);
    setSession(null);
    setTestCases([]);
    setError("");
    setStatus("Form cleared. Add a new function brief when you are ready.");
  };

  return (
    <main className="shell">
      <section className="hero">
        <nav>
          <span className="nav-link primary">Generator</span>
          <Link className="nav-link" href="/history">
            History Library
          </Link>
        </nav>
        <div>
          <h1>Pre-Code Unit Test Case Generator</h1>
        </div>
        <p>
          Build unit test cases before implementation code exists. The workflow
          stays structured from end to end: function brief in, categorized test
          table out, automatic persistence to Supabase, and one-click Excel
          export.
        </p>
      </section>

      <section className="grid main">
        <InputForm
          formInputs={formInputs}
          isSubmitting={isSubmitting}
          onChange={updateFormInput}
          onSubmit={() => void handleGenerate()}
          onReset={resetForm}
        />

        <section className="panel">
          <div className="panel-inner stack">
            <div>
              <h2>Generated Test Matrix</h2>
              <p className="muted">
                Review, adjust, and export the structured cases. Edits made here
                are used for immediate export.
              </p>
            </div>

            <div className={`status ${error ? "error" : ""}`}>
              {error || status}
            </div>

            <div className="actions">
              <ExportButton
                functionName={formInputs.functionName || session?.functionName || "test-cases"}
                testCases={testCases}
              />
            </div>

            <TestCaseTable testCases={testCases} onChange={updateTestCase} />
          </div>
        </section>
      </section>

      <div style={{ height: 20 }} />

      <HistoryPanel mode="compact" onLoadSession={loadSession} />
    </main>
  );
}
