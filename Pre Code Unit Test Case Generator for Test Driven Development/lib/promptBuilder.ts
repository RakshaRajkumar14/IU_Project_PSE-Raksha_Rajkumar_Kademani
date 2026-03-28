import type { FormInputs } from "@/types";

export function buildPrompt(formInputs: FormInputs) {
  return `
You are generating unit test cases for a software engineering planning workflow.
Return only valid JSON.
Do not return markdown.
Do not wrap the JSON in code fences.
Do not include explanations.

Create at least 6 test cases for the function described below.
The set must cover happy-path, boundary, negative, and edge categories.
Use concise but specific engineering language.

Output schema:
[
  {
    "category": "happy-path | boundary | negative | edge",
    "title": "short test name",
    "input": "input data values",
    "preconditions": "required setup or N/A",
    "steps": "short execution steps",
    "expectedResult": "precise expected result",
    "priority": "High | Medium | Low"
  }
]

Function name: ${formInputs.functionName}
Description: ${formInputs.description}
Parameters: ${formInputs.parameters}
Expected behavior: ${formInputs.expectedBehavior}
Boundary conditions: ${formInputs.boundaryConditions}
Return type: ${formInputs.returnType}
Additional notes: ${formInputs.notes || "N/A"}
`.trim();
}
