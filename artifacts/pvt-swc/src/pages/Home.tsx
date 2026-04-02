import React from "react";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { AudienceSection } from "@/components/AudienceSection";
import { ValueSection } from "@/components/ValueSection";
import { ContentSection } from "@/components/ContentSection";
import { FeaturedSection } from "@/components/FeaturedSection";
import { PhilosophySection } from "@/components/PhilosophySection";
import { CommunitySection } from "@/components/CommunitySection";
import { LeadFormSection } from "@/components/LeadFormSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <AudienceSection />
      <ValueSection />
      <ContentSection />
      <FeaturedSection />
      <PhilosophySection />
      <CommunitySection />
      <LeadFormSection />
    </>
  );
}
