import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import "@/app/globals.css";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap"
});

const headingFont = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
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
      <body className={`${bodyFont.variable} ${headingFont.variable} antialiased`}>{children}</body>
    </html>
  );
}
