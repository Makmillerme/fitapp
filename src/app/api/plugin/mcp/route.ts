import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, service: "fitapp" });
}

export async function POST() {
  return NextResponse.json({ ok: true, service: "fitapp" });
}
