// frontend/src/components/landing/hero/HeroSection.tsx
import React from "react";
import Link from "next/link";
import { CalendarIcon, EyeIcon } from "../shared/Icons";
import { BackgroundDecor } from "../shared/BackgroundDecor";

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-white">
      <BackgroundDecor />

      <div className="container mx-auto px-6 lg:px-8 text-center relative z-10 max-w-6xl mt-20">
        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-gray-800">
          <span className="block">
            Senyum
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">
              {" "}
              Sehat
            </span>
          </span>
          <span className="block">
            Hidup
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              {" "}
              Bahagia
            </span>
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-4xl mx-auto text-gray-600 leading-relaxed">
          Wujudkan senyum impian Anda dengan
          <span className="font-semibold text-blue-600">
            {" "}
            teknologi terdepan
          </span>{" "}
          dan
          <span className="font-semibold text-blue-700">
            {" "}
            tim dokter profesional
          </span>
        </p>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 mb-10 text-gray-700">
          <div className="text-center">
            <div className="font-bold text-lg text-blue-600">5000+</div>
            <div className="text-xs text-gray-500">Pasien Puas</div>
          </div>
          <div className="w-px h-6 bg-gray-300" />
          <div className="text-center">
            <div className="font-bold text-lg text-blue-600">12+</div>
            <div className="text-xs text-gray-500">Tahun</div>
          </div>
          <div className="w-px h-6 bg-gray-300" />
          <div className="text-center">
            <div className="font-bold text-lg text-blue-600">24/7</div>
            <div className="text-xs text-gray-500">Layanan</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="#kontak" className="group w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all duration-300">
              <CalendarIcon />
              <span>Reservasi Sekarang</span>
            </button>
          </Link>

          <Link href="#layanan" className="group w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-3 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-all duration-300">
              <EyeIcon />
              <span>Lihat Layanan</span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
