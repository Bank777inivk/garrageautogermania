import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useBrands from '@shared/hooks/useBrands';
import BrandSelect from '@shared/components/BrandSelect';

const SearchBar = ({ className = "" }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [type, setType] = useState('');
    const { brands, brandCounts } = useBrands();

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (brand) params.append('brand', brand);
        if (model) params.append('model', model);
        if (type) params.append('type', type);
        navigate(`/catalogue?${params.toString()}`);
    };

    return (
        <div className={`bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl max-w-4xl border border-white/20 ${className}`}>
            <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-2">

                <div className="flex-1 bg-slate-50/50 p-4 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('search.type', 'Type de véhicule')}</label>
                    <select
                        className="w-full bg-transparent border-none p-0 text-slate-900 font-bold focus:ring-0 outline-none cursor-pointer appearance-none"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="">Tous les types</option>
                        <option value="Berline">Berline</option>
                        <option value="SUV">SUV</option>
                        <option value="Break">Break</option>
                        <option value="Coupé">Coupé</option>
                        <option value="Cabriolet">Cabriolet</option>
                        <option value="Compacte">Compacte</option>
                        <option value="Citadine">Citadine</option>
                        <option value="Van">Van / Monospace</option>
                    </select>
                </div>

                <div className="flex-1 bg-slate-50/50 p-4 rounded-xl border border-transparent hover:border-slate-200 transition-all flex flex-col justify-center">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 z-10">{t('search.brand', 'Marque')}</label>
                    <BrandSelect
                        brands={brands}
                        value={brand}
                        onChange={(name) => setBrand(name)}
                        placeholder={t('search.allBrands', 'Toutes les marques')}
                        allLabel={t('search.allBrands', 'Toutes les marques')}
                        vehicleCounts={brandCounts}
                        activeClassName="bg-slate-900 text-white border-slate-900"
                        className="w-full relative z-20 mt-1 shadow-none"
                    />
                </div>

                <div className="flex-1 bg-slate-50/50 p-4 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('search.model', 'Modèle')}</label>
                    <input
                        type="text"
                        placeholder={t('search.modelPlaceholder', 'Ex: Série 3, A4...')}
                        className="w-full bg-transparent border-none p-0 text-slate-900 font-bold focus:ring-0 outline-none placeholder:text-slate-300"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                    />
                </div>

                <div className="p-2">
                    <button
                        type="submit"
                        className="h-full lg:w-48 w-full bg-slate-900 hover:bg-amber-600 text-white font-black text-[11px] uppercase tracking-[0.2em] px-8 py-5 rounded-xl transition-all flex items-center justify-center shadow-xl active:scale-95 group"
                    >
                        <Search size={18} className="mr-3 group-hover:scale-110 transition-transform" />
                        {t('search.button', 'Chercher')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SearchBar;
