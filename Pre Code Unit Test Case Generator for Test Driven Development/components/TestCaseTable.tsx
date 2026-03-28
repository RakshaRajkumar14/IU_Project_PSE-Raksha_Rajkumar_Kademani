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

const editableFields: Array<keyof Omit<TestCase, "id">> = [
  "category",
  "title",
  "input",
  "preconditions",
  "steps",
  "expectedResult",
  "priority",
];

export function TestCaseTable({
  testCases,
  onChange,
}: TestCaseTableProps) {
  const createHandler =
    (id: string, field: keyof Omit<TestCase, "id">) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(id, field, event.target.value);
    };

  if (!testCases.length) {
    return (
      <div className="empty">
        Generated test cases will appear here after you submit the form.
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {editableFields.map((field) => (
              <th key={field}>{field}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {testCases.map((testCase) => (
            <tr key={testCase.id}>
              {editableFields.map((field) => (
                <td key={field}>
                  {field === "category" || field === "priority" ? (
                    <input
                      className="input"
                      value={testCase[field]}
                      onChange={createHandler(testCase.id, field)}
                    />
                  ) : (
                    <textarea
                      className="textarea"
                      value={testCase[field]}
                      onChange={createHandler(testCase.id, field)}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
