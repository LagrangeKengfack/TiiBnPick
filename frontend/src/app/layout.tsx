import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TiiBnPick - Super Admin Dashboard",
  description: "Tableau de bord administrateur pour la plateforme TiiBnPick. Gestion des inscriptions de livreurs et des comptes utilisateurs.",
  keywords: ["TiiBnPick", "Administration", "Livraison", "Gestion", "Dashboard", "Next.js", "TypeScript"],
  authors: [{ name: "TiiBnPick Team" }],
  openGraph: {
    title: "TiiBnPick - Super Admin Dashboard",
    description: "Tableau de bord administrateur pour la plateforme TiiBnPick",
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
        <Toaster />
      </body>
    </html>
  );
}
