import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@shared/store/useAuthStore';
import { db } from '@shared/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User, MapPin, Calendar, Loader2, Phone, Mail, Building2, Save, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'France'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion');
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
        toast.error("Impossible de charger votre profil");
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">Profil & Sécurité</h1>
          <p className="text-slate-500 mt-4 font-bold text-[10px] uppercase tracking-[0.2em]">Gestion de votre identité et préférences</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            Depuis {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '-'}
          </p>
        </div>
      </div>

      <div className="max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Header - Grounded */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-900/10 p-8 flex flex-col md:flex-row items-center gap-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden relative group/avatar border border-[#FCA311]/30 bg-gradient-to-br from-[#021024] via-[#052659] to-[#021024]">
              {/* Subtle Glow */}
              <div className="absolute inset-0 bg-[#FCA311]/10 blur-xl group-hover/avatar:bg-[#FCA311]/20 transition-all duration-700" />
              <User size={36} className="text-[#FCA311] relative z-10" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                {formData.firstName || 'Client'} {formData.lastName || 'AutoImport'}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Mail size={12} />
                  {user?.email}
                </div>
                <div className="w-1 h-1 bg-slate-200 rounded-full my-auto hidden sm:block"></div>
                <div className="text-[10px] font-black text-[#FCA311] uppercase tracking-widest flex items-center gap-1.5">
                  <Award size={12} className="fill-current" />
                  Compte Certifié
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Identity - Grounded */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-900/10 p-8 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                <User size={16} className="text-slate-400" />
                Identité
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-5 py-3 bg-white/50 border border-slate-200/60 rounded-xl font-black text-slate-900 focus:bg-white transition-all outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-5 py-3 bg-white/50 border border-slate-200/60 rounded-xl font-black text-slate-900 focus:bg-white transition-all outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative group/input">
                  <Mail size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-5 py-3 bg-slate-100/50 border border-slate-200/30 rounded-xl font-black text-slate-400 outline-none text-sm grayscale cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone mobile</label>
                <div className="relative group/input">
                  <Phone size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+33 6 00 00 00 00"
                    className="w-full pl-12 pr-5 py-3 bg-white/50 border border-slate-200/60 rounded-xl font-black text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Localization - Grounded */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-900/10 p-8 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                <MapPin size={16} className="text-slate-400" />
                Localisation
              </h3>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Société</label>
                <div className="relative group/input">
                  <Building2 size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Optionnel"
                    className="w-full pl-12 pr-5 py-3 bg-white/50 border border-slate-200/60 rounded-xl font-black text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse de livraison</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="N°, Rue, Appt..."
                  className="w-full px-5 py-3 bg-white/50 border border-slate-200/60 rounded-xl font-black text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Code Postal</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full px-5 py-3 bg-white/50 border border-slate-200/60 rounded-xl font-black text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ville</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-5 py-3 bg-white/50 border border-slate-200/60 rounded-xl font-black text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pays</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-5 py-3 bg-white/50 border border-slate-200/60 rounded-xl font-black text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none text-sm appearance-none"
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

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden relative group bg-gradient-to-br from-[#021024] via-[#052659] to-[#021024] border border-[#FCA311]/30">
            {/* Vivid Atmosphere */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#FCA311]/10 rounded-full blur-[80px] group-hover:bg-[#FCA311]/20 transition-all duration-1000" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#5483B3]/5 rounded-full blur-[80px] group-hover:bg-[#5483B3]/15 transition-all duration-1000" />
            
            <div className="relative z-10 text-white text-center md:text-left">
              <p className="font-black text-sm tracking-tight uppercase leading-none mb-2">Sécurité des données</p>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Conformité RGPD & Chiffrement de bout en bout</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto flex items-center justify-center bg-white text-slate-900 px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-70 group hover:bg-slate-800 hover:text-white border border-white hover:border-[#FCA311]"
            >
              {saving ? <Loader2 className="animate-spin mr-3" size={14} /> : <Save className="mr-3 group-hover:scale-110 transition-transform" size={14} />}
              {saving ? 'Synchronisation...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
