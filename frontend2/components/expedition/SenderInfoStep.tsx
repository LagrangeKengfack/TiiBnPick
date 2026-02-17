"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  ArrowRight,
  Send,
  Loader2,
  CheckCircle2,
  Globe,
  Building,
  Navigation,
  MapPinned,
  X,
  Circle,
} from "lucide-react";
import { countries } from "@/lib/utils";
import { reverseGeocodeRaw, getDeviceLocation } from "@/services/geocoding";
import { SenderData, SenderInfoStepProps } from "@/types/package";

export default function SenderInfoStep({
  initialData,
  onContinue,
}: SenderInfoStepProps) {
  // We include isSender in the state so it persists when navigating back/forth
  const [formData, setFormData] = useState<SenderData>({
    ...initialData,
    isSender: initialData.isSender || false, // Ensure this is in your SenderData interface
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLocating, setIsLocating] = useState(false);
  const [fullDetectedAddress, setFullDetectedAddress] = useState("");

  // --- LEGACY COUNTRY/REGION/CITY LOGIC ---
  useEffect(() => {
    if (formData.senderCountry) {
      const countryData =
        countries[formData.senderCountry as keyof typeof countries];
      if (
        countryData &&
        !countryData.regions.hasOwnProperty(formData.senderRegion)
      ) {
        setFormData((prev) => ({ ...prev, senderRegion: "", senderCity: "" }));
      }
    }
  }, [formData.senderCountry, formData.senderRegion]);

  useEffect(() => {
    if (formData.senderCountry && formData.senderRegion) {
      const countryData =
        countries[formData.senderCountry as keyof typeof countries];
      const regionData = (countryData.regions as any)[formData.senderRegion];
      if (regionData && !regionData.cities.includes(formData.senderCity)) {
        setFormData((prev) => ({ ...prev, senderCity: "" }));
      }
    }
  }, [formData.senderCountry, formData.senderRegion, formData.senderCity]);

  // --- HANDLERS ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAutoLocate = async () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const data = await reverseGeocodeRaw(latitude, longitude);
          const addr = data.address;
          setFullDetectedAddress(data.display_name);

          setFormData((prev) => ({
            ...prev,
            isSender: true,
            senderCountry: addr.country?.toLowerCase() || "",
            senderRegion: addr.state || "",
            senderCity: addr.city || addr.town || addr.village || "",
            senderAddress: addr.road || addr.pedestrian || "",
            senderLieuDit:
              addr.suburb || addr.neighborhood || addr.county || "",
            latitude,
            longitude,
          }));
        } catch (error) {
          alert("Erreur lors de la récupération de l'adresse.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        alert("Localisation échouée. Vérifiez vos permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.senderFirstName.trim()) newErrors.senderFirstName = "Requis";
    if (!formData.senderLastName.trim()) newErrors.senderLastName = "Requis";
    if (!formData.senderPhone.trim()) newErrors.senderPhone = "Requis";

    // Only validate selects/manual address if NOT in isSender mode
    if (!formData.isSender) {
      if (!formData.senderCountry) newErrors.senderCountry = "Requis";
      if (!formData.senderRegion) newErrors.senderRegion = "Requis";
      if (!formData.senderCity) newErrors.senderCity = "Requis";
      if (!formData.senderAddress.trim()) newErrors.senderAddress = "Requis";
      if (!formData.senderLieuDit.trim()) newErrors.senderLieuDit = "Requis";
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valErrors = validateForm();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }
    onContinue(formData);
  };

  const availableRegions =
    countries[formData.senderCountry as keyof typeof countries]?.regions || {};
  const availableCities =
    (availableRegions as any)[formData.senderRegion]?.cities || [];

  return (
    <div className="flex flex-col items-center py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 p-8 md:p-10"
      >
        {/* Header (Same as Recipient) */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl mb-4">
            <Send className="w-6 h-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Informations expéditeur
          </h2>
        </div>

        {/* Smart Box */}
        <div className="mb-8 p-6 rounded-2xl bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-orange-900 dark:text-orange-300 font-bold text-sm">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.isSender ? "bg-orange-500 border-orange-500" : "bg-white"}`}
            >
              {formData.isSender && (
                <CheckCircle2 className="w-4 h-4 text-white" />
              )}
            </div>
            <span>Je suis l'expéditeur (Utiliser ma position actuelle)</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAutoLocate}
              disabled={isLocating}
              className="px-6 py-2.5 bg-orange-600 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-2"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPinned className="w-4 h-4" />
              )}
              {formData.isSender ? "Position Validée" : "Oui, localisez-moi"}
            </button>
            {formData.isSender && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isSender: false })}
                className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-400"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              icon={User}
              label="Nom"
              name="senderLastName"
              value={formData.senderLastName}
              onChange={handleChange}
              error={errors.senderLastName}
            />
            <InputField
              icon={User}
              label="Prénom"
              name="senderFirstName"
              value={formData.senderFirstName}
              onChange={handleChange}
              error={errors.senderFirstName}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              icon={Phone}
              label="Téléphone"
              name="senderPhone"
              value={formData.senderPhone}
              onChange={handleChange}
              error={errors.senderPhone}
            />
            <InputField
              icon={Mail}
              label="Email (Optionnel)"
              name="senderEmail"
              value={formData.senderEmail}
              onChange={handleChange}
            />
          </div>

          <AnimatePresence mode="wait">
            {formData.isSender ? (
              <motion.div
                key="auto"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2"
              >
                <label className="text-[11px] font-bold uppercase text-orange-600 mb-1 block ml-1">
                  Adresse détectée
                </label>
                <textarea
                  readOnly
                  value={fullDetectedAddress || formData.senderAddress}
                  className="w-full p-4 bg-orange-50/30 border border-orange-200 rounded-2xl text-xs italic text-gray-600 outline-none"
                  rows={2}
                />
              </motion.div>
            ) : (
              <motion.div
                key="manual"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SelectField
                    icon={Globe}
                    label="Pays"
                    name="senderCountry"
                    value={formData.senderCountry}
                    onChange={handleChange}
                    error={errors.senderCountry}
                  >
                    <option value="">Choisir...</option>
                    {Object.entries(countries).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.name}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    icon={Building}
                    label="Région"
                    name="senderRegion"
                    value={formData.senderRegion}
                    onChange={handleChange}
                    error={errors.senderRegion}
                    disabled={!formData.senderCountry}
                  >
                    <option value="">Choisir...</option>
                    {Object.entries(availableRegions).map(([k, v]: any) => (
                      <option key={k} value={k}>
                        {v.name}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    icon={Navigation}
                    label="Ville"
                    name="senderCity"
                    value={formData.senderCity}
                    onChange={handleChange}
                    error={errors.senderCity}
                    disabled={!formData.senderRegion}
                  >
                    <option value="">Choisir...</option>
                    {availableCities.map((c: string) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <InputField
                  icon={MapPin}
                  label="Adresse Complète"
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleChange}
                  error={errors.senderAddress}
                />
                <InputField
                  icon={Home}
                  label="Lieu-dit"
                  name="senderLieuDit"
                  value={formData.senderLieuDit}
                  onChange={handleChange}
                  error={errors.senderLieuDit}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              className="px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all active:scale-95"
            >
              Continuer
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Reusable Legacy UI components
const InputField = ({ icon: Icon, label, error, ...props }: any) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
      <input
        {...props}
        className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border ${error ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-2xl outline-none focus:border-orange-500 text-sm transition-all`}
      />
    </div>
    {error && <span className="text-[10px] text-red-500 ml-1">{error}</span>}
  </div>
);

const SelectField = ({ icon: Icon, label, error, children, ...props }: any) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-[11px] font-bold uppercase text-gray-500 ml-1">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 z-10" />
      <select
        {...props}
        className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border ${error ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-2xl outline-none appearance-none text-sm`}
      >
        {children}
      </select>
    </div>
  </div>
);
