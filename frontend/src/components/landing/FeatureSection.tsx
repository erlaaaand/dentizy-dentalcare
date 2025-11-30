import React from 'react';
import { Zap, Users, Heart, Award, CheckCircle, MessageCircle, Clock, Shield } from 'lucide-react';

const features = [
    {
        icon: Zap,
        title: 'Teknologi Terdepan',
        desc: 'Peralatan medis canggih dengan teknologi digital terkini untuk diagnosis yang akurat dan perawatan yang nyaman tanpa rasa sakit.',
        badge: 'ADVANCED TECH',
        color: 'from-cyan-500 to-blue-500',
        features: [
            'Digital X-Ray & 3D Imaging',
            'Intraoral Camera HD',
            'Laser Therapy System'
        ]
    },
    {
        icon: Users,
        title: 'Tim Ahli Berpengalaman',
        desc: 'Dokter spesialis dengan sertifikasi internasional dan pengalaman puluhan tahun dalam menangani berbagai kasus dental.',
        badge: 'EXPERT TEAM',
        color: 'from-purple-500 to-pink-500',
        features: [
            'Sertifikasi Internasional',
            '15+ Tahun Pengalaman',
            'Spesialisasi Lengkap'
        ]
    },
    {
        icon: Heart,
        title: 'Pelayanan Personal',
        desc: 'Suasana klinik yang nyaman seperti rumah dengan pelayanan yang ramah dan personal untuk setiap pasien.',
        badge: 'PERSONAL CARE',
        color: 'from-emerald-500 to-teal-500',
        features: [
            'Konsultasi One-on-One',
            'Follow-up Berkala',
            'Fleksibilitas Jadwal'
        ]
    }
];

const stats = [
    { icon: CheckCircle, value: '1000+', label: 'Pasien Terlayani', color: 'from-cyan-500 to-blue-500' },
    { icon: Award, value: '99%', label: 'Tingkat Kepuasan', color: 'from-purple-500 to-pink-500' },
    { icon: Clock, value: '8+', label: 'Tahun Pengalaman', color: 'from-emerald-500 to-teal-500' },
    { icon: Shield, value: '24/7', label: 'Support Online', color: 'from-orange-500 to-amber-500' }
];

export function FeaturesSection() {
    return (
        <section className="py-24 bg-gradient-to-br from-white via-gray-50 to-slate-100 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-br from-cyan-200/20 to-blue-300/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-br from-purple-200/15 to-pink-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/4 right-1/3 w-48 h-48 bg-gradient-to-br from-emerald-200/15 to-teal-300/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-gradient-to-br from-orange-200/20 to-amber-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-16 left-10 w-3 h-3 bg-cyan-400/40 rounded-full animate-ping" />
                <div className="absolute top-24 right-16 w-4 h-4 border-2 border-purple-400/30 rotate-45 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-32 left-1/5 w-2 h-2 bg-emerald-400/50 animate-ping" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-20 right-1/4 w-5 h-5 bg-pink-400/30 rotate-12 animate-pulse" style={{ animationDelay: '1.5s' }} />
                <div className="absolute top-1/2 right-12 w-3 h-3 bg-blue-500/40 rounded-full animate-ping" style={{ animationDelay: '3s' }} />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Enhanced Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 rounded-full text-sm font-semibold mb-6 shadow-lg border border-gray-200">
                        <Zap className="w-5 h-5 mr-2" />
                        Keunggulan Terbaik
                    </div>

                    <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                        Mengapa
                        <span className="relative inline-block mx-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500">Memilih</span>
                            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 rounded-full opacity-40" />
                        </span>
                        Kami?
                    </h2>

                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light mb-8">
                        Komitmen kami adalah memberikan pelayanan terbaik dengan teknologi terdepan dan pendekatan yang personal untuk setiap pasien
                    </p>

                    {/* Trust Indicators */}
                    <div className="flex justify-center items-center space-x-8 mt-8">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-600">ISO</div>
                            <div className="text-xs text-gray-600">Certified</div>
                        </div>
                        <div className="w-px h-8 bg-gray-300" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-600">8+</div>
                            <div className="text-xs text-gray-600">Tahun</div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={idx}
                                className="group relative bg-gradient-to-br from-cyan-50/80 via-blue-50/60 to-cyan-100/40 backdrop-blur-sm p-8 rounded-3xl border border-cyan-200/50 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-4 transition-all duration-700 overflow-hidden"
                                style={{
                                    background: idx === 0 ? 'linear-gradient(to bottom right, rgba(207, 250, 254, 0.8), rgba(224, 242, 254, 0.6), rgba(207, 250, 254, 0.4))' :
                                        idx === 1 ? 'linear-gradient(to bottom right, rgba(250, 232, 255, 0.8), rgba(252, 231, 243, 0.6), rgba(250, 232, 255, 0.4))' :
                                            'linear-gradient(to bottom right, rgba(236, 253, 245, 0.8), rgba(240, 253, 250, 0.6), rgba(236, 253, 245, 0.4))'
                                }}
                            >
                                {/* Background Pattern */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />

                                {/* Icon Container */}
                                <div className="relative z-10 mb-8">
                                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all duration-500 group-hover:rotate-3`}>
                                        <Icon className="w-10 h-10 text-white" />
                                    </div>

                                    {/* Badge */}
                                    <div className={`inline-flex items-center px-3 py-1 bg-gradient-to-r ${feature.color} bg-opacity-10 text-${idx === 0 ? 'cyan' : idx === 1 ? 'purple' : 'emerald'}-700 rounded-full text-xs font-semibold`}>
                                        <div className={`w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full mr-2 animate-pulse`} />
                                        {feature.badge}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <h3 className={`text-2xl font-bold text-gray-800 mb-4 group-hover:bg-gradient-to-r ${feature.color} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        {feature.desc}
                                    </p>

                                    {/* Features List */}
                                    <div className="space-y-3">
                                        {feature.features.map((item, i) => (
                                            <div key={i} className="flex items-center text-sm text-gray-600">
                                                <CheckCircle className={`w-4 h-4 mr-3 text-${idx === 0 ? 'cyan' : idx === 1 ? 'purple' : 'emerald'}-500`} />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Stats Section */}
                <div className="mt-20 text-center">
                    <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-gray-200/50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {stats.map((stat, idx) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={idx} className="text-center">
                                        <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</div>
                                        <div className="text-gray-600">{stat.label}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Call to Action */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <p className="text-gray-600 mb-6">Siap merasakan perbedaan pelayanan dental care premium?</p>
                            <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 text-white font-semibold rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300">
                                <MessageCircle className="w-5 h-5 mr-2" />
                                Konsultasi Gratis Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}