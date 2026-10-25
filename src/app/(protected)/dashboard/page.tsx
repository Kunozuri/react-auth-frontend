"use client";

import { useAuth } from "@/components/providers/auth-provider";
import SignOutButton from "@/components/sign-out-button";

// Served at /dashboard. Only reachable when logged in (see the layout).
export default function DashboardPage() {
    const { user } = useAuth(); // only the user is needed now

    return (
        <main className="mx-auto mt-24 max-w-sm space-y-4 rounded-xl border border-neutral-200 bg-white p-6 text-neutral-900">
            <h1 className="text-xl font-semibold">Hello, {user?.name}</h1>
            <p className="text-sm text-neutral-500">{user?.email}</p>
            <SignOutButton />
        </main>
    );
}