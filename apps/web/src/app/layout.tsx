import type { Metadata } from "next";
import { Big_Shoulders, Sora } from "next/font/google";
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
 * Display face — a bold athletic condensed grotesque. The optical-size axis
 * lets the browser pick the high-contrast "display" cut at headline sizes.
 */
const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
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
      className={`${sora.variable} ${bigShoulders.variable} h-full antialiased`}
    >
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
