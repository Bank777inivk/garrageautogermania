import React, { useState, useEffect } from 'react';
import { db } from '@shared/firebase/config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import {
  Mail,
  Send,
  Settings,
  History,
  Eye,
  EyeOff,
  Save,
  FolderOpen,
  PlusCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  Loader2,
  X,
  Sparkles,
  FileText,
  User,
  AlertCircle
} from 'lucide-react';

const DEFAULT_SMTP_CONFIG = {
  host: 'cp5.obambu.com',
  port: '465',
  user: 'contact@garrageautogermania.com',
  password: '',
  senderName: 'A.P.S. CARS & TRUCKS GMBH',
  headerBg: '#14213D',
  headerText: '#FFFFFF',
  accentColor: '#FCA311',
  footerTitle: 'SERVICE PROFESSIONNEL A.P.S. CARS & TRUCKS GMBH',
  footerContent: "Ce courriel et ses pièces jointes sont confidentiels et établis à l'attention exclusive de ses destinataires. Toute modification, diffusion ou reproduction est rigoureusement interdite par A.P.S. CARS & TRUCKS GMBH - Import-Export Allemagne."
};

const DEFAULT_TEMPLATES = [
  {
    id: 'tpl_1',
    title: '🚗 Confirmation d\'Importation & Validation Dossier',
    subject: 'Confirmation de votre dossier d\'importation - A.P.S. CARS & TRUCKS GMBH',
    body: `Bonjour,

Nous avons le plaisir de vous confirmer la bonne réception et la validation technique de votre dossier d'importation automobile au départ de l'Allemagne.

Notre équipe d'experts a vérifié avec minutie l'ensemble de l'historique d'entretien, du carnet kilométrique et de l'inspection mécanique certifiée du véhicule sélectionné.

Vous trouverez ci-joint les documents de confirmation ainsi que les prochaines étapes de votre projet d'importation sécurisée.

Restant à votre entière disposition pour tout renseignement complémentaire,

Cordialement,
L'équipe Commerciale et Import
A.P.S. CARS & TRUCKS GMBH`
  },
  {
    id: 'tpl_2',
    title: '📦 Notification d\'Expédition & Suivi Logistique',
    subject: 'Expédition en cours - Suivi de transport de votre véhicule',
    body: `Bonjour,

Nous vous informons que votre véhicule a été officiellement pris en charge par notre transporteur sécurisé et remorque fermée en Allemagne. Le départ vers le centre de livraison a été validé ce jour.

Vous pouvez suivre en toute sérénité l'acheminement de votre voiture directement depuis notre espace client en ligne à l'aide de votre référence de commande.

Notre service logistique prendra contact avec vous 48 heures avant l'arrivée afin de convenir du rendez-vous officiel de remise des clés et des documents douaniers (Quitus Fiscal / COC).

Bien à vous,
Le Département Logistique & Livraison
A.P.S. CARS & TRUCKS GMBH`
  },
  {
    id: 'tpl_3',
    title: '💶 Confirmation de Paiement & Facturation Officielle',
    subject: 'Accréditation de paiement et facture - A.P.S. CARS & TRUCKS GMBH',
    body: `Bonjour,

Par la présente, notre service comptabilité vous confirme l'accréditation bancaire de votre virement concernant la commande de votre véhicule automobile allemand.

Votre facture définitive acquittée ainsi que l'ensemble des certificats (Certificat de conformité européen, Certificat d'immatriculation allemand Teil I & Teil II) ont été édités et versés à votre dossier administratif.

Nous vous remercions sincèrement pour votre confiance et nous réjouissons de vous livrer prochainement votre véhicule d'exception.

Cordialement,
Service Comptabilité & Administration
A.P.S. CARS & TRUCKS GMBH`
  },
  {
    id: 'tpl_4',
    title: '💬 Réponse Prospect Facebook (Véhicule Spécifique)',
    subject: 'Votre demande pour le véhicule [MARQUE ET MODÈLE]',
    body: `Bonjour,

Nous vous remercions pour l'intérêt que vous portez au véhicule [MARQUE ET MODÈLE] suite à votre message sur notre page Facebook.

Chez A.P.S. CARS & TRUCKS GMBH, nous sommes spécialisés dans l'importation sécurisée de véhicules Premium depuis l'Allemagne et l'Europe. Ce véhicule est en excellent état, son kilométrage est certifié et il a passé notre inspection avec succès.

Pour découvrir toutes les caractéristiques techniques, les options détaillées ainsi qu'une galerie de photos complètes, nous vous invitons à consulter sa fiche officielle sécurisée en cliquant sur le lien ci-dessous :

Lien du véhicule : [LIEN DU VÉHICULE]

Si ce modèle correspond à vos attentes, un de nos conseillers experts est à votre entière disposition par téléphone ou par e-mail pour finaliser votre dossier d'importation.

Dans l'attente de votre retour, nous vous souhaitons une excellente journée.

Cordialement,
L'équipe Commerciale
A.P.S. CARS & TRUCKS GMBH`
  }
];

const EmailManager = () => {
  const [activeTab, setActiveTab] = useState('send'); // 'send', 'config', 'history'
  
  // SMTP Config state
  const [smtpConfig, setSmtpConfig] = useState(DEFAULT_SMTP_CONFIG);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Email form state
  const [form, setForm] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [sending, setSending] = useState(false);
  
  // Clients / Users dropdown list
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');

  // Vehicles dropdown list
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  // Email logs & templates
  const [history, setHistory] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);

  // Modals
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [saveTemplateModalOpen, setSaveTemplateModalOpen] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');

  // 1. Load SMTP Config from Firestore
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'settings', 'smtp_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSmtpConfig({ ...DEFAULT_SMTP_CONFIG, ...docSnap.data() });
        }
      } catch (err) {
        console.error('Erreur lors de la lecture des paramètres SMTP:', err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  // 2. Fetch clients (from users/clients and orders collections, minus deleted_clients)
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const emailMap = new Map();
        
        // 0. Fetch deleted/hidden clients
        const deletedEmails = new Set();
        try {
          const deletedSnap = await getDocs(collection(db, 'deleted_clients'));
          deletedSnap.forEach(d => deletedEmails.add(d.id));
        } catch (e) {
          console.error("Erreur fetch deleted_clients:", e);
        }

        // Try fetching registered clients
        try {
          const clientsSnap = await getDocs(collection(db, 'clients'));
          clientsSnap.forEach(d => {
            const data = d.data();
            const email = data.email || d.id;
            if (email && !deletedEmails.has(email)) {
              const label = data.firstName ? `${data.firstName} ${data.lastName} (${email})` : email;
              emailMap.set(email, label);
            }
          });
        } catch (e) {
          // ignore if collection doesn't exist
        }

        // Try fetching orders to capture buyer emails
        try {
          const ordersSnap = await getDocs(collection(db, 'orders'));
          ordersSnap.forEach(d => {
            const data = d.data();
            const email = data.email || data.clientEmail || data.userEmail || data?.customer?.email;
            const name = data.name || data.clientName || data?.customer?.name;
            if (email && !emailMap.has(email) && !deletedEmails.has(email)) {
              const label = name ? `${name} - Commande #${d.id.slice(0,6)} (${email})` : `${email} - Commande #${d.id.slice(0,6)}`;
              emailMap.set(email, label);
            }
          });
        } catch (e) {
          // ignore if collection doesn't exist
        }

        const clientList = Array.from(emailMap.entries()).map(([email, label]) => ({
          email,
          label
        }));
        setClients(clientList);
      } catch (err) {
        console.error("Erreur chargement des clients :", err);
      }
    };
    fetchClients();

    const fetchVehicles = async () => {
      try {
        const vehiclesSnap = await getDocs(collection(db, 'vehicles'));
        const vList = [];
        vehiclesSnap.forEach(d => {
          vList.push({ id: d.id, ...d.data() });
        });
        setVehicles(vList);
      } catch (e) {
        console.error("Erreur chargement véhicules :", e);
      }
    };
    fetchVehicles();
  }, []);

  // 3. Subscribe to Email History & Custom Templates
  useEffect(() => {
    // History
    const historyQuery = query(collection(db, 'email_history'), orderBy('date', 'desc'));
    const unsubscribeHistory = onSnapshot(historyQuery, (snapshot) => {
      const logs = [];
      snapshot.forEach(d => logs.push({ id: d.id, ...d.data() }));
      setHistory(logs);
    }, (err) => {
      console.error('Erreur observation email_history :', err);
    });

    // Custom templates
    const templatesQuery = query(collection(db, 'email_templates'), orderBy('createdAt', 'desc'));
    const unsubscribeTemplates = onSnapshot(templatesQuery, (snapshot) => {
      const tpls = [];
      snapshot.forEach(d => tpls.push({ id: d.id, ...d.data() }));
      setCustomTemplates(tpls);
    }, (err) => {
      console.error('Erreur observation email_templates :', err);
    });

    return () => {
      unsubscribeHistory();
      unsubscribeTemplates();
    };
  }, []);

  // Handle Save SMTP Config
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await setDoc(doc(db, 'settings', 'smtp_config'), smtpConfig);
      toast.success('💾 Configuration SMTP et Personnalisation sauvegardées avec succès !');
    } catch (err) {
      console.error("Erreur sauvegarde SMTP :", err);
      toast.error('Erreur de sauvegarde de la configuration.');
    } finally {
      setSavingConfig(false);
    }
  };

  // Generate responsive high-end HTML email
  const generateHtmlEmail = (subject, plainTextBody) => {
    let formattedBody = plainTextBody ? plainTextBody.replace(/\n/g, '<br/>') : '';

    // Auto-convert vehicle links to beautiful HTML buttons
    formattedBody = formattedBody.replace(
      /(?:Lien du véhicule\s*:\s*)?(https:\/\/aps-trucks\.ms-automobiledeutschland\.de\/vehicule\/[^<\s]+)/gi,
      `<br/>
       <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
         <tr>
           <td align="center">
             <a href="$1" style="background-color: ${smtpConfig.accentColor || '#FCA311'}; color: #050A19; padding: 16px 36px; font-weight: 900; text-decoration: none; border-radius: 8px; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">Voir la Fiche du Véhicule</a>
           </td>
         </tr>
       </table>
       <br/>`
    );
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject || "Message Professionnel"}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b132b; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <!-- Hidden Preheader Text for Gmail/Apple Mail Snippet -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 0px; line-height: 0px; color: transparent;">
    ${plainTextBody ? plainTextBody.substring(0, 150).replace(/\n/g, ' ') : ''}...
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b132b; padding: 35px 15px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.35);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${smtpConfig.headerBg || '#14213D'}; padding: 35px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: ${smtpConfig.headerText || '#FFFFFF'}; text-transform: uppercase;">
                ${smtpConfig.senderName || 'A.P.S. CARS & TRUCKS GMBH'}
              </h1>
              <p style="margin: 6px 0 0; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.7); letter-spacing: 2.5px; text-transform: uppercase;">
                Importation Automobile d'Exception • Allemagne
              </p>
            </td>
          </tr>
          <!-- Accent Gold / Blue Strip -->
          <tr>
            <td style="height: 5px; background-color: ${smtpConfig.accentColor || '#FCA311'};"></td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 45px 40px 35px; line-height: 1.7; font-size: 15px; color: #334155;">
              ${formattedBody}
            </td>
          </tr>
          <!-- Signature block -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 15px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <p style="margin: 0; font-weight: 800; color: #0f172a; font-size: 15px; text-transform: uppercase;">Service Commercial & Direction</p>
                      <p style="margin: 4px 0 0; color: #64748b; font-size: 13px; font-weight: 600;">${smtpConfig.senderName || 'A.P.S. CARS & TRUCKS GMBH'}</p>
                      <p style="margin: 4px 0 0; font-size: 12px;"><a href="https://aps-trucks.ms-automobiledeutschland.de" style="color: ${smtpConfig.accentColor || '#FCA311'}; text-decoration: none; font-weight: 800;">aps-trucks.ms-automobiledeutschland.de</a> • Support Clients Allemagne</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          <!-- Footer Disclaimer -->
          <tr>
            <td style="background-color: #090e1d; padding: 30px 40px; text-align: center; color: #94a3b8; font-size: 11px;">
              <p style="margin: 0 0 10px; font-weight: 800; color: #e2e8f0; letter-spacing: 1px;">${smtpConfig.footerTitle || 'SERVICE PROFESSIONNEL A.P.S. CARS & TRUCKS GMBH'}</p>
              <p style="margin: 0; line-height: 1.5; font-size: 10px; color: #64748b;">${smtpConfig.footerContent || "Ce courriel et ses pièces jointes sont confidentiels et établis à l'attention exclusive de ses destinataires."}</p>
              <p style="margin: 15px 0 0; font-size: 9px; color: #475569;">Pour ne plus recevoir nos e-mails, veuillez nous répondre avec "STOP" ou nous contacter via notre site web.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  // Handle Send Email
  const handleSendEmail = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.to || !form.subject || !form.body) {
      toast.error("Veuillez remplir le destinataire, l'objet et le corps du message.");
      return;
    }

    if (form.subject.includes('[MARQUE ET MODÈLE]') || form.body.includes('[MARQUE ET MODÈLE]') || form.body.includes('[LIEN DU VÉHICULE]')) {
      toast.error("⚠️ Attention : Vous n'avez pas remplacé les variables du véhicule (cliquez sur 'Injecter les infos du véhicule' ou modifiez le texte manuellement).");
      return;
    }

    setSending(true);
    const htmlContent = generateHtmlEmail(form.subject, form.body);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: form.to,
          subject: form.subject,
          html: htmlContent,
          smtpConfig: smtpConfig
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Erreur lors de l\'envoi via le serveur SMTP');
      }

      toast.success('🚀 E-mail envoyé avec succès au destinataire !');
      setPreviewModalOpen(false);
      
      // Log success to Firestore history
      await addDoc(collection(db, 'email_history'), {
        to: form.to,
        subject: form.subject,
        body: form.body,
        date: serverTimestamp(),
        status: 'RÉUSSI',
        error: '-'
      });

      // Clear fields
      setForm({ to: '', subject: '', body: '' });
      setSelectedClient('');
    } catch (err) {
      console.error('Erreur denvoi e-mail :', err);
      toast.error(`❌ Échec de l'envoi : ${err.message}`);
      
      // Log failure to Firestore history
      await addDoc(collection(db, 'email_history'), {
        to: form.to,
        subject: form.subject,
        body: form.body,
        date: serverTimestamp(),
        status: 'ÉCHEC',
        error: err.message || 'Échec du serveur SMTP'
      });
    } finally {
      setSending(false);
    }
  };

  // Handle Save Template
  const handleSaveTemplate = async () => {
    if (!newTemplateTitle.trim()) {
      toast.error('Veuillez donner un titre à votre modèle.');
      return;
    }
    try {
      await addDoc(collection(db, 'email_templates'), {
        title: newTemplateTitle,
        subject: form.subject || 'Sans objet',
        body: form.body || '',
        createdAt: serverTimestamp()
      });
      toast.success('💾 Modèle d\'e-mail enregistré dans votre bibliothèque !');
      setSaveTemplateModalOpen(false);
      setNewTemplateTitle('');
    } catch (err) {
      console.error('Erreur sauvegarde modèle :', err);
      toast.error('Erreur lors de l\'enregistrement du modèle.');
    }
  };

  // Delete history log or custom template
  const handleDeleteLog = async (id) => {
    try {
      await deleteDoc(doc(db, 'email_history', id));
      toast.success('Entrée d\'historique supprimée.');
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const handleDeleteTemplate = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'email_templates', id));
      toast.success('Modèle supprimé.');
    } catch (err) {
      toast.error('Erreur de suppression.');
    }
  };

  // Resend or load an old sent message back into the form
  const handleLoadFromHistory = (log) => {
    setForm({
      to: log.to || '',
      subject: log.subject || '',
      body: log.body || ''
    });
    setActiveTab('send');
    toast.success('📧 E-mail rechargé dans l\'éditeur !');
  };

  // Format timestamp for display
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Instant...';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loadingConfig) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-[#FCA311]">
        <Loader2 className="animate-spin mr-3" size={32} />
        <span className="font-bold uppercase tracking-widest text-sm text-slate-300">Chargement du service E-Mail Pro...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A19] text-white p-4 sm:p-6 lg:p-8 rounded-[2rem] border border-[#1E294B] shadow-2xl">
      
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-[#1E294B]/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Mail size={26} />
            </div>
            Service E-Mail Pro (A.P.S / Garage Pro)
          </h1>
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.2em] mt-1.5 ml-1">
            Messagerie Commerciale SMTP Haut de Gamme • Modèles, Personnalisation & Trajectoire
          </p>
        </div>

        {/* Navigation Tab Pills */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#0A1128] rounded-2xl border border-[#1E294B] shadow-inner">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'send'
                ? 'bg-emerald-500 text-[#050A19] shadow-lg shadow-emerald-500/20 scale-102'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Send size={15} className={activeTab === 'send' ? 'text-[#050A19]' : 'text-emerald-400'} />
            Envoyer un E-mail
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'config'
                ? 'bg-emerald-500 text-[#050A19] shadow-lg shadow-emerald-500/20 scale-102'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings size={15} className={activeTab === 'config' ? 'text-[#050A19]' : 'text-amber-400'} />
            Config SMTP Garage
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-[#050A19] shadow-lg shadow-emerald-500/20 scale-102'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <History size={15} className={activeTab === 'history' ? 'text-[#050A19]' : 'text-amber-400'} />
            Historique Des Envois
            {history.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-slate-800 text-emerald-300 rounded-full text-[10px] border border-slate-700">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ==================== TAB 1 : ENVOYER UN E-MAIL ==================== */}
      {activeTab === 'send' && (
        <div className="bg-[#0B132B] rounded-[2.5rem] border border-[#1E294B] p-6 sm:p-8 md:p-10 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1E294B]/70">
            <span className="w-3 h-7 bg-emerald-500 rounded-full inline-block"></span>
            <h2 className="text-lg font-black uppercase tracking-wider text-white">
              Nouveau Message Professionnel ({smtpConfig.senderName || "Garage Pro"})
            </h2>
          </div>

          <form onSubmit={handleSendEmail} className="space-y-6">
            {/* Row 1 : Select Client + Destination Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <User size={14} className="text-emerald-400" />
                  Sélectionner un client / candidat (Optionnel)
                </label>
                <div className="relative">
                  <select
                    value={selectedClient}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedClient(val);
                      if (val) {
                        setForm(prev => ({ ...prev, to: val }));
                      }
                    }}
                    className="w-full bg-[#050A19] border border-[#1E294B] rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner font-semibold"
                  >
                    <option value="">-- Sélectionner dans vos clients / commandes --</option>
                    {clients.map((c, idx) => (
                      <option key={idx} value={c.email}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Mail size={14} className="text-emerald-400" />
                  Destinataire (E-mail) <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: destinataire@gmail.com"
                  value={form.to}
                  onChange={(e) => setForm(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full bg-[#050A19] border border-[#1E294B] rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-semibold shadow-inner"
                />
              </div>
            </div>

            {/* Row 2 : Select Vehicle */}
            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2 mt-6 md:mt-4">
                <span className="text-amber-400">🚗</span>
                Associer un Véhicule du Garage (Optionnel)
              </label>
              <div className="relative">
                <select
                  value={selectedVehicleId}
                  onChange={(e) => {
                    const vId = e.target.value;
                    setSelectedVehicleId(vId);
                  }}
                  className="w-full bg-[#050A19] border border-[#1E294B] rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner font-semibold"
                >
                  <option value="">-- Sélectionner un véhicule dans votre catalogue --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand || v.make} {v.model} - {v.price}€ (Ref: {v.id.slice(0,6)})
                    </option>
                  ))}
                </select>
              </div>
              {selectedVehicleId && (
                <button
                  type="button"
                  onClick={() => {
                    const v = vehicles.find(v => v.id === selectedVehicleId);
                    if (v) {
                      const name = `${v.brand || v.make || ''} ${v.model || ''}`.trim();
                      const link = `https://aps-trucks.ms-automobiledeutschland.de/vehicule/${v.id}`;
                      setForm(prev => ({
                        ...prev,
                        subject: (prev.subject || '').replace(/\[MARQUE ET MODÈLE\]/g, name),
                        body: (prev.body || '').replace(/\[MARQUE ET MODÈLE\]/g, name).replace(/\[LIEN DU VÉHICULE\]/g, link)
                      }));
                      toast.success(`✅ Données du véhicule ${name} insérées dans l'e-mail !`);
                    }
                  }}
                  className="mt-3 text-xs font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 px-4 py-2 rounded-xl transition-all border border-amber-400/20"
                >
                  ✨ Injecter les infos du véhicule dans l'e-mail
                </button>
              )}
            </div>

            {/* Row 3 : Objet */}
            <div className="mt-6 md:mt-0">
              <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                <FileText size={14} className="text-amber-400" />
                Objet du mail <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Confirmation de votre dossier partenaire / Commande Mercedes-Benz"
                value={form.subject}
                onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full bg-[#050A19] border border-[#1E294B] rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-bold shadow-inner"
              />
            </div>

            {/* Row 3 : Body */}
            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#FCA311]" />
                  Corps du message (Texte libre - Sera formaté en e-mail de luxe) <span className="text-red-400">*</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 normal-case">
                  ✨ En-tête, signature officielle et disclaimer légal ajoutés automatiquement !
                </span>
              </label>
              <textarea
                rows={12}
                required
                placeholder="Écrivez votre message ici... (Les retours à la ligne et paragraphes sont préservés avec élégance)"
                value={form.body}
                onChange={(e) => setForm(prev => ({ ...prev, body: e.target.value }))}
                className="w-full bg-[#050A19] border border-[#1E294B] rounded-3xl p-5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all leading-relaxed font-normal shadow-inner resize-y"
              />
            </div>

            {/* Action Bottom Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#1E294B]/70">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setTemplatesModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3.5 bg-[#050A19] hover:bg-slate-800 text-slate-200 border border-[#1E294B] hover:border-amber-400/50 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md w-full sm:w-auto justify-center"
                >
                  <FolderOpen size={16} className="text-amber-400" />
                  Charger le modèle
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!form.subject && !form.body) {
                      toast.error("Veuillez remplir au moins l'objet ou le message pour sauvegarder un modèle.");
                      return;
                    }
                    setNewTemplateTitle(form.subject || 'Nouveau modèle Garage Pro');
                    setSaveTemplateModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3.5 bg-[#050A19] hover:bg-slate-800 text-slate-200 border border-[#1E294B] hover:border-blue-400/50 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md w-full sm:w-auto justify-center"
                >
                  <Save size={16} className="text-blue-400" />
                  Enregistrer le modèle
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!form.subject && !form.body) {
                      toast.error("Veuillez saisir un message pour afficher l'aperçu HTML.");
                      return;
                    }
                    setPreviewModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3.5 bg-[#050A19] hover:bg-slate-800 text-slate-200 border border-[#1E294B] hover:border-emerald-400/50 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md w-full sm:w-auto justify-center"
                >
                  <Eye size={16} className="text-emerald-400" />
                  Aperçu HTML
                </button>
              </div>

              <button
                type="submit"
                disabled={sending || form.subject.includes('[MARQUE ET MODÈLE]') || form.body.includes('[MARQUE ET MODÈLE]') || form.body.includes('[LIEN DU VÉHICULE]')}
                className={`w-full sm:w-auto px-10 py-4 font-black uppercase tracking-widest text-xs sm:text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 transform hover:scale-102 ${
                  form.subject.includes('[MARQUE ET MODÈLE]') || form.body.includes('[MARQUE ET MODÈLE]') || form.body.includes('[LIEN DU VÉHICULE]')
                    ? "bg-slate-800 text-red-400 border border-red-500/30 cursor-not-allowed opacity-80"
                    : "bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#050A19] shadow-emerald-500/25 disabled:opacity-50"
                }`}
              >
                {sending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Expédition SMTP en cours...
                  </>
                ) : (form.subject.includes('[MARQUE ET MODÈLE]') || form.body.includes('[MARQUE ET MODÈLE]') || form.body.includes('[LIEN DU VÉHICULE]')) ? (
                  <>
                    <AlertCircle size={18} />
                    Remplacez les variables pour envoyer
                  </>
                ) : (
                  <>
                    <Send size={18} className="text-[#050A19] fill-[#050A19]" />
                    🚀 Envoyer l'E-mail
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== TAB 2 : CONFIGURATION SMTP SERVEUR ==================== */}
      {activeTab === 'config' && (
        <div className="bg-[#0B132B] rounded-[2.5rem] border border-[#1E294B] p-6 sm:p-8 md:p-10 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1E294B]/70">
            <span className="w-3 h-7 bg-amber-400 rounded-full inline-block"></span>
            <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2.5">
              Configuration SMTP Serveur ({smtpConfig.senderName || "A.P.S. CARS & TRUCKS GMBH"})
            </h2>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-8">
            
            {/* Section 1 : Serveur SMTP */}
            <div className="bg-[#050A19] p-6 rounded-[2rem] border border-[#1E294B]/60 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <Settings size={16} /> Identifiants & Accessibilité du Serveur Mail
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-2">
                    Hôte SMTP (Host)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: cp5.obambu.com ou smtp.gmail.com"
                    value={smtpConfig.host || ''}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                    className="w-full bg-[#0B132B] border border-[#1E294B] rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-all font-semibold shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-2">
                    Port SMTP
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="ex: 465 (SSL) ou 587 (TLS)"
                    value={smtpConfig.port || ''}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                    className="w-full bg-[#0B132B] border border-[#1E294B] rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-all font-semibold shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-2">
                    Utilisateur (E-mail expéditeur / Compte SMTP)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ex: aibv@permisdeconduirebe.com / contact@garrage.de"
                    value={smtpConfig.user || ''}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                    className="w-full bg-[#0B132B] border border-[#1E294B] rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-all font-semibold shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-2">
                    Mot de passe SMTP
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••••••"
                      value={smtpConfig.password || ''}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                      className="w-full bg-[#0B132B] border border-[#1E294B] rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-all font-semibold shadow-inner pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 : Design & Branding des Mails */}
            <div className="bg-[#050A19] p-6 rounded-[2rem] border border-[#1E294B]/60 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <Sparkles size={16} /> Personnalisation Graphique & Nom Affiché
              </h3>

              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-2">
                  Nom de l'expéditeur affiché dans la messagerie client
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: A.P.S. CARS & TRUCKS GMBH / GARAGE AUTO GERMANIA"
                  value={smtpConfig.senderName || ''}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, senderName: e.target.value })}
                  className="w-full bg-[#0B132B] border border-[#1E294B] rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-all font-bold shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-2">
                    Couleur de fond En-tête
                  </label>
                  <div className="flex items-center gap-3 bg-[#0B132B] border border-[#1E294B] rounded-2xl p-2.5 shadow-inner">
                    <input
                      type="color"
                      value={smtpConfig.headerBg || '#14213D'}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, headerBg: e.target.value })}
                      className="w-12 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={smtpConfig.headerBg || '#14213D'}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, headerBg: e.target.value })}
                      className="w-full bg-transparent text-sm font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-2">
                    Couleur du texte En-tête
                  </label>
                  <div className="flex items-center gap-3 bg-[#0B132B] border border-[#1E294B] rounded-2xl p-2.5 shadow-inner">
                    <input
                      type="color"
                      value={smtpConfig.headerText || '#FFFFFF'}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, headerText: e.target.value })}
                      className="w-12 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={smtpConfig.headerText || '#FFFFFF'}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, headerText: e.target.value })}
                      className="w-full bg-transparent text-sm font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-2">
                    Couleur d'accentuation (Ligne)
                  </label>
                  <div className="flex items-center gap-3 bg-[#0B132B] border border-[#1E294B] rounded-2xl p-2.5 shadow-inner">
                    <input
                      type="color"
                      value={smtpConfig.accentColor || '#FCA311'}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, accentColor: e.target.value })}
                      className="w-12 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={smtpConfig.accentColor || '#FCA311'}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, accentColor: e.target.value })}
                      className="w-full bg-transparent text-sm font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 : Footer Disclaimer */}
            <div className="bg-[#050A19] p-6 rounded-[2rem] border border-[#1E294B]/60 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                <FileText size={16} /> Pied de Page (Footer & Mention de Confidentialité)
              </h3>

              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-2">
                  Titre du pied de page (Footer)
                </label>
                <input
                  type="text"
                  placeholder="ex: SERVICE PROFESSIONNEL A.P.S. CARS & TRUCKS GMBH"
                  value={smtpConfig.footerTitle || ''}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, footerTitle: e.target.value })}
                  className="w-full bg-[#0B132B] border border-[#1E294B] rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-all font-semibold shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-2">
                  Contenu du pied de page (Disclaimer légal & confidentialité)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ce courriel et ses pièces jointes sont confidentiels..."
                  value={smtpConfig.footerContent || ''}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, footerContent: e.target.value })}
                  className="w-full bg-[#0B132B] border border-[#1E294B] rounded-2xl p-5 text-sm text-white focus:outline-none focus:border-amber-400 transition-all shadow-inner leading-relaxed"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-[#1E294B]/70">
              <button
                type="submit"
                disabled={savingConfig}
                className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#050A19] font-black uppercase tracking-widest text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-3 disabled:opacity-50 transform hover:scale-102"
              >
                {savingConfig ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-[#050A19]" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={18} className="text-[#050A19]" />
                    💾 Sauvegarder la configuration
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== TAB 3 : HISTORIQUE DES ENVOIS ==================== */}
      {activeTab === 'history' && (
        <div className="bg-[#0B132B] rounded-[2.5rem] border border-[#1E294B] p-6 sm:p-8 md:p-10 shadow-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-[#1E294B]/70">
            <div className="flex items-center gap-3">
              <span className="w-3 h-7 bg-teal-400 rounded-full inline-block"></span>
              <h2 className="text-lg font-black uppercase tracking-wider text-white">
                Messages Envoyés Via Le Service E-Mail
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Total d'envois enregistrés : <strong className="text-emerald-400">{history.length}</strong>
            </span>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-20 bg-[#050A19] rounded-3xl border border-dashed border-[#1E294B] p-8">
              <History size={48} className="mx-auto mb-4 text-slate-600 animate-pulse" />
              <p className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                Aucun e-mail n'a été expédié pour le moment
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Vos envois et leur statut d'accréditation (Réussi/Échec) apparaîtront automatiquement ici en temps réel.
              </p>
              <button
                onClick={() => setActiveTab('send')}
                className="mt-6 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#050A19] rounded-xl font-black uppercase tracking-widest text-xs inline-flex items-center gap-2 shadow-lg"
              >
                <Send size={14} /> composer mon premier e-mail
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#1E294B] shadow-inner bg-[#050A19]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0D1530] text-slate-300 uppercase tracking-widest text-[11px] font-black border-b border-[#1E294B]">
                    <th className="py-4 px-5">Destinataire</th>
                    <th className="py-4 px-5">Objet</th>
                    <th className="py-4 px-5">Date & Heure</th>
                    <th className="py-4 px-5">Statut</th>
                    <th className="py-4 px-5">Détails/Erreur</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E294B]/60 text-sm font-medium">
                  {history.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="py-4 px-5 font-bold text-white">
                        {log.to}
                      </td>
                      <td className="py-4 px-5 text-slate-200 max-w-[240px] truncate" title={log.subject}>
                        {log.subject}
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-xs font-mono whitespace-nowrap">
                        {formatDateTime(log.date)}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        {log.status === 'RÉUSSI' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-black tracking-wider uppercase shadow-2xs">
                            <CheckCircle2 size={13} /> RÉUSSI
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg text-xs font-black tracking-wider uppercase shadow-2xs">
                            <XCircle size={13} /> ÉCHEC
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-xs text-slate-400 font-mono max-w-[200px] truncate" title={log.error}>
                        {log.error || '-'}
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setForm({ to: log.to || '', subject: log.subject || '', body: log.body || '' });
                              setPreviewModalOpen(true);
                            }}
                            title="Aperçu du message envoyé"
                            className="p-2 bg-slate-800 hover:bg-emerald-500 hover:text-[#050A19] text-slate-300 rounded-xl transition-colors shadow-xs"
                          >
                            <Eye size={15} />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleLoadFromHistory(log)}
                            title="Réexpédier ou recharger cet email dans l'éditeur"
                            className="p-2 bg-slate-800 hover:bg-amber-400 hover:text-[#050A19] text-slate-300 rounded-xl transition-colors shadow-xs"
                          >
                            <RefreshCw size={15} />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteLog(log.id)}
                            title="Supprimer cet historique"
                            className="p-2 bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white rounded-xl transition-colors shadow-xs"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODAL 1 : APERÇU HTML (HTML PREVIEW) ==================== */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0B132B] border border-[#1E294B] rounded-[2.5rem] w-full max-w-4xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[92vh] my-auto animate-fade-in">
            <div className="flex justify-between items-center gap-4 mb-4 pb-4 border-b border-[#1E294B]">
              <div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white flex items-center gap-2.5">
                  <Sparkles className="text-emerald-400" size={22} />
                  Aperçu du Message E-Mail (Rendu Officiel Client)
                </h3>
                <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-0.5">
                  Destinataire : <strong className="text-emerald-300">{form.to || "Non spécifié"}</strong> • Objet : <strong className="text-white">{form.subject || "Sans objet"}</strong>
                </p>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-3 bg-slate-800/80 hover:bg-red-500 text-slate-400 hover:text-white rounded-2xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Iframe Preview Box */}
            <div className="flex-1 overflow-hidden rounded-2xl border border-[#1E294B] bg-slate-200 min-h-[420px]">
              <iframe
                title="Aperçu E-Mail HTML"
                srcDoc={generateHtmlEmail(form.subject, form.body)}
                className="w-full h-full min-h-[500px] border-0"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-[#1E294B]">
              <span className="text-xs font-semibold text-slate-400 italic flex items-center gap-1.5">
                <AlertCircle size={15} className="text-amber-400" />
                Le rendu s'adapte parfaitement à Gmail, Outlook et sur téléphones mobiles.
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="flex-1 sm:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-black uppercase text-xs tracking-wider transition-colors"
                >
                  Fermer l'aperçu
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSendEmail(e)}
                  disabled={sending}
                  className="flex-1 sm:flex-none px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#050A19] font-black uppercase text-xs tracking-wider rounded-xl shadow-lg transition-transform hover:scale-102 flex items-center justify-center gap-2"
                >
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  🚀 Confirmer & Envoyer l'E-Mail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2 : CHARGER UN MODÈLE (TEMPLATES) ==================== */}
      {templatesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0B132B] border border-[#1E294B] rounded-[2.5rem] w-full max-w-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] my-auto animate-fade-in">
            <div className="flex justify-between items-center gap-4 mb-6 pb-4 border-b border-[#1E294B]">
              <div>
                <h3 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2.5">
                  <FolderOpen className="text-amber-400" size={24} />
                  Bibliothèque de Modèles D'E-Mails
                </h3>
                <p className="text-xs text-slate-400 font-extrabold tracking-widest uppercase mt-0.5">
                  Sélectionnez un modèle prêt à l'emploi ou l'un de vos modèles personnalisés
                </p>
              </div>
              <button
                onClick={() => setTemplatesModalOpen(false)}
                className="p-3 bg-slate-800/80 hover:bg-red-500 text-slate-400 hover:text-white rounded-2xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              
              {/* Predefined templates */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                  <Sparkles size={14} /> Modèles Officiels Garage Pro (Inclus)
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {DEFAULT_TEMPLATES.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setForm(prev => ({ ...prev, subject: tpl.subject, body: tpl.body }));
                        setTemplatesModalOpen(false);
                        toast.success(` Modèle "${tpl.title.replace(/[^a-zA-Z\s]/g, '')}" chargé avec succès !`);
                      }}
                      className="p-5 bg-[#050A19] hover:bg-slate-900 border border-[#1E294B] hover:border-emerald-500 rounded-2xl cursor-pointer transition-all shadow-md group"
                    >
                      <div className="flex items-center justify-between font-bold text-sm text-white mb-2 group-hover:text-emerald-400 transition-colors">
                        <span>{tpl.title}</span>
                        <span className="text-[10px] uppercase px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/30">
                          Cliquer pour insérer
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold mb-1 truncate">
                        <strong>Objet :</strong> {tpl.subject}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2 italic font-normal">
                        {tpl.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom saved templates */}
              {customTemplates.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#1E294B]/70">
                  <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                    <Save size={14} /> Vos Modèles Personnalisés Enregistrés ({customTemplates.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {customTemplates.map((tpl) => (
                      <div
                        key={tpl.id}
                        onClick={() => {
                          setForm(prev => ({ ...prev, subject: tpl.subject, body: tpl.body }));
                          setTemplatesModalOpen(false);
                          toast.success(' Modèle personnalisé chargé !');
                        }}
                        className="p-5 bg-[#050A19] hover:bg-slate-900 border border-[#1E294B] hover:border-amber-400 rounded-2xl cursor-pointer transition-all shadow-md group flex items-start justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 font-bold text-sm text-white mb-2 group-hover:text-amber-400 transition-colors">
                            <span>⭐ {tpl.title}</span>
                          </div>
                          <p className="text-xs text-slate-400 font-semibold mb-1 truncate">
                            <strong>Objet :</strong> {tpl.subject}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2 font-normal">
                            {tpl.body}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                          title="Supprimer ce modèle"
                          className="p-2.5 bg-slate-800/80 hover:bg-red-500 text-slate-400 hover:text-white rounded-xl transition-colors z-10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#1E294B] flex justify-end">
              <button
                type="button"
                onClick={() => setTemplatesModalOpen(false)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase text-xs tracking-wider rounded-xl transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 3 : ENREGISTRER LE MODÈLE (SAVE TEMPLATE) ==================== */}
      {saveTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-[#1E294B] rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-black uppercase tracking-wider text-white mb-2 flex items-center gap-2">
              <Save className="text-blue-400" size={20} />
              Enregistrer ce modèle d'e-mail
            </h3>
            <p className="text-xs text-slate-400 font-semibold mb-6">
              Sauvegardez l'objet et le corps actuels dans votre bibliothèque pour vos futurs envois rapides.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-300 mb-2">
                Nom du modèle (ex: Relance Paiement VIP) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Ex: Confirmation RDV Livraison"
                value={newTemplateTitle}
                onChange={(e) => setNewTemplateTitle(e.target.value)}
                className="w-full bg-[#050A19] border border-[#1E294B] rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-blue-400 font-bold shadow-inner"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSaveTemplateModalOpen(false)}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase text-xs tracking-wider rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-102 flex items-center gap-2"
              >
                <PlusCircle size={15} />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmailManager;
