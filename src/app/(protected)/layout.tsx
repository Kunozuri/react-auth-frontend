"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

// Wraps every page inside (protected). It acts as the bouncer:
// once we know there is no user, send the visitor to /sign-in.
// NOTE: this only hides the UI. Your Express routes must still check auth
// on their own, because the frontend can never be trusted for security.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.replace("/sign-in");
    }, [loading, user, router]);

    // While /me is still loading (or we're redirecting), don't flash the page.
    if (loading || !user) {
        return <p className="p-8 text-sm text-neutral-500">Loading...</p>;
    }
    return <>{children}</>;
}
