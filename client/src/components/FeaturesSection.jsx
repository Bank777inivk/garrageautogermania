import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Truck, SearchCheck, Award } from 'lucide-react';

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: SearchCheck,
      title: t('features.inspection', 'Inspection Rigoureuse'),
      description: t('features.inspectionDesc', 'Chaque véhicule est inspecté sur plus de 100 points de contrôle avant importation.')
    },
    {
      icon: ShieldCheck,
      title: t('features.warranty', 'Garantie Premium'),
      description: t('features.warrantyDesc', 'Roulez l\'esprit tranquille avec nos extensions de garantie jusqu\'à 24 mois.')
    },
    {
      icon: Truck,
      title: t('features.delivery', 'Livraison Clé en Main'),
      description: t('features.deliveryDesc', 'Nous gérons l\'importation, l\'immatriculation et la livraison à votre domicile.')
    },
    {
      icon: Award,
      title: t('features.experience', 'Expertise Reconnue'),
      description: t('features.experienceDesc', 'Plus de 10 ans d\'expérience dans l\'importation de véhicules allemands.')
    }
  ];

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-red-700 uppercase tracking-[0.2em] mb-3">
            Notre engagement
          </p>
          <h2 className="text-3xl font-bold font-montserrat mb-4">
            {t('home.whyChooseUs', 'Pourquoi nous choisir ?')}
          </h2>
          <span className="section-line" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group text-center p-7 bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-red-700/40 hover:bg-gray-800 transition-all duration-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/20"
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              {/* Icon circle */}
              <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-gray-900 border border-gray-700 group-hover:border-red-700/50 flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-red-900/30">
                <feature.icon size={28} className="text-red-700 group-hover:text-red-600 transition-colors duration-300" />
              </div>
              <h3 className="text-base font-bold mb-2 font-montserrat tracking-tight">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

