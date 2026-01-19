// frontend/src/components/landing/services/ServicesSection.tsx
import React from "react";
import { MessageIcon } from "../shared/Icons";
import { SectionHeader } from "../shared/SectionHeader";
import { BackgroundDecor } from "../shared/BackgroundDecor";
import { ServiceCard } from "./ServiceCard";

const services = [
  {
    title: "Pembersihan Karang Gigi",
    desc: "Scaling ultrasonic untuk menghilangkan plak dan karang gigi membandel, menjaga kesehatan gusi optimal dengan teknologi terdepan.",
    price: "Mulai Rp 150K",
    badge: "POPULER",
    badgeColor: "bg-emerald-500",
    features: ["Teknologi Ultrasonic Modern", "Konsultasi Gratis"],
    image:
      "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Restorasi Komposit Gigi",
    desc: "Prosedur penambalan gigi menggunakan resin komposit premium untuk mengembalikan fungsi dan estetika gigi secara optimal dan tahan lama.",
    price: "Mulai Rp 250K",
    badge: "PREMIUM",
    badgeColor: "bg-blue-500",
    features: ["Material Komposit Premium", "Garansi 2 Tahun"],
    image:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Pemasangan Kawat Gigi",
    desc: "Solusi untuk merapikan susunan gigi dan memperbaiki struktur rahang dengan pilihan behel metal, keramik, atau transparan.",
    price: "Konsultasi",
    badge: "SPESIALIS",
    badgeColor: "bg-blue-600",
    features: ["Konsultasi Ortodontis", "Pilihan Material Terlengkap"],
    image:
      "https://images.unsplash.com/photo-1609840114035-3c981960e833?auto=format&fit=crop&w=800&q=80",
  },
];

export function ServicesSection() {
  return (
    <section
      id="layanan"
      className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-white relative overflow-hidden"
    >
      <BackgroundDecor />

      <div className="container mx-auto px-6 relative z-10">
        <SectionHeader
          title="Layanan"
          highlight="Unggulan"
          description="Solusi lengkap untuk segala kebutuhan kesehatan gigi Anda dengan teknologi terdepan dan pelayanan terpercaya"
        />

        {/* Stats Row */}
        <div className="flex justify-center items-center space-x-8 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">15+</div>
            <div className="text-sm text-gray-600">Jenis Layanan</div>
          </div>
          <div className="w-px h-12 bg-gray-300" />
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">24/7</div>
            <div className="text-sm text-gray-600">Konsultasi Online</div>
          </div>
          <div className="w-px h-12 bg-gray-300" />
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">100%</div>
            <div className="text-sm text-gray-600">Steril & Aman</div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, idx) => (
            <ServiceCard key={idx} service={service} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white" />
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full border-2 border-white" />
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full border-2 border-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-800">
                Ada pertanyaan tentang layanan?
              </div>
              <div className="text-sm text-gray-600">
                Tim ahli kami siap membantu Anda
              </div>
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2">
              <MessageIcon />
              Konsultasi Gratis
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

