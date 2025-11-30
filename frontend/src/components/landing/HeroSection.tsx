import React from 'react';
import Link from 'next/link';
import { Calendar, Eye } from 'lucide-react';

export function HeroSection() {
    return (
        <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Subtle Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-32 right-16 w-40 h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '10s', animationDelay: '-2s' }} />
                <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full blur-xl animate-bounce" style={{ animationDuration: '6s', animationDelay: '-1s' }} />

                {/* Small decorative dots */}
                <div className="absolute top-24 right-20 w-3 h-3 bg-blue-300 rounded-full animate-pulse" />
                <div className="absolute bottom-20 left-20 w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '-1s' }} />
            </div>

            {/* Main Content Container */}
            <div className="container mx-auto px-6 lg:px-8 text-center relative z-10 max-w-6xl mt-20">
                {/* Main heading */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight text-gray-800">
                    <span className="block transform hover:scale-105 transition-transform duration-300">
                        Senyum
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600"> Sehat</span>
                    </span>
                    <span className="block transform hover:scale-105 transition-transform duration-300">
                        Hidup
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"> Bahagia</span>
                    </span>
                </h1>

                {/* Description */}
                <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-4xl mx-auto text-gray-600 font-medium leading-relaxed">
                    Wujudkan senyum impian Anda dengan
                    <span className="font-bold text-blue-600"> teknologi terdepan</span> dan
                    <span className="font-bold text-purple-600"> tim dokter profesional</span>
                </p>

                {/* Trust indicators */}
                <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 mb-10 text-gray-700">
                    <div className="text-center">
                        <div className="font-bold text-lg text-blue-600">5000+</div>
                        <div className="text-xs text-gray-500">Pasien Puas</div>
                    </div>

                    <div className="w-px h-6 bg-gray-300" />

                    <div className="text-center">
                        <div className="font-bold text-lg text-purple-600">12+</div>
                        <div className="text-xs text-gray-500">Tahun</div>
                    </div>

                    <div className="w-px h-6 bg-gray-300" />

                    <div className="text-center">
                        <div className="font-bold text-lg text-green-600">24/7</div>
                        <div className="text-xs text-gray-500">Layanan</div>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="#kontak" className="group w-full sm:w-auto">
                        <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-500 hover:to-purple-500 hover:scale-105 transition-all duration-300 shadow-lg">
                            <Calendar className="w-5 h-5" />
                            <span>Reservasi Sekarang</span>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        </div>
                    </Link>

                    <Link href="#layanan" className="group w-full sm:w-auto">
                        <div className="flex items-center justify-center gap-3 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 hover:border-gray-400 hover:scale-105 transition-all duration-300">
                            <Eye className="w-5 h-5" />
                            <span>Lihat Layanan</span>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}