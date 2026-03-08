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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Shield className="mr-2" /> Gestion des Administrateurs
        </h1>
        {isSuperAdmin && (
          <button
            onClick={() => setShowSecretLink(!showSecretLink)}
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors shadow-sm"
          >
            {showSecretLink ? <EyeOff size={18} className="mr-2" /> : <Eye size={18} className="mr-2" />}
            {showSecretLink ? 'Masquer le lien d\'inscription' : 'Afficher le lien d\'inscription'}
          </button>
        )}
      </div>

      {isSuperAdmin && showSecretLink && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <Lock className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 font-medium">
                Lien d'inscription secret (Accès Super Admin)
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                Ce lien permet de créer un compte admin. Ne le partagez qu'avec les personnes dont vous avez autorisé l'email ci-dessous.
              </p>
              <div className="mt-3 flex items-center space-x-2">
                <code className="bg-white px-3 py-2 rounded border border-gray-300 text-xs font-mono text-gray-600 select-all">
                  {secretLink}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-2 rounded font-medium hover:bg-indigo-100 transition-colors"
                >
                  Copier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <h2 className="text-lg font-medium mb-4 text-gray-800">Ajouter un nouvel administrateur</h2>
        <p className="text-sm text-gray-500 mb-4">
          L'email ajouté ici aura immédiatement accès au tableau de bord s'il se connecte.
        </p>

        <form onSubmit={handleAddAdmin} className="flex gap-4 items-end">
          <div className="flex-1 max-w-md">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email de l'utilisateur</label>
            <input
              type="email"
              id="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="nouveau.admin@exemple.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter
          </button>
        </form>
        {feedback && <p className={`mt-2 text-sm ${feedback.includes('Erreur') ? 'text-red-600' : 'text-green-600'}`}>{feedback}</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Administrateurs Actifs</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Liste des utilisateurs ayant les droits d'accès au back-office.</p>
        </div>
        <div className="">
          <ul role="list" className="divide-y divide-gray-200">
            {/* Super Admin Hardcodé */}
            <li className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-indigo-50 transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 ring-2 ring-indigo-50">
                  <Shield size={20} />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-bold text-gray-900">noellinemous@gmail.com</div>
                  <div className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">Super Admin (Propriétaire)</div>
                </div>
              </div>
              <div className="text-xs text-gray-400 italic px-3 border border-gray-200 rounded-full py-1 bg-gray-50">
                Non supprimable
              </div>
            </li>

            {/* Admins Dynamiques */}
            {admins.filter(admin => admin.email !== 'noellinemous@gmail.com').map((admin) => (
              <li key={admin.email} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <span className="font-medium text-sm">{admin.email.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{admin.email}</div>
                    <div className="flex items-center mt-0.5 space-x-2">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        {admin.role || 'Admin'}
                      </span>
                      <span className="text-xs text-gray-400">
                        • Ajouté le {admin.createdAt ? new Date(admin.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveAdmin(admin.email)}
                  className="ml-4 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors flex items-center text-sm border border-transparent hover:border-red-200"
                  title="Révoquer les droits"
                >
                  <Trash2 size={16} className="mr-1.5" />
                  Révoquer
                </button>
              </li>
            ))}

            {admins.filter(admin => admin.email !== 'noellinemous@gmail.com').length === 0 && (
              <li className="px-4 py-12 text-center text-gray-500 text-sm">
                Aucun administrateur supplémentaire configuré.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
