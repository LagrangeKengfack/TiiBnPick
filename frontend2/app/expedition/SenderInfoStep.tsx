'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, MapPin, Home, ArrowRight, Send, Sparkles, Circle, UserPlus, X, Globe, Building, Navigation } from 'lucide-react';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SenderData {
  senderFirstName: string;
  senderLastName: string;
  senderPhone: string;
  senderEmail: string;
  senderCountry: string;
  senderRegion: string;
  senderCity: string;
  senderAddress: string;
  latitude?: number;
  longitude?: number;
}

interface SenderInfoStepProps {
  initialData: SenderData;
  onContinue: (data: SenderData) => void;
  currentUser?: any;
}

// Données des pays et régions
const countries = {
  cameroun: {
    name: 'Cameroun',
    regions: {
      'centre': { name: 'Centre', cities: ['Yaoundé', 'Mbalmayo', 'Akonolinga', 'Bafia', 'Ntui', 'Mfou', 'Obala', 'Okola', 'Soa'] },
      'littoral': { name: 'Littoral', cities: ['Douala', 'Edéa', 'Nkongsamba', 'Yabassi', 'Loum', 'Manjo', 'Mbanga', 'Mouanko'] },
      'ouest': { name: 'Ouest', cities: ['Bafoussam', 'Dschang', 'Bandjoun', 'Mbouda', 'Bangangté', 'Foumban', 'Kékem'] },
      'nord-ouest': { name: 'Nord-Ouest', cities: ['Bamenda', 'Kumbo', 'Wum', 'Ndop', 'Mbengwi', 'Bali', 'Bafut'] },
      'sud-ouest': { name: 'Sud-Ouest', cities: ['Buéa', 'Limbe', 'Kumba', 'Mamfe', 'Tiko', 'Idenau', 'Fontem'] },
      'adamaoua': { name: 'Adamaoua', cities: ['Ngaoundéré', 'Meiganga', 'Tibati', 'Tignère', 'Banyo', 'Kontcha'] },
      'nord': { name: 'Nord', cities: ['Garoua', 'Maroua', 'Guider', 'Figuil', 'Poli', 'Rey-Bouba', 'Tcholliré'] },
      'extreme-nord': { name: 'Extrême-Nord', cities: ['Maroua', 'Mokolo', 'Kousséri', 'Yagoua', 'Mora', 'Waza', 'Kaélé'] },
      'est': { name: 'Est', cities: ['Bertoua', 'Batouri', 'Abong-Mbang', 'Yokadouma', 'Kenzou', 'Garoua-Boulaï'] },
      'sud': { name: 'Sud', cities: ['Ebolowa', 'Sangmélima', 'Kribi', 'Ambam', 'Lolodorf', 'Campo', 'Mvangane'] }
    }
  },
  nigeria: {
    name: 'Nigeria',
    regions: {
      'lagos': { name: 'Lagos', cities: ['Lagos', 'Ikeja', 'Epe', 'Ikorodu', 'Badagry', 'Mushin', 'Alimosho'] },
      'abuja': { name: 'Abuja FCT', cities: ['Abuja', 'Gwagwalada', 'Kuje', 'Abaji', 'Bwari', 'Kwali'] },
      'kano': { name: 'Kano', cities: ['Kano', 'Wudil', 'Gwarzo', 'Rano', 'Karaye', 'Rimin Gado'] },
      'rivers': { name: 'Rivers', cities: ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Ikwerre', 'Oyigbo', 'Okrika'] },
      'oyo': { name: 'Oyo', cities: ['Ibadan', 'Ogbomoso', 'Oyo', 'Iseyin', 'Saki', 'Igboho', 'Eruwa'] },
      'kaduna': { name: 'Kaduna', cities: ['Kaduna', 'Zaria', 'Kafanchan', 'Kagoro', 'Zonkwa', 'Makarfi'] },
      'ogun': { name: 'Ogun', cities: ['Abeokuta', 'Sagamu', 'Ijebu-Ode', 'Ota', 'Ilaro', 'Ayetoro'] },
      'anambra': { name: 'Anambra', cities: ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia', 'Agulu', 'Ihiala'] }
    }
  }
};

const FloatingIcon = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 0.2, y: 0 }}
    transition={{ duration: 0.6, delay, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
    className="absolute text-orange-200 dark:text-orange-500/20"
  >
    {children}
  </motion.div>
);

const InputField = ({ icon: Icon, id, error, ...props }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="group"
  >
    <label htmlFor={id} className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 tracking-wider">
      {props.label}
    </label>
    <div className="relative">
      <motion.div
        className="absolute left-3 top-1/2 -translate-y-1/2"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-orange-500 transition-colors" />
      </motion.div>
      <input
        id={id}
        {...props}
        className={`w-full pl-10 pr-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-2 rounded-lg transition-all duration-200 
          bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm
          ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-500'}
          focus:ring-2 focus:ring-orange-500/20 focus:bg-white dark:focus:bg-gray-900 shadow-sm hover:shadow-md`}
      />
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <Circle className="w-2 h-2 fill-red-500 text-red-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

const SelectField = ({ icon: Icon, id, error, children, ...props }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="group"
  >
    <label htmlFor={id} className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 tracking-wider">
      {props.label}
    </label>
    <div className="relative">
      <motion.div
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-orange-500 transition-colors" />
      </motion.div>
      <select
        id={id}
        {...props}
        className={`w-full pl-10 pr-8 py-2.5 text-sm text-gray-800 dark:text-gray-100 border-2 rounded-lg appearance-none transition-all duration-200 
          bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm
          ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-500'}
          focus:ring-2 focus:ring-orange-500/20 focus:bg-white dark:focus:bg-gray-900 shadow-sm hover:shadow-md cursor-pointer`}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </motion.div>
);

const BreakingNewsNotification = ({ isVisible, onClose, onRegister, onContinueWithout }: { isVisible: boolean; onClose: () => void; onRegister: () => void; onContinueWithout: () => void; }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 shadow-2xl">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <motion.div animate={{ x: ['0%', '100%'] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>
          <div className="hidden md:block">
            <div className="relative px-4 py-3">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center space-x-4 flex-1">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }} className="flex items-center bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Sparkles className="w-4 h-4 text-white mr-2" /></motion.div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Notification</span>
                  </motion.div>
                  <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex-1 overflow-hidden">
                    <motion.p animate={{ x: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="text-white font-medium text-sm lg:text-base whitespace-nowrap">🎉 Créez votre compte gratuitement pour un suivi optimal de vos envois et une expérience personnalisée !</motion.p>
                  </motion.div>
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  <motion.button onClick={onRegister} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center bg-white text-orange-600 px-4 py-2 rounded-full font-semibold text-sm hover:bg-orange-50 transition-colors shadow-lg"><UserPlus className="w-4 h-4 mr-2" />S'inscrire</motion.button>
                  <motion.button onClick={onContinueWithout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-white text-sm hover:text-orange-200 transition-colors underline">Continuer sans compte</motion.button>
                  <motion.button onClick={onClose} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} className="text-white/80 hover:text-white transition-colors ml-2"><X className="w-5 h-5" /></motion.button>
                </div>
              </div>
            </div>
          </div>
          {/* Versions pour mobile et tablette (simplifiées) */}
          <div className="px-4 py-3 md:hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm"><Sparkles className="w-4 h-4 text-white mr-2" /><span className="text-xs font-bold text-white uppercase tracking-wider">Notification</span></div>
              <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-white font-medium text-sm text-center mb-3">🎉 Créez votre compte pour un suivi optimal de vos envois !</p>
            <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-2 sm:space-y-0">
              <button onClick={onRegister} className="w-full sm:w-auto flex items-center justify-center bg-white text-orange-600 px-4 py-2.5 rounded-full font-semibold text-sm shadow-lg"><UserPlus className="w-4 h-4 mr-2" />S'inscrire gratuitement</button>
              <button onClick={onContinueWithout} className="w-full sm:w-auto text-white text-sm hover:text-orange-200">Continuer sans compte</button>
            </div>
          </div>
          <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 8, ease: "linear" }} className="h-1 bg-white/30" />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function SenderInfoStep({ initialData, onContinue, currentUser }: SenderInfoStepProps) {
  const [formData, setFormData] = useState<SenderData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Synchroniser l'état local avec les données initiales du parent (pour l'auto-remplissage)
  useEffect(() => {
    // On ne met à jour que si les nouveaux initialData apportent des infos (évite d'écraser une saisie utilisateur encours par du vide)
    if (initialData.senderFirstName || initialData.senderLastName || initialData.senderPhone || initialData.senderEmail) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationTimer, setNotificationTimer] = useState<NodeJS.Timeout | null>(null);
  const [isSender, setIsSender] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geolocationPermission, setGeolocationPermission] = useState<string>('prompt');
  const router = useRouter();
  const { user: authUser } = useAuth();

  // Pour être sûr, on considère connecté si 'currentUser' (prop) OU 'authUser' (context) est présent.
  const isUserLoggedIn = !!(currentUser || authUser);

  // --- CORRECTION START ---
  // Effet pour réinitialiser la région et la ville si le pays change et que la région n'est plus valide.
  useEffect(() => {
    if (formData.senderCountry) {
      const countryData = countries[formData.senderCountry as keyof typeof countries];
      if (countryData && !countryData.regions.hasOwnProperty(formData.senderRegion)) {
        setFormData(prev => ({ ...prev, senderRegion: '', senderCity: '' }));
      }
    }
  }, [formData.senderCountry, formData.senderRegion]);

  // Effet pour réinitialiser la ville si la région change et que la ville n'est plus valide.
  useEffect(() => {
    if (formData.senderCountry && formData.senderRegion) {
      const countryData = countries[formData.senderCountry as keyof typeof countries];
      const regionData = (countryData.regions as any)[formData.senderRegion];
      if (regionData && !regionData.cities.includes(formData.senderCity)) {
        setFormData(prev => ({ ...prev, senderCity: '' }));
      }
    }
  }, [formData.senderCountry, formData.senderRegion, formData.senderCity]);

  // Effet pour gérer la disparition automatique de la notification et continuer automatiquement
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
        // Avancer automatiquement à l'étape suivante après la disparition de la notification
        onContinue(formData);
      }, 10000);

      setNotificationTimer(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [showNotification, formData, onContinue]);

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setGeolocationPermission(result.state);
        result.onchange = () => {
          setGeolocationPermission(result.state);
        };
      });
    }
  }, []);
  // --- CORRECTION END ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.senderFirstName.trim().length < 2) newErrors.senderFirstName = "Prénom requis";
    if (formData.senderLastName.trim().length < 2) newErrors.senderLastName = "Nom requis";
    if (!/^(6|2)(?:[235-9]\d{7})$/.test(formData.senderPhone.replace(/\s/g, ''))) newErrors.senderPhone = "Format invalide";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.senderEmail)) newErrors.senderEmail = "Email invalide";

    if (!isSender) {
      if (!formData.senderCountry) newErrors.senderCountry = "Pays requis";
      if (!formData.senderRegion) newErrors.senderRegion = "Région requise";
      if (!formData.senderCity) newErrors.senderCity = "Ville requise";
      if (!formData.senderAddress.trim()) newErrors.senderAddress = "Adresse requise";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    onContinue(formData);
    setIsSubmitting(false);
  };

  const handleRegister = () => {
    localStorage.setItem('temp_sender_info_for_registration', JSON.stringify(formData));
    router.push('/register');
  };

  const handleContinueWithout = () => {
    setShowNotification(false);
    onContinue(formData);
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const availableRegions = formData.senderCountry ? countries[formData.senderCountry as keyof typeof countries]?.regions || {} : {};
  // --- CORRECTION ---
  const availableCities = (() => {
    if (formData.senderCountry && formData.senderRegion) {
      const countryData = countries[formData.senderCountry as keyof typeof countries];
      if (countryData) {
        const regionData = (countryData.regions as any)[formData.senderRegion];
        return regionData?.cities || [];
      }
    }
    return [];
  })();
  // --- FIN DE LA CORRECTION ---
  const handleGeolocationRequest = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };
      navigator.geolocation.getCurrentPosition((position) => {
        setIsSender(true);
        setFormData(prev => ({
          ...prev,
          senderFirstName: currentUser?.full_name?.split(' ')[0] || (authUser as any)?.user_metadata?.full_name?.split(' ')[0] || '',
          senderLastName: currentUser?.full_name?.split(' ').slice(1).join(' ') || (authUser as any)?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          senderPhone: currentUser?.phone || (authUser as any)?.user_metadata?.phone || '',
          senderEmail: currentUser?.email || authUser?.email || '',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setIsLocating(false);
      }, (error) => {
        console.error("Erreur de géolocalisation", error);
        let errorMessage = "Impossible de récupérer votre position.";
        if (error.code === 1) { // PERMISSION_DENIED
          errorMessage = "Le navigateur a bloqué l'accès. Le site ne peut pas forcer l'activation. Réinitialisez les permissions du site dans vos réglages.";
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          errorMessage = "Position indisponible. Activez le GPS de votre appareil.";
        } else if (error.code === 3) { // TIMEOUT
          errorMessage = "Délai d'attente dépassé. Réessayez.";
        }
        alert(errorMessage);
        setIsSender(false);
        setIsLocating(false);
      }, options);
    } else {
      alert("Votre navigateur ne supporte pas la géolocalisation.");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-transparent relative overflow-hidden transition-colors duration-300">
        <FloatingIcon delay={0}><Send className="w-16 h-16 absolute top-20 right-20" /></FloatingIcon>
        <FloatingIcon delay={0.5}><Sparkles className="w-12 h-12 absolute top-40 left-10" /></FloatingIcon>
        <FloatingIcon delay={1}><Circle className="w-8 h-8 absolute bottom-40 right-40" /></FloatingIcon>
        <FloatingIcon delay={1.5}><Sparkles className="w-10 h-10 absolute bottom-20 left-20" /></FloatingIcon>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div className="w-full max-w-3xl" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}>
            <motion.div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-orange-900/10 border border-white/50 dark:border-gray-700/50 p-6 sm:p-8" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <div className="text-center mb-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-3">
                  <Send className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </motion.div>
                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                  Informations expéditeur
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="text-sm text-gray-500 dark:text-gray-400">
                  Renseignez vos coordonnées pour l'envoi
                </motion.p>
              </div>

              <div className="mb-6 flex flex-col items-center justify-center bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800/30">
                <div className={`flex items-center space-x-3 cursor-pointer ${isLocating ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => {
                  if (isLocating) return;
                  if (!isSender) {
                    // Trigger the same logic as the button below
                    handleGeolocationRequest();
                  } else {
                    setIsSender(false);
                    setFormData(prev => ({ ...prev, latitude: undefined, longitude: undefined }));
                  }
                }}>
                  <div className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSender ? 'border-orange-600 bg-orange-600' : 'border-gray-400 bg-white'}`}>
                    {isLocating ? (
                      <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin absolute" />
                    ) : (
                      isSender && <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className={`font-medium ${isSender ? 'text-orange-700 dark:text-orange-400' : 'text-gray-600 dark:text-gray-300'}`}>
                    {isLocating ? "Acquisition de la position..." : "Je suis l'expéditeur (Utiliser ma position actuelle)"}
                  </span>
                </div>

                {!isSender && !isLocating && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-full transition-colors flex items-center shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGeolocationRequest();
                    }}
                  >
                    <MapPin className="w-3 h-3 mr-1.5" />
                    Activer la localisation du site
                  </motion.button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField icon={User} id="senderLastName" name="senderLastName" value={formData.senderLastName} onChange={handleChange} label="Nom" placeholder="Mballa" error={errors.senderLastName} />
                  <InputField icon={User} id="senderFirstName" name="senderFirstName" value={formData.senderFirstName} onChange={handleChange} label="Prénom" placeholder="Joseph" error={errors.senderFirstName} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField icon={Phone} id="senderPhone" name="senderPhone" value={formData.senderPhone} onChange={handleChange} label="Téléphone" placeholder="699123456" error={errors.senderPhone} />
                  <InputField icon={Mail} type="email" id="senderEmail" name="senderEmail" value={formData.senderEmail} onChange={handleChange} label="Email" placeholder="nom@exemple.com" error={errors.senderEmail} />
                </div>

                {!isSender && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <SelectField icon={Globe} id="senderCountry" name="senderCountry" value={formData.senderCountry} onChange={handleChange} label="Pays" error={errors.senderCountry}>
                        <option value="">Sélectionner un pays</option>
                        {Object.entries(countries).map(([key, country]) => (<option key={key} value={key}>{country.name}</option>))}
                      </SelectField>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField icon={Building} id="senderRegion" name="senderRegion" value={formData.senderRegion} onChange={(e: any) => {
                          const region = e.target.value;
                          const city = region === 'centre' ? 'Yaoundé' : 'Douala';
                          setFormData(prev => ({
                            ...prev,
                            senderRegion: region,
                            senderCity: city,
                            senderAddress: ''
                          }));
                        }} label="Région" error={errors.senderRegion} disabled={!formData.senderCountry}>
                          <option value="">Sélectionner une région</option>
                          <option value="centre">Centre</option>
                          <option value="littoral">Littoral</option>
                        </SelectField>
                        <SelectField icon={Navigation} id="senderCity" name="senderCity" value={formData.senderCity} label="Ville" error={errors.senderCity} disabled>
                          <option value={formData.senderCity}>{formData.senderCity || "Sélectionner une ville"}</option>
                        </SelectField>
                      </div>
                    </div>


                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 tracking-wider">
                      Adresse Complète
                    </label>
                    <AddressAutocomplete
                      onSelect={(address) => {
                        setFormData(prev => ({
                          ...prev,
                          senderAddress: address.street,
                          latitude: address.latitude,
                          longitude: address.longitude
                        }));
                        if (errors.senderAddress) setErrors(prev => ({ ...prev, senderAddress: '' }));
                      }}
                      defaultValue={formData.senderAddress}
                      city={formData.senderCity}
                      placeholder="Rue, Quartier..."
                      className={errors.senderAddress ? 'border-red-300' : ''}
                    />
                    {errors.senderAddress && <p className="text-[10px] text-red-500 mt-1">{errors.senderAddress}</p>}
                  </>
                )}

                <AnimatePresence>
                  {Object.values(errors).some(error => error) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 rounded-lg p-3">
                      <div className="text-xs text-red-600 dark:text-red-300 font-medium">Veuillez corriger les erreurs ci-dessus</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4 flex justify-end">
                  <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`inline-flex items-center justify-center px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl ${isSubmitting ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800'} text-white transform hover:-translate-y-0.5`}>
                    <AnimatePresence mode="wait">
                      {isSubmitting ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Traitement...
                        </motion.div>
                      ) : (
                        <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                          Continuer
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
