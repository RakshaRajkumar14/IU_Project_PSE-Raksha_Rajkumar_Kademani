"use client";

import type { ChangeEvent } from "react";
import type { FormInputs } from "@/types";

interface InputFormProps {
  formInputs: FormInputs;
  isSubmitting: boolean;
  onChange: (field: keyof FormInputs, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
}

const fieldConfig: Array<{
  key: keyof FormInputs;
  label: string;
  placeholder: string;
  multiline?: boolean;
}> = [
  {
    key: "functionName",
    label: "Function name",
    placeholder: "calculateDiscount",
  },
  {
    key: "description",
    label: "Description",
    placeholder: "Describe what the function is intended to do.",
    multiline: true,
  },
  {
    key: "parameters",
    label: "Parameters",
    placeholder: "price: number, customerType: string, coupon?: string",
    multiline: true,
  },
  {
    key: "expectedBehavior",
    label: "Expected behavior",
    placeholder: "Explain the expected output and core rules.",
    multiline: true,
  },
  {
    key: "boundaryConditions",
    label: "Boundary conditions",
    placeholder: "Zero values, nulls, max length, min amount...",
    multiline: true,
  },
  {
    key: "returnType",
    label: "Return type",
    placeholder: "number",
  },
  {
    key: "notes",
    label: "Additional notes",
    placeholder: "Any assumptions, constraints, or validation rules.",
    multiline: true,
  },
];

export function InputForm({
  formInputs,
  isSubmitting,
  onChange,
  onSubmit,
  onReset,
}: InputFormProps) {
  const handleFieldChange =
    (key: keyof FormInputs) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(key, event.target.value);
    };

  return (
    <section className="panel">
      <div className="panel-inner stack">
        <div>
          <h2>Function Brief</h2>
          <p className="muted">
            Fill in the function contract first. Gemini stays behind the scenes
            and returns a structured test table instead of chat output.
          </p>
        </div>

        {fieldConfig.map((field) => (
          <div className="field" key={field.key}>
            <label htmlFor={field.key}>{field.label}</label>
            {field.multiline ? (
              <textarea
                id={field.key}
                className="textarea"
                value={formInputs[field.key]}
                onChange={handleFieldChange(field.key)}
                placeholder={field.placeholder}
              />
            ) : (
              <input
                id={field.key}
                className="input"
                value={formInputs[field.key]}
                onChange={handleFieldChange(field.key)}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}

        <div className="actions">
          <button
            type="button"
            className="button"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Generating..." : "Generate Test Cases"}
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={onReset}
            disabled={isSubmitting}
          >
            Clear Form
          </button>
        </div>
      </div>
    </section>
  );
}
