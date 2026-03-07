import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import SidebarCategories from '../components/SidebarCategories';
import FeaturedVehicles from '../components/FeaturedVehicles';
import FeaturesSection from '../components/FeaturesSection';
import VerticalAd from '../components/VerticalAd';
import SecondaryAd from '../components/SecondaryAd';
import LogoCard from '../components/LogoCard';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

/* ── Scroll-reveal observer ── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useScrollReveal();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* COLONNE GAUCHE (1/4) - Passée en bas sur mobile */}
          <div className="w-full lg:w-1/4 space-y-8 flex-shrink-0 order-2 lg:order-1">
            {/* Filtres Avancés - Masqués sur mobile car redondants avec la recherche header */}
            <div className="hidden lg:block reveal-left">
              <SidebarCategories />
            </div>

            {/* Titre et Pub */}
            <div className="reveal-left bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
              <div className="p-6">
                <p className="text-[10px] font-black text-red-700 uppercase tracking-[0.2em] mb-3">
                  Sélection du moment
                </p>
                <h2 className="text-2xl font-black font-montserrat text-slate-900 mb-4 leading-tight uppercase tracking-tight">
                  Nos dernières <br />pépites
                  <span className="block h-1.5 w-16 bg-red-700 mt-3 rounded-full"></span>
                </h2>
              </div>

              {/* Image Pub Générée */}
              <div className="relative group overflow-hidden cursor-pointer" onClick={() => navigate('/catalogue')}>
                <img
                  src="/premium_car_ad_v2_1772795850000_1772805918746.webp"
                  alt="Premium Ad"
                  className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <span className="text-white font-black text-[10px] uppercase tracking-widest group-hover:text-red-500 transition-colors">Découvrir l'offre</span>
                </div>
              </div>
            </div>

            {/* Publicité Verticale (Remplissage de vide) */}
            <VerticalAd />
            <SecondaryAd />
            <div className="hidden lg:block">
              <LogoCard />
            </div>
          </div>

          {/* COLONNE DROITE (3/4) - Passée en haut sur mobile */}
          <div className="w-full lg:w-3/4 space-y-8 order-1 lg:order-2">
            {/* Hero Slider */}
            <div className="h-[400px] md:h-[600px] reveal rounded-2xl overflow-hidden shadow-2xl">
              <HeroSlider />
            </div>

            {/* Banner Horizontale Premium */}
            <div className="reveal bg-slate-900 rounded-2xl p-8 relative overflow-hidden group shadow-xl border border-red-700/20">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-white text-xl font-black font-montserrat uppercase tracking-tight mb-2">
                    L'Excellence <span className="text-red-600">Allemande</span> à votre portée
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Importation directe • Garantie Premium • Livraison France entière
                  </p>
                </div>
                <Link
                  to="/catalogue"
                  className="flex items-center gap-3 px-8 py-4 bg-red-700 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-xl hover:bg-white hover:text-slate-900 transition-all shadow-lg scale-100 hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  Explorer le stock
                  <ArrowRight size={16} />
                </Link>
              </div>
              {/* Decorative Gradient */}
              <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-red-700/10 to-transparent pointer-events-none"></div>
            </div>

            {/* Grille de Véhicules */}
            <div className="reveal">
              <FeaturedVehicles gridOnly={true} />
            </div>
          </div>

        </div>
      </div>

      <div className="reveal">
        <FeaturesSection />
      </div>
    </div>
  );
};

export default Home;
