import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CDO LGU Management System - Cagayan de Oro City",
  description: "Integrated Local Government Unit Management System for Cagayan de Oro City, Philippines. Manage residents, services, complaints, permits, and more.",
  keywords: ["Cagayan de Oro", "LGU", "Government", "Management System", "Philippines", "Local Government"],
  authors: [{ name: "CDO LGU IT Department" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "CDO LGU Management System",
    description: "Integrated Local Government Unit Management System for Cagayan de Oro City",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
