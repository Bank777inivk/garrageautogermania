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
  Wand2, Sparkles, Trash2, Paintbrush, Square, RotateCcw
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
  <div className="bg-white rounded-3xl border border-[#E5E5E5] overflow-hidden shadow-sm">
    <div className="px-8 py-5 bg-white border-b border-[#E5E5E5] flex items-center gap-4">
      <div className="w-10 h-10 bg-[#14213D] text-[#FCA311] rounded-2xl flex items-center justify-center shadow-sm">
        <Icon size={20} />
      </div>
      <h3 className="text-[11px] md:text-[12px] font-black text-[#14213D] uppercase tracking-widest">{title}</h3>
    </div>
    <div className="p-8">{children}</div>
  </div>
);

const FormField = ({ label, error, required, children }) => (
  <div className="space-y-2">
    <label className="text-[9px] md:text-[10px] font-black text-[#14213D]/40 uppercase tracking-widest ml-1">
      {label} {required && <span className="text-[#FCA311]">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">{error}</p>}
  </div>
);

const inputClass = "w-full bg-white border border-[#E5E5E5] rounded-2xl px-6 py-4 text-base font-black text-[#14213D] placeholder:text-gray-300 focus:ring-2 focus:ring-[#FCA311] outline-none transition-all shadow-sm";
const selectClass = "w-full bg-white border border-[#E5E5E5] rounded-2xl px-6 py-4 text-base font-black text-[#14213D] placeholder:text-gray-300 focus:ring-2 focus:ring-[#FCA311] outline-none transition-all shadow-sm cursor-pointer appearance-none";

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
  const [blurModalOpen, setBlurModalOpen] = useState(false);
  const [blurTargetIndex, setBlurTargetIndex] = useState(null);
  const [blurTargetUrl, setBlurTargetUrl] = useState('');

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
    <div className="max-w-5xl mx-auto space-y-10 pb-20 pt-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/vehicles')}
            className="w-12 h-12 bg-white border border-[#E5E5E5] text-[#14213D] rounded-2xl flex items-center justify-center hover:bg-[#14213D] hover:text-[#FCA311] transition-all shadow-sm group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#14213D] uppercase tracking-tight">
              {isEdit ? 'Modifier le véhicule' : 'Nouveau véhicule'}
            </h1>
            <p className="text-[10px] md:text-[11px] text-[#14213D]/40 font-bold uppercase tracking-widest mt-1">
              {isEdit ? 'Édition des caractéristiques' : 'Ajout au catalogue officiel'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className={`flex items-center gap-3 cursor-pointer border rounded-2xl px-5 py-3 transition-all shadow-sm ${formData.featured 
            ? 'bg-[#14213D] border-[#14213D] text-[#FCA311]' 
            : 'bg-white border-[#E5E5E5] text-[#14213D]/40 hover:border-[#FCA311]'}`}>
            <Star size={18} className={formData.featured ? 'fill-[#FCA311]' : ''} />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Mis en avant</span>
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="hidden"
            />
          </label>
          <div className="relative">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`text-[10px] md:text-xs font-black uppercase tracking-widest rounded-2xl border px-5 py-3 outline-none cursor-pointer shadow-sm appearance-none pr-10 ${formData.status === 'available'
                ? 'bg-white border-[#E5E5E5] text-green-600'
                : 'bg-white border-[#E5E5E5] text-red-600'
                }`}
            >
              <option value="available">Disponible</option>
              <option value="sold">Vendu</option>
              <option value="reserved">Réservé</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#14213D]/20" />
          </div>
        </div>
      </div>

      {/* AI Parser Section */}
      {!isEdit && (
        <div className="bg-[#14213D] rounded-3xl border border-[#FCA311]/20 p-8 shadow-xl relative overflow-hidden group">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FCA311]/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-[#FCA311] text-[#14213D] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FCA311]/20">
                <Sparkles size={28} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">Remplissage IA</h3>
                <p className="text-[10px] md:text-[11px] text-[#FCA311] font-bold uppercase tracking-widest mt-1">Extraction de données par Intelligence Artificielle</p>
              </div>
            </div>

            {/* Agent Selector */}
            <div className="flex flex-wrap bg-white/5 p-1.5 rounded-2xl border border-white/10">
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
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${aiAgent === agent.id
                    ? 'bg-[#FCA311] text-[#14213D] shadow-md shadow-[#FCA311]/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  title={agent.desc}
                >
                  {agent.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6">
              <textarea
                value={rawAIText}
                onChange={(e) => setRawAIText(e.target.value)}
                placeholder={(aiAgent === 'mistral' || aiAgent === 'gemini')
                  ? "Collez la description ou transférez une photo de l'annonce..."
                  : "Collez votre annonce texte pour analyse..."}
                className="flex-1 h-32 md:h-28 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#FCA311] outline-none transition-all resize-none leading-relaxed"
              />

              {(aiAgent === 'mistral' || aiAgent === 'gemini') && (
                <div className="flex-shrink-0 w-full md:w-56">
                  {aiImagePreview ? (
                    <div className="relative h-28 md:h-full rounded-2xl overflow-hidden border border-white/10 group/img shadow-lg">
                      <img src={aiImagePreview} alt="AI analysis" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removeAIImage}
                        className="absolute inset-0 bg-[#14213D]/80 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="text-[#FCA311]" size={24} />
                      </button>
                    </div>
                  ) : (
                    <label className="h-28 md:h-full flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#FCA311]/50 cursor-pointer transition-all group/upload">
                      <ImagePlus className="text-white/20 group-hover/upload:text-[#FCA311] transition-colors" size={28} />
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest group-hover/upload:text-white transition-colors">Ajouter photo</span>
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
              className="flex items-center justify-center gap-3 px-8 py-4 bg-[#FCA311] text-[#14213D] rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#FCA311]/10 disabled:opacity-50 disabled:hover:bg-[#FCA311] group"
            >
              {parsing ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Wand2 size={18} className="group-hover:rotate-12 transition-transform" />
              )}
              {parsing ? "Analyse en cours..." : "Lancer l'extraction automatique"}
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
                    className={`flex-1 min-w-[50px] py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-widest border transition-all shadow-sm ${formData.doors === n
                      ? 'bg-[#14213D] text-[#FCA311] border-[#14213D]'
                      : 'bg-white text-[#14213D]/40 border-[#E5E5E5] hover:border-[#FCA311]'
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
                    className={`flex-1 min-w-[50px] py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-widest border transition-all shadow-sm ${formData.seats === n
                      ? 'bg-[#14213D] text-[#FCA311] border-[#14213D]'
                      : 'bg-white text-[#14213D]/40 border-[#E5E5E5] hover:border-[#FCA311]'
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
                className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all shadow-sm ${selectedFeatures.includes(feature)
                  ? 'bg-[#14213D] border-[#14213D] text-[#FCA311]'
                  : 'bg-white border-[#E5E5E5] text-[#14213D]/60 hover:border-[#FCA311]'
                  }`}
              >
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all ${selectedFeatures.includes(feature)
                  ? 'bg-[#FCA311] border-[#FCA311] text-[#14213D]'
                  : 'border-[#E5E5E5] bg-gray-50'
                  }`}>
                  {selectedFeatures.includes(feature) && <Check size={14} strokeWidth={4} />}
                </div>
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-tight leading-tight">{feature}</span>
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
          <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] p-10 md:p-20 cursor-pointer transition-all mb-8 shadow-sm ${uploading 
              ? 'border-[#FCA311] bg-[#14213D]/5' 
              : 'border-[#E5E5E5] bg-gray-50 hover:border-[#FCA311] hover:bg-white'
            }`}>
            {uploading ? (
              <>
                <Loader2 className="animate-spin text-[#14213D] mb-5" size={48} />
                <p className="text-[11px] font-black text-[#14213D] uppercase tracking-widest">Téléchargement en cours...</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-[#14213D] text-[#FCA311] rounded-[2rem] flex items-center justify-center shadow-xl mb-6">
                  <Upload size={36} />
                </div>
                <p className="text-base font-black text-[#14213D] uppercase tracking-tight">Glisser-Déposer les clichés</p>
                <p className="text-[10px] text-[#14213D]/40 font-bold uppercase tracking-widest mt-2">Format supportés : PNG, JPG • Aucune limite de taille</p>
                <div className="mt-8 px-8 py-4 bg-[#14213D] text-[#FCA311] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
                  Parcourir les fichiers
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
                  <div key={idx} className={`relative group rounded-3xl overflow-hidden border-2 transition-all shadow-sm ${idx === 0 ? 'border-[#FCA311] ring-4 ring-[#FCA311]/10' : 'border-[#E5E5E5]'
                    }`}>
                    <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-40 object-cover p-1 rounded-3xl" />
                    {idx === 0 && (
                      <div className="absolute top-3 left-3 bg-[#FCA311] text-[#14213D] text-[9px] font-black uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Star size={12} fill="#14213D" /> Couverture
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[#14213D]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setCoverImage(idx)}
                          className="w-12 h-12 bg-[#FCA311] text-[#14213D] rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                          title="Définir comme principale"
                        >
                          <Star size={20} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setBlurTargetUrl(img);
                          setBlurTargetIndex(idx);
                          setBlurModalOpen(true);
                        }}
                        className="w-12 h-12 bg-white text-[#14213D] rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                        title="Masquer la plaque"
                      >
                        <Wand2 size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="w-12 h-12 bg-white text-red-600 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                        title="Supprimer"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </FormSection>

        {/* Submit Bar */}
        <div className="sticky bottom-6 mx-[-8px] sm:mx-0 bg-[#14213D] border border-white/10 p-5 rounded-3xl flex flex-col sm:flex-row gap-4 justify-between items-center shadow-2xl z-10 overflow-hidden">
          {/* Decorative accents */}
          <div className="absolute top-0 right-0 w-32 h-full bg-[#FCA311] translate-x-20 -skew-x-12 opacity-10" />
          
          <button
            type="button"
            onClick={() => navigate('/vehicles')}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-white hover:bg-white/10 uppercase tracking-widest transition-all order-2 sm:order-1"
          >
            Abandonner
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full sm:w-auto px-12 py-4 bg-[#FCA311] text-[#14213D] rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#FCA311]/10 order-1 sm:order-2"
          >
            {(loading || uploading) && <Loader2 className="animate-spin" size={20} />}
            {isEdit ? 'Enregistrer les modifications' : 'Mettre en ligne le véhicule'}
          </button>
         </div>
       </form>
      {blurModalOpen && (
        <PlateBlurModal
          imageUrl={blurTargetUrl}
          onClose={() => setBlurModalOpen(false)}
          onSave={(newUrl) => {
            setImages(prev => {
              const updated = [...prev];
              updated[blurTargetIndex] = newUrl;
              return updated;
            });
            setBlurModalOpen(false);
          }}
        />
      )}
     </div>
   );
 };

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
};

const PlateBlurModal = ({ imageUrl, onClose, onSave }) => {
  const canvasRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [saving, setSaving] = useState(false);
  
  // Modes: 'rect' (Cadre / Plaque Pro) vs 'brush' (Pinceau Libre)
  const [mode, setMode] = useState('rect');
  const [brushType, setBrushType] = useState('blur'); // 'blur' or 'solid'
  const [brushSize, setBrushSize] = useState(45); // 25, 45, 75
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [selection, setSelection] = useState(null);

  // Load image to canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    };
  }, [imageUrl]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, relX: 0, relY: 0, width: 1, height: 1 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    return {
      x,
      y,
      relX: x / rect.width,
      relY: y / rect.height,
      width: rect.width,
      height: rect.height
    };
  };

  const applyBrushAt = (relX, relY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = Math.floor(relX * canvas.width);
    const cy = Math.floor(relY * canvas.height);
    
    // Scale brush radius accurately based on image natural width
    const radius = Math.max(15, Math.floor((canvas.width / 1000) * brushSize));
    
    if (brushType === 'blur') {
      const size = Math.max(6, Math.floor(radius / 2.5));
      const startX = Math.max(0, cx - radius);
      const startY = Math.max(0, cy - radius);
      const w = Math.min(canvas.width - startX, radius * 2);
      const h = Math.min(canvas.height - startY, radius * 2);
      if (w <= 0 || h <= 0) return;
      
      const imgData = ctx.getImageData(startX, startY, w, h);
      const data = imgData.data;
      
      for (let r = 0; r < h; r += size) {
        for (let c = 0; c < w; c += size) {
          const dx = (startX + c + size / 2) - cx;
          const dy = (startY + r + size / 2) - cy;
          if (dx * dx + dy * dy <= radius * radius * 1.3) {
            const pr = Math.min(r, h - 1);
            const pc = Math.min(c, w - 1);
            const idx = (pr * Math.floor(w) + pc) * 4;
            ctx.fillStyle = `rgba(${data[idx]}, ${data[idx+1]}, ${data[idx+2]}, ${data[idx+3] / 255})`;
            ctx.fillRect(startX + c, startY + r, Math.min(size, w - c), Math.min(size, h - r));
          }
        }
      }
    } else {
      // Dark matte cover brush
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#14213D';
      ctx.fill();
    }
  };

  const handleStart = (e) => {
    if (e.cancelable) e.preventDefault();
    const { x, y, relX, relY } = getCanvasCoords(e);
    
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentPos({ x, y });
    
    if (mode === 'rect') {
      setSelection(null);
    } else if (mode === 'brush') {
      applyBrushAt(relX, relY);
    }
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    const { x, y, relX, relY } = getCanvasCoords(e);
    setCurrentPos({ x, y });
    
    if (mode === 'brush') {
      applyBrushAt(relX, relY);
    }
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (mode === 'rect') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const left = Math.min(startPos.x, currentPos.x) / rect.width;
      const top = Math.min(startPos.y, currentPos.y) / rect.height;
      const width = Math.abs(startPos.x - currentPos.x) / rect.width;
      const height = Math.abs(startPos.y - currentPos.y) / rect.height;
      
      if (width > 0.01 && height > 0.01) {
        setSelection({ left, top, width, height });
      }
    }
  };

  const applyMask = () => {
    if (!selection) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const x = selection.left * canvas.width;
    const y = selection.top * canvas.height;
    const w = selection.width * canvas.width;
    const h = selection.height * canvas.height;
    
    ctx.save();

    // 1. Drop shadow for authentic 3D integration into car bumper
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = Math.max(6, h * 0.15);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.max(3, h * 0.06);

    // 2. Outer Euro dealer holder frame (Support de plaque en plastique mat)
    const outerRadius = Math.max(4, h * 0.12);
    drawRoundedRect(ctx, x, y, w, h, outerRadius);
    
    // Charcoal matte gradient finish
    const frameGrad = ctx.createLinearGradient(x, y, x, y + h);
    frameGrad.addColorStop(0, '#27272A');
    frameGrad.addColorStop(0.25, '#18181B');
    frameGrad.addColorStop(1, '#09090B');
    ctx.fillStyle = frameGrad;
    ctx.fill();

    // Reset shadow for inner elements
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Subtle metallic outer edge highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = Math.max(1, h * 0.02);
    ctx.stroke();

    // 3. Inner License Plate Area
    // Insets: sides top by ~6%, bottom by ~24% to reserve space for bottom dealership lip text
    const insetX = w * 0.02;
    const insetTop = h * 0.06;
    const insetBottom = h * 0.25;
    const innerX = x + insetX;
    const innerY = y + insetTop;
    const innerW = w - (insetX * 2);
    const innerH = h - insetTop - insetBottom;
    const innerRadius = Math.max(3, innerH * 0.1);

    drawRoundedRect(ctx, innerX, innerY, innerW, innerH, innerRadius);
    const plateGrad = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
    plateGrad.addColorStop(0, '#1E293B');
    plateGrad.addColorStop(0.2, '#0F172A');
    plateGrad.addColorStop(1, '#020617');
    ctx.fillStyle = plateGrad;
    ctx.fill();

    // Inner subtle silver trim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = Math.max(1, innerH * 0.03);
    ctx.stroke();

    // 4. Center Typography: "GARAGE PRO"
    // White GARAGE + Golden Orange PRO (#FCA311) with 3D embossed shadow
    const fontSize = Math.max(11, Math.floor(innerH * 0.52));
    ctx.font = `900 ${fontSize}px "Arial Black", Impact, sans-serif`;
    ctx.textBaseline = 'middle';
    
    const part1 = "GARAGE ";
    const part2 = "PRO";
    const w1 = ctx.measureText(part1).width;
    const w2 = ctx.measureText(part2).width;
    const totalW = w1 + w2;
    const startX = innerX + (innerW - totalW) / 2;
    const textY = innerY + (innerH * 0.44);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = Math.max(3, innerH * 0.06);
    ctx.shadowOffsetY = Math.max(1, innerH * 0.03);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText(part1, startX, textY);
    
    ctx.fillStyle = '#FCA311'; // Brand Signature Gold
    ctx.fillText(part2, startX + w1, textY);

    // Subtext inside plate
    ctx.shadowColor = 'transparent';
    const subSize = Math.max(7, Math.floor(innerH * 0.16));
    ctx.font = `bold ${subSize}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText("AUTO EXPORT • DEUTSCHLAND", innerX + innerW / 2, innerY + (innerH * 0.82));

    // 5. Dealer Lip Branding along bottom edge of plastic holder frame
    const lipCenterY = y + h - (insetBottom * 0.44);
    const lipSize = Math.max(6, Math.floor(insetBottom * 0.46));
    ctx.font = `900 ${lipSize}px sans-serif`;
    ctx.fillStyle = '#E2E8F0';
    ctx.textAlign = 'center';
    ctx.fillText("A.P.S. CARS & TRUCKS GMBH   •   GARAGE PRO", x + w / 2, lipCenterY);

    ctx.restore();
    setSelection(null);
    toast.success("Plaque Pro 3D réaliste appliquée !");
  };

  const applyBlur = () => {
    if (!selection) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const x = selection.left * canvas.width;
    const y = selection.top * canvas.height;
    const w = selection.width * canvas.width;
    const h = selection.height * canvas.height;
    
    const size = Math.max(5, Math.floor(h / 8));
    const imgData = ctx.getImageData(x, y, w, h);
    const data = imgData.data;
    
    for (let r = 0; r < h; r += size) {
      for (let c = 0; c < w; c += size) {
        const pr = Math.min(r, h - 1);
        const pc = Math.min(c, w - 1);
        const i = (pr * Math.floor(w) + pc) * 4;
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const alpha = data[i + 3];
        
        ctx.fillStyle = `rgba(${red},${green},${blue},${alpha / 255})`;
        ctx.fillRect(x + c, y + r, Math.min(size, w - c), Math.min(size, h - r));
      }
    }
    
    setSelection(null);
    toast.success("Cadre flouté");
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      setSelection(null);
      toast.success("Image réinitialisée");
    };
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    setSaving(true);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setSaving(false);
        return;
      }
      const file = new File([blob], "blurred_license_plate.jpg", { type: "image/jpeg" });
      try {
        const newUrl = await uploadToCloudinary(file);
        onSave(newUrl);
        toast.success("Photo principale mise à jour avec succès !");
      } catch (err) {
        toast.error("Erreur de sauvegarde sur Cloudinary");
      } finally {
        setSaving(false);
      }
    }, 'image/jpeg', 0.92);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] border border-[#E5E5E5] w-full max-w-5xl p-6 sm:p-8 flex flex-col max-h-[95vh] shadow-2xl animate-fade-in overflow-hidden">
        <div className="flex justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-black text-[#14213D] uppercase tracking-wider flex items-center gap-2">
              <Wand2 size={22} className="text-[#FCA311]" />
              Masquage & Floutage de Plaque
            </h3>
            <p className="text-xs font-bold text-[#14213D]/50 uppercase tracking-widest mt-1">
              Choisissez le Mode Cadre pour la Plaque Pro 3D ou le Mode Pinceau Libre
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-2.5 bg-gray-50 rounded-2xl border border-[#E5E5E5]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setMode('rect'); setSelection(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                mode === 'rect'
                  ? 'bg-[#14213D] text-[#FCA311] shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Square size={15} /> 1. Cadre (Plaque Pro 3D)
            </button>
            <button
              type="button"
              onClick={() => { setMode('brush'); setSelection(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                mode === 'brush'
                  ? 'bg-[#14213D] text-[#FCA311] shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Paintbrush size={15} /> 2. Pinceau Libre
            </button>
          </div>

          {mode === 'brush' && (
            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200 w-full sm:w-auto justify-end">
              <span className="text-[10px] font-black text-gray-400 uppercase mr-1">Style :</span>
              <button
                type="button"
                onClick={() => setBrushType('blur')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  brushType === 'blur' ? 'bg-[#FCA311] text-[#14213D] shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                ✨ Mosaïque
              </button>
              <button
                type="button"
                onClick={() => setBrushType('solid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  brushType === 'solid' ? 'bg-[#14213D] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                ⬛ Noir Mat
              </button>
              
              <span className="text-[10px] font-black text-gray-400 uppercase ml-2 mr-1">Taille :</span>
              {[
                { label: 'S', size: 25 },
                { label: 'M', size: 45 },
                { label: 'L', size: 75 }
              ].map(b => (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => setBrushSize(b.size)}
                  className={`w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center ${
                    brushSize === b.size ? 'bg-[#14213D] text-[#FCA311] shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div 
          ref={containerRef}
          className="relative flex-1 bg-gray-900/5 rounded-[2rem] border border-[#E5E5E5] overflow-hidden flex items-center justify-center p-4 min-h-[350px] max-h-[55vh] select-none"
        >
          <div className="relative inline-flex items-center justify-center max-w-full max-h-full">
            <canvas 
              ref={canvasRef} 
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
              draggable="false" 
              className={`max-w-full max-h-[50vh] object-contain rounded-xl shadow-lg ${
                mode === 'brush' ? 'cursor-crosshair' : 'cursor-default'
              }`} 
            />
            
            {/* Selection rectangle overlay for rect mode during drag */}
            {isDrawing && mode === 'rect' && (
              <div 
                className="absolute border-2 border-dashed border-[#FCA311] bg-[#FCA311]/15 pointer-events-none rounded-sm"
                style={{
                  left: Math.min(startPos.x, currentPos.x),
                  top: Math.min(startPos.y, currentPos.y),
                  width: Math.abs(startPos.x - currentPos.x),
                  height: Math.abs(startPos.y - currentPos.y)
                }}
              />
            )}
            
            {/* Selected rectangle after draw in rect mode */}
            {selection && !isDrawing && mode === 'rect' && (
              <div 
                className="absolute border-3 border-[#FCA311] bg-[#FCA311]/10 pointer-events-none rounded-sm shadow-sm animate-pulse"
                style={{
                  left: `${selection.left * 100}%`,
                  top: `${selection.top * 100}%`,
                  width: `${selection.width * 100}%`,
                  height: `${selection.height * 100}%`
                }}
              />
            )}
          </div>
        </div>

        {/* Action Buttons Bottom Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-6 pt-5 border-t border-[#E5E5E5]">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {mode === 'rect' ? (
              <>
                <button
                  type="button"
                  onClick={applyMask}
                  disabled={!selection}
                  className="px-6 py-3.5 bg-[#14213D] text-[#FCA311] disabled:opacity-40 hover:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
                >
                  <Check size={16} strokeWidth={3} /> 👑 Appliquer Plaque Pro (3D Réaliste)
                </button>
                <button
                  type="button"
                  onClick={applyBlur}
                  disabled={!selection}
                  className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-[#14213D] disabled:opacity-40 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  <Sparkles size={16} /> Flouter le cadre
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs font-black text-[#14213D] bg-amber-50 px-4 py-3 rounded-xl border border-amber-200 shadow-2xs">
                <Paintbrush size={16} className="text-[#FCA311]" />
                Maintenez et glissez sur la photo pour dessiner/flouter en direct !
              </div>
            )}
            
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-3.5 bg-white border border-[#E5E5E5] hover:border-red-300 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ml-auto sm:ml-0"
            >
              <RotateCcw size={15} /> Réinitialiser
            </button>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-white border border-[#E5E5E5] hover:bg-gray-50 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none px-8 py-3.5 bg-[#FCA311] text-[#14213D] hover:bg-amber-500 disabled:opacity-50 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2.5"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
              Appliquer & Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleForm;
