import SignInForm from "@/components/forms/sign-in-form";

// A page.tsx is what turns a folder into a URL: this one is served at /sign-in.
// "(auth)" is a route group, so it does NOT appear in the URL.
export default function SignInPage() {
    return <SignInForm />;
}
