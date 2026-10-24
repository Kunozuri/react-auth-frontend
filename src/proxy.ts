// ============================================================================
// proxy.ts - a checkpoint that requests pass through BEFORE a page is served.
// ============================================================================
//
// WHERE IT LIVES
// Save this as: src/proxy.ts - at the same level as your `app` folder.
// Next.js looks for this exact file name automatically. You never import it
// anywhere, Next.js finds it and runs it by itself.
//
// WHAT IT IS
// It runs on your NEXT.JS SERVER (not in the browser, and not in Express).
// Every matching request reaches this function first, and the function
// decides what happens to it:
//   - let it continue to the page          -> NextResponse.next()
//   - send the person somewhere else       -> NextResponse.redirect(...)
//
// NAMING NOTE
// In older tutorials this file is called `middleware.ts` and the function is
// called `middleware`. Next.js 16 renamed it to `proxy` (same feature, new
// name, because "middleware" was easily confused with Express middleware).
// The function MUST be named `proxy`, and there can only be one per project.
//
// IT DOES NOT FORWARD REQUESTS TO EXPRESS
// Despite the name, that is not this file's job. Sending /api/... requests to
// Express on port 5500 is done by next.config.ts.
//
// PROXY vs EXPRESS MIDDLEWARE
//   proxy.ts           -> guards which PAGES a person can open (convenience)
//   Express middleware -> guards which API DATA a person can get (real security)
// You need both: anyone can call your API directly without using your pages.
// ============================================================================

// NextResponse is the tool we use to build the answer (continue / redirect).
// `type NextRequest` is imported only for TypeScript. It describes the
// incoming request (its URL, cookies, headers...) and is erased at runtime.
import { NextResponse, type NextRequest } from "next/server";


// ----------------------------------------------------------------------------
// The current version: does nothing
// ----------------------------------------------------------------------------
// `request` holds everything about the incoming request, but right now we
// never look at it. `NextResponse.next()` means "no changes, carry on to the
// page as normal". So this file is only a placeholder for now.
export function proxy(request: NextRequest) {
    return NextResponse.next();
}


// ============================================================================
// EXAMPLE FOR LATER (commented out): protect pages using the session cookie
// ============================================================================
// To try it: delete the placeholder function above, then remove the leading
// `// ` from the lines below. Change the cookie names to the ones your
// Express backend REALLY sets (look in your sign-in controller).
//
// export function proxy(request: NextRequest) {
//     // Does the browser have a session cookie at all?
//     // We check the refresh cookie too. If we only checked the access cookie,
//     // a person whose access token just expired would be bounced to sign-in
//     // before client.ts gets a chance to refresh the session silently.
//     const hasSession =
//         request.cookies.has("accessToken") || request.cookies.has("refreshToken");
//
//     // The path the person is trying to open, e.g. "/dashboard".
//     const { pathname } = request.nextUrl;
//
//     // CASE 1: not logged in, but trying to open a private page.
//     // -> send them to the sign-in page.
//     if (!hasSession && pathname.startsWith("/dashboard")) {
//         return NextResponse.redirect(new URL("/sign-in", request.url));
//     }
//
//     // CASE 2: already logged in, but opening the sign-in page.
//     // -> skip it and go straight to the dashboard.
//     if (hasSession && pathname.startsWith("/sign-in")) {
//         return NextResponse.redirect(new URL("/dashboard", request.url));
//     }
//
//     // CASE 3: everything else is fine -> carry on as normal.
//     return NextResponse.next();
// }
//
// // `matcher` limits WHICH paths run through proxy(). Without it, the function
// // would run for every request (images, scripts, /api calls...), which is
// // wasteful. Here it only runs for the dashboard pages and the sign-in page.
// export const config = {
//     matcher: ["/dashboard/:path*", "/sign-in"],
// };
//
// REMEMBER: this only checks that a cookie EXISTS, not that it is valid.
// Express still does the real verification on every API call.