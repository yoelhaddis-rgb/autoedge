import type { Metadata } from "next";
import { DM_Sans, Outfit, Bebas_Neue } from "next/font/google";
import "@/app/globals.css";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap"
});

const headingFont = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap"
});

const displayFont = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap"
});

export const metadata: Metadata = {
  title: "AutoEdge | Dealer Deal Intelligence",
  description:
    "AutoEdge helps car dealers discover underpriced vehicles, analyze margin opportunities, and move before competitors."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable} ${displayFont.variable} antialiased`}>{children}</body>
    </html>
  );
}
