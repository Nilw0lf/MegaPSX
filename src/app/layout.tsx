import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { ToastStack } from "@/components/ToastStack";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "MegaPX - Profit Reality Calculator",
  description: "Local-first dividend and sell planner with realistic fees and tax scenarios."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Navbar />
          <KeyboardShortcuts />
          <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
            {children}
          </main>
          <Footer />
          <ToastStack />
        </ThemeProvider>
      </body>
    </html>
  );
}
