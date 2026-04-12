"use client";

import type { ChangeEvent } from "react";
import type { FormInputs } from "@/types";

const LANGUAGES = [
  "Python", "JavaScript", "TypeScript", "Java", "C#", "C++", "Go",
  "Rust", "Ruby", "Swift", "Kotlin", "PHP", "Scala", "R", "Other",
];

interface InputFormProps {
  formInputs: FormInputs;
  isSubmitting: boolean;
  onChange: (field: keyof FormInputs, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function InputForm({ formInputs, isSubmitting, onChange, onSubmit, onReset }: InputFormProps) {
  const handle = (key: keyof FormInputs) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(key, e.target.value);

  return (
    <div className="gen-card">
      {/* Step header */}
      <div className="gen-card-header">
        <span className="gen-step-badge">1</span>
        <h2 className="gen-card-title">Describe Your Function</h2>
      </div>

      {/* Row 1: Function Name + Language */}
      <div className="gen-row">
        <div className="gen-field">
          <label className="gen-label">
            Function Name <span className="gen-required">*</span>
          </label>
          <input
            className="gen-input"
            value={formInputs.functionName}
            onChange={handle("functionName")}
            placeholder="e.g. calculateTotalPrice"
          />
        </div>
        <div className="gen-field">
          <label className="gen-label">Programming Language</label>
          <div className="gen-select-wrap">
            <select
              className="gen-select"
              value={formInputs.programmingLanguage}
              onChange={handle("programmingLanguage")}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <svg className="gen-select-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Row 2: Parameters + Boundary */}
      <div className="gen-row">
        <div className="gen-field">
          <label className="gen-label">Parameters &amp; Data Types</label>
          <input
            className="gen-input"
            value={formInputs.parameters}
            onChange={handle("parameters")}
            placeholder="e.g. price: float, quantity: int, discount: float"
          />
        </div>
        <div className="gen-field">
          <label className="gen-label">Known Boundary Conditions</label>
          <input
            className="gen-input"
            value={formInputs.boundaryConditions}
            onChange={handle("boundaryConditions")}
            placeholder="e.g. discount must be 0-100%, quantity > 0"
          />
        </div>
      </div>

      {/* Expected Behaviour */}
      <div className="gen-field">
        <label className="gen-label">Expected Behaviour</label>
        <textarea
          className="gen-textarea"
          value={formInputs.expectedBehavior}
          onChange={handle("expectedBehavior")}
          placeholder="Describe what the function should do — its purpose, return value, and any special behaviour..."
          rows={4}
        />
      </div>

      {/* Tip */}
      <div className="gen-tip">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#7c5cff" strokeWidth="1.5"/>
          <path d="M8 7v4M8 5v.5" stroke="#7c5cff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p>
          <strong>Tip:</strong> The more detail you provide, the more comprehensive your test cases will be.
          Include edge cases, error scenarios, and type constraints for best results.
        </p>
      </div>

      {/* Actions */}
      <div className="gen-actions">
        <button
          type="button"
          className="gen-btn-primary"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L8.5 4.5H12.5L9.5 6.5L10.5 10.5L7 8.5L3.5 10.5L4.5 6.5L1.5 4.5H5.5L7 1Z" fill="white"/>
          </svg>
          {isSubmitting ? "Generating..." : "Generate Test Cases"}
        </button>
        {!isSubmitting && (
          <button type="button" className="gen-btn-ghost" onClick={onReset}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
