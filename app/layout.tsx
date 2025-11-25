import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Latency Topology Visualizer",
  description: "3D visualization of exchange server locations and latency data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

