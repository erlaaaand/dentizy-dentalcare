import React from 'react';
import Link from 'next/link';

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Background Decorations */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse" />
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-30 animate-pulse delay-700" />

            <div className="container mx-auto px-6 text-center relative z-10">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight text-gray-900 tracking-tight">
                    Senyum <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Sehat</span>
                    <br />
                    Hidup <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Bahagia</span>
                </h1>

                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Wujudkan senyum impian Anda dengan teknologi terdepan dan tim dokter profesional di Dentizy Dentalcare.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        href="#kontak"
                        className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                        Reservasi Sekarang
                    </Link>
                    <Link
                        href="#layanan"
                        className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:border-blue-200 hover:bg-blue-50 transition-all duration-300"
                    >
                        Lihat Layanan
                    </Link>
                </div>

                {/* Stats */}
                <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto border-t border-gray-200 pt-8">
                    <div>
                        <div className="text-3xl font-bold text-blue-600">5000+</div>
                        <div className="text-sm text-gray-500">Pasien Puas</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-purple-600">12+</div>
                        <div className="text-sm text-gray-500">Tahun Pengalaman</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-emerald-600">24/7</div>
                        <div className="text-sm text-gray-500">Support</div>
                    </div>
                </div>
            </div>
        </section>
    );
}