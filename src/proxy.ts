import { NextResponse, type NextRequest } from "next/server";

// Runs before every request reaches a page. Right now it does nothing
// and just lets the request continue.
export function proxy(request: NextRequest) {
    return NextResponse.next();
}