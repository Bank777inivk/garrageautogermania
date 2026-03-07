import React from 'react';

const LogoCard = () => {
    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 group">
            <div className="relative overflow-hidden h-64 flex items-center justify-center bg-slate-50">
                <img
                    src="/logo 6.png"
                    alt="Garrage Pro"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                {/* Subtle Overlay Decor */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent pointer-events-none"></div>
            </div>
            <div className="p-6 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                    Partenaire Officiel
                </p>
            </div>
        </div>
    );
};

export default LogoCard;
