import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Program the Adventure",
  description:
    "A child-friendly programming game where kids help Bloop the robot complete missions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
