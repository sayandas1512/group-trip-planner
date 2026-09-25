import "./globals.css";
import { ReactNode } from "react";
import Link from "next/link";
import { Poppins, Inter } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata = {
  title: "SortMyHoliday",
  description: "Pick a trip your whole group actually commits to.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.variable}`}>
        <header className="site-header">
          <Link href="/" className="site-logo">
            🧭 SortMyHoliday
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
