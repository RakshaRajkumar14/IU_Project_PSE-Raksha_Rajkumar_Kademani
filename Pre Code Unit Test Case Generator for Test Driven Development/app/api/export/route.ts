import { NextResponse } from "next/server";
import { createWorkbookBuffer } from "@/lib/excelExporter";
import { getSessionById } from "@/lib/sessionRepository";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createClient } from "@/lib/supabase/server";
import type { TestCase } from "@/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PAYLOAD_BYTES = 100_000;

function toFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const ip = getClientIp(request);
    if (!checkRateLimit(`export:${ip}`, 30, 60_000)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const payload = searchParams.get("payload");

    let functionName = "generated-test-cases";
    let testCases: TestCase[] = [];

    if (sessionId) {
      if (!UUID_RE.test(sessionId)) {
        return NextResponse.json(
          { error: "Invalid session ID format." },
          { status: 400 }
        );
      }
      const session = await getSessionById(sessionId, user.id);
      functionName = session.functionName;
      testCases = session.testCases;
    } else if (payload) {
      if (payload.length > MAX_PAYLOAD_BYTES) {
        return NextResponse.json({ error: "Payload too large." }, { status: 400 });
      }
      const parsed = JSON.parse(payload) as {
        functionName: string;
        testCases: TestCase[];
      };
      functionName = parsed.functionName;
      testCases = parsed.testCases;
    } else {
      throw new Error("Provide either sessionId or payload.");
    }

    const buffer = await createWorkbookBuffer(functionName, testCases);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${toFilename(functionName) || "test-cases"}.xlsx"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to export workbook.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
