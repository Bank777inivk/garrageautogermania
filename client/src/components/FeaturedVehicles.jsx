import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useClientVehicleStore from '@shared/store/useClientVehicleStore';
import useCartStore from '@shared/store/useCartStore';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Database } from 'lucide-react';
import { seedVehicles } from '../utils/seedVehicles';
import VehicleCard from './VehicleCard';

const FeaturedVehicles = ({ gridOnly = false }) => {
  const { t } = useTranslation();
  const { featuredVehicles, loading, fetchFeaturedVehicles } = useClientVehicleStore();
  const { addToCart } = useCartStore();
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchFeaturedVehicles();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    const success = await seedVehicles();
    if (success) fetchFeaturedVehicles();
    setSeeding(false);
  };

  if (loading && !seeding) {
    return (
      <div className={gridOnly ? "" : "py-20 bg-gray-50"}>
        <div className={gridOnly ? "" : "container mx-auto px-4"}>
          <div className="flex flex-col gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm h-64 animate-pulse border border-slate-100 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const Content = (
    <div className="flex flex-col gap-8">
      {!gridOnly && (
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-xs font-bold text-red-700 uppercase tracking-[0.2em] mb-2">
              Sélection du moment
            </p>
            <h2 className="text-3xl font-bold font-montserrat text-gray-900 mb-3">
              {t('home.featuredTitle', 'Nos dernières pépites')}
            </h2>
            <span className="section-line" />
          </div>
          <Link
            to="/catalogue"
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-900 transition-colors group"
          >
            {t('home.viewAllVehicles', 'Voir tous les véhicules')}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}

      {featuredVehicles.length === 0 ? (
        <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-4">
          <p className="text-sm">{t('home.noVehicles', 'Aucun véhicule disponible pour le moment.')}</p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-lg transition-colors"
          >
            <Database size={15} className="mr-2" />
            {seeding ? 'Chargement...' : 'Générer des véhicules de démo'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:gap-8">
            {featuredVehicles.slice(0, 6).map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} layout="list" />
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <Link
              to="/catalogue"
              className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-3 group active:scale-95"
            >
              Voir le catalogue complet
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </>
      )}
    </div>
  );

  if (gridOnly) return Content;

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {Content}
      </div>
    </section>
  );
};

export default FeaturedVehicles;
