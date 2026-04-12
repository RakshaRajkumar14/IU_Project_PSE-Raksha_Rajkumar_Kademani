import { parseGeminiCases, createFallbackCases } from "@/lib/gemini";
import type { FormInputs } from "@/types";

const validCases = Array.from({ length: 6 }, (_, i) => ({
  category: ["happy-path", "boundary", "negative", "edge", "boundary", "happy-path"][i],
  title: `Test case ${i + 1}`,
  input: "some input",
  preconditions: "none",
  steps: "call the function",
  expectedResult: "expected output",
  priority: "High",
}));

const baseInputs: FormInputs = {
  functionName: "multiply",
  programmingLanguage: "Python",
  description: "Multiplies two numbers",
  parameters: "a: int, b: int",
  expectedBehavior: "Returns a * b",
  boundaryConditions: "a and b >= 0",
  returnType: "int",
  notes: "",
};

describe("parseGeminiCases", () => {
  it("parses a valid JSON array of 6 cases", () => {
    const result = parseGeminiCases(JSON.stringify(validCases));
    expect(result).toHaveLength(6);
  });

  it("assigns a UUID id to every case", () => {
    const result = parseGeminiCases(JSON.stringify(validCases));
    result.forEach((tc) => {
      expect(tc.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });
  });

  it("throws when JSON is invalid", () => {
    expect(() => parseGeminiCases("not json")).toThrow();
  });

  it("throws when fewer than 6 cases are returned", () => {
    const few = validCases.slice(0, 3);
    expect(() => parseGeminiCases(JSON.stringify(few))).toThrow();
  });

  it("defaults invalid priority to Medium", () => {
    const cases = validCases.map((c) => ({ ...c, priority: "UNKNOWN" }));
    const result = parseGeminiCases(JSON.stringify(cases));
    result.forEach((tc) => expect(tc.priority).toBe("Medium"));
  });

  it("defaults invalid category using fallback list", () => {
    const cases = validCases.map((c) => ({ ...c, category: "invalid" }));
    const result = parseGeminiCases(JSON.stringify(cases));
    const valid = ["happy-path", "boundary", "negative", "edge"];
    result.forEach((tc) => expect(valid).toContain(tc.category));
  });

  it("strips code fences from response", () => {
    const wrapped = "```json\n" + JSON.stringify(validCases) + "\n```";
    const result = parseGeminiCases(wrapped);
    expect(result).toHaveLength(6);
  });
});

describe("createFallbackCases", () => {
  it("returns exactly 6 test cases", () => {
    const result = createFallbackCases(baseInputs);
    expect(result).toHaveLength(6);
  });

  it("covers all 4 required categories", () => {
    const result = createFallbackCases(baseInputs);
    const categories = result.map((tc) => tc.category);
    expect(categories).toContain("happy-path");
    expect(categories).toContain("boundary");
    expect(categories).toContain("negative");
    expect(categories).toContain("edge");
  });

  it("includes the function name in titles", () => {
    const result = createFallbackCases(baseInputs);
    result.forEach((tc) => expect(tc.title).toContain("multiply"));
  });

  it("assigns a UUID id to every case", () => {
    const result = createFallbackCases(baseInputs);
    result.forEach((tc) => {
      expect(tc.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });
  });

  it("uses Unnamed function when functionName is empty", () => {
    const result = createFallbackCases({ ...baseInputs, functionName: "" });
    expect(result[0].title).toContain("Unnamed function");
  });
});
