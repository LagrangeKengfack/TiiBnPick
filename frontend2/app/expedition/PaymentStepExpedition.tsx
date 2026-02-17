'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  PrinterIcon,
  DocumentTextIcon,
  ClockIcon,
  PlusIcon as PlusIconHero,
  GiftIcon
} from '@heroicons/react/24/outline';
import { pdfService } from '@/services/pdfService';
import { supabase } from '@/lib/supabase';
import {
  PhoneIcon,
  PlusIcon,
  StarIcon,
  UserPlusIcon,
  Loader2,
  CheckCircle,
  UserPlus,
  Star
} from 'lucide-react';
import { ProcessingAnimation } from './demo';
import { useRouter } from 'next/navigation';
// --- IMPORTATIONS CRUCIALES POUR LE BACKEND ---
import { createAnnouncement, AnnouncementCreationPayload } from '@/services/announcementService';
import { AddressType } from '@/services/packageService';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

interface FinalData {
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

  recipientFirstName: string;
  recipientLastName: string;
  recipientPhone: string;
  recipientEmail: string;
  recipientCountry: string;
  recipientRegion: string;
  recipientCity: string;
  recipientAddress?: string;
  recipientLatitude?: number;
  recipientLongitude?: number;

  photo: string | null;
  designation: string;
  description?: string;
  weight: string;
  length?: string;
  width?: string;
  height?: string;

  isFragile: boolean;
  isPerishable: boolean;

  transportMethod: string;

  departurePointId: number | null;
  arrivalPointId: number | null;
  departurePointName: string;
  arrivalPointName: string;
  distanceKm: number;
  signatureUrl: string | null;

  basePrice: number;
  travelPrice: number;
  durationMinutes?: number;
}


interface LoggedInUser {
  id: string;
}

interface PaymentStepProps {
  allData: FinalData;
  onBack: () => void;
  onPaymentFinalized: (pricing: { basePrice: number, travelPrice: number, operatorFee: number, totalPrice: number, trackingNumber?: string }) => void;
  currentUser: LoggedInUser | null;
}


// --- CORRECTION : Définition de l'interface pour le sous-composant ---
interface PaymentOptionProps {
  id: 'cash' | 'mobile' | 'recipient';
  label: string;
  description: string;
  icon: React.ElementType;
  fee: number;
  selected: 'cash' | 'mobile' | 'recipient';
  setSelected: (id: 'cash' | 'mobile' | 'recipient') => void;
  badge?: string;
}

const PAYMENT_OPERATOR_FEE = 100;
const APP_NAME = "PicknDrop Link";

export default function PaymentStep({ allData, onBack, onPaymentFinalized, currentUser }: PaymentStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'mobile' | 'recipient'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(''); // Stockera le vrai tracking number du backend
  const [mobileOperator, setMobileOperator] = useState<'orange' | 'mtn'>('orange');
  const [mobilePhone, setMobilePhone] = useState('');

  const router = useRouter();
  const { showNotification } = useNotification();

  const operatorFee = selectedMethod === 'mobile' ? PAYMENT_OPERATOR_FEE : 0;
  const totalPrice = allData.basePrice + allData.travelPrice + operatorFee;

  const { user: authUser } = useAuth();

  // Pour être sûr, on considère connecté si 'currentUser' (prop) OU 'authUser' (context) est présent.
  const isUserLoggedIn = !!(currentUser || authUser);



  // Validation du numéro de téléphone mobile
  const validateMobilePhone = (phone: string) => {
    const cleaned = phone.replace(/\s+/g, '');
    // Format Cameroun : 6XXXXXXXX ou +237 6XXXXXXXX
    return /^(\+237\s?)?6[0-9]{8}$/.test(cleaned);
  };

  const canConfirmPayment = () => {
    if (selectedMethod === 'mobile') {
      return validateMobilePhone(mobilePhone);
    }
    return true;
  };

  const handleCreateAccount = () => {
    const prefillData = {
      firstName: allData.senderFirstName,
      lastName: allData.senderLastName,
      email: allData.senderEmail,
      phone: allData.senderPhone,
    };
    localStorage.setItem('registration_prefill', JSON.stringify(prefillData));
    router.push('/register');
  };

  const generateBordereauPDF = async () => {
    await pdfService.generateBordereauPDF(
      allData,
      trackingNumber,
      totalPrice,
      operatorFee,
      selectedMethod,
    );
  };


  // --- SOUMISSION DES DONNÉES AU BACKEND ---
  const handleSubmit = async () => {
    console.log("🚀 Début de la soumission du colis...");
    setIsProcessing(true);

    try {
      // 1. Détermination du Client ID
      let clientId = authUser?.clientId || authUser?.id || currentUser?.id;

      // Gestion spécifique pour le mode "Invité" ou si l'ID est manquant
      if (!clientId) {
        console.warn("⚠️ Aucun ID client trouvé. Utilisation de l'ID par défaut (risque d'erreur si le compte invité n'existe pas en base).");
        clientId = "00000000-0000-0000-0000-000000000000";
      }

      // 2. Construction des dimensions JSON stringifié (si nécessaire pour d'autres usages, sinon ignoré car PacketDTO attend des nombres)
      // Note: PacketDTO attend des nombres, pas des strings JSON.

      // 3. Nettoyage du téléphone (on enlève les espaces et on assure le +237)
      let cleanRecipientPhone = allData.recipientPhone.replace(/\s+/g, '');
      if (!cleanRecipientPhone.startsWith('+')) cleanRecipientPhone = '+237' + cleanRecipientPhone;

      let cleanSenderPhone = allData.senderPhone.replace(/\s+/g, '');
      // Pas de force +237 si c'est déjà saisi, mais recommandé

      // 4. CONSTRUCTION DU PAYLOAD COMPLET
      const payload: AnnouncementCreationPayload = {
        clientId: clientId,
        title: `Envoi de ${allData.designation}`,
        description: allData.description || `Envoi de ${allData.designation}`,

        recipientFirstName: allData.recipientFirstName,
        recipientLastName: allData.recipientLastName,
        recipientPhone: cleanRecipientPhone,
        recipientEmail: allData.recipientEmail,


        shipperFirstName: allData.senderFirstName,
        shipperLastName: allData.senderLastName,
        shipperPhone: cleanSenderPhone,
        shipperEmail: allData.senderEmail,

        amount: totalPrice,
        signatureUrl: allData.signatureUrl,
        paymentMethod: selectedMethod,
        transportMethod: allData.transportMethod,
        distance: allData.distanceKm,
        duration: allData.durationMinutes,

        pickupAddress: {
          street: allData.senderAddress || "Adresse non précisée",
          city: allData.senderCity,
          district: allData.senderRegion,
          country: allData.senderCountry,
          type: AddressType.PRIMARY,
          latitude: allData.latitude || 0,
          longitude: allData.longitude || 0
        },
        deliveryAddress: {
          street: allData.recipientAddress || "Adresse non précisée",
          city: allData.recipientCity,
          district: allData.recipientRegion,
          country: allData.recipientCountry,
          type: AddressType.SECONDARY,
          latitude: allData.recipientLatitude || 0,
          longitude: allData.recipientLongitude || 0
        },
        packet: {
          designation: allData.designation,
          weight: parseFloat(allData.weight),
          length: parseFloat(allData.length || '0'),
          width: parseFloat(allData.width || '0'),
          height: parseFloat(allData.height || '0'),
          thickness: parseFloat(allData.height || '0'),
          fragile: allData.isFragile,
          isPerishable: allData.isPerishable,
          description: allData.description,
          photoPacket: allData.photo || undefined
        }
      };

      console.log("📦 PAYLOAD ENVOYÉ AU BACKEND :", JSON.stringify(payload, null, 2));

      // 5. APPEL SERVICE
      const response = await createAnnouncement(payload);

      console.log("✅ RÉPONSE BACKEND REÇUE :", response);

      const newTracking = response.id; // Ou un autre champ si disponible (ex: code généré)

      if (!newTracking) throw new Error("ID de l'annonce manquant dans la réponse backend.");

      setTrackingNumber(newTracking);
      setPaymentSuccess(true);
      showNotification({ message: `Annonce créée ! Réf : ${newTracking.substring(0, 8)}...`, type: 'success' });

    } catch (err: any) {
      console.error("❌ ERREUR D'ENVOI :", err);
      const errorMsg = err.response?.data?.message || err.message || JSON.stringify(err);
      showNotification({ message: "Erreur lors de la création: " + errorMsg, type: 'error' });

      // Si l'erreur mentionne une contrainte de clé étrangère sur le client, avertir l'utilisateur
      if (typeof errorMsg === 'string' && (errorMsg.includes('constraint') || errorMsg.includes('client'))) {
        alert("Erreur d'identification du client. Veuillez vous connecter et réessayer.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Animation des variantes
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-transparent p-0 transition-colors duration-300"
    >
      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <ProcessingAnimation />
          </motion.div>
        ) : paymentSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center p-4"
          >
            <div className="max-w-md w-full text-center space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-orange-100 dark:border-orange-800">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto drop-shadow-lg" />
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-4 mb-2">Expédition confirmée !</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Votre colis a été enregistré.</p>

                <div className="bg-orange-50 dark:bg-orange-900/30 rounded-2xl p-4 mb-6 border border-orange-200 dark:border-orange-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide font-semibold">Numéro de suivi</p>
                  <p className="text-3xl font-black text-orange-600 dark:text-orange-400 font-mono tracking-wider">{trackingNumber}</p>
                </div>

                <motion.button
                  onClick={generateBordereauPDF}
                  className="w-full flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-orange-500/25"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PrinterIcon className="w-5 h-5 mr-2" />
                  Télécharger le Bordereau
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="payment-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 lg:p-8"
          >
            <div className="max-w-7xl mx-auto">
              {/* En-tête */}
              <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Finaliser votre expédition
                </h1>
                <p className="text-gray-600 dark:text-gray-300">Choisissez votre mode de paiement et confirmez votre envoi</p>
              </motion.div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Colonne principale - Options de paiement */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">

                  {/* Méthodes de paiement */}
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 shadow-lg transition-colors duration-300">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
                      <CreditCardIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      Mode de paiement
                    </h2>

                    <div className="space-y-4">
                      <PaymentOption
                        id="cash"
                        label="Paiement en espèces"
                        description="Payez directement à notre agent"
                        icon={BanknotesIcon}
                        fee={0}
                        selected={selectedMethod}
                        setSelected={setSelectedMethod}
                        badge="Recommandé"
                      />

                      <PaymentOption
                        id="mobile"
                        label="Paiement Mobile"
                        description="Orange Money, MTN Mobile Money"
                        icon={DevicePhoneMobileIcon}
                        fee={PAYMENT_OPERATOR_FEE}
                        selected={selectedMethod}
                        setSelected={setSelectedMethod}
                      />

                      <PaymentOption
                        id="recipient"
                        label="Paiement par le destinataire"
                        description="Le destinataire paie à la réception"
                        icon={GiftIcon}
                        fee={0}
                        selected={selectedMethod}
                        setSelected={setSelectedMethod}
                      />
                    </div>

                    {/* Formulaire de paiement mobile */}
                    <AnimatePresence>
                      {selectedMethod === 'mobile' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-6 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border-2 border-orange-200 dark:border-orange-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                              <PhoneIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                              Informations de paiement mobile
                            </h3>

                            {/* Sélection de l'opérateur */}
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Opérateur mobile
                              </label>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => setMobileOperator('orange')}
                                  className={`p-3 rounded-xl border-2 font-medium transition-all ${mobileOperator === 'orange'
                                    ? 'border-orange-500 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                  Orange Money
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setMobileOperator('mtn')}
                                  className={`p-3 rounded-xl border-2 font-medium transition-all ${mobileOperator === 'mtn'
                                    ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                  MTN Mobile Money
                                </button>
                              </div>
                            </div>

                            {/* Numéro de téléphone */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Numéro de téléphone
                              </label>
                              <input
                                type="tel"
                                value={mobilePhone}
                                onChange={(e) => setMobilePhone(e.target.value)}
                                placeholder="6XXXXXXXX ou +237 6XXXXXXXX"
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${mobilePhone && validateMobilePhone(mobilePhone)
                                  ? 'border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400'
                                  : mobilePhone && !validateMobilePhone(mobilePhone)
                                    ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400'
                                    : 'border-gray-300 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400'
                                  }`}
                              />
                              {mobilePhone && !validateMobilePhone(mobilePhone) && (
                                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                                  Format invalide. Utilisez 6XXXXXXXX ou +237 6XXXXXXXX
                                </p>
                              )}
                            </div>

                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                <strong>Note :</strong> Vous recevrez un SMS de confirmation pour valider le paiement.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Détails de l'expédition */}
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 shadow-lg transition-colors duration-300">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
                      <DocumentTextIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      Détails de l'expédition
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Expéditeur</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {allData.senderFirstName} {allData.senderLastName}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300">{allData.senderPhone}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Départ</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{allData.departurePointName}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Destinataire</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{allData.recipientFirstName} {allData.recipientLastName}</p>
                          <p className="text-gray-600 dark:text-gray-300">{allData.recipientPhone}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Arrivée</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{allData.arrivalPointName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/30 px-3 py-2 rounded-xl">
                          <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{allData.designation}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-xl">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{allData.weight} kg</span>
                        </div>
                        {allData.isFragile && (
                          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-xl">
                            <span className="text-sm font-medium text-red-700 dark:text-red-400">Fragile</span>
                          </div>
                        )}
                        {allData.isPerishable && (
                          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-xl">
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Périssable</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-xl">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{allData.distanceKm} km parcourus</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Sidebar - Résumé de la commande */}
                <motion.div variants={itemVariants} className="lg:sticky lg:top-8 h-fit">
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border-2 border-orange-100 dark:border-orange-800 transition-colors duration-300">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Résumé de la commande</h3>

                    <div className="space-y-4 mb-6">
                      <SummaryLine label="Coût de base" value={allData.basePrice} />
                      <SummaryLine label="Coût du trajet" value={allData.travelPrice} />
                      {operatorFee > 0 && (
                        <SummaryLine label="Frais de transaction" value={operatorFee} />
                      )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">TOTAL</span>
                        <div className="text-right">
                          <span className="text-3xl font-black text-orange-600 dark:text-orange-400">{totalPrice.toLocaleString()}</span>
                          <span className="text-lg font-semibold text-gray-600 dark:text-gray-400 ml-1">FCFA</span>
                        </div>
                      </div>
                    </div>

                    {/* Informations sur la livraison */}
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <ClockIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Temps de livraison</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {allData.durationMinutes && allData.durationMinutes > 0 ? (
                          `Temps de trajet estimé : ${allData.durationMinutes} min`
                        ) : (
                          'Livraison standard'
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Boutons d'action */}
              <motion.div
                variants={itemVariants}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center"
              >
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold transition-colors order-2 sm:order-1"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Retour
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || !canConfirmPayment()}
                  className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 disabled:bg-orange-400 dark:disabled:bg-orange-800 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all transform hover:scale-105 disabled:scale-100 order-1 sm:order-2"
                >
                  {isProcessing ? 'Traitement...' : 'Confirmer l\'expédition'}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


const PaymentOption = ({ id, label, description, icon: Icon, fee, selected, setSelected, badge }: PaymentOptionProps) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => setSelected(id)}
    className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all ${selected === id
      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-orange-200 dark:hover:border-orange-700 hover:shadow-md'
      }`}
  >
    {badge && selected === id && (
      <span className="absolute -top-2 -right-2 bg-orange-600 dark:bg-orange-700 text-white text-xs font-bold px-2 py-1 rounded-full">
        {badge}
      </span>
    )}

    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${selected === id
          ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
          : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
          }`}>
          <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1">{label}</h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{description}</p>
          {fee > 0 && (
            <p className="text-orange-600 dark:text-orange-400 text-sm font-semibold">
              Frais: +{fee} FCFA
            </p>
          )}
        </div>
      </div>

      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected === id
        ? 'border-orange-500 bg-orange-500'
        : 'border-gray-300 dark:border-gray-500'
        }`}>
        {selected === id && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCircleIcon className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </div>
    </div>
  </motion.div>
);

const SummaryLine = ({ label, value }: { label: string; value: number }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
    <span className="font-semibold text-gray-900 dark:text-gray-100">{value.toLocaleString()} FCFA</span>
  </div>
);
