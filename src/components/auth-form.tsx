// ============================================================================
// auth-form.tsx - ONE form component used by BOTH the sign-in and sign-up pages.
// ============================================================================
//
// Save this as: src/components/auth-form.tsx
//
// HOW IT'S USED
//   sign-in/page.tsx  ->  <AuthForm mode="sign-in" />
//   sign-up/page.tsx  ->  <AuthForm mode="sign-up" />
//
// THE FLOW
//   You type -> you submit -> handleSubmit() reads the inputs -> calls the API
//   -> success: redirect somewhere | failure: show the error message.
// ============================================================================

"use client"; // handles clicks, typing and state -> Client Component

// "use client" is needed because this file uses useState, event handlers and
// the router. Those only work in the BROWSER. Without this line, Next.js would
// treat the file as a Server Component and throw an error.

import { useState, type FormEvent } from "react";
// - useState: gives the component memory (see the two states below).
// - `type FormEvent`: only a TypeScript description of the submit event. It is
//   erased at runtime and just gives us autocomplete and error checking.

import Link from "next/link";
// Next.js's version of <a>. Clicking it changes pages WITHOUT reloading the
// whole site, so it feels instant.

import { useRouter } from "next/navigation";
// Lets us change pages from code, e.g. router.push("/dashboard").
// (Make sure it's "next/navigation" and not "next/router", which is the old one.)

import { useAuth } from "@/components/auth-provider";
// A custom hook that reads the SHARED auth state of the whole app (the
// logged-in user). It comes from a Provider that wraps your app.

import { signUp } from "@/lib/api/auth";
// The sign-up call from auth.ts. It goes: auth.ts -> client.ts -> Express.
// Notice there is NO signIn import from auth.ts. Sign-in is taken from
// useAuth() below, because it also has to save the user in the shared state.


// ----------------------------------------------------------------------------
// The component
// ----------------------------------------------------------------------------
// One form for both pages. The `mode` prop decides the fields and the API call.
//
// `{ mode }: { mode: "sign-in" | "sign-up" }` has two parts:
//   - `{ mode }`  pulls the prop out of the props object (destructuring).
//   - the second part is its TYPE: mode can ONLY be one of those two exact
//     strings. Typing mode="signin" would be a red underline in WebStorm.
//
// `export default` is what lets the page do: import AuthForm from "...".
export default function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
    // true when we are on the sign-up page. Used in many places below so we
    // don't repeat the long comparison.
    const isSignUp = mode === "sign-up";

    // The router, used to redirect after success.
    const router = useRouter();

    // Pull the signIn function out of the shared auth state. It calls the
    // backend sign-in, then asks /me "who am I?" and stores the user, so the
    // rest of the app knows you are logged in.
    const { signIn } = useAuth();

    // STATE 1: the error message to show. "" means no error.
    const [error, setError] = useState("");

    // STATE 2: is a request currently running? Used to disable the button
    // and stop double submits.
    const [pending, setPending] = useState(false);


    // ------------------------------------------------------------------------
    // handleSubmit - runs when the form is submitted
    // ------------------------------------------------------------------------
    // `async` because it waits for network calls. `e` is the submit event;
    // FormEvent<HTMLFormElement> tells TypeScript it came from a <form>.
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        // By default, submitting a form makes the browser reload the page.
        // That would wipe our React state and error message. This line stops it
        // so WE decide what happens.
        e.preventDefault(); // stop the browser's default full-page form submit

        // Clear any old error, and mark that a request has started.
        // Each setX call asks React to re-render with the new value, so the
        // button instantly becomes disabled and says "Please wait...".
        setError("");
        setPending(true);

        // Read the inputs through their `name` attribute.
        // e.currentTarget is the <form> itself (e.target could be whatever
        // child was clicked). FormData collects every named input inside it.
        const data = new FormData(e.currentTarget);

        // data.get("email") could be a string, a File, or null, so we wrap it
        // in String() to be sure we end up with plain text.
        const email = String(data.get("email"));
        const password = String(data.get("password"));

        // try/catch/finally: "try this, if it throws do that, and ALWAYS finish
        // with the last part."
        try {
            if (isSignUp) {
                // SIGN-UP: send name, email and password to Express.
                // `await` pauses here until Express answers. If Express replies
                // with an error, api() in client.ts THROWS and we jump to catch.
                await signUp({ name: String(data.get("name")), email, password });

                // Account created. We don't log them in automatically, so send
                // them to the sign-in page.
                router.push("/sign-in"); // account created, now go sign in
            } else {
                // SIGN-IN: calls /sign-in, then /me (see auth-provider), and
                // stores the user in the shared state.
                await signIn({ email, password }); // calls /sign-in, then /me

                // Logged in -> go to the private page.
                router.push("/dashboard");
            }
        } catch (err) {
            // Shows the message Express sent (see ApiError in client.ts), e.g.
            // "Invalid credentials". ApiError extends Error, so the
            // `instanceof Error` check passes and err.message is that text.
            // The fallback covers anything unexpected (like a network crash).
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            // Runs whether it worked or failed: re-enable the button.
            // (On success the page changes anyway, so this is harmless.)
            setPending(false);
        }
    }


    // ------------------------------------------------------------------------
    // Styling
    // ------------------------------------------------------------------------
    // Tailwind classes live right in the markup, there is no separate CSS file.
    //
    // We store the long input style in one variable and reuse it on all three
    // inputs, so a style change is made in ONE place. Reading it roughly:
    // full width, rounded, grey border, white background, padding, small text,
    // no default outline, and a dark border + soft ring when focused.
    const field =
        "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";


    // ------------------------------------------------------------------------
    // What gets drawn on the screen (JSX)
    // ------------------------------------------------------------------------
    // JSX looks like HTML but is really JavaScript. Anything inside { } is
    // JavaScript. Comments INSIDE the JSX must be written as {/* ... */}.
    return (
        // <main>: full-screen wrapper that centers the card both ways.
        // (flex + items-center + justify-center + min-h-screen)
        <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 text-neutral-900">
            {/* onSubmit connects the form to handleSubmit. Using onSubmit on the
                FORM (not onClick on the button) means pressing Enter in an
                input also submits it. */}
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
            >
                {/* Ternary: condition ? valueIfTrue : valueIfFalse */}
                <h1 className="text-xl font-semibold">
                    {isSignUp ? "Create your account" : "Sign in to your account"}
                </h1>

                {/* `a && b` means: show b ONLY if a is true. So the name field
                    exists only on the sign-up page. The `name` attribute is
                    what FormData uses to find this input. `required` makes the
                    browser block an empty submit. */}
                {isSignUp && (
                    <input name="name" placeholder="Name" required className={field} />
                )}

                {/* type="email" makes the browser check the email format.
                    type="password" hides the characters as you type. */}
                <input name="email" type="email" placeholder="Email" required className={field} />
                <input name="password" type="password" placeholder="Password" required className={field} />

                {/* Same `&&` trick: the red error line only shows when `error`
                    isn't an empty string. */}
                {error && <p className="text-sm text-red-600">{error}</p>}

                {/* A <button> inside a <form> submits it by default, so it
                    needs no onClick. disabled={pending} blocks clicks while a
                    request is running. The text uses a nested ternary:
                    pending -> "Please wait..."
                    else sign-up -> "Create account"
                    else -> "Sign in" */}
                <button
                    disabled={pending}
                    className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                >
                    {pending ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
                </button>

                {/* Link to the OTHER page: sign-up page links to sign-in and
                    the other way around. {" "} forces a real space between the
                    text and the link, because JSX trims whitespace at line
                    breaks. */}
                <p className="text-center text-sm text-neutral-500">
                    {isSignUp ? "Already have an account?" : "No account yet?"}{" "}
                    <Link href={isSignUp ? "/sign-in" : "/sign-up"} className="text-neutral-900 underline">
                        {isSignUp ? "Sign in" : "Create one"}
                    </Link>
                </p>
            </form>
        </main>
    );
}