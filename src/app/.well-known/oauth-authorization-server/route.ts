import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    issuer: "fitapp-local",
    authorization_endpoint: "/connect",
    token_endpoint: "/api/plugin/mcp",
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
  });
}
