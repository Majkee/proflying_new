import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: {
    default: "ProFlying Academy",
    template: "%s | ProFlying Academy",
  },
  description: "System zarzadzania szkola pole dance",
  robots: { index: false, follow: false },
  openGraph: {
    title: "ProFlying Academy",
    description: "System zarzadzania szkola pole dance",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#9333ea" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
