import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Loader2, ShieldCheck, ShieldX } from 'lucide-react';
import useAuthStore from '@shared/store/useAuthStore';
import useFavoriteStore from '@shared/store/useFavoriteStore';
import { db } from '@shared/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await login(formData.email, formData.password);

      // Check if account is blocked
      const clientRef = doc(db, 'clients', loggedUser.uid);
      const clientSnap = await getDoc(clientRef);
      if (clientSnap.exists() && clientSnap.data().blocked) {
        // Account is blocked — sign out and show error
        await useAuthStore.getState().logout();
        toast.error("Votre compte a été suspendu. Contactez le support.", { icon: '🚫', duration: 6000 });
        setLoading(false);
        return;
      }

      // Sync favorites
      const { syncWithUser } = useFavoriteStore.getState();
      await syncWithUser(loggedUser.uid);

      toast.success("Connexion réussie !");
      navigate('/dashboard');
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erreur de connexion : Vérifiez vos identifiants");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center pt-32 pb-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-slate-900 rounded-2xl shadow-lg border border-red-700/20">
              <ShieldCheck size={32} className="text-red-700" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-red-700 uppercase tracking-[0.2em] mb-2">Espace Client Sécurisé</p>
          <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-slate-900 uppercase tracking-tight">
            Se Connecter
          </h2>
        </div>

        <div className="bg-white py-10 px-6 sm:px-10 rounded-2xl shadow-xl shadow-gray-100 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:bg-white outline-none transition-all"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:bg-white outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-red-700 focus:ring-red-700 border-gray-300 rounded-md transition-colors cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-gray-500 cursor-pointer">
                  Rester connecté
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="text-red-700 hover:text-slate-900 transition-colors">
                  Oublié ?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-[10px] font-bold uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 disabled:opacity-70 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Se connecter"}
              </button>
            </div>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                <span className="px-3 bg-white text-gray-400">
                  Nouveau client ?
                </span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/inscription"
                className="w-full flex justify-center items-center py-4 px-4 border border-gray-200 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 bg-white hover:bg-gray-50 transition-all border-dashed shadow-sm"
              >
                Créer un compte
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400 font-medium">
          &copy; 2024 AutoImport Pro • Excellence de l'importation
        </p>
      </div>
    </div>
  );
};

export default Login;
