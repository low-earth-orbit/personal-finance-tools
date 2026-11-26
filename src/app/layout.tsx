import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Source_Sans_3 } from "next/font/google";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import Providers from "./providers";
import { SITE_URL } from "@/utils/site";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // icon.svg, favicon.ico, apple-icon.png and opengraph-image.png in this folder are picked up by
  // file convention and apply to every route.
  openGraph: { siteName: "Personal Finance", type: "website", locale: "en_CA" },
  twitter: { card: "summary_large_image" },
  // Hub canonical; every tool page sets its own.
  alternates: { canonical: "/" },
  title: {
    default: "Personal Finance: free calculators for Canadians",
    template: "%s | Personal Finance",
  },
  description:
    "Free, simple personal finance calculators for Canadians — compare renting vs buying, plan for retirement, and more.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps} className={sourceSans.variable}>
      <head>
        <ColorSchemeScript
          defaultColorScheme="auto"
          localStorageKey="personal-finance-color-scheme"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Personal Finance",
              url: SITE_URL,
            }),
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
