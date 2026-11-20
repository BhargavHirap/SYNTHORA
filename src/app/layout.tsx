import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SYNTHORA — Scientific Intelligence Platform",
  description: "A research operating system for protocol design, evidence provenance, scientific benchmarking, simulation, validation and reproducibility.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
