import { api } from "./client";
import type { SignInInput, SignUpInput, User } from "@/types/auth";

// One function per Express endpoint. Components call THESE, never fetch().
// Paths start with /api so next.config.ts forwards them to Express on :5500.
// (/api/auth/refresh is not here: client.ts calls it automatically.)
// HTTP methods are assumed to be POST, change them if your routes differ.

export const signUp = (input: SignUpInput) =>
    api("/api/auth/sign-up", { method: "POST", body: JSON.stringify(input) });

export const signIn = (input: SignInInput) =>
    api("/api/auth/sign-in", { method: "POST", body: JSON.stringify(input) });

export const signOut = () => api("/api/auth/sign-out", { method: "POST" });

export async function getMe(): Promise<User> {
    // Your Express replies { success: true, data: ... }.
    // `data` might be the user itself, or { user: {...} } depending on your
    // controller, so this handles both.
    const res = await api<{ success: boolean; data: User | { user: User } }>(
        "/api/auth/me"
    );
    return "user" in res.data ? res.data.user : res.data;
}
