// ============================================================================
// client.ts - the ONE place in the whole frontend where fetch() is called.
// ============================================================================
//
// WHY THIS FILE EXISTS
// Your Express backend exposes endpoints. The browser has to call them with
// fetch(). Doing that by hand in every component would mean copy-pasting the
// same boilerplate everywhere. Instead, every request goes through the single
// function `api()` below.
//
// IT DOES 3 JOBS
//   1. Sends the auth cookies with every request.
//   2. Turns failed responses (400, 401, 500...) into real errors that you can
//      catch with try/catch. (Plain fetch() does NOT do this on its own.)
//   3. Silently refreshes the session when the access token has expired, then
//      repeats the request that failed, so the user never notices.
// ============================================================================


// ----------------------------------------------------------------------------
// ApiError - a custom error type for "the backend answered, but with a failure"
// ----------------------------------------------------------------------------
// A normal `Error` only carries a message. We extend it to also carry the HTTP
// status code (400, 401, 409...), so a component can react differently:
//
//   catch (err) {
//     if (err instanceof ApiError && err.status === 409) { ...email taken... }
//   }
export class ApiError extends Error {
    // The HTTP status code the backend replied with.
    status: number;

    constructor(message: string, status: number) {
        // super(message) runs the built-in Error constructor,
        // which stores the message for us (err.message).
        super(message);
        // Then we store our extra piece of information.
        this.status = status;
    }
}


// ----------------------------------------------------------------------------
// The shared refresh
// ----------------------------------------------------------------------------
// Imagine a page fires 5 requests at once and the access token has expired.
// All 5 get a 401. Without protection, all 5 would call /refresh at the same
// time, which is wasteful and can even break things (e.g. if your backend
// rotates refresh tokens, only the first call would succeed).
//
// So we keep the refresh that is CURRENTLY running in this variable.
//   - null                  -> no refresh is running right now
//   - Promise<boolean>      -> a refresh is in progress, everyone can wait on it
//                              (resolves to true = success, false = failed)
let refreshing: Promise<boolean> | null = null;

function refreshSession() {
    // `??=` means: "only assign if the variable is currently null/undefined".
    //   - First caller: refreshing is null, so a new fetch is started and stored.
    //   - Other callers at the same moment: refreshing already holds a promise,
    //     so nothing new is started. They all get back the SAME promise.
    refreshing ??= fetch("/api/auth/refresh", {
        method: "POST", // change to "GET" if your refresh route is a GET
        credentials: "include", // send the refresh-token cookie to Express
    })
        // res.ok is true for any 2xx status. true = Express replied with
        // success and set fresh cookies in the browser.
        .then((res) => res.ok)
        // If the network itself failed (server down, offline), treat it as
        // "refresh failed" instead of letting an error crash everything.
        .catch(() => false)
        // Runs no matter what happened. We reset to null so the NEXT time a
        // token expires, a brand new refresh can be started.
        .finally(() => {
            refreshing = null;
        });

    return refreshing;
}


// ----------------------------------------------------------------------------
// api() - the function every request in your app goes through
// ----------------------------------------------------------------------------
// <T> is a TypeScript "generic". It lets the caller say what shape of data it
// expects back, e.g. api<User>("/api/auth/me"), and TypeScript then knows the
// result is a User. It has no effect at runtime, it only helps the editor.
//
// Parameters:
//   path     - the URL to call, e.g. "/api/auth/sign-in"
//   options  - normal fetch options (method, body...). Defaults to {}.
//   canRetry - internal flag. true on the first attempt, false on the replay,
//              so we never retry more than once (prevents an infinite loop).
export async function api<T>(
    path: string,
    options: RequestInit = {},
    canRetry = true
): Promise<T> {
    // STEP 1: send the request.
    const res = await fetch(path, {
        // Copy in everything the caller passed (method, body, ...).
        ...options,

        // Tells the browser to send AND save cookies on this request.
        // Without it, fetch ignores cookies and you would look logged out.
        credentials: "include",

        headers: {
            // We always talk JSON to the backend.
            "Content-Type": "application/json",
            // Spread the caller's headers AFTER ours, so if they pass their own
            // headers, they can add to or override the defaults.
            ...options.headers,
        },
    });

    // STEP 2: handle an expired session.
    // 401 means "not logged in" OR "access token expired". We try to refresh
    // once, then repeat the original request.
    //
    // Sign-in and sign-up are skipped: a 401 there just means "wrong
    // credentials", so refreshing would be pointless.
    const isAuthForm = path.includes("/sign-in") || path.includes("/sign-up");

    if (res.status === 401 && canRetry && !isAuthForm) {
        // Wait for the (shared) refresh to finish.
        if (await refreshSession()) {
            // Refresh worked: cookies are fresh. Run the exact same request
            // again. We pass canRetry=false so that if it STILL returns 401,
            // we don't refresh again and loop forever.
            return api<T>(path, options, false);
        }
        // Refresh failed: we fall through to the error handling below, which
        // throws an ApiError with status 401 (user really is logged out).
    }

    // STEP 3: read the response body as JSON.
    // .catch(() => null) is needed because some responses have no body
    // (e.g. a 204 No Content) and res.json() would throw on those.
    const data = await res.json().catch(() => null);

    // STEP 4: turn failures into errors.
    // fetch() does NOT throw on 400/401/500, it only throws if the network
    // dies. So we check res.ok ourselves and throw.
    if (!res.ok) {
        // Use the message Express sent, e.g. { message: "Invalid credentials" }.
        // `?.` safely handles data being null; `??` is the fallback message.
        throw new ApiError(data?.message ?? "Something went wrong", res.status);
    }

    // STEP 5: success. Hand the parsed data back to whoever called api().
    // `as T` just tells TypeScript to trust us that it has the expected shape.
    return data as T;
}