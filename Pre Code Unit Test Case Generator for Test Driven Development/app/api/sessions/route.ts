import { NextResponse } from "next/server";
import { saveSession, searchSessions } from "@/lib/sessionRepository";
import type { FormInputs, TestCase } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "newest";

    const sessions = await searchSessions({ query, category, sort });

    return NextResponse.json({ sessions });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load sessions.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      functionName: string;
      formInputs: FormInputs;
      testCases: TestCase[];
    };

    const session = await saveSession(body);

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save session.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
