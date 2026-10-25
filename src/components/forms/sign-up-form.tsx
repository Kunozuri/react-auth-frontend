// ============================================================================
// sign-up-form.tsx - the SIGN-UP form (its own design, its own logic).
// ============================================================================
//
// Save this as: src/components/forms/sign-up-form.tsx
//
// HOW IT'S USED
//   src/app/(auth)/sign-up/page.tsx  ->  <SignUpForm />
//
// THE FLOW
//   type name + email + password -> submit -> handleSubmit() -> signUp()
//   -> success: go to /sign-in | failure: show the message Express sent
//
// DIFFERENCES FROM sign-in-form.tsx
//   1. It has an extra `name` field.
//   2. It calls signUp() from auth.ts directly. It does NOT use useAuth(),
//      because creating an account doesn't log you in, so the shared auth
//      state has nothing to update.
//   3. After success it sends you to /sign-in instead of /dashboard.
// Everything else works exactly the same, so those parts have short comments.
// ============================================================================

"use client"; // handles clicks, typing and state -> Client Component

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// auth.ts -> client.ts -> Express. No useAuth needed here (see note above).
import { signUp } from "@/lib/api/auth";


export default function SignUpForm() {
    const router = useRouter();

    // The red error text ("" = no error) and the "request running" flag.
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);


    // ------------------------------------------------------------------------
    // handleSubmit - runs when the form is submitted
    // ------------------------------------------------------------------------
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault(); // stop the browser's default full-page reload
        setError("");
        setPending(true);

        // Read the inputs through their `name` attribute.
        const data = new FormData(e.currentTarget);
        const name = String(data.get("name")); // <- the extra field
        const email = String(data.get("email"));
        const password = String(data.get("password"));

        try {
            // Throws an ApiError if Express rejects it (email already in use,
            // a rule in your User model failed...). Then we jump to the catch.
            await signUp({ name, email, password });

            // Account created. We don't log them in automatically, so send
            // them to the sign-in page.
            router.push("/sign-in");
        } catch (err) {
            // The text Express sent, e.g. "email already in use".
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setPending(false); // re-enable the button either way
        }
    }


    // ------------------------------------------------------------------------
    // Styling - THIS form's own look. Change it freely: the sign-in form has
    // its own copy and won't be affected.
    // ------------------------------------------------------------------------
    const field =
        "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";


    // ------------------------------------------------------------------------
    // What gets drawn on the screen (JSX)
    // ------------------------------------------------------------------------
    return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 text-neutral-900">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
            >
                <h1 className="text-xl font-semibold">Create your account</h1>

                {/* Three fields. Each `name` must match what handleSubmit reads
                    with data.get("..."), and the backend must expect the same
                    names (name, email, password). */}
                <input name="name" placeholder="Name" required className={field} />
                <input name="email" type="email" placeholder="Email" required className={field} />
                <input name="password" type="password" placeholder="Password" required className={field} />

                {/* Only shown when `error` isn't an empty string. */}
                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    disabled={pending}
                    className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                >
                    {pending ? "Please wait..." : "Create account"}
                </button>

                <p className="text-center text-sm text-neutral-500">
                    Already have an account?{" "}
                    <Link href="/sign-in" className="text-neutral-900 underline">
                        Sign in
                    </Link>
                </p>
            </form>
        </main>
    );
}