import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '@shared/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { CheckCircle, Printer, ArrowRight, Download, User, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { generateOrderPDF } from '@shared/utils/generateAdminDocuments';
import { toast } from 'react-hot-toast';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }

    const fetchSettings = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'documents');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data());
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Commande introuvable</h2>
        <Link to="/" className="text-red-700 hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-32 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Success Message */}
        <div className="bg-white p-8 rounded-xl shadow-sm border-t-4 border-green-600 mb-8 text-center">
          <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Merci. Votre commande a été reçue.</h1>
          <p className="text-gray-500 mb-6 font-medium">Un email de confirmation vient d'être envoyé à {order.customer.email}</p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 max-w-2xl mx-auto text-left">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center">
              <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
              Accédez à votre Espace Client
            </h3>
            <p className="text-sm text-slate-600 mb-4 pl-8">
              Cliquez sur le bouton ci-dessous pour retrouver le détail de votre commande et télécharger votre facture proforma.
            </p>

            <h3 className="font-bold text-slate-900 mb-2 flex items-center">
              <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
              Effectuez le virement
            </h3>
            <p className="text-sm text-slate-600 mb-4 pl-8">
              Utilisez les coordonnées bancaires présentes dans le détail de votre commande pour finaliser le paiement.
            </p>

            <h3 className="font-bold text-slate-900 mb-2 flex items-center">
              <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
              Validation et Expédition
            </h3>
            <p className="text-sm text-slate-600 pl-8">
              Dès réception des fonds, votre commande sera validée et le véhicule préparé pour l'expédition.
            </p>
          </div>
        </div>

        {/* Order Meta */}
        {/* <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-center md:text-left">
            <div>
              <p className="text-gray-500 uppercase text-xs font-bold mb-1">Numéro de commande</p>
              <p className="font-bold text-gray-900 text-lg">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase text-xs font-bold mb-1">Date</p>
              <p className="font-bold text-gray-900 text-lg">
                {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-gray-500 uppercase text-xs font-bold mb-1">Total</p>
              <p className="font-bold text-gray-900 text-lg">{order.total?.toLocaleString()}€</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase text-xs font-bold mb-1">Moyen de paiement</p>
              <p className="font-bold text-gray-900 text-lg">Virement bancaire</p>
            </div>
          </div>
        </div> */}

        {/* Bank Details */}
        {/* <div className="bg-white p-8 rounded-xl shadow-sm mb-8 relative">
          <div className="flex justify-between items-start mb-6">
             <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Nos Coordonnées Bancaires</h2>
             <button 
              onClick={() => window.print()} 
              className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium border border-gray-200 rounded px-3 py-1 hover:bg-gray-50 transition-colors"
            >
              <Printer size={16} className="mr-2" />
              Imprimer
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-gray-500 text-sm mb-1">Titulaire du compte :</p>
              <p className="font-bold text-gray-900 text-lg">Jennifer Suß</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-500 text-sm mb-1">IBAN :</p>
                <p className="font-bold text-gray-900 text-lg font-mono bg-gray-50 p-3 rounded border border-gray-200">
                  DE56 1001 1001 2176 5100 26
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">BIC :</p>
                <p className="font-bold text-gray-900 text-lg font-mono bg-gray-50 p-3 rounded border border-gray-200">
                  NTSBDEB1XXX
                </p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-start mt-4">
              <div className="bg-red-100 p-2 rounded-full mr-3 text-red-600 mt-1">
                <CheckCircle size={16} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Communication / Référence de paiement</p>
                <p className="text-slate-800 text-sm mt-1">
                  Veuillez indiquer votre numéro de commande <strong>{order.orderNumber}</strong> en communication de votre virement.
                </p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Order Details */}
        {/* <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wide">Détails de la commande</h2>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-4 border-b border-gray-200 font-bold text-gray-900">PRODUIT</th>
                <th className="py-4 border-b border-gray-200 font-bold text-gray-900 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 border-b border-gray-100 text-gray-600">
                    {item.brand} {item.model} <span className="font-bold text-gray-900">× 1</span>
                  </td>
                  <td className="py-4 border-b border-gray-100 text-gray-900 font-bold text-right">
                    {Number(item.price).toLocaleString()}€
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-4 border-b border-gray-100 font-bold text-gray-700">Sous-total :</td>
                <td className="py-4 border-b border-gray-100 font-bold text-red-700 truncate">
                  {order.subtotal?.toLocaleString()}€
                </td>
              </tr>
              <tr>
                <td className="py-4 border-b border-gray-100 font-bold text-gray-700">Expédition :</td>
                <td className="py-4 border-b border-gray-100 text-gray-600 text-right">
                  {order.shipping === 0 ? 'Gratuite' : `${order.shipping}€`}
                </td>
              </tr>
              <tr>
                <td className="py-4 font-bold text-gray-900 text-lg">Moyen de paiement :</td>
                <td className="py-4 font-bold text-gray-900 text-right">Virement bancaire</td>
              </tr>
              <tr>
                <td className="py-4 font-bold text-gray-900 text-xl border-t border-gray-200">Total :</td>
                <td className="py-4 font-bold text-blue-600 text-xl border-t border-gray-200 text-right">
                  {order.total?.toLocaleString()}€
                </td>
              </tr>
            </tbody>
          </table>
        </div> */}

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button
            onClick={() => {
              try {
                generateOrderPDF(order, settings);
                toast.success("Bon de commande téléchargé");
              } catch (error) {
                console.error("PDF Error:", error);
                toast.error("Erreur lors de la génération du PDF");
              }
            }}
            className="bg-white text-gray-900 border border-gray-300 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center shadow-sm justify-center"
          >
            <FileText size={20} className="mr-2" />
            Télécharger mon bon de commande
          </button>

          <Link
            to="/dashboard/billing"
            className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center shadow-lg justify-center"
          >
            <User size={20} className="mr-2" />
            Accéder à mon espace facturation
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
