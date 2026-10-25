// ============================================================================
// sign-in-form.tsx - the SIGN-IN form, styled with the Meraki UI card design.
// ============================================================================
//
// Save this as: src/components/forms/sign-in-form.tsx
//
// WHAT CHANGED COMPARED TO THE PREVIOUS VERSION
//   - Only the DESIGN changed (the JSX at the bottom). The logic is identical.
//   - The design came from Meraki UI as plain HTML, so it was converted to JSX:
//       class      -> className
//       <a href>   -> <Link href> (Next.js navigation without a page reload)
//       <form>     -> got onSubmit={handleSubmit}
//       <input>    -> got `name` and `required`, so FormData can read them
//     and two things were ADDED that the design didn't have: the red error
//     line and the pending state on the button.
//   - src/app/(auth)/sign-in/page.tsx does NOT change. It still just renders
//     <SignInForm />, because the page only chooses the URL, the form is the design.
//
// TAILWIND v4 NOTE
// Meraki's snippet was written for Tailwind v3, and this project uses v4
// (see `@import "tailwindcss"` in globals.css). Three classes were adjusted:
//   - focus:ring focus:ring-opacity-40  ->  focus:ring-3 focus:ring-blue-300/40
//     (v4 removed ring-opacity-*; opacity is now written as /40 after the colour,
//      and a bare `ring` became 1px wide, so `ring-3` gives the old 3px glow)
//   - border (no colour)                ->  border border-gray-200
//     (v4 made the default border colour "currentColor", which looks too dark)
//   - focus:outline-none                ->  focus:outline-hidden
//     (the v4 name for the old behaviour)
// ============================================================================

"use client"; // handles clicks, typing and state -> Client Component

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sign-in comes from the shared auth state, NOT straight from auth.ts, because
// it must log in AND store the user so the whole app knows who is logged in.
// (Use the same path your other files use: components/providers/ or components/.)
import { useAuth } from "@/components/providers/auth-provider";


export default function SignInForm() {
    const router = useRouter();
    const { signIn } = useAuth();

    // The red error text ("" = no error) and the "request running" flag.
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);


    // ------------------------------------------------------------------------
    // handleSubmit - the LOGIC. Unchanged by the redesign.
    // ------------------------------------------------------------------------
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault(); // stop the browser's default full-page reload
        setError("");
        setPending(true);

        // Read the inputs through their `name` attribute.
        const data = new FormData(e.currentTarget);
        const email = String(data.get("email"));
        const password = String(data.get("password"));

        try {
            // Throws an ApiError if Express rejects the login. Then we jump to catch.
            await signIn({ email, password });
            router.push("/dashboard");
        } catch (err) {
            // The text Express sent, e.g. "Invalid credentials".
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setPending(false); // re-enable the button either way
        }
    }


    // ------------------------------------------------------------------------
    // Styling
    // ------------------------------------------------------------------------
    // Both inputs share the same long class list, so it's stored once here
    // (Meraki's HTML repeated it). `dark:` classes apply automatically when the
    // visitor's device is in dark mode.
    // `dark:text-gray-300` was ADDED: the original had no text colour for dark
    // mode, so typed text would be dark grey on a dark background.
    const field =
        "mt-2 block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 placeholder-gray-500 focus:border-blue-400 focus:ring-3 focus:ring-blue-300/40 focus:outline-hidden dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:placeholder-gray-400 dark:focus:border-blue-300";


    // ------------------------------------------------------------------------
    // What gets drawn on the screen (JSX). Comments here must be {/* ... */}.
    // ------------------------------------------------------------------------
    return (
        // Page background: light grey normally, dark grey in dark mode.
        // flex + items-center + justify-center + min-h-screen centers the card.
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
            {/* THE CARD: white, rounded, with a shadow. overflow-hidden keeps the
                grey footer strip inside the rounded corners. */}
            <div className="mx-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
                <div className="px-6 py-4">
                    {/* Logo area. Meraki's demo loaded its own logo from merakiui.com,
                        which would show THEIR brand on your page, so it's replaced by
                        text. To use your own logo, put the file in /public and use
                        <Image src="/logo.svg" ... /> from "next/image". */}
                    <div className="mx-auto flex justify-center">
                        <span className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                            Auth app
                        </span>
                    </div>

                    <h3 className="mt-3 text-center text-xl font-medium text-gray-600 dark:text-gray-200">
                        Welcome Back
                    </h3>

                    <p className="mt-1 text-center text-gray-500 dark:text-gray-400">
                        Login or create account
                    </p>

                    {/* onSubmit connects the form to handleSubmit. Pressing the
                        button OR pressing Enter in an input both trigger it. */}
                    <form onSubmit={handleSubmit}>
                        {/* `name` is how FormData finds each value.
                            `required` stops an empty submit.
                            aria-label is for screen readers. */}
                        <div className="mt-4 w-full">
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="Email Address"
                                aria-label="Email Address"
                                className={field}
                            />
                        </div>

                        <div className="mt-4 w-full">
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="Password"
                                aria-label="Password"
                                className={field}
                            />
                        </div>

                        {/* ADDED: only shown when `error` isn't an empty string. */}
                        {error && (
                            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
                        )}

                        {/* Meraki had a "Forget Password?" link on the left of this row.
                            It's left out because that page doesn't exist yet (the link
                            would go nowhere). When you build it, put this back and
                            change justify-end to justify-between:
                            <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-200">
                                Forgot password?
                            </Link> */}
                        <div className="mt-4 flex items-center justify-end">
                            {/* A <button> inside a <form> submits it by default, so it
                                needs no onClick. disabled={pending} blocks clicks while
                                waiting, and the text changes to show progress. */}
                            <button
                                disabled={pending}
                                className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 hover:bg-blue-400 focus:ring-3 focus:ring-blue-300/50 focus:outline-hidden disabled:opacity-50"
                            >
                                {pending ? "Please wait..." : "Sign In"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Grey footer strip with the link to the other page.
                    &apos; is how an apostrophe is written inside JSX text. */}
                <div className="flex items-center justify-center bg-gray-50 py-4 text-center dark:bg-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-200">
                        Don&apos;t have an account?
                    </span>
                    <Link
                        href="/sign-up"
                        className="mx-2 text-sm font-bold text-blue-500 hover:underline dark:text-blue-400"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </main>
    );
}