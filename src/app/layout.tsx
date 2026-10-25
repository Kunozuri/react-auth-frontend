import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";

export const metadata: Metadata = { title: "Auth app" };

// The root layout wraps EVERY page in the app (this file replaces the generated one).
// Putting <AuthProvider> here means any page or component can call useAuth().
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en">
      <body>
      <AuthProvider>{children}</AuthProvider>
      </body>
      </html>
  );
}
