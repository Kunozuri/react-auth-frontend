// ============================================================================
// sign-out-button.tsx - a small reusable "Sign out" button.
// ============================================================================
//
// Save this as: src/components/sign-out-button.tsx
//
// HOW TO USE IT
// Put it on any page or component, for example in your dashboard:
//
//   import SignOutButton from "@/components/sign-out-button";
//   ...
//   <SignOutButton />
//
// Until some file imports it, WebStorm will show "no usages". That's normal.
// ============================================================================

"use client"; // uses a click handler, state and hooks -> Client Component

import { useState } from "react";
import { useRouter } from "next/navigation";

// IMPORTANT: use the signOut from useAuth(), NOT the one in auth.ts.
//   - auth.ts signOut     -> only tells Express to clear the cookies
//   - useAuth().signOut   -> tells Express AND sets the shared `user` to null,
//                            so the whole app instantly knows you're logged out
import { useAuth } from "./providers/auth-provider";


export default function SignOutButton() {
    const { signOut } = useAuth();
    const router = useRouter();

    // true while the request is running (stops double clicks).
    const [pending, setPending] = useState(false);

    async function handleClick() {
        setPending(true);
        try {
            await signOut(); // Express clears the cookies, the provider forgets the user

            // The provider's signOut doesn't redirect anywhere, so this
            // component decides where to go next.
            router.replace("/sign-in");
        } finally {
            setPending(false); // re-enable the button either way
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={pending}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100 disabled:opacity-50"
        >
            {pending ? "Signing out..." : "Sign out"}
        </button>
    );
}