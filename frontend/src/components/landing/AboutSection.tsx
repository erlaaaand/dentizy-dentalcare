'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

const images = [
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80', // Ruang Praktek
    'https://images.unsplash.com/photo-1629909615184-74f495363b63?auto=format&fit=crop&w=800&q=80', // Alat
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80', // Waiting Room
];

export function AboutSection() {
    const [currentIdx, setCurrentIdx] = useState(0);

    const nextSlide = () => setCurrentIdx((prev) => (prev + 1) % images.length);
    const prevSlide = () => setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);

    // Auto play
    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="tentang" className="py-24 bg-slate-50 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Text Content */}
                    <div>
                        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
                            Terpercaya Sejak 2015
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            Kenyamanan Anda Adalah <span className="text-blue-600">Prioritas Kami</span>
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Dentizy Dentalcare hadir dengan konsep modern yang mengutamakan sterilitas dan kenyamanan.
                            Kami menggabungkan keahlian dokter spesialis dengan teknologi terkini.
                        </p>

                        <div className="space-y-4">
                            {[
                                'Sertifikasi ISO 9001:2015',
                                'Teknologi Digital X-Ray & 3D Imaging',
                                'Sterilisasi Alat Standar Rumah Sakit',
                                'Garansi Perawatan'
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    <span className="text-gray-700 font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Gallery / Carousel */}
                    <div className="relative group">
                        <div className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl">
                            {images.map((src, idx) => (
                                <div
                                    key={idx}
                                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentIdx ? 'opacity-100' : 'opacity-0'
                                        }`}
                                >
                                    <img
                                        src={src}
                                        alt={`Facility ${idx}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                            ))}

                            {/* Navigation */}
                            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/50 transition-all">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/50 transition-all">
                                <ChevronRight className="w-6 h-6" />
                            </button>

                            {/* Indicators */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIdx(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIdx ? 'w-6 bg-white' : 'bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hidden md:block animate-float">
                            <div className="text-3xl font-bold text-blue-600">99%</div>
                            <div className="text-sm text-gray-600">Tingkat Kepuasan</div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}