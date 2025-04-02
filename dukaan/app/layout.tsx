import type { Metadata } from "next";
import { Geist, Geist_Mono, Raleway } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "S-Dukaan",
  description: "Buy stuff. Sell stuff. Simple as that. Skibidi.",
};
import { Toaster } from "@/components/ui/sonner"
import { CartProvider } from '@/context/cart';
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${raleway.variable} antialiased bg-[#f7f7f7]  flex justify-center`}
      >
        <CartProvider>
        {children}
        </CartProvider>
        
        <Toaster />
      </body>
    </html>
  );
}
