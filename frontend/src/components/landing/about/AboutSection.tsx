// frontend/src/components/landing/about/AboutSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  CheckIcon,
  AwardIcon,
  UsersIcon,
  ZapIcon,
  HeartIcon,
} from "../shared/Icons";
import { BackgroundDecor } from "../shared/BackgroundDecor";
import { ImageCarousel } from "./ImageCarousel";
import { FeatureCard } from "./FeatureCard";

const images = [
  {
    src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    desc: "Ruang praktek modern & steril",
  },
  {
    src: "https://images.unsplash.com/photo-1629909615184-74f495363b63?auto=format&fit=crop&w=800&q=80",
    desc: "Area konsultasi yang nyaman",
  },
  {
    src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
    desc: "Ruang perawatan premium",
  },
  {
    src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    desc: "Fasilitas medis terdepan",
  },
  {
    src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
    desc: "Area tunggu yang elegan",
  },
];

const features = [
  {
    Icon: CheckIcon,
    title: "Sertifikat ISO 9001:2015",
    desc: "Standar kualitas internasional terjamin",
  },
  {
    Icon: AwardIcon,
    title: "Garansi Perawatan",
    desc: "Jaminan kualitas hasil perawatan",
  },
  {
    Icon: ZapIcon,
    title: "Teknologi Canggih",
    desc: "Digital X-Ray & Intraoral Camera",
  },
  {
    Icon: UsersIcon,
    title: "Konsultasi Personal",
    desc: "Rencana perawatan sesuai kebutuhan Anda",
  },
];

export function AboutSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalImages = images.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalImages);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % totalImages);
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);

  return (
    <section
      id="tentang"
      className="py-24 bg-gradient-to-br from-white via-blue-50 to-gray-50 relative overflow-hidden"
    >
      <BackgroundDecor />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                <CheckIcon className="w-4 h-4 mr-2" />
                Terpercaya Sejak 2015
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
                Pengalaman
                <span className="relative inline-block mx-3">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">
                    8 Tahun
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full opacity-30" />
                </span>
                <br />
                Melayani
              </h2>
            </div>

            <div className="space-y-6">
              <p className="text-lg text-gray-600 leading-relaxed">
                Sejak 2015,{" "}
                <span className="font-semibold text-gray-800">
                  Klinik Gigi Sehat Senyum
                </span>{" "}
                telah menjadi pilihan utama keluarga Indonesia untuk perawatan
                gigi berkualitas premium. Kami bangga telah melayani lebih dari{" "}
                <span className="font-bold text-blue-600">1000+ pasien</span>{" "}
                dengan tingkat kepuasan{" "}
                <span className="font-bold text-emerald-600">99%</span>.
              </p>

              <blockquote className="relative p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-md">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                  <AwardIcon className="w-4 h-4 text-white" />
                </div>
                <p className="text-base text-gray-700 italic leading-relaxed pl-4">
                  Misi kami adalah memberikan pengalaman perawatan gigi yang
                  nyaman, modern, dan terpercaya, membangun kemitraan jangka
                  panjang dengan setiap pasien untuk mencapai senyuman sehat
                  seumur hidup.
                </p>
              </blockquote>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              {features.map((feature, idx) => (
                <FeatureCard key={idx} feature={feature} />
              ))}
            </div>
          </div>

          {/* Image Carousel */}
          <ImageCarousel
            images={images}
            currentIndex={currentIndex}
            onNext={nextImage}
            onPrev={prevImage}
            onSelectImage={setCurrentIndex}
          />
        </div>
      </div>
    </section>
  );
}

