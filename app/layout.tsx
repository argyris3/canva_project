import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import type { Metadata } from "next";
import Provider from "./provider";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";
import { url } from "inspector";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Canva_Project",
  description:
    "Plan, diagram, and organize ideas on an AI-powered visual workspace.",
  icons: {
    icon: [
      {
        url: "/logo.svg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/* Clerk wraps the entire app so route handlers and client components share the same auth session. */}
      <html
        lang="en"
        suppressHydrationWarning
        className={cn("font-sans", inter.variable)}
      >
        <body style={{ margin: 0, padding: 0 }}>
          <Provider>{children}</Provider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
