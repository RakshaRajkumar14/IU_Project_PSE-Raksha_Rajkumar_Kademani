import { NextResponse } from "next/server";
import { buildPrompt } from "@/lib/promptBuilder";
import { createFallbackCases, generateCasesWithGemini } from "@/lib/gemini";
import { saveSession } from "@/lib/sessionRepository";
import { validateEnv } from "@/lib/env";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createClient } from "@/lib/supabase/server";
import type { FormInputs } from "@/types";

const MAX_FIELD_LENGTH = 2000;

function validateFormInputs(formInputs: FormInputs) {
  if (
    !formInputs.functionName?.trim() ||
    !formInputs.description?.trim() ||
    !formInputs.parameters?.trim() ||
    !formInputs.expectedBehavior?.trim()
  ) {
    throw new Error(
      "Function name, description, parameters, and expected behavior are required."
    );
  }

  const fields: (keyof FormInputs)[] = [
    "functionName",
    "description",
    "parameters",
    "expectedBehavior",
    "boundaryConditions",
    "returnType",
    "notes",
  ];
  for (const field of fields) {
    if ((formInputs[field] || "").length > MAX_FIELD_LENGTH) {
      throw new Error(
        `Field "${field}" exceeds the maximum length of ${MAX_FIELD_LENGTH} characters.`
      );
    }
  }
}

export async function POST(request: Request) {
  try {
    validateEnv();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const ip = getClientIp(request);
    if (!checkRateLimit(`generate:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before generating again." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as {
      formInputs: FormInputs;
      useFallback?: boolean;
    };

    validateFormInputs(body.formInputs);

    const prompt = buildPrompt(body.formInputs);
    let testCases;
    if (body.useFallback) {
      testCases = createFallbackCases(body.formInputs);
    } else {
      try {
        testCases = await generateCasesWithGemini(prompt);
      } catch (geminiError) {
        const msg = geminiError instanceof Error ? geminiError.message : "";
        if (msg.includes("429") || msg.includes("503") || msg.includes("retries")) {
          testCases = createFallbackCases(body.formInputs);
        } else {
          throw geminiError;
        }
      }
    }

    const session = await saveSession({
      userId: user.id,
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
