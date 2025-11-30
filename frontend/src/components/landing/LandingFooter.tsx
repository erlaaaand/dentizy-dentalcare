import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, MessageCircle, Facebook, Instagram } from 'lucide-react';

export function LandingFooter() {
    const navLinks = [
        { name: 'Layanan', href: '#layanan', icon: '📋' },
        { name: 'Tentang Kami', href: '#tentang', icon: 'ℹ️' },
        { name: 'Tim Dokter', href: '#dokter', icon: '👥' },
        { name: 'Kontak', href: '#kontak', icon: '📞' }
    ];

    return (
        <footer className="bg-black text-white">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-x-2 text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg" />
                            <span>Sehat Senyum</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            Klinik gigi terpercaya dengan teknologi modern dan pelayanan prima untuk keluarga Indonesia.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-6 h-6 fill-white" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-6 h-6 fill-white" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                                aria-label="WhatsApp"
                            >
                                <MessageCircle className="w-6 h-6 fill-white" />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-cyan-400">Navigasi</h3>
                        <ul className="space-y-3">
                            {navLinks.map((link, idx) => (
                                <li key={idx}>
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-x-3 text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300"
                                    >
                                        <span className="text-lg">{link.icon}</span>
                                        <span>{link.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-cyan-400">Hubungi Kami</h3>
                        <div className="space-y-4 text-gray-400">
                            <div className="flex items-start gap-x-3">
                                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                                <span>
                                    Jl. Kesehatan Raya No. 123<br />
                                    Jakarta Selatan 12560
                                </span>
                            </div>
                            <div className="flex items-start gap-x-3">
                                <Phone className="w-5 h-5 mt-1 flex-shrink-0" />
                                <span>(021) 123-4567</span>
                            </div>
                            <div className="flex items-start gap-x-3">
                                <MessageCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                                <span>WhatsApp: 0811-2345-678</span>
                            </div>
                            <div className="flex items-start gap-x-3">
                                <Mail className="w-5 h-5 mt-1 flex-shrink-0" />
                                <span>info@sehatsenyum.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                    <div className="text-gray-500 text-sm">
                        © 2025 Klinik Gigi Sehat Senyum. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}