import { NextResponse } from "next/server";
import { saveSession, searchSessions } from "@/lib/sessionRepository";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createClient } from "@/lib/supabase/server";
import type { FormInputs, TestCase } from "@/types";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const ip = getClientIp(request);
    if (!checkRateLimit(`sessions-get:${ip}`, 60, 60_000)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "newest";

    const sessions = await searchSessions({ userId: user.id, query, category, sort });
    return NextResponse.json({ sessions });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load sessions.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const ip = getClientIp(request);
    if (!checkRateLimit(`sessions-post:${ip}`, 20, 60_000)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body = (await request.json()) as {
      functionName: string;
      formInputs: FormInputs;
      testCases: TestCase[];
    };

    const session = await saveSession({
      userId: user.id,
      functionName: body.functionName,
      formInputs: body.formInputs,
      testCases: body.testCases,
    });
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save session.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
