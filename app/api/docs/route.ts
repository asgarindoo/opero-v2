import { NextResponse } from "next/server";
import spec from "./openapi.json";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(spec);
}
