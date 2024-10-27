import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";

export const metadata: Metadata = {
  title: "PeerPrep - One Stop Technical Interview Preparation",
  description: "Your choice for Technical Interview Preparation",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body>
    <Navbar />
    {children}
    </body>
    </html>
  );
}
