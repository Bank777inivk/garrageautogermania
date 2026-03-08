import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, Loader2, MapPin, Phone, Building2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import useAuthStore from '@shared/store/useAuthStore';
import useFavoriteStore from '@shared/store/useFavoriteStore';
import { db } from '@shared/firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'France',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (!formData.phone) {
      toast.error("Le numéro de téléphone est requis");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signup(formData.email, formData.password);
      const user = userCredential.user;

      await setDoc(doc(db, 'clients', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        country: formData.country,
        createdAt: serverTimestamp(),
        role: 'client'
      });

      toast.success("Compte créé avec succès !");

      // Sync favorites from guest mode
      const { syncWithUser } = useFavoriteStore.getState();
      await syncWithUser(user.uid);

      navigate('/dashboard');
    } catch (error) {
      console.error("Registration error:", error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Cet email est déjà utilisé");
      } else {
        toast.error("Erreur lors de l'inscription: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-slate-900 rounded-2xl shadow-lg border border-red-700/20">
              <ShieldCheck size={32} className="text-red-700" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-red-700 uppercase tracking-[0.2em] mb-2">Inscription Client</p>
          <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-slate-900 uppercase tracking-tight">
            Créer votre compte
          </h2>
        </div>

        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl shadow-gray-100 border border-gray-100">
          <form className="space-y-8" onSubmit={handleSubmit}>

            {/* Informations Personnelles */}
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center border-b border-gray-100 pb-2">
                <User className="mr-2 text-red-700" size={14} />
                Identité & Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Prénom *</label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nom *</label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Email Professionnel *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Téléphone *</label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div className="pt-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center border-b border-gray-100 pb-2">
                <MapPin className="mr-2 text-red-700" size={14} />
                Adresse de facturation
              </h3>

              <div className="mb-6">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Société (Optionnel)</label>
                <input
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Numéro et voie *</label>
                <input
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Code Postal *</label>
                  <input
                    name="zipCode"
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Ville *</label>
                  <input
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Pays *</label>
                <select
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:bg-white outline-none transition-all cursor-pointer"
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Luxembourg">Luxembourg</option>
                  <option value="Allemagne">Allemagne</option>
                </select>
              </div>
            </div>

            {/* Sécurité */}
            <div className="pt-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center border-b border-gray-100 pb-2">
                <Lock className="mr-2 text-red-700" size={14} />
                Sécurité du compte
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Mot de passe *</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:bg-white outline-none transition-all pr-12"
                      placeholder="Min. 6 caractères"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-700 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Confirmation *</label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:bg-white outline-none transition-all pr-12"
                      placeholder="Répétez le mot de passe"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-700 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-[10px] font-bold uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 disabled:opacity-70 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Finaliser l'inscription"}
              </button>
            </div>
          </form>

          <div className="mt-10 border-t border-gray-50 pt-8 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Déjà un compte ?</p>
            <Link
              to="/connexion"
              className="inline-flex items-center text-[11px] font-bold uppercase tracking-widest text-red-700 hover:text-slate-900 transition-colors"
            >
              Se connecter maintenant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400 font-medium">
          &copy; 2024 AutoImport Pro • Votre partenaire de confiance
        </p>
      </div>
    </div>
  );
};

export default Register;
