import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FitApp",
    template: "%s | FitApp",
  },
  description: "CRM для тренерів — управління клієнтами",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className={cn(
          "min-h-full flex flex-col text-foreground",
          process.env.NODE_ENV === "development" ? "bg-[#E4E4E7]" : "bg-[#FAFAFA]",
        )}
      >
        {children}
      </body>
    </html>
  );
}
