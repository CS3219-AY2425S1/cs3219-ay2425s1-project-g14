import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import ThemeProvider from "./theme-provider";

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
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
