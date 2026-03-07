import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutGrid } from 'lucide-react';

const topBrands = [
    { name: 'Audi', slug: 'Audi', icon: '🚗' },
    { name: 'BMW', slug: 'BMW', icon: '🏎️' },
    { name: 'Mercedes', slug: 'Mercedes-Benz', icon: '💎' },
    { name: 'Porsche', slug: 'Porsche', icon: '⚡' },
    { name: 'VW', slug: 'Volkswagen', icon: '🚙' },
    { name: 'Land Rover', slug: 'Land-Rover', icon: '⛰️' },
    { name: 'Ferrari', slug: 'Ferrari', icon: '🐎' },
    { name: 'Tesla', slug: 'Tesla', icon: '🔌' },
];

const MobileCategories = () => {
    const { t } = useTranslation();

    return (
        <div className="lg:hidden w-full bg-white/80 backdrop-blur-md py-4 border-b border-slate-100 sticky top-16 z-40 overflow-hidden">
            <div className="flex items-center gap-3 px-4 mb-3">
                <div className="w-6 h-6 rounded-md bg-red-700 flex items-center justify-center shadow-lg shadow-red-700/20">
                    <LayoutGrid size={12} className="text-white" />
                </div>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
                    Explorer par marque
                </span>
            </div>

            <div className="flex overflow-x-auto overflow-y-hidden gap-3 px-4 pb-2 no-scrollbar scroll-smooth">
                {topBrands.map((brand) => (
                    <Link
                        key={brand.slug}
                        to={`/catalogue?brand=${brand.slug}`}
                        className="flex-shrink-0 flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-red-700/30 transition-all active:scale-95"
                    >
                        <span className="text-sm">{brand.icon}</span>
                        <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{brand.name}</span>
                    </Link>
                ))}
                <Link
                    to="/catalogue"
                    className="flex-shrink-0 flex items-center gap-2 bg-slate-900 px-4 py-2.5 rounded-xl text-white shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
                >
                    <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">Voir tout</span>
                </Link>
            </div>
        </div>
    );
};

export default MobileCategories;
