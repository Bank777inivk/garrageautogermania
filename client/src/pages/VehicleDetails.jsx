import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useClientVehicleStore from '@shared/store/useClientVehicleStore';
import useCartStore from '@shared/store/useCartStore';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft, Calendar, Fuel, Gauge, Award, CheckCircle,
  MapPin, Phone, Mail, Share2, Heart, ShieldCheck, ShoppingCart
} from 'lucide-react';

const VehicleDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { currentVehicle, loading, error, fetchVehicleById } = useClientVehicleStore();
  const { addToCart } = useCartStore();
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchVehicleById(id);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !currentVehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('vehicle.notFound', 'Véhicule non trouvé')}</h2>
        <Link to="/catalogue" className="text-red-700 hover:text-red-900 hover:underline flex items-center">
          <ChevronLeft size={20} className="mr-1" />
          {t('common.backToCatalogue', 'Retour au catalogue')}
        </Link>
      </div>
    );
  }

  const vehicle = currentVehicle;
  const images = vehicle.images && vehicle.images.length > 0
    ? vehicle.images
    : ['https://placehold.co/800x600?text=No+Image'];

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Breadcrumb & Back */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link to="/catalogue" className="inline-flex items-center text-gray-500 hover:text-red-700 transition-colors text-sm font-medium">
            <ChevronLeft size={16} className="mr-1" />
            {t('common.backToCatalogue', 'Retour au catalogue')}
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Gallery & Description (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="relative h-[400px] md:h-[500px] bg-gray-100">
                <img
                  src={images[activeImage]}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="bg-white/90 p-2 rounded-full shadow hover:bg-white text-gray-600 hover:text-red-600 transition-colors">
                    <Heart size={20} />
                  </button>
                  <button className="bg-white/90 p-2 rounded-full shadow hover:bg-white text-gray-600 hover:text-red-600 transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === index ? 'border-red-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                      <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('vehicle.description', 'Description du véhicule')}</h2>
              <div className="prose max-w-none text-gray-600">
                {vehicle.description ? (
                  <p>{vehicle.description}</p>
                ) : (
                  <p className="italic text-gray-400">Aucune description disponible pour ce véhicule.</p>
                )}
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <ShieldCheck className="text-green-600 mr-3 mt-1" size={24} />
                  <div>
                    <h4 className="font-bold text-gray-900">Garantie Premium</h4>
                    <p className="text-sm text-gray-600">Véhicule inspecté et garanti 12 mois minimum.</p>
                  </div>
                </div>
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <Award className="text-yellow-600 mr-3 mt-1" size={24} />
                  <div>
                    <h4 className="font-bold text-gray-900">Historique Vérifié</h4>
                    <p className="text-sm text-gray-600">Carnet d'entretien complet et kilométrage certifié.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Info & Contact (1/3) */}
          <div className="space-y-6">

            {/* Main Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-24">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{vehicle.brand} {vehicle.model}</h1>
                <p className="text-lg text-gray-500 font-medium">{vehicle.version}</p>
              </div>

              <div className="text-4xl font-bold text-gray-900 mb-6 font-montserrat tracking-tight">
                {vehicle.price?.toLocaleString()} €
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-8 text-sm">
                <div className="flex items-center text-gray-700">
                  <Calendar size={18} className="mr-2 text-gray-400" />
                  <span className="font-medium">{vehicle.year}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Gauge size={18} className="mr-2 text-gray-400" />
                  <span className="font-medium">{vehicle.mileage?.toLocaleString()} km</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Fuel size={18} className="mr-2 text-gray-400" />
                  <span className="font-medium">{vehicle.fuel}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-4 h-4 mr-2 border-2 border-gray-300 rounded-sm flex items-center justify-center text-[10px] text-gray-400 font-bold">A</div>
                  <span className="font-medium">{vehicle.transmission}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Add to cart clicked (Details):", vehicle);
                    addToCart(vehicle);
                  }}
                  className="w-full bg-gray-900 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center shadow-md hover:shadow-lg cursor-pointer relative z-20"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  {t('cart.add', 'Ajouter au panier')}
                </button>
                <button type="button" className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center shadow-md hover:shadow-lg">
                  <Phone size={20} className="mr-2" />
                  {t('vehicle.callUs', 'Appeler maintenant')}
                </button>
                <button className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                  <Mail size={20} className="mr-2" />
                  {t('vehicle.contactUs', 'Envoyer un message')}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  <span>Véhicule disponible</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin size={16} className="text-gray-400 mr-2" />
                  <span>Visible sur rendez-vous</span>
                </div>
              </div>
            </div>

            {/* Technical Specs Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">{t('vehicle.specs', 'Fiche Technique')}</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-500">Puissance</span>
                  <span className="font-medium">{vehicle.power || '-'} ch</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Couleur</span>
                  <span className="font-medium">{vehicle.color || '-'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Portes</span>
                  <span className="font-medium">{vehicle.doors || '-'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Places</span>
                  <span className="font-medium">{vehicle.seats || '-'}</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
