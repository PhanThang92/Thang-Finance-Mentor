import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FloatingContactWidget } from "./FloatingContactWidget";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col w-full bg-background font-sans overflow-x-hidden">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingContactWidget />
    </div>
  );
}
