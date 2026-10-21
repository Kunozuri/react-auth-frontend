"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

// Served at /dashboard. Only reachable when logged in (see the layout above).
export default function DashboardPage() {
    const { user, signOut } = useAuth(); // the user that /me returned
    const router = useRouter();

    async function handleSignOut() {
        await signOut(); // calls /sign-out and clears the user
        router.push("/sign-in");
    }

    return (
        <main className="mx-auto mt-24 max-w-sm space-y-4 rounded-xl border border-neutral-200 bg-white p-6 text-neutral-900">
            <h1 className="text-xl font-semibold">Hello, {user?.name}</h1>
            <p className="text-sm text-neutral-500">{user?.email}</p>
            <button
                onClick={handleSignOut}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100"
            >
                Sign out
            </button>
        </main>
    );
}
