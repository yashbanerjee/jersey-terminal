import type { Metadata } from "next";
import { Exo_2, Sora } from "next/font/google";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { PageAtmosphere } from "@/components/layout/PageAtmosphere";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageTransition } from "@/components/motion/PageTransition";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import "./globals.css";

/** Body face — modern geometric sans with a slightly techy, sporty feel. */
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Display face — heavy italic extended grotesque with a motorsport / sports-
 * broadcast feel. Used in Black Italic for all headlines.
 */
const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Jersey Terminal — Premium Sports Merchandise",
    template: "%s · Jersey Terminal",
  },
  description:
    "Premium sports merchandise for the UAE and international fans. Jerseys, kits, training wear, and limited editions.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${exo2.variable} h-full antialiased`}
    >
      <head>
        <link rel="preload" as="image" href="/bg/stadium-night.jpg" />
      </head>
      <body className="relative flex min-h-full w-full flex-col overflow-x-hidden bg-jt-black text-white">
        <SmoothScroll />
        <PageAtmosphere />
        <SiteHeader />
        <main className="relative z-10 w-full flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
        <CartDrawer />
      </body>
    </html>
  );
}
