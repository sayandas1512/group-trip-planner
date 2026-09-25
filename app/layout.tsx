import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Group Trip Planner",
  description: "Pick a trip your whole group actually commits to.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
