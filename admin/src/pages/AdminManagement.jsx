import React, { useEffect, useState } from 'react';
import useAdminStore from '@shared/store/useAdminStore';
import { Trash2, UserPlus, Shield, Eye, EyeOff, Lock } from 'lucide-react';
import useAuthStore from '@shared/store/useAuthStore';

const AdminManagement = () => {
  const { admins, loading, fetchAdmins, addAdmin, removeAdmin, error } = useAdminStore();
  const { user } = useAuthStore();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showSecretLink, setShowSecretLink] = useState(false);

  // Seul le Super Admin peut voir le lien secret
  const isSuperAdmin = user?.email === 'noellinemous@gmail.com';

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail) return;

    setFeedback('');
    try {
      await addAdmin(newAdminEmail);
      setNewAdminEmail('');
      setFeedback('Admin ajouté avec succès !');
      // Effacer le message après 3 secondes
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error(err);
      setFeedback('Erreur lors de l\'ajout.');
    }
  };

  const handleRemoveAdmin = async (email) => {
    if (window.confirm(`Êtes-vous sûr de vouloir retirer les droits d'admin à ${email} ?`)) {
      try {
        await removeAdmin(email);
      } catch (err) {
        console.error(err);
        alert('Erreur lors de la suppression.');
      }
    }
  };

  const secretLink = `${window.location.origin}/admin-register-secret-access`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secretLink);
    alert('Lien copié dans le presse-papier !');
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-3">
            <Shield className="text-indigo-600" size={24} /> Gestion des Admins
          </h1>
          <p className="text-xs md:text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest opacity-60">Gérez les accès et privilèges administrateur.</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowSecretLink(!showSecretLink)}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 group"
          >
            {showSecretLink ? <EyeOff size={18} /> : <Eye size={18} />}
            <span>{showSecretLink ? 'Masquer le lien' : 'Afficher le lien'}</span>
          </button>
        )}
      </div>

      {isSuperAdmin && showSecretLink && (
        <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-[2rem] shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Lock className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Lien d'inscription secret</p>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Ce lien permet de créer un compte admin. Ne le partagez qu'avec les personnes dont vous avez autorisé l'email ci-dessous.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <code className="flex-1 bg-white px-4 py-3 rounded-xl border border-orange-100 text-[10px] font-bold text-slate-600 break-all shadow-inner">
                  {secretLink}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                >
                  Copier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="mb-8">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Ajouter un Admin</h2>
          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest opacity-60">L'email ajouté pourra accéder au back-office.</p>
        </div>

        <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-900 placeholder:text-slate-300 transition-all"
              placeholder="nouveau.admin@exemple.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <UserPlus size={18} />
            Ajouter
          </button>
        </form>
        {feedback && <p className={`mt-4 text-[10px] font-black uppercase tracking-widest ml-1 ${feedback.includes('Erreur') ? 'text-red-500' : 'text-green-500'}`}>{feedback}</p>}
        {error && <p className="mt-4 text-[10px] font-black uppercase tracking-widest ml-1 text-red-500">{error}</p>}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Administrateurs Actifs</h3>
          <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
            {admins.length} Total
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Card Super Admin */}
          <div className="bg-white border border-indigo-100 rounded-[2rem] p-6 shadow-xl shadow-indigo-100/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group transition-all duration-500 hover:shadow-indigo-600/10">
            <div className="flex items-center gap-5 min-w-0">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-500">
                <Shield size={24} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-slate-900 leading-tight truncate">noellinemous@gmail.com</div>
                <div className="inline-flex items-center gap-1.5 mt-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-indigo-100">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
                  Super Admin
                </div>
              </div>
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-40 sm:px-4 shrink-0">Propriétaire</div>
          </div>

          {/* Admins Dynamiques */}
          {admins.filter(admin => admin.email !== 'noellinemous@gmail.com').map((admin) => (
            <div key={admin.email} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-2xl shadow-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group transition-all duration-500 hover:shadow-indigo-600/10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner group-hover:scale-110 transition-transform duration-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-100">
                  <span className="font-black text-sm uppercase tracking-tighter">{admin.email.substring(0, 2)}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-black text-slate-900 leading-tight">{admin.email}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      {admin.role || 'Admin Account'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                      • {admin.createdAt ? new Date(admin.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveAdmin(admin.email)}
                className="w-full sm:w-auto px-6 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-red-100 active:scale-95"
              >
                <Trash2 size={16} />
                Révoquer
              </button>
            </div>
          ))}

          {admins.filter(admin => admin.email !== 'noellinemous@gmail.com').length === 0 && (
            <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
              <Shield className="text-slate-200" size={48} />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60 italic">Aucun admin supplémentaire</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
