import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield, Award, Users, Globe, CheckCircle, ArrowRight,
  Search, Wrench, Truck, Key, Star, Quote, User
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── Animated Number Hook ── */
function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return count;
}

const StatItem = ({ label, value, suffix }) => {
  const count = useCountUp(value);
  return (
    <div className="flex flex-col items-center">
      <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-montserrat mb-1">
        {count}{suffix}
      </p>
      <p className="text-gray-400 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
};

const About = () => {
  const { t } = useTranslation();

  const stats = [
    { label: "Véhicules Livrés", value: 1250, suffix: "+" },
    { label: "Clients Satisfaits", value: 98, suffix: "%" },
    { label: "Partenaires Europe", value: 45, suffix: "" },
    { label: "Années d'Excellence", value: 10, suffix: "+" }
  ];

  const processSteps = [
    {
      icon: <Search size={20} />,
      title: "Sourcing",
      desc: "Analyse quotidienne des parcs automobiles européens pour dénicher des opportunités exclusives."
    },
    {
      icon: <Wrench size={20} />,
      title: "Expertise",
      desc: "Inspection technique rigoureuse certifiée avant toute acquisition pour garantir la qualité."
    },
    {
      icon: <Truck size={20} />,
      title: "Logistique",
      desc: "Transport sécurisé et assurance tous risques jusqu'à votre domicile avec suivi temps réel."
    },
    {
      icon: <Key size={20} />,
      title: "Livraison",
      desc: "Gestion complète des formalités administratives et de l'immatriculation française."
    }
  ];

  const values = [
    {
      icon: <Shield className="text-red-700" size={24} />,
      title: "Fiabilité",
      description: "Transparence totale sur l'historique et l'état réel de chaque véhicule importé."
    },
    {
      icon: <Award className="text-red-700" size={24} />,
      title: "Excellence",
      description: "Spécialisation dans les marques premium allemandes et les véhicules de luxe."
    },
    {
      icon: <Globe className="text-red-700" size={24} />,
      title: "International",
      description: "Un réseau de partenaires solides dans toute l'Europe pour le meilleur prix."
    },
    {
      icon: <Users className="text-red-700" size={24} />,
      title: "Accompagnement",
      description: "Un conseiller dédié pour vous accompagner à chaque étape de votre projet d'achat."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION - GERMAN FLAG COLORS ACCENT */}
      <section className="relative h-[50vh] md:h-[55vh] flex items-center justify-center overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 z-0">
          <img
            src="/about-hero.png"
            alt="Luxury Car Showroom"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/70"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="text-[10px] md:text-xs font-bold text-red-700 uppercase tracking-[0.2em] mb-4">
            Depuis 2014 • AutoImport Pro
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold font-montserrat uppercase tracking-tight mb-6 leading-tight">
            <span className="text-white">L'Importation</span> <br className="sm:hidden" />
            <span className="text-red-700">Automobile</span> <br className="sm:hidden" />
            <span className="text-amber-500">de Confiance</span>
          </h1>
          <p className="text-gray-300 text-sm md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Votre courtier spécialisé dans l'importation de véhicules premium depuis l'Allemagne et l'Europe entière.
          </p>
        </div>
      </section>

      {/* STATS STRIP - STACKS ON MOBILE */}
      <section className="bg-slate-900 py-10 md:py-14 border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-4">
            {stats.map((s, i) => (
              <StatItem key={i} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* OUR STORY - MOBILE REVERSE STACKING OR NORMAL */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full lg:w-1/2 order-2 lg:order-1">
              <div className="relative">
                <div className="overflow-hidden rounded-xl shadow-lg border border-gray-100">
                  <img
                    src="/mercedes.png"
                    alt="Notre Expertise"
                    className="w-full h-auto"
                  />
                </div>
                {/* Visual Badges & Stars on Image */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 shadow-xl">
                    <Shield size={14} className="text-red-700" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Premium Quality</span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm text-slate-900 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2 shadow-xl">
                    <CheckCircle size={14} className="text-red-700" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800">Expertise Certifiée</span>
                  </div>
                  <div className="bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 shadow-xl">
                    <Shield size={14} className="text-red-700" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Garantie Premium</span>
                  </div>
                  <div className="flex gap-0.5 px-1 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={10} fill="#b91c1c" className="text-red-700" />
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-red-700 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg shadow-md border border-red-800">
                  <p className="text-xl sm:text-2xl font-bold font-montserrat leading-none">10 Ans</p>
                  <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest mt-1 opacity-90">De Passion</p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 order-1 lg:order-2">
              <p className="text-[10px] sm:text-xs font-bold text-red-700 uppercase tracking-[0.2em] mb-3">Notre Philosophie</p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-montserrat text-slate-900 uppercase tracking-tight mb-8 leading-tight">
                Rendre l'Importation Automobile Accessible
              </h2>
              <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                <p>
                  <strong>AutoImport Pro</strong> a été fondé avec une vision claire : offrir un accès sécurisé et transparent aux meilleurs parcs automobiles européens. Nous sommes vos courtiers de confiance.
                </p>
                <p>
                  Chaque véhicule bénéficie d'une traçabilité complète et d'une inspection technique certifiée avant livraison.
                </p>
                <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    "Transparence totale",
                    "Expertise technique",
                    "Logistique dédiée",
                    "Service après-vente"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-800 font-bold uppercase text-[8px] sm:text-[9px] tracking-widest leading-none">
                      <div className="h-4 w-4 rounded-full bg-red-700/10 flex-shrink-0 flex items-center justify-center">
                        <CheckCircle size={10} className="text-red-700" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS TIMELINE - GRID ON MOBILE */}
      <section className="py-16 md:py-24 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-[10px] sm:text-xs font-bold text-red-700 uppercase tracking-[0.2em] mb-2">Notre Expertise</p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-montserrat text-slate-900 uppercase tracking-tight">
              Processus de Livraison Sécurisé
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {processSteps.map((step, i) => (
              <div key={i} className="bg-white p-6 sm:p-8 rounded-xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-red-700 mb-6 border border-slate-800">
                  {step.icon}
                </div>
                <h3 className="text-gray-900 text-sm sm:text-base font-bold font-montserrat uppercase mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-[11px] sm:text-xs leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 text-center mb-12 sm:mb-16">
          <p className="text-[10px] sm:text-xs font-bold text-red-700 uppercase tracking-[0.2em] mb-2">Engagements</p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-montserrat text-slate-900 uppercase tracking-tight">
            Pourquoi nous choisir ?
          </h2>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((v, i) => (
              <div key={i} className="group p-6 sm:p-8 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="mb-6 p-4 bg-gray-50 rounded-lg inline-block text-red-700 group-hover:bg-red-700 group-hover:text-white transition-colors border border-gray-100">
                  {v.icon}
                </div>
                <h3 className="text-sm sm:text-base font-bold font-montserrat text-gray-900 uppercase mb-2 tracking-tight">
                  {v.title}
                </h3>
                <p className="text-gray-500 text-[11px] sm:text-xs leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS TEASER - MOBILE OPTIMIZED */}
      <section className="py-16 md:py-24 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <Quote className="text-red-700 mx-auto mb-4" size={32} />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-montserrat text-slate-900 uppercase tracking-tight">
              Confiance de nos Clients
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 sm:p-10 rounded-xl shadow-sm border border-gray-100">
              <div className="flex gap-1 text-red-700 mb-6">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} fill="currentColor" />)}
              </div>
              <p className="text-gray-700 font-medium text-sm sm:text-base mb-6 leading-relaxed italic">
                "Un service d'une qualité rare. Ma RS6 est arrivée en parfait état et les formalités ont été gérées avec un grand professionnalisme."
              </p>
              <p className="text-gray-900 font-bold text-[8px] sm:text-[9px] uppercase tracking-widest border-t border-gray-100 pt-4 leading-none">Jean-Marc T. — Audi RS6 Performance</p>
            </div>

            <div className="bg-white p-6 sm:p-10 rounded-xl shadow-sm border border-gray-100">
              <div className="flex gap-1 text-red-700 mb-6">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} fill="currentColor" />)}
              </div>
              <p className="text-gray-700 font-medium text-sm sm:text-base mb-6 leading-relaxed italic">
                "Première expérience d'import réussie grâce à l'équipe. Je recommande vivement pour tout achat de véhicule premium allemand."
              </p>
              <p className="text-gray-900 font-bold text-[8px] sm:text-[9px] uppercase tracking-widest border-t border-gray-100 pt-4 leading-none">Sarah L. — Mercedes Classe G63</p>
            </div>
          </div>
        </div>
      </section>

      {/* THE FOUNDER'S WORDS */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <p className="text-lg md:text-xl font-medium text-gray-800 leading-relaxed mb-8 md:mb-12 italic">
            "Nous ne vendons pas simplement des véhicules. Nous livrons des rêves et sécurisons vos investissements avec la plus grande rigueur."
          </p>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white mb-4 border border-slate-800 shadow-sm">
              <User size={18} />
            </div>
            <h4 className="text-gray-900 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">Directeur Général</h4>
            <p className="text-red-700 font-montserrat font-bold text-lg sm:text-xl mt-1 tracking-tighter">
              AutoImport Pro
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION - FULLY RESPONSIVE */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-slate-900 rounded-2xl p-8 sm:p-12 md:p-20 text-center border border-red-700/20 shadow-xl overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-white text-xl sm:text-2xl md:text-4xl font-bold font-montserrat uppercase tracking-tight mb-4 leading-tight">
                Votre projet commence ici.
              </h2>
              <p className="text-gray-400 text-[10px] sm:text-xs max-w-xl mx-auto mb-8 leading-relaxed uppercase tracking-[0.1em] font-bold">
                Importation directe • Garantie Premium • Livraison France entière
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/catalogue"
                  className="px-8 py-4 bg-red-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-white hover:text-slate-900 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 group"
                >
                  Découvrir le stock
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-4 border border-slate-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-slate-800 transition-all active:scale-95"
                >
                  Nous contacter
                </Link>
              </div>
            </div>

            {/* Subtle Gradient Decor (Minimalist) */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-red-700/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
