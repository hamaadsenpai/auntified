import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { Toaster } from "@/components/ui";
import { StoreHydration } from "@/store";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auntified",
  description: "Auntie Kumari reads your ledger and stops scams before they go.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`} suppressHydrationWarning>
      <body>
        <StoreHydration />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
