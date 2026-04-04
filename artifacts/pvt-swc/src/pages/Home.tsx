import React from "react";
import { HeroSection } from "@/components/HeroSection";
import { ValueCoreSection } from "@/components/ValueCoreSection";
import { LatestPostsSection } from "@/components/LatestPostsSection";
import { ServicesSection } from "@/components/ServicesSection";
import { TopicsSection } from "@/components/TopicsSection";
import { AboutPersonSection } from "@/components/AboutPersonSection";
import { ProcessSection } from "@/components/ProcessSection";
import { CTASection } from "@/components/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ValueCoreSection />
      <LatestPostsSection />
      <ServicesSection />
      <TopicsSection />
      <AboutPersonSection />
      <ProcessSection />
      <CTASection />
    </>
  );
}
