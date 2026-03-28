import { NextResponse } from "next/server";
import { createWorkbookBuffer } from "@/lib/excelExporter";
import { getSessionById } from "@/lib/sessionRepository";
import type { TestCase } from "@/types";

function toFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const payload = searchParams.get("payload");

    let functionName = "generated-test-cases";
    let testCases: TestCase[] = [];

    if (sessionId) {
      const session = await getSessionById(sessionId);
      functionName = session.functionName;
      testCases = session.testCases;
    } else if (payload) {
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
