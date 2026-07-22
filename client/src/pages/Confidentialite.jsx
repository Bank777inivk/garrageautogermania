import React, { useEffect } from 'react';
import { ShieldAlert, Eye, Lock, Server, CheckCircle2 } from 'lucide-react';
import useClientVehicleStore from '@shared/store/useClientVehicleStore';

const Confidentialite = () => {
  const { settings, fetchSettings } = useClientVehicleStore();

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  const companyName = settings?.companyName || 'A.P.S Cars and Trucks GmbH';
  const email = settings?.email || 'contact@garrageautogermania.com';
  const address = settings?.address || 'Basler Str. 5, Schliengen, Germany, 79418';

  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <div className="inline-flex p-3 bg-amber-600/10 rounded-full text-amber-600 mb-4">
            <Lock size={24} />
          </div>
          <p className="text-[10px] md:text-xs font-bold text-amber-600 uppercase tracking-[0.2em] mb-3">Protection des données</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-montserrat text-slate-900 uppercase tracking-tight">
            Politique de Confidentialité
          </h1>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 space-y-8 text-slate-750 text-sm leading-relaxed">
          
          <p className="text-slate-500 text-xs">
            Dernière mise à jour : 22 juillet 2026. Chez {companyName}, nous accordons une importance primordiale à la protection et au respect de votre vie privée. La présente politique décrit comment nous collectons, utilisons et protégeons vos données à caractère personnel.
          </p>

          {/* Section: Collecte */}
          <section className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Eye size={16} className="text-amber-600" />
              1. Collecte des Données Personnelles
            </h2>
            <p>
              Nous collectons les données que vous nous fournissez volontairement lors de l'utilisation de nos services, notamment via :
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li>Le formulaire de contact (nom, prénom, adresse e-mail, numéro de téléphone, message).</li>
              <li>Le processus de commande et d'achat de véhicule (informations de facturation, adresse de livraison, justificatifs d'identité nécessaires à l'immatriculation).</li>
              <li>La création d'un compte client sur notre espace membre.</li>
            </ul>
          </section>

          {/* Section: Finalités */}
          <section className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CheckCircle2 size={16} className="text-amber-600" />
              2. Utilisation et Finalités du Traitement
            </h2>
            <p>
              Vos données personnelles sont traitées pour des finalités spécifiques et légitimes :
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li><strong>Gestion des services d'importation</strong> : Traitement des commandes, courtage automobile, préparation logistique et livraison à domicile.</li>
              <li><strong>Relations clients</strong> : Réponse aux demandes de devis, suivi de commande en temps réel et support après-vente.</li>
              <li><strong>Obligations légales</strong> : Facturation, comptabilité et formalités administratives d'exportation/importation de véhicules.</li>
            </ul>
          </section>

          {/* Section: Sécurité */}
          <section className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Lock size={16} className="text-amber-600" />
              3. Sécurité et Conservation
            </h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques (chiffrement SSL, serveurs sécurisés Firestore) pour protéger vos données contre tout accès non autorisé, altération ou divulgation.
            </p>
            <p>
              Vos données sont conservées uniquement pendant la durée nécessaire à la réalisation des finalités décrites ou pour nous conformer à nos obligations légales de conservation (par exemple, 10 ans pour les pièces comptables).
            </p>
          </section>

          {/* Section: Destinataires */}
          <section className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Server size={16} className="text-amber-600" />
              4. Partage des Données
            </h2>
            <p>
              {companyName} ne vend, ne loue, ni ne cède vos données à des tiers à des fins marketing. Vos données peuvent être partagées uniquement avec :
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li>Nos prestataires de confiance nécessaires à l'exécution de nos services (partenaires logistiques, transporteurs pour la livraison à domicile).</li>
              <li>Les autorités judiciaires ou douanières si la loi l'exige.</li>
            </ul>
          </section>

          {/* Section: Vos Droits */}
          <section className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldAlert size={16} className="text-amber-600" />
              5. Vos Droits (RGPD)
            </h2>
            <p>
              Conformément à la réglementation européenne sur la protection des données (RGPD), vous disposez de droits complets sur vos données personnelles :
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li>Droit d'accès et d'obtenir copie de vos données.</li>
              <li>Droit de rectification de vos informations si elles sont incomplètes ou inexactes.</li>
              <li>Droit à l'effacement ("droit à l'oubli").</li>
              <li>Droit à la limitation du traitement et d'opposition pour motifs légitimes.</li>
            </ul>
            <p className="mt-2">
              Pour exercer vos droits, vous pouvez contacter notre responsable de la protection des données par e-mail à : <a href={`mailto:${email}`} className="text-amber-600 font-extrabold hover:underline">{email}</a> ou par courrier à notre siège social : <span className="font-extrabold">{address}</span>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Confidentialite;
