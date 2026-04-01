import React from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { AudienceSection } from "@/components/AudienceSection";
import { ValueSection } from "@/components/ValueSection";
import { ContentSection } from "@/components/ContentSection";
import { FeaturedSection } from "@/components/FeaturedSection";
import { PhilosophySection } from "@/components/PhilosophySection";
import { CommunitySection } from "@/components/CommunitySection";
import { LeadFormSection } from "@/components/LeadFormSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col w-full bg-background font-sans overflow-x-hidden">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <AudienceSection />
        <ValueSection />
        <ContentSection />
        <FeaturedSection />
        <PhilosophySection />
        <CommunitySection />
        <LeadFormSection />
      </main>
      <Footer />
    </div>
  );
}
