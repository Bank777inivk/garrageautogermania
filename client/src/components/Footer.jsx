import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, Mail, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [openSections, setOpenSections] = useState({
    links: false,
    brands: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 lg:gap-y-12 gap-x-4 mb-16 text-center sm:text-left">
          {/* Company Info - Full width on mobile */}
          <div className="col-span-2 lg:col-span-1 flex flex-col items-center sm:items-start mb-4 lg:mb-0">
            <Link to="/" className="inline-block mb-6 group transition-transform hover:scale-105">
              <img
                src="/logo.webp"
                alt="Garrage Pro"
                className="h-12 md:h-14 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-xs sm:max-w-none">
              {t('footer.description', 'Spécialiste de l\'importation de véhicules premium depuis l\'Allemagne. Nous sélectionnons pour vous les meilleures offres du marché avec garantie et transparence.')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-slate-800 p-2.5 rounded-xl hover:bg-amber-600 transition-all hover:-translate-y-1 shadow-lg">
                <Facebook size={18} />
              </a>
              <a href="#" className="bg-slate-800 p-2.5 rounded-xl hover:bg-amber-600 transition-all hover:-translate-y-1 shadow-lg">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links - Collapsible on mobile */}
          <div className="col-span-2 sm:col-span-1 border-b border-slate-800/50 sm:border-none py-4 sm:py-0">
            <button
              onClick={() => toggleSection('links')}
              className="flex items-center justify-between w-full sm:cursor-default"
            >
              <h4 className="text-[10px] font-black font-montserrat uppercase tracking-[0.2em] text-white/90">
                {t('footer.quickLinks', 'Liens Rapides')}
              </h4>
              <div className="sm:hidden">
                {openSections.links ? <ChevronUp size={16} className="text-amber-600" /> : <ChevronDown size={16} className="text-gray-500" />}
              </div>
            </button>
            <ul className={`space-y-3 text-[12px] text-gray-400 font-medium mt-6 transition-all duration-300 overflow-hidden ${openSections.links ? 'max-h-60 opacity-100' : 'max-h-0 sm:max-h-none opacity-0 sm:opacity-100'}`}>
              <li><Link to="/" className="hover:text-amber-500 transition-colors inline-block py-1">{t('nav.home', 'Accueil')}</Link></li>
              <li><Link to="/catalogue" className="hover:text-amber-500 transition-colors inline-block py-1">{t('nav.catalogue', 'Catalogue')}</Link></li>
              <li><Link to="/a-propos" className="hover:text-amber-500 transition-colors inline-block py-1">{t('nav.about', 'À propos')}</Link></li>
              <li><Link to="/contact" className="hover:text-amber-500 transition-colors inline-block py-1">{t('nav.contact', 'Contact')}</Link></li>
              <li><Link to="/suivi-livraison" className="hover:text-amber-500 transition-colors inline-block py-1">Suivi</Link></li>
            </ul>
          </div>

          {/* Vehicle Categories - Collapsible on mobile */}
          <div className="col-span-2 sm:col-span-1 border-b border-slate-800/50 sm:border-none py-4 sm:py-0">
            <button
              onClick={() => toggleSection('brands')}
              className="flex items-center justify-between w-full sm:cursor-default"
            >
              <h4 className="text-[10px] font-black font-montserrat uppercase tracking-[0.2em] text-white/90">
                {t('footer.categories', 'Marques')}
              </h4>
              <div className="sm:hidden">
                {openSections.brands ? <ChevronUp size={16} className="text-amber-600" /> : <ChevronDown size={16} className="text-gray-500" />}
              </div>
            </button>
            <ul className={`space-y-3 text-[12px] text-gray-400 font-medium mt-6 transition-all duration-300 overflow-hidden ${openSections.brands ? 'max-h-60 opacity-100' : 'max-h-0 sm:max-h-none opacity-0 sm:opacity-100'}`}>
              <li><Link to="/catalogue?brand=Mercedes-Benz" className="hover:text-amber-500 transition-colors inline-block py-1">Mercedes</Link></li>
              <li><Link to="/catalogue?brand=BMW" className="hover:text-amber-500 transition-colors inline-block py-1">BMW</Link></li>
              <li><Link to="/catalogue?brand=Audi" className="hover:text-amber-500 transition-colors inline-block py-1">Audi</Link></li>
              <li><Link to="/catalogue?brand=Porsche" className="hover:text-amber-500 transition-colors inline-block py-1">Porsche</Link></li>
              <li><Link to="/catalogue?brand=Volkswagen" className="hover:text-amber-500 transition-colors inline-block py-1">VW</Link></li>
            </ul>
          </div>

          {/* Contact Info - Full width on mobile */}
          <div className="col-span-2 lg:col-span-1 flex flex-col items-center sm:items-start pt-8 lg:pt-0">
            <h4 className="text-[10px] font-black mb-6 font-montserrat uppercase tracking-[0.2em] text-white/90">{t('nav.contact', 'Contact')}</h4>
            <ul className="space-y-4 text-[12px] text-gray-400 font-medium">
              <li className="flex items-start justify-center sm:justify-start">
                <MapPin size={16} className="mr-3 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  123 Avenue des Champs-Élysées<br />
                  75008 Paris, France
                </span>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <Phone size={16} className="mr-3 text-amber-600 flex-shrink-0" />
                <a href="tel:+33123456789" className="hover:text-white transition-colors">+33 1 23 45 67 89</a>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <Mail size={16} className="mr-3 text-amber-600 flex-shrink-0" />
                <a href="mailto:contact@garragepro.com" className="hover:text-white transition-colors text-[11px] sm:text-[12px]">contact@garragepro.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/60 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">
          <p>&copy; {currentYear} Garrage Pro. {t('footer.rights', 'Tous droits réservés.')}</p>
          <div className="flex gap-6">
            <Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions Légales</Link>
            <Link to="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
