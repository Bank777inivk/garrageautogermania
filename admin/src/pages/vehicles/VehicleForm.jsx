import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '@shared/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import useVehicleStore from '@shared/store/useVehicleStore';
import uploadToCloudinary from '@shared/cloudinary/config';
import useBrands from '@shared/hooks/useBrands';
import BrandSelect from '@shared/components/BrandSelect';
import {
  Upload, X, Star, Car, DollarSign, Gauge, Settings, Palette,
  Users, DoorOpen, Wind, Check, ChevronDown, Loader2, ArrowLeft, ImagePlus,
  Wand2, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { extractVehicleData as extractMistral } from '../../utils/mistral';
import { extractVehicleData as extractGroq } from '../../utils/groq';
import { extractVehicleData as extractDeepSeek } from '../../utils/deepseek';
import { extractVehicleData as extractAnthropic } from '../../utils/anthropic';
import { extractVehicleData as extractGemini } from '../../utils/gemini';

const AVAILABLE_FEATURES = [
  "Bluetooth", "Ordinateur de bord", "Lecteur CD", "Vitres électriques",
  "Rétroviseur extérieur électrique", "Réglage électrique des sièges",
  "Kit mains libres", "Affichage tête haute", "Isofix",
  "Volant multifonction", "GPS", "Capteur de pluie", "Toit ouvrant",
  "Direction assistée", "Sièges chauffants", "Trappe à skis",
  "Chauffage auxiliaire", "Système Stop & Start", "Fermeture centralisée",
  "Caméra de recul", "Régulateur de vitesse", "Aide au stationnement",
  "Jantes alliage", "Phares LED", "Traction intégrale (AWD/4WD)"
];

const TYPE_OPTIONS = [
  "Berline", "SUV", "Break", "Coupé", "Cabriolet",
  "Compacte", "Citadine", "Van / Monospace", "Pick-up", "Utilitaire"
];

const FUEL_OPTIONS = [
  "Essence", "Diesel", "Hybride", "Hybride Rechargeable", "Électrique", "GPL", "Bioéthanol"
];

const TRANSMISSION_OPTIONS = [
  "Manuelle", "Automatique", "Semi-automatique"
];

const COLOR_OPTIONS = [
  "Noir", "Blanc", "Gris", "Argent", "Bleu", "Rouge",
  "Jaune", "Vert", "Marron", "Beige", "Orange", "Violet", "Autre"
];

const AC_OPTIONS = [
  "Manuelle", "Automatique", "Automatique 2 zones",
  "Automatique 3 zones", "Automatique 4 zones", "Aucune"
];

const FormSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
      <div className="p-2 bg-[#2271B1]/10 rounded-lg text-[#2271B1]">
        <Icon size={18} />
      </div>
      <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const FormField = ({ label, error, required, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const inputClass = "mt-0 block w-full rounded-lg border-gray-200 border bg-gray-50 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#2271B1]/30 focus:border-[#2271B1] outline-none transition-all";
const selectClass = `${inputClass} cursor-pointer appearance-none`;

const VehicleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { addVehicle, updateVehicle, loading } = useVehicleStore();
  const { brands, brandCounts } = useBrands();

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [rawAIText, setRawAIText] = useState('');
  const [aiImage, setAIImage] = useState(null);
  const [aiImagePreview, setAIImagePreview] = useState(null);
  const [aiAgent, setAiAgent] = useState('mistral');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    version: '',
    year: new Date().getFullYear().toString(),
    price: '',
    mileage: '',
    fuel: '',
    transmission: '',
    type: '',
    power: '',
    color: '',
    doors: '5',
    seats: '5',
    ac: 'Automatique',
    origin: 'Allemagne',
    status: 'available',
    featured: false,
    discount: '0',
    description: '',
  });

  // Load vehicle data if editing
  useEffect(() => {
    if (isEdit) {
      const loadVehicle = async () => {
        const docSnap = await getDoc(doc(db, 'vehicles', id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            brand: data.brand || '',
            model: data.model || '',
            version: data.version || '',
            year: data.year?.toString() || '',
            price: data.price?.toString() || '',
            mileage: data.mileage?.toString() || '',
            fuel: data.fuel || '',
            transmission: data.transmission || '',
            type: data.type || '',
            power: data.power?.toString() || '',
            color: data.color || '',
            doors: data.doors?.toString() || '5',
            seats: data.seats?.toString() || '5',
            ac: data.ac || 'Automatique',
            origin: data.origin || 'Allemagne',
            status: data.status || 'available',
            featured: data.featured || false,
            discount: data.discount?.toString() || '0',
            description: data.description || '',
          });
          setImages(data.images || []);
          setSelectedFeatures(data.features || []);
        }
      };
      loadVehicle();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;

    setFormData(prev => {
      const newState = { ...prev, [name]: inputType === 'checkbox' ? checked : value };

      // Auto-remove featured status if vehicle is sold or reserved
      if (name === 'status' && (value === 'sold' || value === 'reserved')) {
        newState.featured = false;
      }

      return newState;
    });

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(f => uploadToCloudinary(f)));
      setImages(prev => [...prev, ...urls]);
      toast.success(`${urls.length} photo(s) ajoutée(s)`);
    } catch {
      toast.error("Erreur lors du téléchargement");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));
  const setCoverImage = (idx) => {
    setImages(prev => {
      const newImages = [...prev];
      const [cover] = newImages.splice(idx, 1);
      newImages.unshift(cover);
      return newImages;
    });
    toast.success("Photo principale définie");
  };

  const toggleFeature = (feature) => {
    setSelectedFeatures(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.brand) newErrors.brand = 'La marque est requise';
    if (!formData.model) newErrors.model = 'Le modèle est requis';
    if (!formData.year || !/^\d{4}$/.test(formData.year)) newErrors.year = 'Année invalide';
    if (!formData.price) newErrors.price = 'Le prix est requis';
    if (!formData.mileage) newErrors.mileage = 'Le kilométrage est requis';
    if (!formData.fuel) newErrors.fuel = 'Le carburant est requis';
    if (!formData.transmission) newErrors.transmission = 'La boîte est requise';
    if (!formData.type) newErrors.type = 'Le type est requis';
    if (images.length === 0) newErrors.images = 'Au moins une photo est requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Veuillez corriger les erreurs");
      return;
    }
    const vehicleData = {
      ...formData,
      year: Number(formData.year),
      price: Number(formData.price),
      mileage: Number(formData.mileage),
      power: formData.power ? Number(formData.power) : null,
      doors: Number(formData.doors),
      seats: Number(formData.seats),
      discount: Number(formData.discount || 0),
      features: selectedFeatures,
      images,
      image: images[0] || null, // First image as main image
    };

    try {
      if (isEdit) {
        await updateVehicle(id, vehicleData);
        toast.success("Véhicule mis à jour");
      } else {
        await addVehicle(vehicleData);
        toast.success("Véhicule ajouté au catalogue");
      }
      navigate('/vehicles');
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleAIImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image est trop lourde (max 5Mo)");
        return;
      }
      setAIImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setAIImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeAIImage = () => {
    setAIImage(null);
    setAIImagePreview(null);
  };

  const handleAIParse = async () => {
    if (!rawAIText.trim() && !aiImage) {
      toast.error("Veuillez coller une description ou ajouter une image");
      return;
    }

    setParsing(true);
    const loadingToast = toast.loading("L'IA analyse vos données...");

    try {
      let imageBase64 = null;
      if (aiImage) {
        imageBase64 = aiImagePreview.split(',')[1];
      }

      let data;
      if (aiAgent === 'mistral') {
        data = await extractMistral(rawAIText, imageBase64);
      } else if (aiAgent === 'groq') {
        data = await extractGroq(rawAIText);
      } else if (aiAgent === 'deepseek') {
        data = await extractDeepSeek(rawAIText);
      } else if (aiAgent === 'anthropic') {
        data = await extractAnthropic(rawAIText);
      } else if (aiAgent === 'gemini') {
        data = await extractGemini(rawAIText, imageBase64);
      }

      setFormData(prev => ({
        ...prev,
        brand: data.brand || prev.brand,
        model: data.model || prev.model,
        version: data.version || prev.version,
        year: data.year ? data.year.toString() : prev.year,
        price: data.price ? data.price.toString() : prev.price,
        mileage: data.mileage ? data.mileage.toString() : prev.mileage,
        fuel: data.fuel || prev.fuel,
        transmission: data.transmission || prev.transmission,
        type: data.type || prev.type,
        power: data.power ? data.power.toString() : prev.power,
        color: data.color || prev.color,
        description: data.description || prev.description,
      }));

      if (data.features && Array.isArray(data.features)) {
        // Filter out features that might not be in our AVAILABLE_FEATURES list exactly
        const validFeatures = data.features.filter(f => AVAILABLE_FEATURES.includes(f));
        setSelectedFeatures(validFeatures);
      }

      toast.success("Formulaire auto-rempli avec succès !", { id: loadingToast });
      setRawAIText('');
      removeAIImage();
    } catch (err) {
      toast.error("L'IA n'a pas pu analyser les données. Vérifiez votre clé API.", { id: loadingToast });
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/vehicles')}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              {isEdit ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
            </h1>
            <p className="text-xs text-gray-500">Remplissez tous les champs</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-amber-50 border border-amber-200 px-3 sm:px-4 py-2 rounded-lg hover:bg-amber-100 transition-all shrink-0">
            <Star size={16} className={formData.featured ? 'text-amber-500 fill-amber-500' : 'text-gray-400'} />
            <span className="text-xs sm:text-sm font-bold text-gray-700 whitespace-nowrap">Mis en avant</span>
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="hidden"
            />
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`text-xs sm:text-sm font-bold rounded-lg border px-2 sm:px-3 py-2 outline-none cursor-pointer shrink-0 ${formData.status === 'available'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
              }`}
          >
            <option value="available">Disponible</option>
            <option value="sold">Vendu</option>
            <option value="reserved">Réservé</option>
          </select>
        </div>
      </div>

      {/* AI Parser Section */}
      {!isEdit && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-lg">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Remplissage Magique par IA</h3>
                <p className="text-xs text-gray-500">Choisissez votre agent pour remplir le formulaire</p>
              </div>
            </div>

            {/* Agent Selector */}
            <div className="flex flex-wrap bg-white/50 p-1 rounded-xl border border-indigo-100 self-start sm:self-center">
              {[
                { id: 'mistral', label: 'Mistral', desc: 'Photos & Texte (Free)' },
                { id: 'gemini', label: 'Gemini', desc: 'Photos & Texte (Fast)' },
                { id: 'groq', label: 'Groq', desc: 'Ultra rapide (Free)' },
                { id: 'deepseek', label: 'DeepSeek', desc: 'Haute Précision' },
                { id: 'anthropic', label: 'Claude', desc: 'Premium' }
              ].map(agent => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setAiAgent(agent.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${aiAgent === agent.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-indigo-600 hover:bg-white/80'
                    }`}
                  title={agent.desc}
                >
                  {agent.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <textarea
                value={rawAIText}
                onChange={(e) => setRawAIText(e.target.value)}
                placeholder={(aiAgent === 'mistral' || aiAgent === 'gemini')
                  ? "Collez texte ou ajoutez une photo..."
                  : "Collez votre annonce texte (Cet agent ne voit pas encore les photos)..."}
                className="flex-1 h-32 md:h-24 rounded-xl border-indigo-200 border bg-white/50 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all resize-none"
              />

              {(aiAgent === 'mistral' || aiAgent === 'gemini') && (
                <div className="flex-shrink-0 w-full md:w-48">
                  {aiImagePreview ? (
                    <div className="relative h-24 rounded-xl overflow-hidden border border-indigo-200 group">
                      <img src={aiImagePreview} alt="AI analysis" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removeAIImage}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="text-white" size={20} />
                      </button>
                    </div>
                  ) : (
                    <label className="h-24 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-200 bg-white/30 hover:bg-indigo-50 hover:border-indigo-400 cursor-pointer transition-all">
                      <ImagePlus className="text-indigo-400" size={24} />
                      <span className="text-[10px] font-bold text-indigo-500 uppercase">Ajouter photo</span>
                      <input type="file" accept="image/*" onChange={handleAIImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleAIParse}
              disabled={parsing || (!rawAIText.trim() && !aiImage)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md group"
            >
              {parsing ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Wand2 size={18} className="group-hover:rotate-12 transition-transform" />
              )}
              {parsing ? "Analyse en cours..." : "Extraire les informations"}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Section 1: Identité */}
        <FormSection title="Identité du véhicule" icon={Car}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FormField label="Marque" required error={errors.brand}>
              <BrandSelect
                brands={brands}
                value={formData.brand}
                onChange={(name) => setFormData(prev => ({ ...prev, brand: name }))}
                placeholder="Sélectionner une marque..."
                allLabel="Toutes les marques"
                vehicleCounts={brandCounts}
              />
            </FormField>

            <FormField label="Modèle" required error={errors.model}>
              <input name="model" value={formData.model} onChange={handleChange} placeholder="ex: Série 5, RS6, GLE..." className={inputClass} />
            </FormField>

            <FormField label="Version / Finition" error={errors.version}>
              <input name="version" value={formData.version} onChange={handleChange} placeholder="ex: 3.0 TDI S-Line, AMG" className={inputClass} />
            </FormField>

            <FormField label="Type de véhicule" required error={errors.type}>
              <div className="relative">
                <select name="type" value={formData.type} onChange={handleChange} className={selectClass}>
                  <option value="">Sélectionner...</option>
                  {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </FormField>

            <FormField label="Année" required error={errors.year}>
              <input name="year" type="number" value={formData.year} onChange={handleChange} placeholder="2022" min="1990" max="2025" className={inputClass} />
            </FormField>

            <FormField label="Pays d'origine">
              <input name="origin" value={formData.origin} onChange={handleChange} placeholder="Allemagne" className={inputClass} />
            </FormField>
          </div>
        </FormSection>

        {/* Section 2: Prix & Kilométrage */}
        <FormSection title="Prix & Kilométrage" icon={DollarSign}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Prix en € (TTC)" required error={errors.price}>
              <div className="relative">
                <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="45000" className={`${inputClass} pr-8`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">€</span>
              </div>
            </FormField>

            <FormField label="Kilométrage" required error={errors.mileage}>
              <div className="relative">
                <input name="mileage" type="number" value={formData.mileage} onChange={handleChange} placeholder="45000" className={`${inputClass} pr-10`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">km</span>
              </div>
            </FormField>

            <FormField label="Promotion (%)" error={errors.discount}>
              <div className="relative">
                <input name="discount" type="number" value={formData.discount} onChange={handleChange} placeholder="0" min="0" max="100" className={`${inputClass} pr-8`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
              </div>
            </FormField>
          </div>
        </FormSection>

        {/* Section 3: Motorisation */}
        <FormSection title="Motorisation & Transmission" icon={Settings}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <FormField label="Carburant" required error={errors.fuel}>
              <div className="relative">
                <select name="fuel" value={formData.fuel} onChange={handleChange} className={selectClass}>
                  <option value="">Type...</option>
                  {FUEL_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </FormField>

            <FormField label="Boîte de vitesse" required error={errors.transmission}>
              <div className="relative">
                <select name="transmission" value={formData.transmission} onChange={handleChange} className={selectClass}>
                  <option value="">Type...</option>
                  {TRANSMISSION_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </FormField>

            <FormField label="Puissance (ch)">
              <div className="relative">
                <input name="power" type="number" value={formData.power} onChange={handleChange} placeholder="200" className={`${inputClass} pr-8`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">ch</span>
              </div>
            </FormField>

            <FormField label="Couleur">
              <div className="relative">
                <select name="color" value={formData.color} onChange={handleChange} className={selectClass}>
                  <option value="">Couleur...</option>
                  {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </FormField>
          </div>
        </FormSection>

        {/* Section 4: Habitacle */}
        <FormSection title="Habitacle & Confort" icon={Users}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormField label="Nombre de portes">
              <div className="flex flex-wrap gap-2">
                {['2', '3', '4', '5'].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, doors: n }))}
                    className={`flex-1 min-w-[40px] py-2 rounded-lg text-sm font-bold border transition-all ${formData.doors === n
                      ? 'bg-[#2271B1] text-white border-[#2271B1]'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#2271B1]/50'
                      }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Nombre de places">
              <div className="flex flex-wrap gap-2">
                {['2', '4', '5', '7', '8', '9'].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, seats: n }))}
                    className={`flex-1 min-w-[40px] py-2 rounded-lg text-xs font-bold border transition-all ${formData.seats === n
                      ? 'bg-[#2271B1] text-white border-[#2271B1]'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#2271B1]/50'
                      }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Climatisation">
              <div className="relative">
                <select name="ac" value={formData.ac} onChange={handleChange} className={selectClass}>
                  <option value="">Type...</option>
                  {AC_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </FormField>
          </div>
        </FormSection>

        {/* Section 5: Options & Équipements */}
        <FormSection title="Options & Équipements" icon={Check}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {AVAILABLE_FEATURES.map(feature => (
              <label
                key={feature}
                onClick={() => toggleFeature(feature)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${selectedFeatures.includes(feature)
                  ? 'bg-[#2271B1]/5 border-[#2271B1]/30 text-[#2271B1]'
                  : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200'
                  }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${selectedFeatures.includes(feature)
                  ? 'bg-[#2271B1] border-[#2271B1] text-white'
                  : 'border-gray-300'
                  }`}>
                  {selectedFeatures.includes(feature) && <Check size={12} strokeWidth={3} />}
                </div>
                <span className="text-[11px] font-bold leading-tight">{feature}</span>
              </label>
            ))}
          </div>
        </FormSection>

        {/* Section 6: Description */}
        <FormSection title="Description commerciale" icon={Car}>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            className={`${inputClass} resize-none`}
            placeholder="Décrivez ce véhicule pour les clients : historique, état, points forts, équipements spéciaux..."
          />
        </FormSection>

        {/* Section 7: Photos */}
        <FormSection title="Galerie Photos" icon={ImagePlus}>
          {errors.images && (
            <p className="text-red-500 text-sm mb-4 flex items-center gap-2">
              <X size={16} /> {errors.images}
            </p>
          )}

          {/* Upload Zone */}
          <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 sm:p-10 cursor-pointer transition-all mb-6 ${uploading ? 'border-[#2271B1] bg-[#2271B1]/5' : 'border-gray-200 hover:border-[#2271B1]/50 hover:bg-gray-50'
            }`}>
            {uploading ? (
              <>
                <Loader2 className="animate-spin text-[#2271B1] mb-3" size={40} />
                <p className="text-sm font-bold text-[#2271B1]">Téléchargement en cours...</p>
              </>
            ) : (
              <>
                <div className="p-4 bg-[#2271B1]/10 rounded-2xl text-[#2271B1] mb-3">
                  <Upload size={32} />
                </div>
                <p className="text-sm font-bold text-gray-700 text-center">Glisser / Déposer des photos</p>
                <p className="text-xs text-gray-400 mt-1 text-center max-w-xs">ou cliquer pour parcourir • PNG, JPG • Sans limite</p>
                <div className="mt-4 px-6 py-2 bg-[#2271B1] text-white rounded-lg text-sm font-bold">
                  Choisir des photos
                </div>
              </>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>

          {/* Image Grid */}
          {images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-600">{images.length} photo(s) — La première est la photo principale</p>
                <p className="text-xs text-gray-400 italic">Cliquer sur ⭐ pour définir comme principale</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className={`relative group rounded-xl overflow-hidden border-2 transition-all ${idx === 0 ? 'border-amber-400 ring-2 ring-amber-200' : 'border-gray-100'
                    }`}>
                    <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-32 object-cover" />
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 bg-amber-400 text-white text-[9px] font-black uppercase px-2 py-1 rounded-full flex items-center gap-1">
                        <Star size={10} fill="white" /> Principale
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setCoverImage(idx)}
                          className="p-2 bg-amber-400 text-white rounded-full hover:bg-amber-500 transition-colors"
                          title="Définir comme principale"
                        >
                          <Star size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Supprimer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </FormSection>

        {/* Submit Bar */}
        <div className="sticky bottom-4 mx-[-8px] sm:mx-0 bg-white border border-gray-200 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row gap-3 justify-between items-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-10">
          <button
            type="button"
            onClick={() => navigate('/vehicles')}
            className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors order-2 sm:order-1"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full sm:w-auto px-8 py-3 bg-[#2271B1] text-white rounded-xl text-sm font-bold hover:bg-[#135e96] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md order-1 sm:order-2"
          >
            {(loading || uploading) && <Loader2 className="animate-spin" size={16} />}
            {isEdit ? 'Mettre à jour' : 'Publier le véhicule'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
