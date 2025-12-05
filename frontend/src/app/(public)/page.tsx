import React from "react";
import { LandingNavbar } from "@/components/landing/navbar/LandingNavbar";
import { HeroSection } from "@/components/landing/hero/HeroSection";
import { ServicesSection } from "@/components/landing/services/ServicesSection";
import { FeaturesSection } from "@/components/landing/features/FeaturesSection";
import { AboutSection } from "@/components/landing/about/AboutSection";
import { DoctorsSection } from "@/components/landing/doctors/DoctorsSection";
import { ContactSection } from "@/components/landing/contact-section/ContactSection";
import { LandingFooter } from "@/components/landing/footer/LandingFooter";

// Metadata khusus untuk landing page
export const metadata = {
  title: "Klinik Gigi Modern & Terpercaya",
  description:
    "Layanan kesehatan gigi premium dengan teknologi terkini dan dokter spesialis berpengalaman.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth">
      <LandingNavbar />

      <HeroSection />

      <ServicesSection />

      <FeaturesSection />

      <AboutSection />

      <DoctorsSection />

      <ContactSection />

      <LandingFooter />
    </main>
  );
}
