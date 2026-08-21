import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@shared/store/useAuthStore';
import { db } from '@shared/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User, MapPin, Calendar, Loader2, Phone, Mail, Building2, Save, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useLangNavigate from '../../hooks/useLangNavigate';

const Profile = () => {
  const navigate = useNavigate();
  const { langNavigate } = useLangNavigate();
  const { user, loading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.displayName ? user.displayName.split(' ')[0] : '',
    lastName: user?.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
    email: user?.email || '',
    phone: '',
    company: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'France'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      langNavigate('/connexion');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const clientDoc = await getDoc(doc(db, 'clients', user.uid));
        if (clientDoc.exists()) {
          const data = clientDoc.data();
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            company: data.company || '',
            address: data.address || '',
            city: data.city || '',
            zipCode: data.zipCode || '',
            country: data.country || 'France'
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Données locales chargées (connexion Firestore bloquée).");
        if (user) {
          setFormData(prev => ({
            ...prev,
            email: user.email || prev.email,
            firstName: user.displayName ? user.displayName.split(' ')[0] : prev.firstName,
            lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : prev.lastName
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateDoc(doc(db, 'clients', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        company: formData.company,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        country: formData.country,
        // Email is usually not updated here directly for Auth, but kept in profile
        email: formData.email
      });
      toast.success("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8" style={{ color: '#052659' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto mt-2 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profil & Sécurité</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Gestion de votre identité et de vos préférences</p>
        </div>
        <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm font-semibold">
          Membre depuis {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '-'}
        </div>
      </div>

      <div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Header - Flat */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-blue-600 bg-blue-50 shrink-0">
              <User size={32} />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {formData.firstName || 'Client'} {formData.lastName || 'AutoImport'}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Mail size={16} />
                  {user?.email}
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full my-auto hidden sm:block"></div>
                <div className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                  <Award size={16} />
                  Compte Certifié
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Identity - Flat */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Identité
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500 outline-none cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Téléphone mobile</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+33 6 00 00 00 00"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Localization - Flat */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Localisation
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Société</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Optionnel"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Adresse de livraison</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="N°, Rue, Appt..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Code Postal</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Ville</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Pays</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                >
                  <option value="France">France 🇫🇷</option>
                  <option value="Belgique">Belgique 🇧🇪</option>
                  <option value="Suisse">Suisse 🇨🇭</option>
                  <option value="Luxembourg">Luxembourg 🇱🇺</option>
                  <option value="Allemagne">Allemagne 🇩🇪</option>
                  <option value="Espagne">Espagne 🇪🇸</option>
                  <option value="Italie">Italie 🇮🇹</option>
                  <option value="Portugal">Portugal 🇵🇹</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:px-8 bg-slate-50 rounded-3xl border border-slate-200 shadow-sm mt-6">
            <div className="text-center md:text-left">
              <p className="font-bold text-slate-900 mb-1">Sécurité des données</p>
              <p className="text-slate-500 text-sm font-medium">Conformité RGPD & Chiffrement de bout en bout</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto flex items-center justify-center bg-slate-900 text-white px-8 py-3 rounded-full font-semibold text-sm transition-all hover:bg-slate-800 disabled:opacity-70 shadow-sm"
            >
              {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
              {saving ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
