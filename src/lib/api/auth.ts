// ============================================================================
// auth.ts - one small function for each auth endpoint on your Express backend.
// ============================================================================
//
// THE IDEA
// Components should never write URLs or call fetch() themselves. They call
// these functions instead:
//
//   await signIn({ email, password });
//
// If a route path ever changes on the backend, you fix it here, in ONE place,
// and no component needs to be touched.
//
// HOW IT CONNECTS
//   Component  ->  auth.ts  ->  client.ts  ->  Express backend
//
// Every function below calls `api()` from client.ts, so each one automatically
// gets: cookies sent, errors thrown properly, and silent token refresh.
// ============================================================================

import { api } from "./client";

// `import type` means "only import these for TypeScript checking". They are
// erased when the code runs, so they add nothing to your final bundle.
// - SignInInput / SignUpInput: the shape of the data the forms send.
// - User: the shape of a user object coming back from the backend.
// The "@/" is a path alias that points to your `src` folder.
import type { SignInInput, SignUpInput, User } from "@/types/auth";

// NOTES
// - Paths start with /api so that next.config.ts forwards them to Express
//   running on port 5500. The browser thinks everything comes from the same
//   origin, which avoids CORS problems and keeps cookies simple.
// - /api/auth/refresh is NOT listed here on purpose: client.ts calls it
//   automatically whenever an access token expires.
// - The HTTP methods below are assumed to be POST. Change them if your
//   Express routes use something different.


// ----------------------------------------------------------------------------
// signUp - create a new account
// ----------------------------------------------------------------------------
// - `input` is the data from the sign-up form (typed as SignUpInput).
// - method: "POST" because we are sending data to create something.
// - JSON.stringify(input) turns the JS object into the JSON text that goes in
//   the request body. fetch can't send a raw object.
export const signUp = (input: SignUpInput) =>
    api("/api/auth/sign-up", { method: "POST", body: JSON.stringify(input) });


// ----------------------------------------------------------------------------
// signIn - log in with email/password
// ----------------------------------------------------------------------------
// Same pattern as signUp. If the credentials are right, Express replies with
// Set-Cookie headers and the browser stores the auth cookies automatically
// (thanks to credentials: "include" in client.ts).
// If they are wrong, api() throws an ApiError with the backend's message.
export const signIn = (input: SignInInput) =>
    api("/api/auth/sign-in", { method: "POST", body: JSON.stringify(input) });


// ----------------------------------------------------------------------------
// signOut - log out
// ----------------------------------------------------------------------------
// No body needed. The cookies are sent automatically, so Express knows who is
// logging out, and it replies by clearing those cookies.
export const signOut = () => api("/api/auth/sign-out", { method: "POST" });


// ----------------------------------------------------------------------------
// getMe - ask the backend "who am I?" (the currently logged-in user)
// ----------------------------------------------------------------------------
// Typically used on page load to check whether the user has a valid session.
// Promise<User> means: this async function will eventually give back a User.
export async function getMe(): Promise<User> {
    // Your Express wraps replies like { success: true, data: ... }.
    // We tell api() the exact shape we expect so TypeScript can help us.
    // `data` might be the user itself, OR an object like { user: {...} },
    // depending on how your controller is written, so the type allows both.
    const res = await api<{ success: boolean; data: User | { user: User } }>(
        "/api/auth/me"
    );

    // `"user" in res.data` checks whether the key "user" exists on the object.
    //   - yes -> the user is nested, so return res.data.user
    //   - no  -> res.data already IS the user, so return it as it is
    // Once you know which shape your controller returns, you can delete this
    // check and return the right one directly.
    return "user" in res.data ? res.data.user : res.data;
}