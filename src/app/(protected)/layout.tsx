// ============================================================================
// layout.tsx - the "bouncer" for every page inside the (protected) folder.
// ============================================================================
//
// Save this as: src/app/(protected)/layout.tsx
//
// WHERE THINGS MUST BE
//   src/app/(protected)/layout.tsx            <- this file
//   src/app/(protected)/dashboard/page.tsx    <- the dashboard
//
//   A folder name in (parentheses) is a "route group": it groups files without
//   appearing in the URL, so the dashboard is still served at /dashboard. A
//   layout.tsx wraps EVERY page inside its folder. If your dashboard page is
//   NOT inside (protected), this file never runs and the page is not protected.
//
// WHAT CHANGED
//   Only the "Loading..." screen: it now has the dashboard's green background,
//   so you don't get a white flash before the green page. It's styled with
//   inline styles, so it doesn't depend on Tailwind. The logic is identical.
// ============================================================================

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

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
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    background: "#052e22",
                    color: "#a7d9c3",
                    fontSize: "0.875rem",
                }}
            >
                Loading...
            </div>
        );
    }
    return <>{children}</>;
}