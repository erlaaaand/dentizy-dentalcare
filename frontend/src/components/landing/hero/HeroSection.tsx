import React from "react";
import Link from "next/link";

const CalendarIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const EyeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const BackgroundDecor = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      className="absolute -top-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse"
      style={{ animationDuration: "4s" }}
    />
    <div
      className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl animate-pulse"
      style={{ animationDuration: "6s" }}
    />
    <div
      className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-100/20 rounded-full blur-2xl animate-pulse"
      style={{ animationDuration: "5s" }}
    />
  </div>
);

export default function HeroSection() {
  const smoothScrollTo = (e, targetId) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-white">
      <BackgroundDecor />

      <div className="container mx-auto px-6 lg:px-8 text-center relative z-10 max-w-6xl mt-20">
        {/* Main heading dengan animasi */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

        {/* Description dengan delay animasi */}
        <p
          className="text-lg sm:text-xl md:text-2xl mb-10 max-w-4xl mx-auto text-gray-600 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "150ms" }}
        >
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
        <div
          className="flex flex-wrap justify-center items-center gap-6 md:gap-8 mb-10 text-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "300ms" }}
        >
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
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "450ms" }}
        >
          <a
            href="#kontak"
            onClick={(e) => smoothScrollTo(e, "#kontak")}
            className="group w-full sm:w-auto cursor-pointer"
          >
            <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
              <CalendarIcon />
              <span>Reservasi Sekarang</span>
            </button>
          </a>

          <a
            href="#layanan"
            onClick={(e) => smoothScrollTo(e, "#layanan")}
            className="group w-full sm:w-auto cursor-pointer"
          >
            <button className="w-full sm:w-auto flex items-center justify-center gap-3 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 hover:scale-105 transition-all duration-300">
              <EyeIcon />
              <span>Lihat Layanan</span>
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}
