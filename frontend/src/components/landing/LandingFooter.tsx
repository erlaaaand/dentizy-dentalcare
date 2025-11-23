import React from 'react';

export function LandingFooter() {
    return (
        <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Dentizy
                    </div>
                    <div className="text-gray-400 text-sm">
                        © 2025 Klinik Gigi Sehat Senyum. All rights reserved.
                    </div>
                    <div className="flex gap-4">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}