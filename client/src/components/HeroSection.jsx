import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="relative h-[600px] md:h-[700px] flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2800&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-4xl">
          <div className="inline-block bg-red-700 text-white text-[10px] font-black px-4 py-1.5 mb-5 uppercase tracking-[0.2em] rounded-sm shadow-lg shadow-red-700/20">
            {t('hero.badge', 'Importation Premium')}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white font-montserrat leading-[1.1] mb-8 tracking-tight">
            {t('hero.title', 'Votre voiture de rêve,')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-800">
              {t('hero.subtitle', 'directement d\'Allemagne')}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl leading-relaxed font-medium">
            {t('hero.description', 'Nous sélectionnons, inspectons et importons pour vous les meilleurs véhicules premium. Transparence totale, garantie et livraison clé en main.')}
          </p>

          {/* Quick Search Bar */}
          <SearchBar />

          <div className="mt-8 flex items-center space-x-2 text-white/80 text-sm font-medium cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/catalogue')}>
            <span>{t('hero.viewAll', 'Voir tout le catalogue')}</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
