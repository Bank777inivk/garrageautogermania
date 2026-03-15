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
          <h1 className="text-xl md:text-2xl font-black text-[#14213D] uppercase tracking-tight flex items-center gap-3">
            <Shield className="text-[#FCA311]" size={24} /> Gestion des Accès Admins
          </h1>
          <p className="text-[10px] md:text-sm text-[#14213D]/40 font-bold mt-1 uppercase tracking-[0.2rem]">Gérez les privilèges et la sécurité du back-office.</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowSecretLink(!showSecretLink)}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-[#14213D] text-[#FCA311] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FCA311] hover:text-[#14213D] transition-all shadow-xl shadow-[#14213D]/20 active:scale-95 group"
          >
            {showSecretLink ? <EyeOff size={18} /> : <Eye size={18} />}
            <span>{showSecretLink ? 'Masquer Sécurité' : 'Afficher Sécurité'}</span>
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
                <p className="text-sm font-black text-[#14213D] uppercase tracking-tight">Lien d'inscription secret</p>
                <p className="text-xs text-[#14213D]/60 font-medium mt-1 leading-relaxed">
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

      <div className="bg-white rounded-[2rem] p-6 md:p-10 border border-[#E5E5E5] shadow-sm">
        <div className="mb-8">
          <h2 className="text-lg font-black text-[#14213D] uppercase tracking-tight">Habiliter un Admin</h2>
          <p className="text-[10px] text-[#14213D]/40 font-bold mt-1 uppercase tracking-widest">L'email autorisé pourra s'enregistrer sur le système.</p>
        </div>

        <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-[#E5E5E5] rounded-2xl focus:ring-2 focus:ring-[#FCA311] outline-none font-bold text-[#14213D] placeholder:text-gray-300 transition-all"
              placeholder="nouveau.admin@garrage.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-[#14213D] text-[#FCA311] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FCA311] hover:text-[#14213D] transition-all shadow-xl shadow-[#14213D]/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <UserPlus size={18} />
            Autoriser
          </button>
        </form>
        {feedback && <p className={`mt-4 text-[10px] font-black uppercase tracking-widest ml-1 ${feedback.includes('Erreur') ? 'text-red-500' : 'text-green-500'}`}>{feedback}</p>}
        {error && <p className="mt-4 text-[10px] font-black uppercase tracking-widest ml-1 text-red-500">{error}</p>}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-[#14213D] uppercase tracking-widest leading-none">Équipe Administrative</h3>
          <span className="bg-[#14213D] text-[#FCA311] px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm">
            {admins.length} Total
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Card Super Admin */}
          <div className="bg-white border-l-8 border-l-[#FCA311] border-y border-r border-[#E5E5E5] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 group transition-all duration-500">
            <div className="flex items-center gap-5 min-w-0">
              <div className="w-14 h-14 bg-[#14213D] rounded-xl flex items-center justify-center text-[#FCA311] border border-[#E5E5E5] shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-500">
                <Shield size={24} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-[#14213D] leading-tight truncate uppercase tracking-tight">noellinemous@gmail.com</div>
                <div className="inline-flex items-center gap-1.5 mt-2 bg-[#FCA311] text-[#14213D] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-[#FCA311]">
                  <div className="w-1.5 h-1.5 bg-[#14213D] rounded-full animate-pulse" />
                  Super Admin / Propriétaire
                </div>
              </div>
            </div>
            <div className="text-[9px] font-black text-[#14213D]/20 uppercase tracking-widest sm:px-4 shrink-0">Accès Total</div>
          </div>

          {/* Admins Dynamiques */}
          {admins.filter(admin => admin.email !== 'noellinemous@gmail.com').map((admin) => (
            <div key={admin.email} className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 group transition-all duration-500 hover:border-[#FCA311]">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-[#14213D]/5 rounded-xl flex items-center justify-center text-[#14213D] border border-[#E5E5E5] shadow-inner group-hover:bg-[#14213D] group-hover:text-[#FCA311] transition-all duration-500">
                  <span className="font-black text-sm uppercase tracking-tighter">{admin.email.substring(0, 2)}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-black text-[#14213D] leading-tight uppercase tracking-tight">{admin.email}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-[#14213D]/40 uppercase tracking-[0.2em]">
                      {admin.role || 'Admin Privilégié'}
                    </span>
                    <span className="text-[9px] font-bold text-[#14213D]/20 uppercase tracking-widest">
                      • {admin.createdAt ? new Date(admin.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveAdmin(admin.email)}
                className="w-full sm:w-auto px-6 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest border border-red-100 active:scale-95"
              >
                <Trash2 size={16} />
                Révoquer les droits
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
