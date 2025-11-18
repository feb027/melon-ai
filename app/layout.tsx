import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Font optimization using next/font/google
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Metadata for SEO and PWA
export const metadata: Metadata = {
  title: {
    default: "MelonAI - Analisis Kematangan Semangka & Melon dengan AI",
    template: "%s | MelonAI",
  },
  description:
    "Aplikasi berbasis AI untuk menganalisis kematangan dan kualitas semangka & melon secara objektif. Mudah digunakan untuk petani dan pedagang.",
  applicationName: "MelonAI",
  keywords: [
    "semangka",
    "melon",
    "analisis semangka",
    "analisis melon",
    "AI",
    "kematangan buah",
    "pertanian",
    "teknologi pertanian",
  ],
  authors: [{ name: "MelonAI Team" }],
  creator: "MelonAI Team",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MelonAI",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "MelonAI",
    title: "MelonAI - Analisis Kematangan Semangka & Melon dengan AI",
    description:
      "Aplikasi berbasis AI untuk menganalisis kematangan dan kualitas semangka & melon secara objektif.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MelonAI - Analisis Kematangan Semangka & Melon dengan AI",
    description:
      "Aplikasi berbasis AI untuk menganalisis kematangan dan kualitas semangka & melon secara objektif.",
  },
};

// Viewport configuration for mobile-first design
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans antialiased">
        {/* Responsive container with mobile-first breakpoints */}
        <div className="min-h-screen bg-background">
          <main className="container mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
        {/* Global toast notifications */}
        <Toaster />
        {/* Vercel Analytics for performance monitoring */}
        <Analytics />
        {/* Vercel Speed Insights for Core Web Vitals */}
        <SpeedInsights />
      </body>
    </html>
  );
}
