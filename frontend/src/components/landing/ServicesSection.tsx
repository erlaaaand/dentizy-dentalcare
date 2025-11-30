import React from 'react';
import { CheckCircle, Sparkles, Award, MessageCircle } from 'lucide-react';

const services = [
    {
        title: 'Pembersihan Karang Gigi',
        desc: 'Scaling ultrasonic untuk menghilangkan plak dan karang gigi membandel, menjaga kesehatan gusi optimal dengan teknologi terdepan.',
        price: 'Mulai Rp 150K',
        badge: 'POPULER',
        badgeColor: 'bg-emerald-500',
        gradient: 'from-cyan-500 to-blue-500',
        features: ['Teknologi Ultrasonic Modern', 'Konsultasi Gratis'],
        image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=800&q=80'
    },
    {
        title: 'Restorasi Komposit Gigi',
        desc: 'Prosedur penambalan gigi menggunakan resin komposit premium untuk mengembalikan fungsi dan estetika gigi secara optimal dan tahan lama.',
        price: 'Mulai Rp 250K',
        badge: 'PREMIUM',
        badgeColor: 'bg-blue-500',
        gradient: 'from-purple-500 to-pink-500',
        features: ['Material Komposit Premium', 'Garansi 2 Tahun'],
        image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80'
    },
    {
        title: 'Pemasangan Kawat Gigi',
        desc: 'Solusi untuk merapikan susunan gigi dan memperbaiki struktur rahang dengan pilihan behel metal, keramik, atau transparan.',
        price: 'Konsultasi',
        badge: 'SPESIALIS',
        badgeColor: 'bg-gradient-to-r from-orange-500 to-amber-500',
        gradient: 'from-emerald-500 to-teal-500',
        features: ['Konsultasi Ortodontis', 'Pilihan Material Terlengkap'],
        image: 'https://images.unsplash.com/photo-1609840114035-3c981960e833?auto=format&fit=crop&w=800&q=80'
    }
];

export function ServicesSection() {
    return (
        <section id="layanan" className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Enhanced Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-300/30 to-blue-400/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-teal-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-1/4 left-1/5 w-48 h-48 bg-gradient-to-br from-orange-200/25 to-amber-300/25 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
            </div>

            {/* Floating Geometric Shapes */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-16 w-4 h-4 bg-cyan-400/30 rotate-45 animate-ping" />
                <div className="absolute top-32 right-20 w-6 h-6 border-2 border-purple-400/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-emerald-400/40 animate-ping" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-28 right-1/3 w-5 h-5 bg-pink-400/30 rotate-12 animate-pulse" style={{ animationDelay: '1.5s' }} />
                <div className="absolute top-1/2 left-12 w-2 h-2 bg-blue-500/50 rounded-full animate-ping" style={{ animationDelay: '3s' }} />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Enhanced Header */}
                <div className="text-center mb-20">
                    <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                        Layanan
                        <span className="relative inline-block mx-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500">Unggulan</span>
                            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full opacity-40" />
                        </span>
                        Kami
                    </h2>

                    <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
                        Solusi lengkap untuk segala kebutuhan kesehatan gigi Anda dengan teknologi terdepan dan pelayanan terpercaya
                    </p>

                    {/* Stats Row */}
                    <div className="flex justify-center items-center space-x-8 mt-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-cyan-600">15+</div>
                            <div className="text-sm text-gray-600">Jenis Layanan</div>
                        </div>
                        <div className="w-px h-12 bg-gray-300" />
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">24/7</div>
                            <div className="text-sm text-gray-600">Konsultasi Online</div>
                        </div>
                        <div className="w-px h-12 bg-gray-300" />
                        <div className="text-center">
                            <div className="text-3xl font-bold text-emerald-600">100%</div>
                            <div className="text-sm text-gray-600">Steril & Aman</div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, idx) => (
                        <div key={idx} className="group relative bg-white/90 backdrop-blur-lg p-8 rounded-3xl border border-white/60 hover:bg-white hover:shadow-2xl hover:-translate-y-4 transition-all duration-700 overflow-hidden">
                            {/* Card Background Pattern */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.gradient} opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500`} />

                            {/* Image Container */}
                            <div className="relative mb-6 overflow-hidden rounded-2xl group-hover:scale-105 transition-transform duration-500">
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Image Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Price Badge */}
                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                                    <div className={`text-sm font-bold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>{service.price}</div>
                                </div>

                                {/* Quality Badge */}
                                <div className={`absolute top-4 right-4 ${service.badgeColor} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                                    {service.badge}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                                <div className="flex items-center mb-3">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className={`text-xl font-bold text-gray-800 group-hover:bg-gradient-to-r ${service.gradient} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                                        {service.title}
                                    </h3>
                                </div>

                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {service.desc}
                                </p>

                                {/* Features List */}
                                <div className="space-y-2 mb-6">
                                    {service.features.map((feature, i) => (
                                        <div key={i} className="flex items-center text-sm text-gray-600">
                                            <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                <button className={`w-full bg-gradient-to-r ${service.gradient} text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300`}>
                                    Buat Janji Temu
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA Section */}
                <div className="text-center mt-16">
                    <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg">
                        <div className="flex -space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full border-2 border-white" />
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-2 border-white" />
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full border-2 border-white" />
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-gray-800">Ada pertanyaan tentang layanan?</div>
                            <div className="text-sm text-gray-600">Tim ahli kami siap membantu Anda</div>
                        </div>
                        <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            Konsultasi Gratis
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}