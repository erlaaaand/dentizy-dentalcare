// frontend/src/components/landing/doctors/DoctorsSection.tsx
import React from "react";

const doctors = [
  {
    name: "drg. Budi Santoso",
    title: "Dokter Gigi Umum",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "drg. Citra Lestari, Sp.KG",
    title: "Spesialis Konservasi Gigi",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80",
  },
];

export function DoctorsSection() {
  return (
    <section
      id="dokter"
      className="py-20 bg-gradient-to-br from-gray-900 to-slate-900 text-white relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tim Dokter <span className="text-blue-400">Expert</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Dokter spesialis dengan sertifikasi internasional dan pengalaman
            puluhan tahun
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:max-w-4xl lg:mx-auto">
          {doctors.map((doctor, idx) => (
            <div
              key={idx}
              className="group relative aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-xl"
            >
              <img
                src={doctor.image}
                alt={doctor.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {doctor.name}
                  </h3>
                  {doctor.title && (
                    <p className="text-blue-300">{doctor.title}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
