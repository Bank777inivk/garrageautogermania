import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import useCartStore from '@shared/store/useCartStore';
import useAuthStore from '@shared/store/useAuthStore';
import useClientVehicleStore from '@shared/store/useClientVehicleStore';
import { db, auth } from '@shared/firebase/config';
import { collection, serverTimestamp, doc, getDoc, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle, CreditCard, Building2, User, MapPin, PackageCheck, ArrowLeft, ArrowRight, ShieldCheck, Info, Zap } from 'lucide-react';

const checkoutSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().min(5, 'L\'adresse est requise'),
  city: z.string().min(2, 'La ville est requise'),
  zipCode: z.string().min(4, 'Le code postal est requis'),
  country: z.string().min(2, 'Le pays est requis'),
  company: z.string().optional(),
  createAccount: z.boolean().optional(),
  password: z.string().optional(),
}).refine((data) => {
  return true;
});

const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, getTotalPrice, getShippingCost, getFinalTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { pendingVehicleIds, fetchUserPendingVehicles } = useClientVehicleStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfileData, setHasProfileData] = useState(false);
  const [conflictingItems, setConflictingItems] = useState([]);
  const isSuccessRef = React.useRef(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: 'France',
      createAccount: !user,
    }
  });

  useEffect(() => {
    if (user) {
      setValue('email', user.email || '');
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, 'clients', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setValue('firstName', data.firstName || '');
            setValue('lastName', data.lastName || '');
            if (data.email) setValue('email', data.email);
            if (data.address) setValue('address', data.address);
            if (data.city) setValue('city', data.city);
            if (data.zipCode) setValue('zipCode', data.zipCode);
            if (data.country) setValue('country', data.country);
            if (data.phone) setValue('phone', data.phone);
            if (data.company) setValue('company', data.company);

            if (data.firstName && data.lastName && data.address && data.phone) {
              setHasProfileData(true);
            }
          }
        } catch (err) {
          console.error("Error pre-filling checkout:", err);
        }
      };
      fetchProfile();
    }
  }, [user, setValue]);

  const createAccount = watch('createAccount');

  useEffect(() => {
    if (!user) {
      setHasProfileData(false);
      setIsEditing(false);
      setIsLoggingIn(false);
      setValue('firstName', '');
      setValue('lastName', '');
      setValue('email', '');
      setValue('phone', '');
      setValue('address', '');
      setValue('city', '');
      setValue('zipCode', '');
      setValue('country', 'France');
      setValue('company', '');
      setValue('createAccount', true);
    }
  }, [user, setValue]);

  useEffect(() => {
    if (items.length === 0 && !isSuccessRef.current) {
      navigate('/panier');
      // toast.error('Votre panier est vide');
    }
  }, [items, navigate]);

  useEffect(() => {
    if (user && pendingVehicleIds.length > 0) {
      const duplicates = items.filter(item => pendingVehicleIds.includes(item.id));
      setConflictingItems(duplicates);
    } else {
      setConflictingItems([]);
    }
  }, [items, pendingVehicleIds, user]);

  const [paymentOption, setPaymentOption] = useState('deposit'); // 'deposit' or 'full'

  const subtotal = getTotalPrice();
  const shipping = getShippingCost();
  const fullPaymentDiscount = 0.15; // 15% discount
  const discountAmount = paymentOption === 'full' ? Math.round(subtotal * fullPaymentDiscount) : 0;
  const finalTotal = subtotal + shipping - discountAmount;
  const amountToPayNow = paymentOption === 'deposit' ? Math.round(finalTotal * 0.3) : finalTotal;

  const onSubmit = async (data) => {
    setIsProcessing(true);
    let userId = user ? user.uid : null;

    // Check for duplicate reservations if user is logged in
    if (userId) {
      const duplicateItem = items.find(item => pendingVehicleIds.includes(item.id));
      if (duplicateItem) {
        toast.error(`Vous avez déjà une commande en cours pour le véhicule : ${duplicateItem.brand} ${duplicateItem.model}`);
        setIsProcessing(false);
        return;
      }
    }

    try {
      if (!user && data.createAccount && data.password) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
          userId = userCredential.user.uid;
          toast.success('Compte créé avec succès !');
        } catch (error) {
          console.error("Erreur création compte:", error);
          if (error.code === 'auth/email-already-in-use') {
            toast.error('Cet email est déjà utilisé. Veuillez vous connecter.');
            setIsProcessing(false);
            return;
          }
          toast.error("Erreur lors de la création du compte: " + error.message);
          setIsProcessing(false);
          return;
        }
      }

      let customerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        zipCode: data.zipCode,
        country: data.country,
        company: data.company || ''
      };

      if (user) {
        const docRef = doc(db, 'clients', user.uid);
        const docSnap = await getDoc(docRef);
        const profile = docSnap.exists() ? docSnap.data() : {};

        customerData = {
          ...customerData,
          firstName: profile.firstName || data.firstName || '',
          lastName: profile.lastName || data.lastName || '',
          email: user.email || profile.email || data.email || '',
          phone: profile.phone || data.phone || '',
        };

        if (!customerData.phone) {
          toast.error("Veuillez renseigner votre numéro de téléphone dans votre profil ou ici");
          setIsProcessing(false);
          return;
        }
      } else {
        if (!data.firstName || !data.lastName || !data.email || !data.phone) {
          toast.error("Veuillez remplir tous les champs obligatoires");
          setIsProcessing(false);
          return;
        }
      }

      const orderData = {
        items: items.map(item => ({
          id: item.id,
          brand: item.brand,
          model: item.model,
          price: item.price,
          discount: item.discount || 0,
          effectivePrice: Math.round(item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price),
          image: item.images?.[0] || ''
        })),
        customer: customerData,
        subtotal: subtotal,
        shipping: shipping,
        discountAmount: discountAmount,
        total: finalTotal,
        amountToPayNow: amountToPayNow,
        paymentOption: paymentOption,
        fullPaymentDiscount: paymentOption === 'full' ? 15 : 0,
        status: 'pending',
        paymentMethod: 'bank_transfer',
        userId: userId,
        createdAt: serverTimestamp(),
        orderNumber: Math.floor(100000 + Math.random() * 900000).toString()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      isSuccessRef.current = true;
      clearCart();
      toast.success('Commande validée !');
      navigate(`/commande-confirmee/${docRef.id}`);

    } catch (error) {
      console.error("Erreur commande:", error);
      toast.error("Une erreur est survenue lors de la commande.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInlineLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error("Veuillez remplir tous les champs de connexion");
      return;
    }

    setIsProcessing(true);
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
      toast.success("Connecté avec succès !");
      setIsLoggingIn(false);
    } catch (error) {
      console.error("Erreur connexion inline:", error);
      toast.error("Identifiants incorrects ou erreur de connexion.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !isSuccessRef.current) return null;

  return (
    <div className="bg-white min-h-screen pt-24 pb-10 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center mb-12 sm:mb-20">
          <div className="p-3 bg-slate-900 rounded-2xl shadow-lg border border-amber-600/20 mb-6">
            <PackageCheck size={28} className="text-amber-600" />
          </div>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] mb-3 text-center">Validation Finale</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-montserrat text-slate-900 uppercase tracking-tight text-center">
            Détails de Commande
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
          {/* Left Column: Billing Details */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-10">
                <h2 className="text-[12px] font-bold font-montserrat text-slate-900 uppercase tracking-[0.1em] flex items-center">
                  <User className="mr-3 text-amber-600 flex-shrink-0" size={16} />
                  {t('checkout.billingDetails', 'Informations de Facturation')}
                </h2>
                {!user && (
                  <button 
                    type="button"
                    onClick={() => setIsLoggingIn(!isLoggingIn)} 
                    className="text-[9px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-700 transition-colors flex items-center gap-2 group"
                  >
                    {isLoggingIn ? "Créer un compte ?" : "Déjà un compte ?"} <span className="p-1.5 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">{isLoggingIn ? "S'inscrire" : "Connectez-vous"}</span>
                  </button>
                )}
                {user && hasProfileData && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-[10px] font-bold text-amber-600 uppercase tracking-widest hover:underline"
                  >
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </button>
                )}
              </div>

              {!isLoggingIn ? (
                /* Registration / Guest Form */
                user && hasProfileData && !isEditing ? (
                  /* Profile Summary View */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Destinataire</span>
                        <p className="text-sm font-bold text-slate-900">{watch('firstName')} {watch('lastName')}</p>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact</span>
                        <p className="text-sm text-slate-600">{watch('email')}</p>
                        <p className="text-sm text-slate-600">{watch('phone')}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Adresse de livraison</span>
                        <p className="text-sm text-slate-900 font-medium leading-relaxed">
                          {watch('address')}<br />
                          {watch('zipCode')} {watch('city')}<br />
                          {watch('country')}
                        </p>
                      </div>
                      {watch('company') && (
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Société</span>
                          <p className="text-sm text-slate-600">{watch('company')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Full Form View */
                  <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    {!user && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Prénom *</label>
                          <input {...register('firstName')} className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-amber-600 focus:bg-white outline-none transition-all ${errors.firstName ? 'border-red-500' : 'border-gray-100'}`} />
                          {errors.firstName && <p className="text-red-500 text-[9px] mt-1 pl-1 font-bold">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Nom *</label>
                          <input {...register('lastName')} className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-amber-600 focus:bg-white outline-none transition-all ${errors.lastName ? 'border-red-500' : 'border-gray-100'}`} />
                          {errors.lastName && <p className="text-red-500 text-[9px] mt-1 pl-1 font-bold">{errors.lastName.message}</p>}
                        </div>
                      </div>
                    )}

                    {!user && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Téléphone *</label>
                          <input type="tel" {...register('phone')} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 focus:bg-white outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">E-mail *</label>
                          <input {...register('email')} type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 focus:bg-white outline-none transition-all" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-6 pt-6 border-t border-gray-50">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Adresse Complète *</label>
                        <input {...register('address')} placeholder="N° et nom de rue..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 focus:bg-white outline-none transition-all" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Code postal *</label>
                          <input {...register('zipCode')} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 focus:bg-white outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Ville *</label>
                          <input {...register('city')} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 focus:bg-white outline-none transition-all" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Pays *</label>
                          <select {...register('country')} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 focus:bg-white outline-none transition-all cursor-pointer">
                            <option value="France">France</option>
                            <option value="Belgique">Belgique</option>
                            <option value="Suisse">Suisse</option>
                            <option value="Luxembourg">Luxembourg</option>
                            <option value="Allemagne">Allemagne</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Société (Facultatif)</label>
                          <input {...register('company')} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 focus:bg-white outline-none transition-all" />
                        </div>
                      </div>
                    </div>

                    {!user ? (
                      <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center mb-6">
                          <input
                            type="checkbox"
                            id="createAccount"
                            {...register('createAccount')}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-600 border-gray-300 rounded-md transition-all cursor-pointer"
                          />
                          <label htmlFor="createAccount" className="ml-3 block text-xs font-bold text-slate-900 uppercase tracking-widest cursor-pointer">
                            Créer un compte pour le suivi ?
                          </label>
                        </div>

                        {createAccount && (
                          <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Définir un mot de passe *</label>
                            <input
                              {...register('password')}
                              type="password"
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 outline-none"
                              placeholder="Minimum 6 caractères"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-8 p-5 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-4">
                        <ShieldCheck className="text-green-600 flex-shrink-0" size={20} />
                        <div className="flex flex-col">
                          <p className="text-[10px] font-bold text-green-800 uppercase tracking-[0.1em]">Session Active</p>
                          <p className="text-green-600 text-xs mt-0.5">La commande sera rattachée à votre compte professionnel.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : (
                /* Inline Login View */
                <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-amber-600/10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-amber-600 rounded-xl text-white shadow-lg">
                        <ShieldCheck size={18} />
                      </div>
                      <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Connexion Sécurisée</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">E-mail</label>
                        <input 
                          type="email" 
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Mot de passe</label>
                        <input 
                          type="password" 
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 outline-none" 
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleInlineLogin}
                      disabled={isProcessing}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                    >
                      {isProcessing ? "Connexion..." : "Se connecter"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Strategy Selection */}
            <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-8">
                <h2 className="text-[12px] font-bold font-montserrat text-slate-900 uppercase tracking-[0.1em] flex items-center">
                  <CreditCard className="mr-3 text-amber-600 flex-shrink-0" size={16} />
                  Mode de Paiement
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <button
                  type="button"
                  onClick={() => setPaymentOption('deposit')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all relative ${paymentOption === 'deposit' ? 'border-amber-600 bg-amber-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  {paymentOption === 'deposit' && <CheckCircle size={20} className="absolute top-4 right-4 text-amber-600" />}
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Option Standard</p>
                  <p className="text-sm font-black text-slate-900 uppercase">Acompte de 30%</p>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Payez seulement 30% pour réserver, soldez avant la livraison.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('full')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all relative ${paymentOption === 'full' ? 'border-amber-600 bg-amber-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  <div className="absolute -top-3 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                    -15% Réduction Immédiate
                  </div>
                  {paymentOption === 'full' && <CheckCircle size={20} className="absolute top-4 right-4 text-emerald-600" />}
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Offre Exclusive</p>
                  <p className="text-sm font-black text-slate-900 uppercase">Paiement Intégral</p>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Économisez 15% sur le prix total en réglant la totalité dès maintenant.</p>
                </button>
              </div>

              {/* Enhanced Explanation Section */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 shrink-0">
                    <Info size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Comprendre nos modes de règlement</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-tight">Paiement Échelonné (30%)</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                          Idéal pour une gestion souple de votre trésorerie. L'acompte de 30% bloque immédiatement le véhicule à votre nom. Le solde (70%) ne sera demandé qu'une fois le véhicule prêt pour l'expédition finale.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tight">Avantage Intégral (-15%)</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                          En choisissant de régler la totalité de la commande aujourd'hui, nous appliquons une remise exceptionnelle de 15% sur la valeur des véhicules. Une économie substantielle pour votre investissement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link to="/panier" className="inline-flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] hover:text-amber-600 transition-colors gap-2 ml-4">
              <ArrowLeft size={14} />
              Modifier ma sélection
            </Link>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-slate-200 border border-slate-800 sticky top-24">
              <h2 className="text-[12px] font-bold font-montserrat text-white uppercase tracking-[0.1em] mb-10 flex items-center border-b border-white/10 pb-4">
                Récapitulatif
              </h2>

              <div className="space-y-6 mb-10">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-xs border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <span className="text-gray-400 pr-4 leading-relaxed uppercase tracking-tighter">
                        {item.brand} {item.model}
                      </span>
                      <span className="font-bold text-white whitespace-nowrap">
                        {Math.round(item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price).toLocaleString()}€
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>Sous-total</span>
                    <span className="text-gray-300">{getTotalPrice().toLocaleString()}€</span>
                  </div>

                  <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest items-center">
                    <span>Expédition</span>
                    <span className="text-green-400 font-bold">Inclus</span>
                  </div>

                  {paymentOption === 'full' && (
                    <div className="flex justify-between text-[10px] font-bold text-emerald-500 uppercase tracking-widest items-center bg-emerald-500/10 p-2 rounded-lg">
                      <span>Remise Paiement Intégral (-15%)</span>
                      <span className="font-bold">-{discountAmount.toLocaleString()}€</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-6 items-baseline">
                    <span className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Total Final</span>
                    <span className="text-amber-600 font-bold text-3xl font-montserrat">{finalTotal.toLocaleString()}€</span>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-white/10 items-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">À régler par virement</span>
                      <span className="text-[9px] text-slate-500 font-medium italic">
                        {paymentOption === 'deposit' ? 'Acompte de 30% requis' : 'Totalité avec remise'}
                      </span>
                    </div>
                    <span className="text-white font-black text-xl font-montserrat">{amountToPayNow.toLocaleString()}€</span>
                  </div>
                </div>

                {conflictingItems.length > 0 && (
                  <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl animate-in shake duration-500">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-relaxed">
                          Réservation déjà active
                        </p>
                        <p className="text-[9px] text-amber-200/70 mt-1 leading-relaxed">
                          Un ou plusieurs véhicules présents dans votre panier font déjà l'objet d'une réservation sur votre compte. Veuillez ajuster votre sélection pour poursuivre.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isProcessing || conflictingItems.length > 0}
                className="w-full bg-amber-600 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-amber-600/20 flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale active:scale-[0.98] group"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> VALIDATION...
                  </>
                ) : conflictingItems.length > 0 ? (
                  <>
                    <ShieldCheck size={16} />
                    <span>Véhicule déjà réservé</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={16} className="group-hover:scale-110 transition-transform" />
                    <span>Confirmer la commande</span>
                  </>
                )}
              </button>

              <div className="mt-10 p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                <p className="text-[9px] text-gray-500 font-medium uppercase tracking-[0.1em] leading-relaxed">
                  Paiement par virement bancaire sécurisé. Vous recevrez nos coordonnées bancaires immédiatement après validation.
                </p>
              </div>

              <div className="mt-6 flex justify-center gap-4 text-gray-600 grayscale opacity-40">
                <ShieldCheck size={20} />
                <CheckCircle size={20} />
                <Building2 size={20} />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
