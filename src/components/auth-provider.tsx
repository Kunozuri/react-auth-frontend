"use client"; // uses useState/useEffect, so this must be a Client Component

import { createContext, useContext, useEffect, useState } from "react";
import {
    getMe,
    signIn as signInRequest,
    signOut as signOutRequest,
} from "@/lib/api/auth";
import type { SignInInput, User } from "@/types/auth";

type AuthState = {
    user: User | null;
    loading: boolean;
    signIn: (input: SignInInput) => Promise<void>;
    signOut: () => Promise<void>;
};

// Context = a "global variable" that any component below the provider can read,
// so we don't have to pass `user` down through props.
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // true until we know who the visitor is

    // Runs once when the app loads, asking "who am I?".
    // The browser attaches its cookies automatically. /me answers with the user,
    // or with 401 (after the auto-refresh attempt in client.ts) if nobody is logged in.
    useEffect(() => {
        getMe()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    async function signIn(input: SignInInput) {
        await signInRequest(input); // Express sets the cookies
        setUser(await getMe()); // then ask /me, so the user always has one known shape
    }

    async function signOut() {
        await signOutRequest(); // Express clears the cookies
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

// A hook so any component can write: const { user } = useAuth();
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
