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
import { useSeoMeta, DEFAULT_OG_IMAGE_PATH } from "@/hooks/useSeoMeta";

export default function Home() {
  useSeoMeta({
    title:       "Tư duy tài chính thực chiến",
    description: "Hành trình từ kiểm soát dòng tiền đến xây dựng tài sản bền vững. Tư duy tài chính thực chiến, đầu tư có kỷ luật, tích sản dài hạn.",
    ogImage:     DEFAULT_OG_IMAGE_PATH,
    ogType:      "website",
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
