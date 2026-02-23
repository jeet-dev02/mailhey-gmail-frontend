import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gmail Clone",
  description: "A pixel-perfect Gmail clone for Mailhey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* WE REMOVED SIDEBAR AND HEADER FROM HERE */}
        {/* Now page.tsx has full control over the layout */}
        {children}
      </body>
    </html>
  );
}