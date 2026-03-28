import { randomUUID } from "crypto";
import type { FormInputs, TestCase, TestCategory } from "@/types";

const categoryFallback: TestCategory[] = [
  "happy-path",
  "boundary",
  "negative",
  "edge",
  "boundary",
  "happy-path",
];

function cleanJsonPayload(rawText: string) {
  const trimmed = rawText.trim();
  const codeFenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  return codeFenceMatch ? codeFenceMatch[1].trim() : trimmed;
}

function normalizePriority(value: unknown): TestCase["priority"] {
  if (value === "High" || value === "Medium" || value === "Low") {
    return value;
  }

  return "Medium";
}

function normalizeCategory(value: unknown, index: number): TestCategory {
  if (
    value === "happy-path" ||
    value === "boundary" ||
    value === "negative" ||
    value === "edge"
  ) {
    return value;
  }

  return categoryFallback[index % categoryFallback.length];
}

export function parseGeminiCases(rawText: string): TestCase[] {
  const parsed = JSON.parse(cleanJsonPayload(rawText)) as Array<
    Partial<TestCase>
  >;

  if (!Array.isArray(parsed) || parsed.length < 6) {
    throw new Error("Gemini returned an invalid test case set.");
  }

  return parsed.map((item, index) => ({
    id: randomUUID(),
    category: normalizeCategory(item.category, index),
    title: item.title?.trim() || `Generated test case ${index + 1}`,
    input: item.input?.trim() || "N/A",
    preconditions: item.preconditions?.trim() || "N/A",
    steps: item.steps?.trim() || "Execute function with the provided input.",
    expectedResult: item.expectedResult?.trim() || "Expected result not specified.",
    priority: normalizePriority(item.priority),
  }));
}

export async function generateCasesWithGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  const model =
    process.env.GEMINI_MODEL || "gemini-1.5-flash";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          responseMimeType: "application/json",
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${errorText}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return parseGeminiCases(text);
}

export function createFallbackCases(formInputs: FormInputs): TestCase[] {
  const functionLabel = formInputs.functionName || "Unnamed function";

  return [
    {
      id: randomUUID(),
      category: "happy-path",
      title: `${functionLabel} returns expected result for valid input`,
      input: formInputs.parameters || "Valid representative values",
      preconditions: "Function contract is defined.",
      steps: "Invoke the function with a standard valid input set.",
      expectedResult: formInputs.expectedBehavior || "Function completes successfully.",
      priority: "High",
    },
    {
      id: randomUUID(),
      category: "boundary",
      title: `${functionLabel} handles lower boundary input`,
      input: formInputs.boundaryConditions || "Minimum allowed value",
      preconditions: "Lower limit is known.",
      steps: "Run the function using the smallest supported input.",
      expectedResult: "The function handles the minimum boundary without error.",
      priority: "High",
    },
    {
      id: randomUUID(),
      category: "boundary",
      title: `${functionLabel} handles upper boundary input`,
      input: formInputs.boundaryConditions || "Maximum allowed value",
      preconditions: "Upper limit is known.",
      steps: "Run the function using the largest supported input.",
      expectedResult: "The function handles the maximum boundary without error.",
      priority: "High",
    },
    {
      id: randomUUID(),
      category: "negative",
      title: `${functionLabel} rejects invalid parameter format`,
      input: "Malformed or unsupported parameter values",
      preconditions: "Input validation rules exist.",
      steps: "Invoke the function with an invalid parameter combination.",
      expectedResult: "The function reports an error or rejects the request safely.",
      priority: "Medium",
    },
    {
      id: randomUUID(),
      category: "edge",
      title: `${functionLabel} handles empty or null-like values`,
      input: "Empty strings, null, undefined, or equivalent sentinel values",
      preconditions: "Language/runtime supports nullable input scenarios.",
      steps: "Execute the function with empty or missing values where applicable.",
      expectedResult: "The function follows the defined null/empty input behavior.",
      priority: "Medium",
    },
    {
      id: randomUUID(),
      category: "happy-path",
      title: `${functionLabel} preserves return type contract`,
      input: "Valid input set that exercises normal output generation",
      preconditions: "Expected return type is documented.",
      steps: "Call the function and inspect the returned value.",
      expectedResult: `The result matches the declared return type: ${formInputs.returnType || "documented output"}.`,
      priority: "Low",
    },
  ];
}
