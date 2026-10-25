// ============================================================================
// auth-provider.tsx - ONE shared copy of "who is logged in" for the whole app.
// ============================================================================
//
// Save this as: src/components/auth-provider.tsx
//
// THE PROBLEM IT SOLVES
// The navbar, the dashboard and the sign-in form all need to know who the user
// is. If each one called getMe() itself, you would send many identical requests
// and each component could end up with a different answer. Instead, this file
// asks ONCE, keeps the answer, and lets every component read it.
//
// THE 3 PIECES OF CONTEXT
//   1. createContext(...)           -> creates an empty "channel".
//   2. <AuthContext.Provider ...>   -> broadcasts a value on that channel to
//                                      everything placed inside it.
//   3. useContext(AuthContext)      -> lets any component inside tune in and
//                                      read the value.
//
// SETUP REQUIRED: wrap your app with the provider, usually in src/app/layout.tsx:
//
//   <html lang="en">
//     <body>
//       <AuthProvider>{children}</AuthProvider>
//     </body>
//   </html>
//
// Without that, useAuth() below throws an error.
// ============================================================================

"use client"; // uses useState/useEffect, so this must be a Client Component

import { createContext, useContext, useEffect, useState } from "react";

// We rename the two API functions as we import them (`X as Y`).
// Reason: this file defines its OWN functions called signIn and signOut below.
// Without the rename, the names would clash. `Request` makes it clear these are
// the raw calls to the backend (auth.ts -> client.ts -> Express).
import {
    getMe,
    signIn as signInRequest,
    signOut as signOutRequest,
} from "@/lib/api/auth";

// Type-only imports (erased at runtime, only used by TypeScript).
import type { SignInInput, User } from "@/types/auth";


// ----------------------------------------------------------------------------
// AuthState - the list of things this "channel" carries
// ----------------------------------------------------------------------------
// Any component that calls useAuth() receives an object with exactly these four.
type AuthState = {
    // The logged-in user, or null when nobody is logged in (or we don't know yet).
    user: User | null;

    // true while we are still finding out who the visitor is.
    loading: boolean;

    // Log in. `(input) => Promise<void>` means: takes email+password, runs
    // async, and gives back nothing useful (the result lands in `user`).
    signIn: (input: SignInInput) => Promise<void>;

    // Log out.
    signOut: () => Promise<void>;
};


// ----------------------------------------------------------------------------
// The context itself
// ----------------------------------------------------------------------------
// Context = a "global variable" that any component below the provider can read,
// so we don't have to pass `user` down through props.
//
// The `null` is the default value, used only if a component tries to read the
// context while NOT being inside an <AuthProvider>. We check for it in useAuth().
const AuthContext = createContext<AuthState | null>(null);


// ----------------------------------------------------------------------------
// AuthProvider - the component that owns the data and shares it
// ----------------------------------------------------------------------------
// `children` is whatever you put between <AuthProvider> and </AuthProvider>
// (in practice: your whole app). React.ReactNode is the type for "anything
// React can render".
export function AuthProvider({ children }: { children: React.ReactNode }) {
    // STATE 1: the current user. null = nobody (or not known yet).
    const [user, setUser] = useState<User | null>(null);

    // STATE 2: are we still checking? Starts true, because at the very first
    // moment we haven't asked the backend anything yet.
    const [loading, setLoading] = useState(true); // true until we know who the visitor is

    // Runs once when the app loads, asking "who am I?".
    // The browser attaches its cookies automatically. /me answers with the user,
    // or with 401 (after the auto-refresh attempt in client.ts) if nobody is logged in.
    //
    // The empty [] at the end means "run only once, right after the first render".
    // (In development React runs it twice on purpose to catch bugs. Normal.)
    useEffect(() => {
        getMe()
            .then(setUser)              // success: store the user
            .catch(() => setUser(null)) // 401 / error: nobody is logged in
            .finally(() => setLoading(false)); // either way, we now know the answer
    }, []);


    // signIn - used by the sign-in form (through useAuth)
    async function signIn(input: SignInInput) {
        await signInRequest(input); // Express sets the cookies
        // We don't trust the sign-in response to describe the user. Asking /me
        // means the user always has the same known shape, wherever it came from.
        setUser(await getMe()); // then ask /me, so the user always has one known shape
        // If signInRequest throws (wrong password), the code stops there and the
        // error travels up to the catch in auth-form.tsx, which displays it.
    }

    // signOut - tell Express to clear the cookies, then forget the user locally
    async function signOut() {
        await signOutRequest(); // Express clears the cookies
        setUser(null);
    }

    // `value` is what gets broadcast. Every component inside the provider that
    // calls useAuth() receives this object. Whenever `user` or `loading` change,
    // those components re-render automatically with the new values.
    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}


// ----------------------------------------------------------------------------
// useAuth - the shortcut every component uses
// ----------------------------------------------------------------------------
// A hook so any component can write: const { user } = useAuth();
//
// Example in a component:
//   const { user, loading } = useAuth();
//   if (loading) return <p>Loading...</p>;
//   if (!user) return <p>Please sign in</p>;
//   return <p>Hello {user.name}</p>;
//
// TIP: always check `loading` before deciding someone is logged out. On a fresh
// page load, `user` is null for a moment while getMe() is still running.
export function useAuth() {
    const ctx = useContext(AuthContext);

    // If ctx is null, this component is NOT inside <AuthProvider>. Throwing a
    // clear error now is much easier to debug than a confusing crash later.
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");

    // After the check above, TypeScript knows ctx is NOT null anymore, so
    // components can use it without extra null checks.
    return ctx;
}