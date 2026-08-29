import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "tRPC Monorepo Workspace",
  description: "Type-Safe Workspace Template",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
