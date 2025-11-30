import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { DoctorsSection } from '@/components/landing/DoctorsSection';
import { ContactSection } from '@/components/landing/contact-section/ContactSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FeaturesSection } from '@/components/landing/FeatureSection';

// Metadata khusus untuk landing page
export const metadata = {
    title: 'Klinik Gigi Modern & Terpercaya',
    description: 'Layanan kesehatan gigi premium dengan teknologi terkini dan dokter spesialis berpengalaman.',
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