'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Award, Users, Heart, Zap } from 'lucide-react';

const images = [
    { src: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80', desc: 'Ruang praktek modern & steril' },
    { src: 'https://images.unsplash.com/photo-1629909615184-74f495363b63?auto=format&fit=crop&w=800&q=80', desc: 'Area konsultasi yang nyaman' },
    { src: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80', desc: 'Ruang perawatan premium' },
    { src: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80', desc: 'Fasilitas medis terdepan' },
    { src: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80', desc: 'Area tunggu yang elegan' }
];

const features = [
    { icon: CheckCircle, title: 'Sertifikat ISO 9001:2015', desc: 'Standar kualitas internasional terjamin', color: 'from-emerald-500 to-teal-500' },
    { icon: Award, title: 'Garansi Perawatan', desc: 'Jaminan kualitas hasil perawatan', color: 'from-blue-500 to-cyan-500' },
    { icon: Zap, title: 'Teknologi Canggih', desc: 'Digital X-Ray & Intraoral Camera', color: 'from-purple-500 to-pink-500' },
    { icon: Users, title: 'Konsultasi Personal', desc: 'Rencana perawatan sesuai kebutuhan Anda', color: 'from-orange-500 to-amber-500' }
];

export function AboutSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalImages = images.length;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalImages);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const nextImage = () => setCurrentIndex((prev) => (prev + 1) % totalImages);
    const prevImage = () => setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);

    return (
        <section id="tentang" className="py-24 bg-gradient-to-br from-slate-50 via-white to-cyan-50 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-200/30 to-blue-300/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-teal-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400/40 rounded-full animate-ping" />
                <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400/30 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-emerald-400/40 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-20 right-1/4 w-4 h-4 bg-blue-400/20 rounded-full animate-ping" style={{ animationDelay: '3s' }} />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Content Section */}
                    <div className="space-y-8 group">
                        <div className="space-y-4">
                            <div className="inline-flex items-center px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold mb-4 shadow-sm">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Terpercaya Sejak 2015
                            </div>

                            <h2 className="text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                                Pengalaman
                                <span className="relative inline-block mx-3">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-pulse">8 Tahun</span>
                                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full opacity-30" />
                                </span>
                                <br />Melayani
                            </h2>
                        </div>

                        <div className="space-y-6">
                            <p className="text-xl text-gray-600 leading-relaxed font-light">
                                Sejak 2015, <span className="font-semibold text-gray-800">Klinik Gigi Sehat Senyum</span> telah menjadi pilihan utama keluarga Indonesia untuk perawatan gigi berkualitas premium. Kami bangga telah melayani lebih dari <span className="font-bold text-cyan-600">1000+ pasien</span> dengan tingkat kepuasan <span className="font-bold text-emerald-600">99%</span>.
                            </p>

                            <blockquote className="relative p-6 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl shadow-lg">
                                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                                    <Award className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-lg text-gray-700 italic font-medium leading-relaxed pl-4">
                                    "Misi kami adalah memberikan pengalaman perawatan gigi yang nyaman, modern, dan terpercaya, membangun kemitraan jangka panjang dengan setiap pasien untuk mencapai senyuman sehat seumur hidup."
                                </p>
                            </blockquote>
                        </div>

                        {/* Features Grid */}
                        <div className="grid sm:grid-cols-2 gap-6 pt-4">
                            {features.map((feature, idx) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={idx} className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer">
                                        <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-800 text-lg mb-1">{feature.title}</div>
                                            <div className="text-gray-600">{feature.desc}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="relative">
                        {/* Main Image Container */}
                        <div className="relative z-20 group">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-3xl">
                                {/* Image Carousel */}
                                <div className="relative w-full h-[500px] overflow-hidden">
                                    {images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className={`absolute inset-0 transition-opacity duration-700 ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                                        >
                                            <img
                                                src={img.src}
                                                alt={img.desc}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/40" />

                                    {/* Navigation Buttons */}
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-white/30 hover:scale-110 opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>

                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-white/30 hover:scale-110 opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>

                                    {/* Image Indicators */}
                                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
                                        {images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentIndex(idx)}
                                                className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 opacity-70 hover:opacity-100 ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Corner Stats */}
                                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                                        <div className="text-2xl font-bold text-gray-800">1000+</div>
                                        <div className="text-sm text-gray-600">Pasien Puas</div>
                                    </div>

                                    <div className="absolute top-6 right-6 bg-emerald-500/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg text-white">
                                        <div className="text-2xl font-bold">99%</div>
                                        <div className="text-sm opacity-90">Kepuasan</div>
                                    </div>

                                    {/* Bottom Badge */}
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-bold text-gray-800 text-lg">Fasilitas Premium</div>
                                                    <div className="text-gray-600">{images[currentIndex].desc}</div>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Decorative Elements */}
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-cyan-300/40 to-blue-400/40 rounded-full blur-2xl animate-pulse z-10" />
                        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-purple-300/30 to-pink-400/30 rounded-full blur-2xl animate-pulse z-10" style={{ animationDelay: '1s' }} />
                        <div className="absolute top-1/2 -right-4 w-20 h-20 bg-gradient-to-br from-emerald-300/30 to-teal-400/30 rounded-full blur-xl animate-pulse z-10" style={{ animationDelay: '2s' }} />

                        {/* Geometric Shapes */}
                        <div className="absolute -top-16 -left-16 w-8 h-8 border-4 border-cyan-400/30 rotate-45 animate-pulse z-10" />
                        <div className="absolute -bottom-12 -right-12 w-6 h-6 bg-purple-400/40 rotate-12 animate-pulse z-10" style={{ animationDelay: '1s' }} />
                        <div className="absolute top-1/4 -left-8 w-4 h-4 bg-emerald-400/50 rounded-full animate-ping z-10" style={{ animationDelay: '2s' }} />
                    </div>
                </div>
            </div>
        </section>
    );
}