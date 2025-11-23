'use client';

import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export function ContactSection() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Fitur ini hanya demo. Silakan login untuk melakukan reservasi.');
    };

    return (
        <section id="kontak" className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16">

                    {/* Info */}
                    <div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">Hubungi Kami</h2>
                        <p className="text-gray-600 mb-10 text-lg">
                            Siap untuk senyum baru Anda? Hubungi kami atau kunjungi klinik kami.
                        </p>

                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <MapPin />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Lokasi</h4>
                                    <p className="text-gray-600">Jl. Kesehatan Raya No. 123<br />Jakarta Selatan 12560</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <Phone />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Telepon / WA</h4>
                                    <p className="text-gray-600">(021) 123-4567<br />0812-3456-7890</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                    <Clock />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Jam Operasional</h4>
                                    <p className="text-gray-600">
                                        Senin - Sabtu: 09:00 - 21:00<br />
                                        Minggu: 10:00 - 15:00
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-lg">
                        <h3 className="text-2xl font-bold mb-6">Reservasi Cepat</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Nama Lengkap" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" required />
                                <input type="tel" placeholder="No. WhatsApp" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" required />
                            </div>
                            <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                            <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all">
                                <option value="">Pilih Layanan</option>
                                <option value="scaling">Scaling</option>
                                <option value="tambal">Tambal Gigi</option>
                                <option value="behel">Behel</option>
                            </select>
                            <textarea rows={4} placeholder="Keluhan / Pesan" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"></textarea>

                            <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                                Kirim Pesan
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </section>
    );
}