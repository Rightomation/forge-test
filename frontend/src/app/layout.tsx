import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo Projects",
  description: "Tasks organized by project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        {children}
        <Toaster position="bottom-right" toastOptions={{ duration: 2800 }} />
      </body>
    </html>
  );
}
