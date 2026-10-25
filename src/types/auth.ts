// ============================================================================
// types/auth.ts - the SHAPES of the data moving between frontend and Express.
// ============================================================================
//
// Save this as: src/types/auth.ts
// (That is why other files can import it with "@/types/auth".)
//
// WHAT A "TYPE" IS
// A type is only a description, like a blueprint: "a User looks like this".
// It exists for TypeScript and your editor (WebStorm) ONLY. When the app runs,
// every type is erased. So:
//   - it adds zero code to your app
//   - it does not send anything to the backend
//   - it does NOT check the real data at runtime
//
// WHAT IT GIVES YOU
//   - Autocomplete: type `user.` and WebStorm suggests id, name, email.
//   - Typo catching: `user.emial` gets a red underline before you even run it.
//   - Missing data catching: `signIn({ email })` with no password is an error.
//
// IMPORTANT: these must match what your Express backend REALLY sends and
// expects. If Express returns `username` but the type says `name`, TypeScript
// will NOT warn you, because it can't see inside your backend. Change the
// fields below whenever your backend changes.
// ============================================================================


// ----------------------------------------------------------------------------
// User - what the backend sends back when you ask "who is logged in?"
// ----------------------------------------------------------------------------
// Used by getMe() in auth.ts, and by components that show the user's info,
// for example: const [user, setUser] = useState<User | null>(null)
//
// Notice there is NO password here. The backend should never send it back.
export type User = {
    id: string;    // the user's unique id (from your database)
    name: string;  // display name
    email: string; // login email
};


// ----------------------------------------------------------------------------
// SignInInput - what the sign-in form sends to the backend
// ----------------------------------------------------------------------------
// Used by signIn() in auth.ts. The form collects these two fields and passes
// them along.
export type SignInInput = {
    email: string;
    password: string;
};


// ----------------------------------------------------------------------------
// SignUpInput - what the sign-up form sends to the backend
// ----------------------------------------------------------------------------
// Sign-up needs everything sign-in needs, PLUS a name.
//
// The `&` is called an "intersection": it means "combine both". So this is
// exactly the same as writing:
//
//   export type SignUpInput = {
//       email: string;
//       password: string;
//       name: string;
//   };
//
// Reusing SignInInput just saves us from repeating email and password. If you
// later add a rule to SignInInput, SignUpInput gets it automatically.
export type SignUpInput = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    country?: string;
    acceptedTerms: boolean; // must be the boolean true, not "true" or 1
};