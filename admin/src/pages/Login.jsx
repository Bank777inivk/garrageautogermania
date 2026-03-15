import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@shared/store/useAuthStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore();
  // const [isRegistering, setIsRegistering] = useState(false); // Inscription désactivée

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Échec de la connexion. Vérifiez vos identifiants.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Côté gauche : Formulaire */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-32 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-[#14213D] font-montserrat tracking-[-0.05em] uppercase">
              GARRAGE<span className="text-[#FCA311]">.</span>
            </h1>
            <p className="mt-3 text-[10px] font-black text-[#14213D]/30 uppercase tracking-[0.3em]">
              Logistics Management System
            </p>
          </div>

          <div className="bg-white border-l-4 border-[#FCA311] p-10 shadow-[40px_40px_80px_-20px_rgba(20,33,61,0.1)] rounded-[2.5rem] border border-[#E5E5E5]/50">
            <h2 className="text-xl font-black text-[#14213D] uppercase tracking-tight mb-8">
              Identification
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-[10px] font-black text-[#14213D] uppercase tracking-widest mb-2 pl-1">
                  Identifiant Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-[#14213D] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FCA311] focus:bg-white transition-all text-sm font-black"
                    placeholder="admin@garrage.com"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label htmlFor="password" className="block text-[10px] font-black text-[#14213D] uppercase tracking-widest mb-2 pl-1">
                  Mot de passe
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-[#14213D] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FCA311] focus:bg-white transition-all text-sm font-black"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center bg-red-50 py-4 rounded-2xl border border-red-100 px-4">
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center py-5 px-4 rounded-[1.5rem] shadow-xl shadow-[#FCA311]/20 text-[10px] font-black uppercase tracking-[0.2em] text-[#14213D] bg-[#FCA311] hover:bg-[#14213D] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FCA311] transition-all active:scale-[0.98] border-b-4 border-[#14213D]/10"
                >
                  Ouvrir la session
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Côté droit : Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover grayscale contrast-125"
          src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Luxury car"
        />
        <div className="absolute inset-0 bg-[#14213D] mix-blend-multiply opacity-90"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-16 max-w-lg">
            <h1 className="text-7xl font-black text-white font-montserrat tracking-[-0.05em] mb-4">
              GARRAGE<span className="text-[#FCA311]">.</span>
            </h1>
            <div className="w-24 h-1 bg-[#FCA311] mx-auto rounded-full mb-8"></div>
            <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.5em] leading-[2]">
              The Ultimate Hub for High-End Vehicle <br/> Import & Logistics 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
