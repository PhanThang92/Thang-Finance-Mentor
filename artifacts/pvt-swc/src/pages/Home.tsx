import React from "react";
import { HeroSection } from "@/components/HeroSection";
import { ValueCoreSection } from "@/components/ValueCoreSection";
import { LatestPostsSection } from "@/components/LatestPostsSection";
import { ServicesSection } from "@/components/ServicesSection";
import { TopicsSection } from "@/components/TopicsSection";
import { YoutubeSection } from "@/components/YoutubeSection";
import { AboutPersonSection } from "@/components/AboutPersonSection";
import { CTASection } from "@/components/CTASection";
import { LeadFormSection } from "@/components/LeadFormSection";
import { useSeoMeta } from "@/hooks/useSeoMeta";

export default function Home() {
  useSeoMeta({
    title: "Tư duy tài chính thực chiến",
    description: "Hành trình từ kiểm soát dòng tiền đến xây dựng tài sản bền vững. Tài chính cá nhân, đầu tư có kỷ luật, hệ sinh thái tri thức thực chiến.",
    ogImage: "/opengraph.jpg",
    ogType:  "website",
  });

  return (
    <>
      <HeroSection />
      <ValueCoreSection />
      <LatestPostsSection />
      <ServicesSection />
      <TopicsSection />
      <YoutubeSection />
      <AboutPersonSection />
      <CTASection />
      <LeadFormSection />
    </>
  );
}
