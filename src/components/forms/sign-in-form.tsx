// ============================================================================
// sign-in-form.tsx - the SIGN-IN form, styled with the Meraki UI card design.
// ============================================================================
//
// Save this as: src/components/forms/sign-in-form.tsx
//
// WHAT CHANGED IN THIS VERSION
//   - The password box got a show/hide eye. It is written directly in this file
//     (no separate component), so this form stays self-contained.
//   - The password box is now a wrapper that draws the border, with the real
//     <input> and the eye side by side INSIDE it, so the eye can't end up
//     outside the box.
//   - Nothing else changed. The logic is identical.
//
// WHAT CHANGED COMPARED TO THE VERSION BEFORE THAT
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

    // true = the password is shown as plain text, false = shown as dots.
    // Clicking the eye flips it.
    const [showPassword, setShowPassword] = useState(false);

    // true while the cursor is in the password box (or on the eye). The blue
    // glow has to be drawn on the WRAPPER, because the wrapper is the visible box.
    const [passwordFocused, setPasswordFocused] = useState(false);


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
    // The email input uses this class list (Meraki's HTML repeated it on every
    // input, so it's stored once here). `dark:` classes apply automatically when
    // the visitor's device is in dark mode.
    // `dark:text-gray-300` was ADDED: the original had no text colour for dark
    // mode, so typed text would be dark grey on a dark background.
    // The password box does NOT use it: it draws its own box (see below).
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

                        {/* THE PASSWORD BOX WITH THE EYE.
                            The outer <div> IS the visible box (border, rounded
                            corners, glow). Inside it, the <input> and the eye
                            button sit side by side, so the eye is always inside.
                            React's onFocus/onBlur also fire for focus changes
                            INSIDE this div, which is what lights up the glow. */}
                        <div className="mt-4 w-full">
                            <div
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800"
                                style={
                                    passwordFocused
                                        ? {
                                            borderColor: "#60a5fa",
                                            boxShadow: "0 0 0 3px rgb(147 197 253 / 0.4)",
                                        }
                                        : undefined
                                }
                            >
                                {/* type flips between "password" (dots) and "text"
                                    (readable). The typed value stays the same.
                                    "current-password" tells the browser this is the
                                    password of an EXISTING account, so password
                                    managers can offer to fill it in.
                                    The inline style gives the input its own padding
                                    and a see-through background (the wrapper draws
                                    the box), and minWidth:0 lets it shrink so the
                                    eye always has room. */}
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Password"
                                    aria-label="Password"
                                    autoComplete="current-password"
                                    className="w-full py-2 text-gray-700 placeholder-gray-500 focus:outline-hidden dark:text-gray-300 dark:placeholder-gray-400"
                                    style={{
                                        minWidth: 0,
                                        background: "transparent",
                                        paddingLeft: "1rem",
                                        paddingRight: "0.5rem",
                                    }}
                                />

                                {/* type="button" is IMPORTANT: a button inside a form
                                    submits it by default, so without it clicking the
                                    eye would try to log in.
                                    alignSelf:"stretch" makes the clickable area as
                                    tall as the box. */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                    className="flex items-center text-gray-500 hover:text-gray-700 focus-visible:text-blue-500 focus:outline-hidden dark:text-gray-400 dark:hover:text-gray-200"
                                    style={{ alignSelf: "stretch", padding: "0 0.75rem" }}
                                >
                                    {/* width/height are set directly on the <svg>. Without
                                        a size, an inline SVG stretches to fill the space. */}
                                    {showPassword ? (
                                        // Eye with a slash: "click to hide"
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            width={20}
                                            height={20}
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={1.5}
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                                            />
                                        </svg>
                                    ) : (
                                        // Open eye: "click to show"
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            width={20}
                                            height={20}
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={1.5}
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
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