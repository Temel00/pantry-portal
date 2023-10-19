"use client";
import Header from "@/components/header";
import Image from "next/image";

export default function Settings() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <Header page={2} />
      <h1 className="text-3xl text-main-black">Settings</h1>
    </main>
  );
}
