'use client'

import React, { useEffect, useState } from "react"
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

// Helper component for stable photo previews
const PhotoPreview = ({ url, alt, className, objectFit = "object-contain" }: { url: string | null, alt: string, className?: string, objectFit?: "object-contain" | "object-cover" }) => {
  const defaultClasses = "flex items-center justify-center overflow-hidden bg-gray-100/50 border-2 border-white shadow-sm rounded-lg";
  // If className includes a rounding class, we remove the default rounded-lg
  const mergedClasses = className
    ? (className.includes('rounded-') ? `${defaultClasses.replace('rounded-lg', '')} ${className}` : `${defaultClasses} ${className}`)
    : defaultClasses;

  return (
    <div className={mergedClasses}>
      {url ? (
        <img
          src={url}
          alt={alt}
          className={`w-full h-full ${objectFit}`}
        />
      ) : (
        <div className="flex flex-col items-center gap-1 text-gray-400">
          <ImageIcon className="h-6 w-6 opacity-20" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Absent</span>
        </div>
      )}
    </div>
  );
};

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, UserCircle, Phone, Mail, Lock, MapPin, Upload, Camera, ChevronDown, ImageIcon, Car, Check, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { checkEmail, createClient, checkNationalId } from '../../services/clientService'

type Step = 1 | 2 | 3 | 4 | 5 | 6
type Role = 'client' | 'livreur' | null

export default function RegisterPage() {

  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [role, setRole] = useState<Role>(null)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [photoIdentite, setPhotoIdentite] = useState<File | null>(null)
  const [photoCniRecto, setPhotoCniRecto] = useState<File | null>(null)
  const [photoCniVerso, setPhotoCniVerso] = useState<File | null>(null)
  const [photoVehiculeAvant, setPhotoVehiculeAvant] = useState<File | null>(null)
  const [photoVehiculeArriere, setPhotoVehiculeArriere] = useState<File | null>(null)
  const [photoNiu, setPhotoNiu] = useState<File | null>(null)

  // Stable URL states for previews
  const [urlIdentite, setUrlIdentite] = useState<string | null>(null)
  const [urlCniRecto, setUrlCniRecto] = useState<string | null>(null)
  const [urlCniVerso, setUrlCniVerso] = useState<string | null>(null)
  const [urlVehiculeAvant, setUrlVehiculeAvant] = useState<string | null>(null)
  const [urlVehiculeArriere, setUrlVehiculeArriere] = useState<string | null>(null)
  const [urlNiu, setUrlNiu] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null);
  const [cniError, setCniError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);



  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    motDePasse: '',
    confirmerMotDePasse: '',
    pays: '',
    adressePersonnelle: '',
    lieuDitAdresse: '',
    numeroCNI: '',
    numeroNINE: '',
    typeVehicule: '',
    marqueVehicule: '',
    numeroImmatriculation: '',
    color: '',
    longeurMalle: '',
    largeurMalle: '',
    hauteurMalle: '',
    uniteMalle: 'cm'
  })

  const searchParams = useSearchParams()

  useEffect(() => {
    try {
      const r = searchParams.get('role')
      const s = searchParams.get('step')
      if (r === 'livreur' || r === 'client') {
        setRole(r as Role)
        setCompletedSteps([1])
        if (s) {
          const n = parseInt(s, 10)
          if (!isNaN(n) && n >= 1 && n <= 4) setStep(n as Step)
          else setStep(2)
        } else {
          setStep(2)
        }
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const selectClient = () => {
    setRole('client')
    setCompletedSteps([1])
    setStep(2)
  }

  const selectLivreur = () => {
    setRole('livreur')
    setCompletedSteps([1])
    setStep(2)
  }

  const goBack = () => {
    if (step === 2) {
      setStep(1)
      setRole(null)
    } else {
      setStep((step - 1) as Step)
    }
  }

  const validateStep2 = () => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (!formData.nom.trim()) {
      errors.nom = "Le nom est requis";
      isValid = false;
    }
    if (!formData.prenom.trim()) {
      errors.prenom = "Le prénom est requis";
      isValid = false;
    }
    if (!formData.telephone.trim()) {
      errors.telephone = "Le téléphone est requis";
      isValid = false;
    } else if (!/^6\d{8}$/.test(formData.telephone)) {
      errors.telephone = "Le téléphone doit commencer par 6 et contenir 9 chiffres";
      isValid = false;
    }
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format d'email invalide";
      isValid = false;
    }
    if (!formData.motDePasse.trim()) {
      errors.motDePasse = "Le mot de passe est requis";
      isValid = false;
    }
    if (!formData.confirmerMotDePasse.trim()) {
      errors.confirmerMotDePasse = "La confirmation est requise";
      isValid = false;
    } else if (formData.motDePasse !== formData.confirmerMotDePasse) {
      errors.confirmerMotDePasse = "Les mots de passe ne correspondent pas";
      isValid = false;
    }

    if (!formData.numeroCNI.trim()) {
      errors.numeroCNI = "Le numéro de CNI est requis";
      isValid = false;
    } else if (formData.numeroCNI.length <= 9) {
      errors.numeroCNI = "Le numéro de CNI doit contenir plus de 9 chiffres";
      isValid = false;
    }


    setFieldErrors(errors);
    return isValid;
  }

  const validateStep3 = () => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (!formData.pays) {
      errors.pays = "Le pays est requis";
      isValid = false;
    }
    if (!formData.adressePersonnelle.trim()) {
      errors.adressePersonnelle = "L'adresse est requise";
      isValid = false;
    }
    if (!formData.lieuDitAdresse.trim()) {
      errors.lieuDitAdresse = "Le lieu-dit est requis";
      isValid = false;
    }
    if (!formData.numeroNINE.trim()) {
      errors.numeroNINE = "Le numéro NINE est requis";
      isValid = false;
    } else if (formData.numeroNINE.length !== 12) {
      errors.numeroNINE = "Le numéro NINE doit contenir 12 caractères";
      isValid = false;
    }

    if (!photoIdentite) {
      errors.photoIdentite = "La photo d'identité est requise";
      isValid = false;
    }
    if (!photoCniRecto) {
      errors.photoCniRecto = "La photo CNI recto est requise";
      isValid = false;
    }
    if (!photoCniVerso) {
      errors.photoCniVerso = "La photo CNI verso est requise";
      isValid = false;
    }
    if (!photoNiu) {
      errors.photoNiu = "Le document NIU est requis";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  }

  const validateStep4 = () => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (!formData.typeVehicule) {
      errors.typeVehicule = "Le type de véhicule est requis";
      isValid = false;
    }
    if (!formData.marqueVehicule.trim()) {
      errors.marqueVehicule = "La marque est requise";
      isValid = false;
    }
    if (!photoVehiculeAvant) {
      errors.photoVehiculeAvant = "La photo avant est requise";
      isValid = false;
    }
    if (!photoVehiculeArriere) {
      errors.photoVehiculeArriere = "La photo arrière est requise";
      isValid = false;
    }
    if (!formData.numeroImmatriculation.trim()) {
      errors.numeroImmatriculation = "Le numéro d'immatriculation est requis";
      isValid = false;
    }
    if (!formData.color.trim()) {
      errors.color = "La couleur est requise";
      isValid = false;
    }
    if (!formData.longeurMalle.toString().trim() || !formData.largeurMalle.toString().trim() || !formData.hauteurMalle.toString().trim()) {
      errors.dimensions = "Toutes les dimensions sont requises";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  }

  const goNext = async () => {
    if (step === 2) {
      if (!validateStep2()) {
        return;
      }

      // Validate email before proceeding
      if (formData.email) {
        try {
          const exists = await checkEmail(formData.email);
          if (exists) {
            setEmailError("Cet email est déjà utilisé.");
            return; // Stop here
          }
          setEmailError(null); // Clear error if valid
        } catch (err) {
          console.error("Error checking email", err);
          setEmailError("Erreur lors de la vérification de l'email.");
          return;
        }
      }

      // Validate CNI before proceeding
      if (formData.numeroCNI) {
        try {
          const exists = await checkNationalId(formData.numeroCNI);
          if (exists) {
            setCniError("Ce numéro de CNI est déjà utilisé.");
            return; // Stop here
          }
          setCniError(null);
        } catch (err) {
          console.error("Error checking CNI", err);
          setCniError("Erreur lors de la vérification du CNI.");
          return;
        }
      }
    }

    if (step === 3 && role === 'livreur') {
      if (!validateStep3()) {
        return;
      }
    }

    if (step === 4 && role === 'livreur') {
      if (!validateStep4()) {
        return;
      }
    }

    if (role === 'livreur' && step < 5) {
      setCompletedSteps([...completedSteps, step])
      setStep((step + 1) as Step)
    } else if (role === 'client' && step < 3) {
      setCompletedSteps([...completedSteps, step])
      setStep((step + 1) as Step)
    } else {
      console.log('Submit:', formData, { photoIdentite, photoCniRecto, photoCniVerso, photoVehiculeAvant, photoVehiculeArriere })
    }
  }

  const updateField = (field: string, value: string) => {
    if (field === 'telephone') {
      let digitsOnly = value.replace(/\D/g, '').slice(0, 9)
      // Force start with 6 if user types anything else at start
      if (digitsOnly.length > 0 && !digitsOnly.startsWith('6')) {
        // If user typed '6' it's fine. If they typed '1', replace with '6' or block?
        // User said "forcé cela sur l'interface". Let's handle it by auto-prefixing or validation.
        // Simpler to just enforce strictly in validation and maybe prevent non-6 start if possible, 
        // but simple replace is often jarring. 
        // Let's just allow digits but validation handles it.
        // Actually, let's try to be smart.
      }
      setFormData({ ...formData, [field]: digitsOnly })
    } else if (field === 'numeroCNI') {
      const digitsOnly = value.replace(/\D/g, '')
      setFormData({ ...formData, [field]: digitsOnly })
    } else if (field === 'numeroNINE') {
      const valueUpper = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
      setFormData({ ...formData, [field]: valueUpper })
    } else if (field === 'numeroImmatriculation') {
      const valueUpper = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9)
      setFormData({ ...formData, [field]: valueUpper })
    } else if (field === 'typeVehicule') {
      const dimensions: { [key: string]: { longeur: string, largeur: string, hauteur: string, unite: string } } = {
        moto: { longeur: '2.05', largeur: '0.85', hauteur: '1.15', unite: 'm' },
        scooter: { longeur: '1.85', largeur: '0.70', hauteur: '1.10', unite: 'm' },
        velo: { longeur: '1.70', largeur: '0.58', hauteur: '1.02', unite: 'm' }
      };

      if (dimensions[value]) {
        setFormData({
          ...formData,
          [field]: value,
          longeurMalle: dimensions[value].longeur,
          largeurMalle: dimensions[value].largeur,
          hauteurMalle: dimensions[value].hauteur,
          uniteMalle: dimensions[value].unite
        });
      } else {
        setFormData({
          ...formData,
          [field]: value,
          longeurMalle: '',
          largeurMalle: '',
          hauteurMalle: '',
          uniteMalle: 'cm'
        });
      }
    } else {
      setFormData({ ...formData, [field]: value })
    }
  }

  const handlePhotoIdentiteChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoIdentite(file)
      try {
        const base64 = await fileToBase64(file)
        setUrlIdentite(base64)
      } catch (err) {
        console.error("Error converting photoIdentite to base64", err)
      }
    }
  }

  const handlePhotoCniRectoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoCniRecto(file)
      try {
        const base64 = await fileToBase64(file)
        setUrlCniRecto(base64)
      } catch (err) {
        console.error("Error converting cniRecto to base64", err)
      }
    }
  }

  const handlePhotoCniVersoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoCniVerso(file)
      try {
        const base64 = await fileToBase64(file)
        setUrlCniVerso(base64)
      } catch (err) {
        console.error("Error converting cniVerso to base64", err)
      }
    }
  }

  const handlePhotoVehiculeAvantChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoVehiculeAvant(file)
      try {
        const base64 = await fileToBase64(file)
        setUrlVehiculeAvant(base64)
      } catch (err) {
        console.error("Error converting vhAvant to base64", err)
      }
    }
  }

  const handlePhotoVehiculeArriereChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoVehiculeArriere(file)
      try {
        const base64 = await fileToBase64(file)
        setUrlVehiculeArriere(base64)
      } catch (err) {
        console.error("Error converting vhArriere to base64", err)
      }
    }
  }

  const handlePhotoNiuChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoNiu(file)
      try {
        const base64 = await fileToBase64(file)
        setUrlNiu(base64)
      } catch (err) {
        console.error("Error converting niu to base64", err)
      }
    }
  }

  // No early return for Step 1 anymore to keep layout stable
  const totalSteps = role === 'client' ? 3 : 5

  return (
    <div key="auth-page-root" className="min-h-screen flex flex-col bg-[#f5f0e6]">
      <main className={`flex-1 flex flex-col ${step === 1 ? 'items-center justify-center' : 'items-start justify-start'} px-3 md:px-4 py-4 md:py-6 overflow-y-auto`}>
        <div className="w-full max-w-md mx-auto space-y-3 md:space-y-6">

          {/* Step 1: Selection (Now integrated to keep structure stable) */}
          {step === 1 && (
            <div key="step-1-content" className="w-full space-y-4 md:space-y-6">
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
              </div>

              <h2 className="text-base md:text-lg font-medium text-gray-800 text-center leading-relaxed">
                Quel type de compte souhaitez-vous créer?
              </h2>

              <div className="space-y-3 md:space-y-4 pt-2">
                <Card
                  className="cursor-pointer border-2 border-gray-200 hover:border-orange-400 transition-all active:scale-95"
                  onClick={selectClient}
                >
                  <CardContent className="p-4 md:p-6 flex flex-col items-center text-center gap-3 md:gap-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center">
                      <svg className="w-7 h-7 md:w-8 md:h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-center gap-1 md:gap-2">
                      <h3 className="font-semibold text-gray-900 text-lg md:text-xl">Client</h3>
                      <p className="text-xs md:text-sm text-gray-500">Je souhaite envoyer des colis</p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer border-2 border-gray-200 hover:border-orange-400 transition-all active:scale-95"
                  onClick={selectLivreur}
                >
                  <CardContent className="p-4 md:p-6 flex flex-col items-center text-center gap-3 md:gap-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center">
                      <svg className="w-7 h-7 md:w-8 md:h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-center gap-1 md:gap-2">
                      <h3 className="font-semibold text-gray-900 text-lg md:text-xl">Livreur</h3>
                      <p className="text-xs md:text-sm text-gray-500">Je souhaite livrer des colis</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step Indicators (Only for Step 2+) */}
          {step > 1 && step < 6 && (
            <div key="step-indicators-wrapper" className="flex flex-col items-center gap-2 md:gap-4 sticky top-0 bg-[#f5f0e6] py-2 z-10">
              <div className="flex items-center justify-center gap-0">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div key={i + 1} className="flex items-center">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 border-orange-500 ${completedSteps.includes(i + 1) ? 'bg-orange-500' : step === i + 1 ? 'bg-orange-500' : 'bg-white'
                      }`}>
                      {completedSteps.includes(i + 1) ? (
                        <Check className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      ) : step === i + 1 ? (
                        <span className="font-bold text-sm md:text-lg text-white">{i + 1}</span>
                      ) : (
                        <span className="font-bold text-sm md:text-lg text-orange-500">{i + 1}</span>
                      )}
                    </div>
                    {i < totalSteps - 1 && <div className={`w-6 md:w-8 h-1 ${completedSteps.includes(i + 1) ? 'bg-orange-500' : 'bg-white'}`}></div>}
                  </div>
                ))}
              </div>

              {step === 2 && (
                <h2 className="text-base md:text-lg font-medium text-gray-800 text-center leading-relaxed">
                  Veuillez remplir vos informations
                </h2>
              )}

              {step === 3 && role === 'client' && (
                <h2 className="text-base md:text-lg font-medium text-gray-800 text-center leading-relaxed">
                  Finalisation
                </h2>
              )}

              {step === 3 && role === 'livreur' && (
                <h2 className="text-base md:text-lg font-medium text-gray-800 text-center leading-relaxed">
                  Coordonnées
                </h2>
              )}

              {step === 4 && role === 'livreur' && (
                <h2 className="text-base md:text-lg font-medium text-gray-800 text-center leading-relaxed">
                  Informations sur le véhicule
                </h2>
              )}

              {step === 5 && role === 'livreur' && (
                <h2 className="text-base md:text-lg font-medium text-gray-800 text-center leading-relaxed">
                  Vérification des informations
                </h2>
              )}
            </div>
          )}

          {/* Step 2: Informations personnelles */}
          {step === 2 && (
            <Card key="step-2" className="border-2 border-gray-200">
              <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Nom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                    <Input
                      type="text"
                      placeholder="Votre nom"
                      value={formData.nom}
                      onChange={(e) => updateField('nom', e.target.value)}
                      className={`pl-9 md:pl-10 border-gray-300 focus:border-orange-500 text-sm md:text-base ${fieldErrors.nom ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {fieldErrors.nom && <p className="text-red-500 text-xs mt-1">{fieldErrors.nom}</p>}
                </div>

                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Prénom</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                    <Input
                      type="text"
                      placeholder="Votre prénom"
                      value={formData.prenom}
                      onChange={(e) => updateField('prenom', e.target.value)}
                      className={`pl-9 md:pl-10 border-gray-300 focus:border-orange-500 text-sm md:text-base ${fieldErrors.prenom ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {fieldErrors.prenom && <p className="text-red-500 text-xs mt-1">{fieldErrors.prenom}</p>}
                </div>

                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Numéro de téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                    <Input
                      type="tel"
                      placeholder="XXXXXXXXX"
                      value={formData.telephone}
                      onChange={(e) => updateField('telephone', e.target.value)}
                      maxLength={9}
                      className={`pl-9 md:pl-10 border-gray-300 focus:border-orange-500 text-sm md:text-base ${fieldErrors.telephone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {fieldErrors.telephone && <p className="text-red-500 text-xs mt-1">{fieldErrors.telephone}</p>}
                  {!fieldErrors.telephone && <p className="text-xs text-gray-500">9 chiffres requis</p>}
                </div>

                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Adresse email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                    <Input
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className={`pl-9 md:pl-10 border-gray-300 focus:border-orange-500 text-sm md:text-base ${fieldErrors.email || emailError ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                  {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                </div>

                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Numéro CNI</Label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                    <Input
                      type="text"
                      placeholder="1234567890..."
                      value={formData.numeroCNI}
                      onChange={(e) => updateField('numeroCNI', e.target.value)}
                      className={`pl-9 md:pl-10 border-gray-300 focus:border-orange-500 text-sm md:text-base ${fieldErrors.numeroCNI || cniError ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {fieldErrors.numeroCNI && <p className="text-red-500 text-xs mt-1">{fieldErrors.numeroCNI}</p>}
                  {!fieldErrors.numeroCNI && <p className="text-xs text-gray-500">{">"} 9 chiffres requis</p>}
                  {cniError && <p className="text-red-500 text-xs mt-1">{cniError}</p>}
                </div>

                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Votre mot de passe"
                      value={formData.motDePasse}
                      onChange={(e) => updateField('motDePasse', e.target.value)}
                      className={`pl-9 md:pl-10 pr-10 border-gray-300 focus:border-orange-500 text-sm md:text-base ${fieldErrors.motDePasse ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-600 transition-colors"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <Eye key="eye-open" size={20} /> : <EyeOff key="eye-closed" size={20} />}
                    </button>
                  </div>
                  {fieldErrors.motDePasse && <p className="text-red-500 text-xs mt-1">{fieldErrors.motDePasse}</p>}
                </div>

                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Confirmer mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirmez votre mot de passe"
                      value={formData.confirmerMotDePasse}
                      onChange={(e) => updateField('confirmerMotDePasse', e.target.value)}
                      className={`pl-9 md:pl-10 pr-10 border-gray-300 focus:border-orange-500 text-sm md:text-base ${fieldErrors.confirmerMotDePasse ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-600 transition-colors"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <Eye key="eye-open-conf" size={20} /> : <EyeOff key="eye-closed-conf" size={20} />}
                    </button>
                  </div>
                  {fieldErrors.confirmerMotDePasse && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmerMotDePasse}</p>}
                </div>

                <div className="flex gap-2 md:gap-3 pt-3 md:pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50 h-12 md:h-auto text-sm md:text-base bg-transparent"
                    onClick={goBack}
                  >
                    Précédent
                  </Button>
                  <Button
                    className="flex-1 bg-orange-500 hover:bg-orange-600 h-12 md:h-auto text-sm md:text-base"
                    onClick={goNext}
                  >
                    Suivant
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Coordonnées - LIVREUR ONLY */}
          {step === 3 && role === 'livreur' && (
            <Card key="step-3-livreur" className="border-2 border-gray-200">
              <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                <h3 className="text-center text-base md:text-lg font-semibold text-orange-500 mb-3 md:mb-4">Informations de localisation</h3>

                {/* 1. Pays */}
                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Pays</Label>
                  <Select value={formData.pays} onValueChange={(value) => updateField('pays', value)}>
                    <SelectTrigger className="border-gray-300 focus:border-orange-500 text-sm md:text-base relative pr-10 [&>svg]:hidden">
                      <SelectValue placeholder="Sélectionner votre pays" />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-orange-500" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cameroun">Cameroun</SelectItem>
                      <SelectItem value="france">France</SelectItem>
                      <SelectItem value="belgique">Belgique</SelectItem>
                      <SelectItem value="suisse">Suisse</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="usa">États-Unis</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.pays && <p className="text-red-500 text-xs mt-1">{fieldErrors.pays}</p>}
                </div>

                {/* 2. Adresse personnelle */}
                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Adresse personnelle</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                    <Input
                      type="text"
                      placeholder="Quartier Bastos, Yaoundé"
                      value={formData.adressePersonnelle}
                      onChange={(e) => updateField('adressePersonnelle', e.target.value)}
                      className={`pl-9 md:pl-10 border-gray-300 focus:border-orange-500 text-sm md:text-base ${fieldErrors.adressePersonnelle ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {fieldErrors.adressePersonnelle && <p className="text-red-500 text-xs mt-1">{fieldErrors.adressePersonnelle}</p>}
                </div>

                {/* 3. Lieu dit de l'adresse */}
                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Lieu dit de l'adresse</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                    <Input
                      type="text"
                      placeholder="Face Pharmacie du Rond Point"
                      value={formData.lieuDitAdresse}
                      onChange={(e) => updateField('lieuDitAdresse', e.target.value)}
                      className={`pl-9 md:pl-10 border-gray-300 focus:border-orange-500 text-sm md:text-base ${fieldErrors.lieuDitAdresse ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {fieldErrors.lieuDitAdresse && <p className="text-red-500 text-xs mt-1">{fieldErrors.lieuDitAdresse}</p>}
                </div>

                {/* 4. Photo d'identité */}
                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Photo d'identité</Label>
                  <div className="relative">
                    <label htmlFor="photo-identite" className="block">
                      <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 md:p-6 cursor-pointer hover:border-orange-400 transition-colors text-center bg-orange-100/50">
                        <div className="flex flex-col items-center gap-2 md:gap-3">
                          {photoIdentite ? (
                            <PhotoPreview key="preview-identite" url={urlIdentite} alt="Identité" className="w-20 h-20 md:w-24 md:h-24 rounded-md" />
                          ) : (
                            <div key="placeholder-identite" className="bg-orange-500 rounded-full p-3 shadow-md">
                              <ImageIcon className="h-8 w-8 text-white" />
                            </div>
                          )}
                          <p className="text-xs md:text-sm font-bold text-orange-600">{photoIdentite ? 'Changer la photo' : 'Cliquer pour téléverser'}</p>
                          <p className="text-[10px] md:text-xs text-gray-500">Photo d'identité (PNG, JPG, Max 5MB)</p>
                        </div>
                      </div>
                      <input id="photo-identite" type="file" accept="image/*" onChange={handlePhotoIdentiteChange} className="hidden" />
                    </label>
                  </div>
                  {fieldErrors.photoIdentite && <p className="text-red-500 text-xs mt-1 text-center">{fieldErrors.photoIdentite}</p>}
                </div>

                {/* 5. Photos CNI Recto et Verso */}
                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Photos CNI</Label>
                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    {/* Recto */}
                    <label htmlFor="photo-cni-recto" className="block">
                      <div className="border-2 border-dashed border-orange-400 rounded-lg p-3 md:p-4 cursor-pointer hover:border-orange-500 transition-colors text-center bg-orange-100/50">
                        <div className="flex flex-col items-center gap-1 md:gap-2">
                          {photoCniRecto ? (
                            <PhotoPreview key="preview-recto" url={urlCniRecto} alt="Recto" className="w-12 h-12 md:w-16 md:h-16 rounded-md" />
                          ) : (
                            <div key="placeholder-recto" className="bg-orange-500 rounded-full p-2 shadow-sm">
                              <ImageIcon className="h-5 w-5 text-white" />
                            </div>
                          )}
                          <p className="text-xs font-bold text-orange-600">Recto</p>
                          <p className="text-[8px] md:text-[10px] text-gray-500">PNG, JPG, Max 5MB</p>
                        </div>
                      </div>
                      <input id="photo-cni-recto" type="file" accept="image/*" onChange={handlePhotoCniRectoChange} className="hidden" />
                    </label>

                    {/* Verso */}
                    <label htmlFor="photo-cni-verso" className="block">
                      <div className="border-2 border-dashed border-orange-400 rounded-lg p-3 md:p-4 cursor-pointer hover:border-orange-500 transition-colors text-center bg-orange-100/50">
                        <div className="flex flex-col items-center gap-1 md:gap-2">
                          {photoCniVerso ? (
                            <PhotoPreview key="preview-verso" url={urlCniVerso} alt="Verso" className="w-12 h-12 md:w-16 md:h-16 rounded-md" />
                          ) : (
                            <div key="placeholder-verso" className="bg-orange-500 rounded-full p-2 shadow-sm">
                              <ImageIcon className="h-5 w-5 text-white" />
                            </div>
                          )}
                          <p className="text-xs font-bold text-orange-600">Verso</p>
                          <p className="text-[8px] md:text-[10px] text-gray-500">PNG, JPG, Max 5MB</p>
                        </div>
                      </div>
                      <input id="photo-cni-verso" type="file" accept="image/*" onChange={handlePhotoCniVersoChange} className="hidden" />
                    </label>
                  </div>
                  {(fieldErrors.photoCniRecto || fieldErrors.photoCniVerso) && <p className="text-red-500 text-xs mt-1 text-center">Les photos CNI sont requises</p>}
                </div>

                {/* 6. Numéro NINE */}
                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Numéro NINE</Label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                    <Input
                      type="text"
                      placeholder="M123456789A"
                      value={formData.numeroNINE}
                      onChange={(e) => updateField('numeroNINE', e.target.value)}
                      maxLength={12}
                      className={`pl-9 md:pl-10 border-gray-300 focus:border-orange-500 text-sm md:text-base uppercase ${fieldErrors.numeroNINE ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Format: M123456789A (12 caractères)</p>
                  {fieldErrors.numeroNINE && <p className="text-red-500 text-xs mt-1">{fieldErrors.numeroNINE}</p>}
                </div>

                {/* 7. Document NIU */}
                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Document NIU</Label>
                  <label htmlFor="photo-niu" className="block">
                    <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 md:p-6 cursor-pointer hover:border-orange-400 transition-colors text-center bg-orange-100/50">
                      <div className="flex flex-col items-center gap-2 md:gap-3">
                        {photoNiu ? (
                          <PhotoPreview key="preview-niu" url={urlNiu} alt="NIU" className="w-20 h-20 md:w-24 md:h-24 rounded-md" />
                        ) : (
                          <div key="placeholder-niu" className="bg-orange-500 rounded-full p-3 shadow-md">
                            <ImageIcon className="h-8 w-8 text-white" />
                          </div>
                        )}
                        <p className="text-xs md:text-sm font-bold text-orange-600">{photoNiu ? 'Changer la photo' : 'Sélectionner une photo'}</p>
                        <p className="text-[10px] md:text-xs text-gray-500">PNG, JPG ou JPEG (Max 5MB)</p>
                      </div>
                    </div>
                    <input id="photo-niu" type="file" accept="image/*" onChange={handlePhotoNiuChange} className="hidden" />
                  </label>
                  {fieldErrors.photoNiu && <p className="text-red-500 text-xs mt-1 text-center">{fieldErrors.photoNiu}</p>}
                </div>

                <div className="flex gap-2 md:gap-3 pt-3 md:pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50 h-12 md:h-auto text-sm md:text-base bg-transparent"
                    onClick={() => setStep(2)}
                  >
                    Précédent
                  </Button>
                  <Button
                    className="flex-1 bg-orange-500 hover:bg-orange-600 h-12 md:h-auto text-sm md:text-base"
                    onClick={goNext}
                  >
                    Suivant
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Finalisation - CLIENT ONLY */}
          {step === 3 && role === 'client' && (
            <Card key="step-3-client" className="border-2 border-gray-200">
              <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                <h3 className="text-center text-base md:text-lg font-semibold text-orange-500 mb-3 md:mb-4">Vérification de Soumission</h3>

                {/* Résumé des informations */}
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 space-y-2 md:space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs md:text-sm font-medium text-orange-700">Type de compte:</span>
                    <span className="text-sm md:text-base text-gray-800">Client</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs md:text-sm font-medium text-orange-700">Nom:</span>
                    <span className="text-sm md:text-base text-gray-800">{formData.nom} {formData.prenom}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs md:text-sm font-medium text-orange-700">Email:</span>
                    <span className="text-sm md:text-base text-gray-800">{formData.email}</span>
                  </div>
                </div>

                {/* Checkbox conditions */}
                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="conditions"
                    checked={isTermsAccepted}
                    onChange={(e) => setIsTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 md:w-5 md:h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="conditions" className="text-xs md:text-sm text-gray-700 cursor-pointer">
                    J'ai lu et j'accepte les conditions d'utilisation
                  </label>
                </div>

                {/* Boutons */}
                <div className="flex gap-2 md:gap-3 pt-3 md:pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50 h-12 md:h-auto text-sm md:text-base bg-transparent"
                    onClick={goBack}
                  >
                    Précédent
                  </Button>
                  <Button
                    className={`flex-1 h-12 md:h-auto text-sm md:text-base ${isTermsAccepted
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    disabled={!isTermsAccepted}
                    onClick={async () => {
                      try {
                        console.log('Submitting Client:', formData);
                        const result = await createClient(formData);
                        console.log('Client created:', result);
                        setStep(6);
                      } catch (error) {
                        console.error('Registration failed', error);
                        alert('Erreur lors de la création du compte');
                      }
                    }}
                  >
                    Créer mon compte
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Véhicule - LIVREUR ONLY */}
          {step === 4 && role === 'livreur' && (
            <Card key="step-4-livreur" className="border-2 border-gray-200">
              <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                <div className="flex items-center justify-center mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-orange-500 text-center">Informations sur le véhicule</h3>
                </div>

                {/* 1. Type de véhicule */}
                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Type de véhicule</Label>
                  <Select value={formData.typeVehicule} onValueChange={(value) => updateField('typeVehicule', value)}>
                    <SelectTrigger className={`border-gray-300 focus:border-orange-500 text-sm md:text-base relative pr-10 [&>svg]:hidden ${fieldErrors.typeVehicule ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Sélectionner le type de véhicule" />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-orange-500" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voiture">Voiture</SelectItem>
                      <SelectItem value="moto">Moto</SelectItem>
                      <SelectItem value="scooter">Scooter</SelectItem>
                      <SelectItem value="camionnette">Camionnette</SelectItem>
                      <SelectItem value="velo">Vélo</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.typeVehicule && <p className="text-red-500 text-xs mt-1">{fieldErrors.typeVehicule}</p>}
                </div>

                {/* 2. Marque de véhicule */}
                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Marque de véhicule</Label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                    <Input
                      type="text"
                      placeholder="Toyota, Mercedes, etc."
                      value={formData.marqueVehicule}
                      onChange={(e) => updateField('marqueVehicule', e.target.value)}
                      className={`pl-9 md:pl-10 border-gray-300 focus:border-orange-500 text-sm md:text-base ${fieldErrors.marqueVehicule ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {fieldErrors.marqueVehicule && <p className="text-red-500 text-xs mt-1">{fieldErrors.marqueVehicule}</p>}
                </div>

                {/* 3. Photos du véhicule */}
                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Photos du véhicule</Label>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {/* Avant */}
                    <label htmlFor="photo-vehicule-avant" className="block">
                      <div className={`border-2 border-dashed rounded-lg p-3 md:p-4 cursor-pointer hover:border-orange-500 transition-colors text-center bg-orange-100/50 ${fieldErrors.photoVehiculeAvant ? 'border-red-500' : 'border-orange-400'}`}>
                        <div className="flex flex-col items-center gap-1 md:gap-2">
                          {photoVehiculeAvant ? (
                            <PhotoPreview key="preview-vh-avant" url={urlVehiculeAvant} alt="Avant" className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-md" />
                          ) : (
                            <div key="placeholder-vh-avant" className="bg-orange-500 rounded-full p-2 shadow-sm">
                              <ImageIcon className="h-5 w-5 text-white" />
                            </div>
                          )}
                          <p className="text-xs font-bold text-orange-600">Avant</p>
                          <p className="text-[8px] md:text-[10px] text-gray-500">PNG, JPG, Max 5MB</p>
                        </div>
                      </div>
                      <input
                        id="photo-vehicule-avant"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoVehiculeAvantChange}
                        className="hidden"
                      />
                    </label>

                    {/* Arrière */}
                    <label htmlFor="photo-vehicule-arriere" className="block">
                      <div className={`border-2 border-dashed rounded-lg p-3 md:p-4 cursor-pointer hover:border-orange-500 transition-colors text-center bg-orange-100/50 ${fieldErrors.photoVehiculeArriere ? 'border-red-500' : 'border-orange-400'}`}>
                        <div className="flex flex-col items-center gap-1 md:gap-2">
                          {photoVehiculeArriere ? (
                            <PhotoPreview key="preview-vh-arriere" url={urlVehiculeArriere} alt="Arrière" className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-md" />
                          ) : (
                            <div key="placeholder-vh-arriere" className="bg-orange-500 rounded-full p-2 shadow-sm">
                              <ImageIcon className="h-5 w-5 text-white" />
                            </div>
                          )}
                          <p className="text-xs font-bold text-orange-600">Arrière</p>
                          <p className="text-[8px] md:text-[10px] text-gray-500">PNG, JPG, Max 5MB</p>
                        </div>
                      </div>
                      <input
                        id="photo-vehicule-arriere"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoVehiculeArriereChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {(fieldErrors.photoVehiculeAvant || fieldErrors.photoVehiculeArriere) && <p className="text-red-500 text-xs mt-1 text-center">Les photos avant et arrière sont requises</p>}
                </div>

                {/* 4. Numéro d'immatriculation */}
                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Numéro d'immatriculation</Label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                    <Input
                      type="text"
                      placeholder="LT-806-AA"
                      value={formData.numeroImmatriculation}
                      onChange={(e) => updateField('numeroImmatriculation', e.target.value)}
                      className={`pl-9 md:pl-10 border-gray-300 focus:border-orange-500 text-sm md:text-base uppercase ${fieldErrors.numeroImmatriculation ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {fieldErrors.numeroImmatriculation && <p className="text-red-500 text-xs mt-1">{fieldErrors.numeroImmatriculation}</p>}
                </div>

                {/* 5. Couleur de la voiture */}
                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Couleur du véhicule</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Ex: Noir, Blanc, Rouge métallique..."
                      value={formData.color}
                      onChange={(e) => updateField('color', e.target.value)}
                      className={`border-gray-300 focus:border-orange-500 text-sm md:text-base ${fieldErrors.color ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {fieldErrors.color && <p className="text-red-500 text-xs mt-1">{fieldErrors.color}</p>}
                </div>

                {/* 6. Dimensions de la malle arrière */}
                <div className="space-y-1 md:space-y-2">
                  <Label className="text-gray-700 text-xs md:text-sm font-medium">Dimensions de la malle arrière</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="L"
                        value={formData.longeurMalle}
                        onChange={(e) => updateField('longeurMalle', e.target.value)}
                        className={`border-gray-300 focus:border-orange-500 text-sm md:text-base text-center ${fieldErrors.dimensions ? 'border-red-500' : ''}`}
                        readOnly={['moto', 'scooter', 'velo'].includes(formData.typeVehicule)}
                      />
                      <span className="text-[10px] text-gray-400 absolute bottom-[-14px] left-1/2 -translate-x-1/2">Long.</span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="l"
                        value={formData.largeurMalle}
                        onChange={(e) => updateField('largeurMalle', e.target.value)}
                        className={`border-gray-300 focus:border-orange-500 text-sm md:text-base text-center ${fieldErrors.dimensions ? 'border-red-500' : ''}`}
                        readOnly={['moto', 'scooter', 'velo'].includes(formData.typeVehicule)}
                      />
                      <span className="text-[10px] text-gray-400 absolute bottom-[-14px] left-1/2 -translate-x-1/2">Larg.</span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="h"
                        value={formData.hauteurMalle}
                        onChange={(e) => updateField('hauteurMalle', e.target.value)}
                        className={`border-gray-300 focus:border-orange-500 text-sm md:text-base text-center ${fieldErrors.dimensions ? 'border-red-500' : ''}`}
                        readOnly={['moto', 'scooter', 'velo'].includes(formData.typeVehicule)}
                      />
                      <span className="text-[10px] text-gray-400 absolute bottom-[-14px] left-1/2 -translate-x-1/2">Haut.</span>
                    </div>
                    <div className="relative">
                      <Select
                        value={formData.uniteMalle}
                        onValueChange={(value) => updateField('uniteMalle', value)}
                        disabled={['moto', 'scooter', 'velo'].includes(formData.typeVehicule)}
                      >
                        <SelectTrigger className={`border-gray-300 focus:border-orange-500 text-sm md:text-base px-1 ${fieldErrors.dimensions ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Unité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cm">cm</SelectItem>
                          <SelectItem value="m">m</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-[10px] text-gray-400 absolute bottom-[-14px] left-1/2 -translate-x-1/2">Unité</span>
                    </div>
                  </div>
                  {fieldErrors.dimensions && <p className="text-red-500 text-xs mt-4">{fieldErrors.dimensions}</p>}
                </div>

                {/* Boutons */}
                <div className="flex gap-2 md:gap-3 pt-3 md:pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50 h-12 md:h-auto text-sm md:text-base bg-transparent"
                    onClick={goBack}
                  >
                    Précédent
                  </Button>
                  <Button
                    className="flex-1 bg-orange-500 hover:bg-orange-600 h-12 md:h-auto text-sm md:text-base"
                    onClick={goNext}
                  >
                    Suivant
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Vérification - LIVREUR ONLY */}
          {step === 5 && role === 'livreur' && (
            <Card key="step-5-livreur" className="border-2 border-gray-200">
              <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                <h3 className="text-center text-base md:text-lg font-semibold text-orange-500 mb-3 md:mb-4">Récapitulatif des informations</h3>

                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 md:p-6 space-y-6">
                  {/* Section: Identité & Contact avec Photo de Profil */}
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start border-b border-orange-200 pb-6">
                    <div className="flex-shrink-0">
                      <PhotoPreview
                        key="profile-photo"
                        url={urlIdentite}
                        alt="Photo de profil"
                        className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white shadow-lg overflow-hidden"
                        objectFit="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-3 w-full text-center md:text-left">
                      <h4 className="text-base md:text-lg font-bold text-orange-700 flex items-center justify-center md:justify-start gap-2">
                        <User className="h-5 w-5" /> Informations Personnelles
                      </h4>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs md:text-sm">
                        <span className="text-gray-500">Nom complet:</span>
                        <span className="text-gray-800 font-bold break-words">{formData.nom} {formData.prenom}</span>
                        <span className="text-gray-500">Téléphone:</span>
                        <span className="text-gray-800 font-bold">{formData.telephone}</span>
                        <span className="text-gray-500">Email:</span>
                        <span className="text-gray-800 font-bold break-words">{formData.email}</span>
                        <span className="text-gray-500">N° CNI:</span>
                        <span className="text-gray-800 font-bold">{formData.numeroCNI}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section: Localisation */}
                  <div className="space-y-3">
                    <h4 className="text-sm md:text-base font-bold text-orange-700 flex items-center gap-2 border-b border-orange-200 pb-2">
                      <MapPin className="h-4 w-4 md:h-5 md:w-5" /> Localisation
                    </h4>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs md:text-sm">
                      <span className="text-gray-500">Pays:</span>
                      <span className="text-gray-800 font-semibold capitalize">{formData.pays}</span>
                      <span className="text-gray-500">Adresse:</span>
                      <span className="text-gray-800 font-semibold">{formData.adressePersonnelle}</span>
                      <span className="text-gray-500">Lieu dit:</span>
                      <span className="text-gray-800 font-semibold">{formData.lieuDitAdresse}</span>
                    </div>
                  </div>

                  {/* Section: Véhicule */}
                  <div className="space-y-3">
                    <h4 className="text-sm md:text-base font-bold text-orange-700 flex items-center gap-2 border-b border-orange-200 pb-2">
                      <Car className="h-4 w-4 md:h-5 md:w-5" /> Véhicule
                    </h4>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs md:text-sm mb-4">
                      <span className="text-gray-500">Type & Marque:</span>
                      <span className="text-gray-800 font-semibold capitalize">{formData.typeVehicule} - {formData.marqueVehicule}</span>
                      <span className="text-gray-500">Immatriculation:</span>
                      <span className="text-gray-800 font-semibold uppercase break-all">{formData.numeroImmatriculation}</span>
                      <span className="text-gray-500">Couleur:</span>
                      <span className="text-gray-800 font-semibold capitalize">{formData.color}</span>
                      <span className="text-gray-500">Dimensions:</span>
                      <span className="text-gray-800 font-semibold">
                        {formData.longeurMalle && formData.largeurMalle && formData.hauteurMalle
                          ? `${formData.longeurMalle}*${formData.largeurMalle}*${formData.hauteurMalle} ${formData.uniteMalle}`
                          : 'Non renseignées'
                        }
                      </span>
                    </div>
                    {/* Photos Véhicule */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] md:text-xs text-orange-600 font-bold bg-orange-100 px-3 py-1 rounded-full uppercase">Vue Avant</span>
                        <PhotoPreview key="sum-vh-avant" url={urlVehiculeAvant} alt="Véhicule Avant" className="w-full h-40 md:h-48 rounded-xl" objectFit="object-cover" />
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] md:text-xs text-orange-600 font-bold bg-orange-100 px-3 py-1 rounded-full uppercase">Vue Arrière</span>
                        <PhotoPreview key="sum-vh-arriere" url={urlVehiculeArriere} alt="Véhicule Arrière" className="w-full h-40 md:h-48 rounded-xl" objectFit="object-cover" />
                      </div>
                    </div>
                  </div>

                  {/* Section: Documents Officiels Scannés */}
                  <div className="space-y-4">
                    <h4 className="text-sm md:text-base font-bold text-orange-700 flex items-center gap-2 border-b border-orange-200 pb-2">
                      <Camera className="h-4 w-4 md:h-5 md:w-5" /> Justificatifs Officiels
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs md:text-sm mb-4">
                      <span className="text-gray-500">Numéro NINE:</span>
                      <span className="text-gray-800 font-bold uppercase tracking-wider">{formData.numeroNINE}</span>
                    </div>

                    {/* Photos Documents */}
                    <div className="space-y-4">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] md:text-xs text-orange-600 font-bold bg-orange-100 px-3 py-1 rounded-full uppercase w-fit">Document d'Attestation NIU</span>
                        <PhotoPreview key="sum-niu" url={urlNiu} alt="NIU" className="w-full h-48 md:h-64 rounded-xl" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[10px] md:text-xs text-orange-600 font-bold bg-orange-100 px-3 py-1 rounded-full uppercase">CNI (Recto)</span>
                          <PhotoPreview key="sum-recto" url={urlCniRecto} alt="CNI Recto" className="w-full h-36 md:h-48 rounded-xl" />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[10px] md:text-xs text-orange-600 font-bold bg-orange-100 px-3 py-1 rounded-full uppercase">CNI (Verso)</span>
                          <PhotoPreview key="sum-verso" url={urlCniVerso} alt="CNI Verso" className="w-full h-36 md:h-48 rounded-xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkbox conditions */}
                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="conditions-livreur"
                    checked={isTermsAccepted}
                    onChange={(e) => setIsTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 md:w-5 md:h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="conditions-livreur" className="text-xs md:text-sm text-gray-700 cursor-pointer">
                    J'ai lu et j'accepte les conditions d'utilisation et la politique de confidentialité.
                  </label>
                </div>

                {/* Boutons */}
                <div className="flex gap-2 md:gap-3 pt-3 md:pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-50 h-12 md:h-auto text-sm md:text-base bg-transparent"
                    onClick={goBack}
                  >
                    Précédent
                  </Button>
                  <Button
                    className={`flex-1 h-12 md:h-auto text-sm md:text-base ${isTermsAccepted
                      ? 'bg-orange-500 hover:bg-orange-600 font-bold'
                      : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    disabled={!isTermsAccepted}
                    onClick={async () => {
                      try {
                        console.log('Final Submission Livreur:', formData);

                        // Prepare data with Base64 images
                        const vehicleTypeMap: { [key: string]: string } = {
                          'voiture': 'CAR',
                          'moto': 'MOTORBIKE',
                          'scooter': 'MOTORBIKE',
                          'camionnette': 'VAN',
                          'velo': 'BIKE'
                        };

                        const payload = {
                          ...formData,
                          lastName: formData.nom,
                          firstName: formData.prenom,
                          phone: formData.telephone,
                          email: formData.email,
                          password: formData.motDePasse,
                          nationalId: formData.numeroCNI,
                          commercialName: `${formData.nom} ${formData.prenom}`,
                          commercialRegister: "INDIVIDUAL",
                          street: formData.adressePersonnelle,
                          city: formData.pays, // Placeholder
                          district: formData.lieuDitAdresse,
                          country: formData.pays,
                          logisticsType: vehicleTypeMap[formData.typeVehicule] || 'CAR',
                          logisticsClass: "STANDARD",
                          plateNumber: formData.numeroImmatriculation,
                          length: formData.longeurMalle ? parseFloat(formData.longeurMalle) : null,
                          width: formData.largeurMalle ? parseFloat(formData.largeurMalle) : null,
                          height: formData.hauteurMalle ? parseFloat(formData.hauteurMalle) : null,
                          unit: formData.uniteMalle,
                          // Separate NIU number from photo
                          nui: formData.numeroNINE,
                          // Photos as Base64
                          photoCard: photoIdentite ? await fileToBase64(photoIdentite) : null,
                          cniRecto: photoCniRecto ? await fileToBase64(photoCniRecto) : null,
                          cniVerso: photoCniVerso ? await fileToBase64(photoCniVerso) : null,
                          nuiPhoto: photoNiu ? await fileToBase64(photoNiu) : null,
                          frontPhoto: photoVehiculeAvant ? await fileToBase64(photoVehiculeAvant) : null,
                          backPhoto: photoVehiculeArriere ? await fileToBase64(photoVehiculeArriere) : null
                        };

                        const response = await fetch('/api/delivery-persons/register', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload)
                        });

                        if (!response.ok) {
                          const errorData = await response.json();
                          throw new Error(errorData.message || 'Registration failed');
                        }

                        setStep(6);
                      } catch (error: any) {
                        console.error('Registration failed:', error);
                        alert(`Erreur : ${error.message || 'Une erreur est survenue'}`);
                      }
                    }}
                  >
                    Confirmer & S'inscrire
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Succès */}
          {step === 6 && (
            <Card key="step-success" className="border-2 border-orange-200 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500">
              <CardContent className="p-8 md:p-12 flex flex-col items-center text-center space-y-6">
                <div className="bg-orange-100 rounded-full p-6 text-orange-500 animate-bounce">
                  <Check className="h-16 w-16 stroke-[3px]" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {role === 'livreur' ? 'Demande envoyée !' : 'Compte créé !'}
                  </h2>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    {role === 'livreur'
                      ? "Félicitations ! Votre dossier d'inscription a été soumis avec succès pour examen."
                      : "Votre compte client a été créé avec succès. Bienvenue chez TicBnPick !"}
                  </p>
                </div>

                {role === 'livreur' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 md:p-6 w-full max-w-sm">
                    <p className="text-sm md:text-base text-orange-800 font-medium">
                      Vous recevrez une notification par email dès que votre demande aura été validée par notre équipe.
                    </p>
                  </div>
                )}

                <Button
                  className="w-full max-w-sm bg-orange-500 hover:bg-orange-600 h-12 text-lg font-bold shadow-lg transition-all hover:scale-[1.02]"
                  onClick={() => router.push('/')}
                >
                  Retour à l'accueil
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="p-3 md:p-6 border-t border-gray-200 mt-auto">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs md:text-sm text-gray-600">
            Vous avez déjà un compte?{' '}
            <Link href="/" className="text-orange-500 hover:text-orange-600 font-semibold">
              Se connecter
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
