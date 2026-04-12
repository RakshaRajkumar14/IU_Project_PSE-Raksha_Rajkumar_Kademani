import type { FormInputs } from "@/types";

export function buildPrompt(formInputs: FormInputs) {
  const fnName = formInputs.functionName.trim();
  const lang = formInputs.programmingLanguage || "Not specified";
  const desc = formInputs.description?.trim() || formInputs.expectedBehavior?.trim() || "";
  const params = formInputs.parameters?.trim() || "Not specified";
  const behavior = formInputs.expectedBehavior?.trim() || "";
  const boundary = formInputs.boundaryConditions?.trim() || "";
  const returnType = formInputs.returnType?.trim() || "";
  const notes = formInputs.notes?.trim() || "";

  return `
You are an expert software QA engineer writing pre-code unit test cases for Test-Driven Development (TDD).

## Task
Generate comprehensive unit test cases for the function described below.
Every field must be SPECIFIC to this exact function — never use generic placeholder text.

## Rules
- Return ONLY a valid JSON array. No markdown. No code fences. No explanations.
- Generate BETWEEN 10 and 14 test cases (not fewer, not more).
- Distribute cases across all four categories:
    • "happy-path" — at least 3 (normal, correct inputs that return the expected result)
    • "boundary" — at least 2 (inputs at or just beyond defined limits)
    • "negative" — at least 2 (invalid inputs, wrong types, missing fields)
    • "edge" — at least 2 (unusual-but-valid inputs: empty collections, large data, special chars, etc.)
- Each "title" must be a SHORT, specific test name that names the exact condition being tested.
  ✗ BAD:  "Function handles invalid input"
  ✓ GOOD: "${fnName} raises ValueError when price is negative"
  ✓ GOOD: "${fnName} returns 0.0 when quantity is 0"
- "input" must list ACTUAL values (not descriptions). Use ${lang} literal syntax where possible.
  ✗ BAD:  "Valid representative values"
  ✓ GOOD: "price=9.99, quantity=3, discount=0.1"
- "preconditions" must state the REAL setup needed (imports, mocks, DB state, env vars, etc.) or "None".
- "steps" must be a numbered list of CONCRETE actions performed in the test.
- "expectedResult" must state the EXACT return value, exception type, or observable effect.
- "priority" must be "High", "Medium", or "Low" — assign thoughtfully based on risk.

## Output schema (repeat for every test case)
[
  {
    "category": "happy-path | boundary | negative | edge",
    "title": "<short specific test name>",
    "input": "<actual values or constructor call>",
    "preconditions": "<setup or None>",
    "steps": "1. <action>\\n2. <action>\\n3. <assertion>",
    "expectedResult": "<exact value / exception / side-effect>",
    "priority": "High | Medium | Low"
  }
]

## Function specification
- **Function name:** ${fnName}
- **Language:** ${lang}
- **Description:** ${desc}
- **Parameters:** ${params}
- **Expected behaviour:** ${behavior}
- **Boundary conditions:** ${boundary || "Not specified"}
- **Return type:** ${returnType || "Not specified"}
- **Additional notes:** ${notes || "None"}
`.trim();
}
