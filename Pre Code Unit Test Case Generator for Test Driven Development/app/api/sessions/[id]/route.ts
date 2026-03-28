import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/sessionRepository";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await deleteSession(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete session.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
