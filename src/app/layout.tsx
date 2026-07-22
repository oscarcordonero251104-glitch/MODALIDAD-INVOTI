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
  title: "INV-OTI — Sistema de Inventario de Equipos Informáticos",
  description: "Sistema web PWA offline-first para la gestión de inventario de equipos informáticos de la Oficina de Tecnología de la Información (OTI).",
  keywords: ["INV-OTI", "inventario", "equipos informáticos", "OTI"],
  icons: {
    icon: "/logo-enatrel.png",
  },
  openGraph: {
    title: "INV-OTI — Sistema de Inventario de Equipos Informáticos",
    description: "Gestión de inventario de equipos informáticos · Oficina de Tecnología de la Información",
    siteName: "INV-OTI",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "INV-OTI — Sistema de Inventario de Equipos Informáticos",
    description: "Gestión de inventario de equipos informáticos · Oficina de Tecnología de la Información",
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
