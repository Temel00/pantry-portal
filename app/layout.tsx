import "./globals.css";
import type {Metadata} from "next";
import {Tilt_Neon} from "next/font/google";

const inter = Tilt_Neon({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Pantry Portal",
  description: "Created by Tyler Emel",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
