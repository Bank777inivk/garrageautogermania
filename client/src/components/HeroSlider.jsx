import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useBrands from '@shared/hooks/useBrands';
import BrandSelect from '@shared/components/BrandSelect';

const slides = [
  {
    id: 1,
    image: '/mercedes.png',
    title: 'hero.title1',
    subtitle: 'hero.subtitle1',
    badge: 'hero.badge'
  },
  {
    id: 2,
    image: '/bmw.png',
    title: 'hero.title2',
    subtitle: 'hero.subtitle2',
    badge: 'hero.badgeNew'
  },
  {
    id: 3,
    image: '/audi.png',
    title: 'hero.title3',
    subtitle: 'hero.subtitle3',
    badge: 'hero.badgeEco'
  }
];

const HeroSlider = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const { brands, brandCounts } = useBrands();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (brand) params.append('brand', brand);
    if (model) params.append('model', model);
    navigate(`/catalogue?${params.toString()}`);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Search Bar - Desktop Only */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hidden lg:block">
        <form onSubmit={handleSearch} className="flex gap-4 items-center">
          <div className="flex-1 border-r border-gray-200 pr-4 flex flex-col justify-center">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 z-10">{t('search.brand', 'Marque')}</label>
            <BrandSelect
              brands={brands}
              value={brand}
              onChange={(name) => setBrand(name)}
              placeholder={t('search.allBrands', 'Toutes les marques')}
              allLabel={t('search.allBrands', 'Toutes les marques')}
              vehicleCounts={brandCounts}
              activeClassName="bg-slate-900 text-white border-slate-900"
              className="w-full relative z-20 mt-1"
            />
          </div>

          <div className="flex-1 border-r border-gray-200 pr-4">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wider uppercase tracking-widest">{t('search.model', 'Modèle')}</label>
            <input
              type="text"
              placeholder={t('search.modelPlaceholder', 'Ex: Série 3, A4...')}
              className="w-full bg-transparent font-semibold text-gray-800 focus:outline-none placeholder-gray-300 text-sm"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-gray-900 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Search size={20} />
          </button>
        </form>
      </div>

      {/* Slider */}
      <div className="relative flex-grow rounded-lg overflow-hidden shadow-xl group">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transform hover:scale-105 transition-transform duration-[10s]"
              style={{ backgroundImage: `url('${slide.image}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent"></div>
            </div>

            <div className="absolute inset-0 flex items-center container mx-auto px-8 md:px-16">
              <div className="max-w-2xl text-white">
                <div className="inline-flex items-center bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 mb-5 uppercase tracking-[0.15em] rounded-full animate-fadeIn shadow-sm border border-red-600/40">
                  {t(slide.badge, 'Importation Premium')}
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-montserrat leading-tight mb-5 animate-slideUp tracking-tight drop-shadow-lg">
                  {t(slide.title, 'Votre voiture de rêve,')} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-yellow-400">
                    {t(slide.subtitle, "directement d'Allemagne")}
                  </span>
                </h2>
                <p className="text-sm md:text-base text-gray-300 mb-8 max-w-md animate-slideUp delay-100 hidden md:block leading-relaxed drop-shadow-md">
                  {t('hero.description', 'Nous sélectionnons, inspectons et importons pour vous les meilleurs véhicules premium. Transparence totale, garantie et livraison clé en main.')}
                </p>

                <button
                  onClick={() => navigate('/catalogue')}
                  className="btn-red-glow inline-flex items-center bg-white text-gray-900 hover:bg-gray-50 font-bold py-3.5 px-8 rounded-xl transition-all animate-slideUp delay-200 text-sm tracking-wide shadow-lg"
                >
                  {t('hero.cta', 'Voir les offres')}
                  <ChevronRight size={20} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        ))}



        {/* Dots Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${index === currentSlide ? 'bg-red-700 w-10 shadow-red-700/30' : 'bg-white/30 w-3 hover:bg-white/60'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
