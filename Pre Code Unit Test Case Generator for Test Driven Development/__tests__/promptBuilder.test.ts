import { buildPrompt } from "@/lib/promptBuilder";
import type { FormInputs } from "@/types";

const baseInputs: FormInputs = {
  functionName: "calculateDiscount",
  programmingLanguage: "TypeScript",
  description: "Calculates discount on a price",
  parameters: "price: number, discountPercent: number",
  expectedBehavior: "Returns the discounted price",
  boundaryConditions: "discount 0–100, price > 0",
  returnType: "number",
  notes: "Throws if discount is negative",
};

describe("buildPrompt", () => {
  it("includes the function name in the prompt", () => {
    const prompt = buildPrompt(baseInputs);
    expect(prompt).toContain("calculateDiscount");
  });

  it("includes the programming language", () => {
    const prompt = buildPrompt(baseInputs);
    expect(prompt).toContain("TypeScript");
  });

  it("includes the parameters", () => {
    const prompt = buildPrompt(baseInputs);
    expect(prompt).toContain("price: number, discountPercent: number");
  });

  it("includes expected behavior", () => {
    const prompt = buildPrompt(baseInputs);
    expect(prompt).toContain("Returns the discounted price");
  });

  it("includes boundary conditions", () => {
    const prompt = buildPrompt(baseInputs);
    expect(prompt).toContain("discount 0–100, price > 0");
  });

  it("instructs Gemini to return JSON only", () => {
    const prompt = buildPrompt(baseInputs);
    expect(prompt).toContain("Return only valid JSON");
  });

  it("requires at least 6 test cases", () => {
    const prompt = buildPrompt(baseInputs);
    expect(prompt).toContain("at least 6");
  });

  it("requires all 4 TDD categories", () => {
    const prompt = buildPrompt(baseInputs);
    expect(prompt).toContain("happy-path");
    expect(prompt).toContain("boundary");
    expect(prompt).toContain("negative");
    expect(prompt).toContain("edge");
  });

  it("falls back to expectedBehavior when description is empty", () => {
    const inputs = { ...baseInputs, description: "" };
    const prompt = buildPrompt(inputs);
    expect(prompt).toContain("Returns the discounted price");
  });
});
