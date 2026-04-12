"use client";

import type { TestCase } from "@/types";

interface ExportButtonProps {
  functionName: string;
  testCases: TestCase[];
  sessionId?: string;
  disabled?: boolean;
}

export function ExportButton({
  functionName,
  testCases,
  sessionId,
  disabled,
}: ExportButtonProps) {
  const handleExport = () => {
    const url = sessionId
      ? `/api/export?sessionId=${encodeURIComponent(sessionId)}`
      : `/api/export?payload=${encodeURIComponent(
          JSON.stringify({ functionName, testCases }),
        )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      className="gen-btn-secondary"
      onClick={handleExport}
      disabled={disabled || !testCases.length}
    >
      Export .xlsx
    </button>
  );
}
