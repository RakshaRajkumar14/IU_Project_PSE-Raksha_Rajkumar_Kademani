import { NextResponse } from "next/server";
import { buildPrompt } from "@/lib/promptBuilder";
import {
  createFallbackCases,
  generateCasesWithGemini,
} from "@/lib/gemini";
import { saveSession } from "@/lib/sessionRepository";
import type { FormInputs } from "@/types";

function validateFormInputs(formInputs: FormInputs) {
  if (
    !formInputs.functionName ||
    !formInputs.description ||
    !formInputs.parameters ||
    !formInputs.expectedBehavior
  ) {
    throw new Error("Function name, description, parameters, and expected behavior are required.");
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      formInputs: FormInputs;
      useFallback?: boolean;
    };

    validateFormInputs(body.formInputs);

    const prompt = buildPrompt(body.formInputs);
    const testCases = body.useFallback
      ? createFallbackCases(body.formInputs)
      : await generateCasesWithGemini(prompt);

    const session = await saveSession({
      functionName: body.formInputs.functionName,
      formInputs: body.formInputs,
      testCases,
    });

    return NextResponse.json({ session });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate test cases.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
