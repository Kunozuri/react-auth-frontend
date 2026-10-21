// One small wrapper around fetch() that every API call goes through.
// It does 3 jobs: (1) sends the cookies, (2) turns failed responses into
// errors we can catch, (3) silently refreshes the session when it expired.

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

// If 5 requests fail with 401 at the same moment, we want ONE refresh call,
// not 5. We keep the refresh that is currently running here so they share it.
let refreshing: Promise<boolean> | null = null;

function refreshSession() {
    refreshing ??= fetch("/api/auth/refresh", {
        method: "POST", // change to "GET" if your refresh route is a GET
        credentials: "include",
    })
        .then((res) => res.ok) // true = Express gave us fresh cookies
        .catch(() => false)
        .finally(() => {
            refreshing = null;
        });
    return refreshing;
}

export async function api<T>(
    path: string,
    options: RequestInit = {},
    canRetry = true
): Promise<T> {
    const res = await fetch(path, {
        ...options,
        credentials: "include", // <- makes the browser send/store the auth cookies
        headers: { "Content-Type": "application/json", ...options.headers },
    });

    // 401 = "not logged in" or "access token expired".
    // Try to refresh once, then repeat the original request.
    // Skipped for sign-in/sign-up: a 401 there just means wrong credentials.
    // canRetry=false stops us from looping forever if refresh also fails.
    const isAuthForm = path.includes("/sign-in") || path.includes("/sign-up");
    if (res.status === 401 && canRetry && !isAuthForm) {
        if (await refreshSession()) return api<T>(path, options, false);
    }

    const data = await res.json().catch(() => null); // some responses have no body
    if (!res.ok) {
        // Show the message Express sent, e.g. { message: "Invalid credentials" }
        throw new ApiError(data?.message ?? "Something went wrong", res.status);
    }
    return data as T;
}
