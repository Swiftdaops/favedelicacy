import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PublicNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BubbleSearch from "@/components/BubbleSearch";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/+$/, "");

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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PublicNavbar />
        {children}
        <Footer />
        <BubbleSearch />
      </body>
    </html>
  );
}
