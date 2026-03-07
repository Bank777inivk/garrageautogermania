import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const VerticalAd = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentCar, setCurrentCar] = useState(0);

    const cars = [
        "https://freepngimg.com/save/31533-bmw-transparent-image/1050x524", // BMW White 
        "https://www.webpmart.com/files/10/Mercedes-Benz-G-Class-PNG-Transparent-Image.webp", // G-Class White
        "https://www.webpall.com/wp-content/uploads/12/Audi-RS6-PNG-Clipart.webp" // Audi RS6 White
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentCar((prev) => (prev + 1) % cars.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 group cursor-pointer flex flex-col h-[550px]"
            onClick={() => navigate('/catalogue')}
        >
            {/* Top Banner: Emerald Green */}
            <div className="bg-[#009966] p-8 pb-12 relative overflow-hidden flex-shrink-0">
                <div className="relative z-10">
                    <h3 className="text-white text-2xl font-black font-montserrat leading-tight uppercase tracking-tight mb-4">
                        <span className="bg-black/20 px-2 py-0.5 inline-block mb-1">{t('ad.benefit', 'BÉNÉFICIEZ DE')}</span><br />
                        <span className="text-4xl">{t('ad.discount', 'JUSQU\'À 12%')}</span><br />
                        <span className="bg-black/20 px-2 py-0.5 inline-block mt-1">{t('ad.reason', 'DE RÉDUCTION')}</span>
                    </h3>
                    <p className="text-white/90 text-xs font-bold uppercase tracking-[0.2em]">
                        {t('ad.condition', 'GRÂCE AU PRÉ-PAIEMENT')}
                    </p>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Middle Section: Car Slider */}
            <div className="flex-grow bg-white flex items-center justify-center p-4 relative overflow-hidden">
                {cars.map((car, index) => (
                    <img
                        key={index}
                        src={car}
                        alt="Car Promo"
                        className={`absolute w-[120%] h-auto object-contain transition-all duration-1000 ease-in-out transform ${index === currentCar
                            ? 'opacity-100 translate-x-0 rotate-0'
                            : 'opacity-0 translate-x-full rotate-6'
                            }`}
                    />
                ))}
            </div>

            {/* Bottom Section: Call to Action */}
            <div className="p-8 pt-0 bg-white">
                <div className="bg-[#009966] text-white py-4 px-6 rounded-lg font-black text-xs uppercase tracking-widest flex items-center justify-between group-hover:bg-slate-900 transition-colors shadow-lg active:scale-95">
                    {t('ad.cta', 'RÉSERVEZ DÈS MAINTENANT')}
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>

                <p className="text-[9px] text-slate-400 font-bold mt-4 italic leading-tight">
                    * {t('ad.disclaimer', 'Les conditions générales de vente standard s\'appliquent.')}
                </p>
            </div>
        </div>
    );
};

export default VerticalAd;
