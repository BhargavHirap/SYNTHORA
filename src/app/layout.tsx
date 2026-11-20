import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SYNTHORA — Human Behaviour Simulation",
  description: "Explore possible human responses with transparent synthetic population simulations.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
