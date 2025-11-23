import React from 'react';

export function DoctorsSection() {
    return (
        <section id="dokter" className="py-24 bg-gray-900 text-white relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Tim Dokter <span className="text-cyan-400">Expert</span></h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Ditangani langsung oleh dokter spesialis berpengalaman dengan sertifikasi internasional.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Dokter 1 */}
                    <div className="group relative aspect-[4/5] rounded-3xl overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80"
                            alt="Dr. Budi"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                            <h3 className="text-2xl font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300">drg. Budi Santoso, Sp.BM</h3>
                            <p className="text-cyan-400 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">Spesialis Bedah Mulut</p>
                        </div>
                    </div>

                    {/* Dokter 2 */}
                    <div className="group relative aspect-[4/5] rounded-3xl overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80"
                            alt="Dr. Citra"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                            <h3 className="text-2xl font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300">drg. Citra Lestari, Sp.KG</h3>
                            <p className="text-cyan-400 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">Spesialis Konservasi Gigi</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}