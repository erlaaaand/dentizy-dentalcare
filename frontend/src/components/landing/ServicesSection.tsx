import React from 'react';

const services = [
    {
        title: 'Scaling Gigi',
        desc: 'Pembersihan karang gigi dengan teknologi ultrasonic untuk nafas segar dan gusi sehat.',
        icon: '✨',
        price: 'Mulai Rp 150K',
        color: 'from-cyan-500 to-blue-500'
    },
    {
        title: 'Tambal Estetik',
        desc: 'Restorasi gigi berlubang dengan bahan komposit premium yang senada dengan warna gigi.',
        icon: '🦷',
        price: 'Mulai Rp 250K',
        color: 'from-purple-500 to-pink-500'
    },
    {
        title: 'Kawat Gigi',
        desc: 'Solusi merapikan gigi dengan berbagai pilihan braces: Metal, Ceramic, hingga Clear Aligner.',
        icon: '😁',
        price: 'Konsultasi',
        color: 'from-emerald-500 to-teal-500'
    }
];

export function ServicesSection() {
    return (
        <section id="layanan" className="py-24 bg-white relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Layanan Unggulan</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Solusi lengkap untuk kesehatan gigi Anda dengan standar medis internasional.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {services.map((service, idx) => (
                        <div key={idx} className="group relative p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.color} opacity-5 rounded-full blur-2xl group-hover:scale-150 transition-transform`} />

                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                {service.icon}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">{service.desc}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                    {service.price}
                                </span>
                                <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                    →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}