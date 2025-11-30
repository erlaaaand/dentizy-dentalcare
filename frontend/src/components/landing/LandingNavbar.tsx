'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Calendar } from 'lucide-react';

export function LandingNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Layanan', href: '#layanan' },
        { name: 'Tentang', href: '#tentang' },
        { name: 'Dokter', href: '#dokter' },
        { name: 'Kontak', href: '#kontak' },
    ];

    return (
        <header className="glass fixed top-0 w-full z-50 transition-all duration-700 backdrop-blur-2xl bg-gradient-to-r from-slate-900/95 via-gray-800/90 to-slate-900/95 border-b border-white/30 shadow-2xl">
            <nav className="container mx-auto px-6 py-5">
                <div className="flex justify-between items-center">
                    {/* Enhanced Logo */}
                    <Link href="/" className="group relative flex items-center space-x-3 hover:scale-105 transition-all duration-500">
                        <div className="relative">
                            <div className="text-3xl animate-pulse group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl filter brightness-110">
                                <div className="w-14 h-14 aspect-square bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">
                                    D
                                </div>
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping shadow-lg"></div>
                        </div>
                        <div className="relative">
                            <span className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-cyan-200 group-hover:via-blue-300 group-hover:to-purple-300 transition-all duration-500 tracking-tight drop-shadow-sm">
                                Dentizy Dentalcare
                            </span>
                            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-70 transition-all duration-500 blur-sm shadow-lg"></div>
                        </div>
                    </Link>

                    {/* Enhanced Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-12">
                        {navLinks.map((link) => (
                            <Link key={link.name} href={link.href} className="group relative py-2 px-4">
                                <span className="text-white/95 hover:text-white font-semibold text-lg tracking-wide transition-colors duration-300 group-hover:text-cyan-200 drop-shadow-sm">
                                    {link.name}
                                </span>
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-300 to-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full shadow-md"></div>
                                <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 shadow-inner"></div>
                            </Link>
                        ))}
                    </div>

                    {/* Enhanced CTA Button */}
                    <Link href="#kontak" className="hidden lg:block group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/40 to-blue-400/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl scale-110 shadow-2xl"></div>
                        <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-cyan-400 hover:to-blue-500 hover:shadow-2xl hover:scale-105 transition-all duration-500 flex items-center gap-3 border-2 border-white/30 backdrop-blur-sm shadow-xl">
                            <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12 drop-shadow-sm" />
                            <span className="tracking-wide drop-shadow-sm">Buat Janji</span>
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping shadow-lg"></div>
                        </div>
                    </Link>

                    {/* Enhanced Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden relative group p-3 rounded-xl bg-slate-800/80 backdrop-blur-md border-2 border-white/30 hover:bg-slate-700/90 transition-all duration-300 focus:outline-none shadow-xl"
                    >
                        <div className="relative">
                            {isMobileMenuOpen ? (
                                <X className="w-7 h-7 text-white group-hover:text-cyan-200 transition-colors duration-300 drop-shadow-sm" />
                            ) : (
                                <Menu className="w-7 h-7 text-white group-hover:text-cyan-200 transition-colors duration-300 drop-shadow-sm" />
                            )}
                            <div className="absolute inset-0 bg-cyan-300/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
                        </div>
                    </button>
                </div>

                {/* Enhanced Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden mt-6 pb-6 bg-slate-900/95 backdrop-blur-xl rounded-3xl border-2 border-white/20 shadow-2xl animate-in slide-in-from-top-5 duration-500">
                        <div className="px-8 py-6 space-y-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="group flex items-center justify-between py-4 px-4 rounded-2xl hover:bg-white/15 transition-all duration-300 shadow-sm hover:shadow-lg"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <span className="text-white/95 group-hover:text-cyan-200 font-semibold text-lg tracking-wide transition-colors duration-300 drop-shadow-sm">
                                        {link.name}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-white/70 group-hover:text-cyan-200 group-hover:translate-x-1 transition-all duration-300 drop-shadow-sm">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                    </svg>
                                </Link>
                            ))}

                            {/* Mobile CTA Button */}
                            <div className="pt-4 mt-6 border-t border-white/20">
                                <Link
                                    href="#kontak"
                                    className="group relative overflow-hidden flex items-center justify-center gap-3 w-full"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/40 to-blue-400/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md scale-105 shadow-2xl"></div>
                                    <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-cyan-400 hover:to-blue-500 w-full text-center transition-all duration-500 flex items-center justify-center gap-3 border-2 border-white/30 shadow-xl">
                                        <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
                                        <span className="drop-shadow-sm">Buat Janji</span>
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping shadow-lg"></div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}