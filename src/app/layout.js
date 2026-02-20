import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import PublicNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BubbleSearch from "@/components/BubbleSearch";
import SonnerToaster from "@/components/SonnerToaster";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://favedelicacy.store").replace(/\/+$/, "");

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fave Delicacy",
    template: "%s | Fave Delicacy",
  },
  description: "Order delicious food and drinks for delivery.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Fave Delicacy",
    title: "Fave Delicacy",
    description: "Order delicious food and drinks for delivery.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fave Delicacy",
    description: "Order delicious food and drinks for delivery.",
  },
  icons: {
    icon: [
      { url: '/chef-icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/chef-icon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/chef-icon-32.png',
    apple: '/chef-icon-192.png',
    other: [
      { url: '/chef-icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Fave Delicacy" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17944539215"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'AW-17944539215');`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PublicNavbar />
        <SonnerToaster />
        {children}
        <Footer />
        <BubbleSearch />
        <Analytics />
      </body>
    </html>
  );
}
