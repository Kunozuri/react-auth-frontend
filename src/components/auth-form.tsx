"use client"; // handles clicks, typing and state -> Client Component

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { signUp } from "@/lib/api/auth";

// One form for both pages. The `mode` prop decides the fields and the API call.
export default function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
    const isSignUp = mode === "sign-up";
    const router = useRouter();
    const { signIn } = useAuth();
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault(); // stop the browser's default full-page form submit
        setError("");
        setPending(true);

        // Read the inputs through their `name` attribute.
        const data = new FormData(e.currentTarget);
        const email = String(data.get("email"));
        const password = String(data.get("password"));

        try {
            if (isSignUp) {
                await signUp({ name: String(data.get("name")), email, password });
                router.push("/sign-in"); // account created, now go sign in
            } else {
                await signIn({ email, password }); // calls /sign-in, then /me
                router.push("/dashboard");
            }
        } catch (err) {
            // Shows the message Express sent (see ApiError in client.ts)
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setPending(false);
        }
    }

    // Tailwind classes live right in the markup, there is no separate CSS file.
    const field =
        "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";

    return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 text-neutral-900">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
            >
                <h1 className="text-xl font-semibold">
                    {isSignUp ? "Create your account" : "Sign in to your account"}
                </h1>

                {isSignUp && (
                    <input name="name" placeholder="Name" required className={field} />
                )}
                <input name="email" type="email" placeholder="Email" required className={field} />
                <input name="password" type="password" placeholder="Password" required className={field} />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    disabled={pending}
                    className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                >
                    {pending ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
                </button>

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
