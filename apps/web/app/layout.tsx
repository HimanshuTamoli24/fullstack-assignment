import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css";
import { AuthProvider } from "~/context/auth-context";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TaskFlow | Team Project & Task Management",
  description:
    "Enterprise project management platform powered by Next.js, tRPC & MongoDB Atlas with deadline audit history tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
