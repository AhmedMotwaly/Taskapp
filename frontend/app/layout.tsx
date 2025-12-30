import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import CookieConsent from "@/components/cookie-consent"; // Uncomment if you have this component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoBuy Guard",
  description: "Track prices. Beat restocks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen text-foreground antialiased`}>
        {children}
        {/* <CookieConsent /> */} 
      </body>
    </html>
  );
}