import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/Toaster";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Concert Ticket Booking",
  description: "Reserve your seat for free concerts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} h-full antialiased`}>
      <body className={`${roboto.className} min-h-full flex flex-col`}>
        <Toaster />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
