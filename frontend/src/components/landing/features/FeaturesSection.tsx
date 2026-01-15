// frontend/src/components/landing/features/FeaturesSection.tsx
import React from "react";
import {
  ZapIcon,
  UsersIcon,
  HeartIcon,
  CheckIcon,
  AwardIcon,
  MessageIcon,
} from "../shared/Icons";
import { SectionHeader } from "../shared/SectionHeader";
import { BackgroundDecor } from "../shared/BackgroundDecor";
import { StatCard } from "../shared/StatCard";

const features = [
  {
    Icon: ZapIcon,
    title: "Teknologi Terdepan",
    desc: "Peralatan medis canggih dengan teknologi digital terkini untuk diagnosis yang akurat dan perawatan yang nyaman tanpa rasa sakit.",
    badge: "ADVANCED TECH",
    features: [
      "Digital X-Ray & 3D Imaging",
      "Intraoral Camera HD",
      "Laser Therapy System",
    ],
  },
  {
    Icon: UsersIcon,
    title: "Tim Ahli Berpengalaman",
    desc: "Dokter spesialis dengan sertifikasi internasional dan pengalaman puluhan tahun dalam menangani berbagai kasus dental.",
    badge: "EXPERT TEAM",
    features: [
      "Sertifikasi Internasional",
      "15+ Tahun Pengalaman",
      "Spesialisasi Lengkap",
    ],
  },
  {
    Icon: HeartIcon,
    title: "Pelayanan Personal",
    desc: "Suasana klinik yang nyaman seperti rumah dengan pelayanan yang ramah dan personal untuk setiap pasien.",
    badge: "PERSONAL CARE",
    features: [
      "Konsultasi One-on-One",
      "Follow-up Berkala",
      "Fleksibilitas Jadwal",
    ],
  },
];

const stats = [
  {
    icon: <CheckIcon className="w-7 h-7 text-white" />,
    value: "1000+",
    label: "Pasien Terlayani",
  },
  {
    icon: <AwardIcon className="w-7 h-7 text-white" />,
    value: "99%",
    label: "Tingkat Kepuasan",
  },
  {
    icon: (
      <svg
        className="w-7 h-7 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    value: "8+",
    label: "Tahun Pengalaman",
  },
  {
    icon: (
      <svg
        className="w-7 h-7 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    value: "24/7",
    label: "Support Online",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      <BackgroundDecor />

      <div className="container mx-auto px-6 relative z-10">
        <SectionHeader
          title="Mengapa"
          highlight="Memilih Kami?"
          description="Komitmen kami adalah memberikan pelayanan terbaik dengan teknologi terdepan dan pendekatan yang personal untuk setiap pasien"
          badge="Keunggulan Terbaik"
        />

        {/* Trust Indicators */}
        <div className="flex justify-center items-center space-x-8 mb-16">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">ISO</div>
            <div className="text-xs text-gray-600">Certified</div>
          </div>
          <div className="w-px h-8 bg-gray-300" />
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">8+</div>
            <div className="text-xs text-gray-600">Tahun</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} index={idx} />
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {stats.map((stat, idx) => (
              <StatCard
                key={idx}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </div>

          <div className="pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-6">
              Siap merasakan perbedaan pelayanan dental care premium?
            </p>
            <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all duration-300">
              <MessageIcon className="w-5 h-5 mr-2" />
              Konsultasi Gratis Sekarang
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// frontend/src/components/landing/features/FeatureCard.tsx
interface FeatureCardProps {
  feature: {
    Icon: React.ComponentType<{ className?: string }>;
    title: string;
    desc: string;
    badge: string;
    features: string[];
  };
  index: number;
}

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const { Icon, title, desc, badge, features } = feature;

  const bgColors = [
    "from-blue-50 to-blue-100",
    "from-blue-100 to-blue-200",
    "from-blue-50 to-blue-100",
  ];

  return (
    <div
      className={`group bg-gradient-to-br ${bgColors[index]} p-8 rounded-2xl border border-blue-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300`}
    >
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-8 h-8 text-white" />
        </div>

        <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
          {badge}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>

        <p className="text-gray-600 leading-relaxed mb-6">{desc}</p>

        <div className="space-y-3">
          {features.map((item, i) => (
            <div key={i} className="flex items-center text-sm text-gray-600">
              <CheckIcon className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
