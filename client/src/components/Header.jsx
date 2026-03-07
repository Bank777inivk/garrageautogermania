import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Phone, User, ShoppingCart, Facebook, Instagram, Clock, Search } from 'lucide-react';
import SearchBar from './SearchBar';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import useCartStore from '@shared/store/useCartStore';
import useAuthStore from '@shared/store/useAuthStore';
import CartDrawer from './CartDrawer';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const { getTotalItems, getTotalPrice, toggleCart } = useCartStore();
  const { user } = useAuthStore();

  // Handle scroll effect for shadow/height
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll when mobile menu or search is open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  const navigation = [
    { name: t('nav.home', 'Accueil'), href: '/' },
    { name: t('nav.catalogue', 'Catalogue'), href: '/catalogue' },
    { name: t('nav.tracking', 'Suivi'), href: '/suivi-livraison' },
    { name: t('nav.about', 'À propos'), href: '/a-propos' },
    { name: t('nav.contact', 'Contact'), href: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 font-sans shadow-md">
      {/* Top Bar (Info & Social) - Dark & Elegant */}
      <div className="bg-slate-900 text-gray-300 py-2 text-xs border-b border-gray-800">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">

          {/* Left Side: Contact Info */}
          <div className="flex items-center space-x-6">
            <a href="tel:+491781234567" className="flex items-center hover:text-white transition-colors">
              <Phone size={14} className="mr-2 text-red-600" />
              <span className="font-medium tracking-wide">+49 178 123 4567</span>
            </a>
            <span className="hidden md:flex items-center">
              <Clock size={14} className="mr-2 text-red-600" />
              <span>Lun - Sam : 9h - 19h</span>
            </span>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`lg:hidden flex items-center gap-2 px-3 py-1 rounded-full transition-all ${isSearchOpen ? 'bg-red-700 text-white' : 'hover:bg-gray-800'}`}
            >
              <Search size={14} className={isSearchOpen ? 'text-white' : 'text-red-700'} />
              <span className="font-black uppercase tracking-widest text-[10px]">Rechercher</span>
            </button>
          </div>

          {/* Right Side: Socials & Language */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 border-r border-gray-700 pr-4">
              <a href="#" className="hover:text-white transition-transform hover:scale-110">
                <Facebook size={16} />
              </a>
              <a href="#" className="hover:text-white transition-transform hover:scale-110">
                <Instagram size={16} />
              </a>
            </div>

            <div className="pl-1">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>

      {/* Search Panel Dropdown - Mobile Only */}
      <div className={`lg:hidden bg-slate-900/95 backdrop-blur-md border-b border-gray-800 overflow-hidden transition-all duration-500 ease-in-out ${isSearchOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-black text-sm uppercase tracking-[0.2em]">Trouvez votre véhicule idéal</h3>
            <button onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <SearchBar className="!max-w-none shadow-none border-none bg-transparent !p-0" />
        </div>
      </div>

      {/* Main Navigation - Sticky & Clean */}
      <div className={`bg-white transition-all duration-300 ${scrolled ? 'py-2' : 'py-3'}`}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center">

            {/* Logo - Enlarged and Imposing */}
            <Link to="/" className="flex items-center group">
              <img
                src="/logo.png"
                alt="Garrage Pro"
                className="h-16 md:h-28 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            <nav className="hidden lg:flex items-center space-x-10">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `nav-link-pro text-[10.5px] uppercase transition-all duration-300 ${isActive
                      ? 'active'
                      : ''
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* Right Actions: Account & Cart */}
            <div className="flex items-center space-x-2 md:space-x-6">

              <Link to={user ? "/dashboard" : "/connexion"} className="hidden md:flex items-center text-gray-700 hover:text-gray-900 transition-all duration-300 group">
                <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-gray-900 group-hover:text-white transition-all duration-300 shadow-sm">
                  <User size={18} />
                </div>
                <span className="ml-3 text-[11px] font-black uppercase tracking-widest hidden xl:block">
                  {user ? t('nav.dashboard', 'Mon Espace') : t('nav.account', 'Compte')}
                </span>
              </Link>

              {/* Cart - Prominent */}
              <button
                onClick={toggleCart}
                className="relative flex items-center group cursor-pointer"
                aria-label={t('cart.title', 'Panier')}
              >
                <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-gray-900 group-hover:text-white transition-all duration-300 shadow-sm text-gray-700">
                  <ShoppingCart size={18} />
                  {getTotalItems() > 0 && (
                    <span className="absolute top-0 right-0 bg-red-700 text-white text-[9px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-white transform translate-x-1.5 -translate-y-1.5">
                      {getTotalItems()}
                    </span>
                  )}
                </div>
                <div className="ml-3 hidden xl:flex flex-col items-start leading-none">
                  <span className="text-[9px] text-gray-400 uppercase font-black tracking-tighter mb-0.5">Panier</span>
                  <span className="text-xs font-black text-gray-900 group-hover:text-gray-700 transition-colors">
                    {getTotalPrice().toLocaleString()}€
                  </span>
                </div>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden text-gray-800 hover:text-red-700 transition-colors p-1"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl z-40 animate-in slide-in-from-top-5 duration-200">
          <div className="px-6 pt-4 pb-8 space-y-3">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block w-full py-3 text-center font-bold text-sm uppercase tracking-wider rounded transition-colors ${isActive
                    ? 'text-white bg-red-700 shadow-md'
                    : 'bg-gray-900 hover:bg-red-700 text-white'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}

            <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
              <Link
                to={user ? "/dashboard" : "/connexion"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 text-gray-700 hover:text-red-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                <User size={20} className="mr-3" />
                {user ? t('nav.dashboard', 'Mon Espace') : t('nav.account', 'Mon Compte')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer />
    </header>
  );
};

export default Header;
