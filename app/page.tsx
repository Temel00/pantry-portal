"use client";
import Auth from "@/components/auth";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-3xl">Pantry Portal</h1>
      <Auth />
    </main>
  );
}
