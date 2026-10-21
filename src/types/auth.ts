// The shapes of data moving between this frontend and your Express API.
// Change the fields to match what your backend really uses.
export type User = { id: string; name: string; email: string };
export type SignInInput = { email: string; password: string };
export type SignUpInput = SignInInput & { name: string };
