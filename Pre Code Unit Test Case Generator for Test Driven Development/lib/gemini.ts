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
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanJsonPayload(rawText));
  } catch {
    throw new Error("Gemini returned a response that could not be parsed as JSON.");
  }

  if (!Array.isArray(parsed) || parsed.length < 8) {
    throw new Error("Gemini returned an invalid test case set.");
  }

  return (parsed as Array<Partial<TestCase>>).map((item, index) => ({
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

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error = new Error("Gemini request failed after retries.");

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 500)
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      // Retry on transient server errors
      if (response.status === 429 || response.status === 503) {
        lastError = new Error(`Gemini API returned ${response.status}, retrying.`);
        continue;
      }

      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError;
}

export async function generateCasesWithGemini(prompt: string): Promise<TestCase[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  const response = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${errorText}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
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
  const fn = formInputs.functionName || "theFunction";
  const lang = formInputs.programmingLanguage || "the language";
  const params = formInputs.parameters || "standard input values";
  const behavior = formInputs.expectedBehavior || "complete without error";
  const boundary = formInputs.boundaryConditions || "documented limits";
  const returnType = formInputs.returnType || "the expected output";

  // Split parameters into individual param hints for realistic input examples
  const paramList = params
    .split(/[,;\n]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const sampleInput = paramList.length
    ? paramList.map((p) => {
        const name = p.split(/[:=\s]/)[0].trim();
        return `${name}=<valid_value>`;
      }).join(", ")
    : params;

  return [
    // ── happy-path ──────────────────────────────────────────
    {
      id: randomUUID(),
      category: "happy-path",
      title: `${fn} returns ${returnType} for typical valid input`,
      input: sampleInput,
      preconditions: `${lang} runtime is available. All dependencies are initialized.`,
      steps: `1. Prepare valid input: ${sampleInput}\n2. Call ${fn}(${paramList.map((p) => p.split(/[:=\s]/)[0]).join(", ")})\n3. Assert the returned value matches ${returnType}.`,
      expectedResult: `Function returns ${returnType}. Behaviour: ${behavior}`,
      priority: "High",
    },
    {
      id: randomUUID(),
      category: "happy-path",
      title: `${fn} processes all parameters without throwing`,
      input: sampleInput,
      preconditions: "No mocks required. Standard environment.",
      steps: `1. Supply all expected parameters: ${params}\n2. Invoke ${fn}\n3. Confirm no exception is raised and output is non-null.`,
      expectedResult: "Returns a valid result; no exception thrown.",
      priority: "High",
    },
    {
      id: randomUUID(),
      category: "happy-path",
      title: `${fn} produces deterministic output for the same input`,
      input: sampleInput,
      preconditions: "Function is pure (no hidden state).",
      steps: `1. Call ${fn} with input A.\n2. Record result R1.\n3. Call ${fn} with the same input A again.\n4. Assert result R2 === R1.`,
      expectedResult: "Same input always yields identical output.",
      priority: "Medium",
    },
    // ── boundary ─────────────────────────────────────────────
    {
      id: randomUUID(),
      category: "boundary",
      title: `${fn} handles minimum-allowed values per boundary conditions`,
      input: `Minimum values derived from: ${boundary}`,
      preconditions: `Boundary limits are: ${boundary || "documented in spec"}.`,
      steps: `1. Set input to the minimum valid value for each parameter.\n2. Call ${fn}.\n3. Assert the result satisfies ${behavior}.`,
      expectedResult: `Function completes successfully at the lower boundary.`,
      priority: "High",
    },
    {
      id: randomUUID(),
      category: "boundary",
      title: `${fn} handles maximum-allowed values per boundary conditions`,
      input: `Maximum values derived from: ${boundary}`,
      preconditions: `Boundary limits are: ${boundary || "documented in spec"}.`,
      steps: `1. Set input to the maximum valid value for each parameter.\n2. Call ${fn}.\n3. Assert the result satisfies ${behavior}.`,
      expectedResult: `Function completes successfully at the upper boundary.`,
      priority: "High",
    },
    {
      id: randomUUID(),
      category: "boundary",
      title: `${fn} raises an error or clamps when input exceeds upper boundary`,
      input: `Value just beyond the maximum limit from: ${boundary}`,
      preconditions: "Boundary constraints are enforced by the function.",
      steps: `1. Supply a value one unit above the maximum boundary.\n2. Call ${fn}.\n3. Validate the error or clamping behaviour.`,
      expectedResult: "Function raises an exception, returns an error code, or clamps to the maximum limit.",
      priority: "Medium",
    },
    // ── negative ─────────────────────────────────────────────
    {
      id: randomUUID(),
      category: "negative",
      title: `${fn} raises an error when required parameter is null or undefined`,
      input: `${paramList[0] ?? "param"}=null (all others valid)`,
      preconditions: "All other parameters remain valid.",
      steps: `1. Set the first required parameter to null.\n2. Call ${fn}.\n3. Assert a TypeError or equivalent validation error is raised.`,
      expectedResult: "Function raises TypeError, ValueError, or domain-specific validation error.",
      priority: "High",
    },
    {
      id: randomUUID(),
      category: "negative",
      title: `${fn} rejects wrong data types for ${paramList[0] ?? "a parameter"}`,
      input: `${paramList[0] ?? "param"}=<wrong_type> (e.g., string instead of int)`,
      preconditions: "Input validation is expected at the function boundary.",
      steps: `1. Pass a value of the wrong type for ${paramList[0] ?? "a parameter"}.\n2. Call ${fn}.\n3. Assert the appropriate error is raised.`,
      expectedResult: "TypeError or validation error is raised; function does not silently produce incorrect output.",
      priority: "High",
    },
    {
      id: randomUUID(),
      category: "negative",
      title: `${fn} rejects an empty string where a non-empty value is required`,
      input: `${paramList.find((p) => p.toLowerCase().includes("str") || p.toLowerCase().includes("name")) ?? paramList[0] ?? "param"}=""`,
      preconditions: "Function expects non-empty string input.",
      steps: `1. Pass an empty string ("") for the relevant parameter.\n2. Call ${fn}.\n3. Assert a ValueError or appropriate error is raised.`,
      expectedResult: "Function raises an error indicating an empty value is not allowed.",
      priority: "Medium",
    },
    // ── edge ─────────────────────────────────────────────────
    {
      id: randomUUID(),
      category: "edge",
      title: `${fn} handles extremely large valid input without overflow`,
      input: `${paramList.map((p) => `${p.split(/[:=\s]/)[0]}=<max_safe_value>`).join(", ")}`,
      preconditions: "No artificial ceiling imposed by the test harness.",
      steps: `1. Supply the largest practically valid input.\n2. Call ${fn}.\n3. Assert no overflow, crash, or silent truncation occurs.`,
      expectedResult: `Function returns ${returnType} within acceptable precision or raises OverflowError if overflows are expected.`,
      priority: "Medium",
    },
  ];
}
