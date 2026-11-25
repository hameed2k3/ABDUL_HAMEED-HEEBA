import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { invitation } from "@/config/invitation";
import "./reference.css";
import "./globals.css";

const referenceFont = localFont({
  src: [
    { path: "../fonts/source-sans.woff", weight: "400", style: "normal" },
    { path: "../fonts/beau-rivage.woff", weight: "800", style: "normal" },
  ],
  variable: "--font-reference",
  display: "swap",
});

const invitationFont = localFont({
  src: [
    { path: "../fonts/gt-super.woff", weight: "100", style: "normal" },
    { path: "../fonts/imperial-script.woff", weight: "300", style: "normal" },
    { path: "../fonts/artica.woff", weight: "400", style: "normal" },
    { path: "../fonts/ovo.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-invitation",
  display: "swap",
});

const envelopeFont = localFont({
  src: "../fonts/cinzel.woff2",
  variable: "--font-envelope",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")),
  title: `${invitation.couple.first} & ${invitation.couple.second} | ${invitation.title}`,
  description: `Join ${invitation.couple.first} and ${invitation.couple.second} for their Reception, Nikah and Walima on ${invitation.fullDate} in ${invitation.hometown}. View the celebration schedule and venue maps.`,
  openGraph: {
    title: `${invitation.couple.first} & ${invitation.couple.second}`,
    description: "Two souls. One destiny. A lifetime written by Allah.",
    type: "website",
  },
  icons: { icon: "/icon.svg" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f9f0e0",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${referenceFont.variable} ${invitationFont.variable} ${envelopeFont.variable}`}>
      <body className="t-body">{children}</body>
    </html>
  );
}
