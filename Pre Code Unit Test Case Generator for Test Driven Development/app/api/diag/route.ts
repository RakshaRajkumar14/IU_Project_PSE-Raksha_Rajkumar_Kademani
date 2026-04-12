import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) return NextResponse.json({ error: "No API key found in .env.local" }, { status: 400 });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();
    
    return NextResponse.json({
      status: response.status,
      availableModels: data.models?.map((m: any) => m.name.replace("models/", "")) || [],
      raw: data
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
