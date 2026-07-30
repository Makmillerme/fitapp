import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    resource: "fitapp",
    authorization_servers: ["/.well-known/oauth-authorization-server"],
  });
}
