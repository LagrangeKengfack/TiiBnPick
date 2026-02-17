"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 1. SERVICES & UTILS
import { buildFullAddress } from "@/lib/utils";
import { authService } from "@/services/authService";
import { pdfService } from "@/services/pdfService";

// 2. COMPONENTS
import PackageInfoStep from "@/components/expedition/FormulaireColisExpedition";
import PaymentStep from "@/components/expedition/PaymentStepExpedition";
import ProgressBar from "@/components/expedition/ProgressBar"; // Move the progress bar logic here
import RecipientInfoStep from "@/components/expedition/RecipientInfoStep";
import RouteSelectionStep from "@/components/expedition/RouteExpedition";
import SenderInfoStep from "@/components/expedition/SenderInfoStep";
import SignatureStep from "@/components/expedition/SignatureStep";
import SuccessStep from "@/components/expedition/SuccessStep";

// 3. TYPES
import { ExpeditionFormData, LoggedInUser } from "@/types/package";
import { fi } from "date-fns/locale";

const STORAGE_KEY = "expedition_form_progress";


export default function ShippingPage() {
  const [trackingNum, setTrackingNum] = useState("");
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<ExpeditionFormData>({
    currentStep: 1,
    senderData: {
      senderFirstName: "",
      senderLastName: "",
      senderPhone: "",
      senderAddress: "",
      senderLieuDit: "",
      senderEmail: "",
      senderCountry: "cameroun",
      senderRegion: "centre",
      senderCity: "Yaoundé",
    },
    recipientData: {
      recipientName: "",
      recipientPhone: "",
      recipientEmail: "",
      recipientAddress: "",
      recipientLieuDit: "",
      recipientCountry: "cameroun",
      recipientRegion: "centre",
      recipientCity: "Yaoundé",
    },
    packageData: {
      photo: null,
      designation: "",
      description: "",
      weight: "",
      length: "",
      width: "",
      height: "",
      isFragile: false,
      isPerishable: false,
      transportMethod: "",
      logistics: "standard",
      pickup: false,
      delivery: false,
    },
    routeData: {
      departurePointId: null,
      arrivalPointId: null,
      departurePointName: "",
      arrivalPointName: "",
      distanceKm: 0,
      durationMinutes: 0,
    },
    signatureData: { signatureUrl: null },
    pricing: { basePrice: 0, travelPrice: 0, operatorFee: 0, totalPrice: 0 },
  });

  // États pour l'écran de succès
  //const [trackingNumber] = useState(`PDL${Date.now().toString().slice(-7)}`);

  // --- PERSISTENCE: Single Responsibility for LocalStorage ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setFormData(JSON.parse(saved));

    authService.getProfile().then((profile) => {
      if (profile) {
        setUser(profile);
        // Only autofill if form is fresh
        setFormData((prev) =>
          prev.currentStep === 1
            ? {
                ...prev,
                senderData: {
                  ...prev.senderData,
                  senderName: profile.full_name || "",
                  senderPhone: profile.phone || "",
                  senderEmail: profile.email || "",
                  senderAddress: profile.address || "",
                  senderLieuDit: profile.lieu_dit || "",
                },
              }
            : prev,
        );
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    // ONLY save to localStorage if we are in the middle of the process
    // If we are at Step 7 (Success) or Step 1 (Empty), we don't save.
    if (formData.currentStep > 1 && formData.currentStep < 7) {
      localStorage.setItem(
        "expedition_form_progress",
        JSON.stringify(formData),
      );
    } else if (formData.currentStep === 7 || formData.currentStep === 1) {
      localStorage.removeItem("expedition_form_progress"); // Clean up
    }
  }, [formData]);

  // --- HANDLERS ---
  const handleDownloadPDF = () => {
    const fullData = {
      ...formData.senderData,
      ...formData.recipientData,
      ...formData.packageData,
      ...formData.routeData,
      ...formData.signatureData,
      // THESE TWO LINES WERE MISSING:
      basePrice: formData.pricing.basePrice,
      travelPrice: formData.pricing.travelPrice,
    };
    pdfService.generateBordereauPDF(
      fullData,
      trackingNum, // Use the state variable we saved in Case 6
      formData.pricing.totalPrice,
      formData.pricing.operatorFee,
      "cash", // Or get the actual method if you stored it
    );
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/expedition"; // Simple page reload to force fresh state
  };
  /*
  const resetFormAndStartOver = () => {
    localStorage.removeItem(EXPEDITION_FORM_STORAGE_KEY);
    window.location.reload();
  };

  const handleCreateAccount = () => {
    // 1. Préparer les données de l'expéditeur pour le pré-remplissage
    const prefillData = {
      name: formData.senderData.senderName,
      email: formData.senderData.senderEmail,
      phone: formData.senderData.senderPhone,
    };

    // 2. Stocker les données dans localStorage pour que la page d'inscription puisse les lire
    localStorage.setItem("registration_prefill", JSON.stringify(prefillData));

    // 3. Rediriger vers la page d'inscription
    router.push("/register");
  };
*/

  const renderStep = () => {
    console.log("Current Step is:", formData.currentStep); // Check this in the console!
    switch (formData.currentStep) {
      case 1:
        return (
          <SenderInfoStep
            initialData={formData.senderData}
            onContinue={(data) =>
              setFormData({ ...formData, senderData: data, currentStep: 2 })
            }
          />
        );
      case 2:
        return (
          <RecipientInfoStep
            initialData={formData.recipientData}
            onContinue={(data) =>
              setFormData((prev) => ({
                ...prev,
                recipientData: data,
                currentStep: 3,
              }))
            }
            onBack={() => setFormData((prev) => ({ ...prev, currentStep: 1 }))}
          />
        );
      case 3:
        return (
          <PackageInfoStep
            initialData={formData.packageData}
            onContinue={(data, totalPrice) =>
              setFormData((prev) => ({
                ...prev,
                packageData: data,
                pricing: { ...prev.pricing, basePrice: totalPrice },
                currentStep: 4,
              }))
            }
            onBack={() => setFormData((prev) => ({ ...prev, currentStep: 2 }))}
          />
        );
      case 4:
        // Construct full strings for both sides
        const fullDeparture = buildFullAddress({
          address: formData.senderData.senderAddress,
          lieuDit: formData.senderData.senderLieuDit,
          city: formData.senderData.senderCity,
          region: formData.senderData.senderRegion,
          country: formData.senderData.senderCountry,
        });

        const fullArrival = buildFullAddress({
          address: formData.recipientData.recipientAddress,
          lieuDit: formData.recipientData.recipientLieuDit,
          city: formData.recipientData.recipientCity,
          region: formData.recipientData.recipientRegion,
          country: formData.recipientData.recipientCountry,
        });

        return (
          <RouteSelectionStep
            initialDepartureAddress={fullDeparture}
            initialArrivalAddress={fullArrival}
            onContinue={(route, price, newSender, newRecipient) =>
              setFormData({
                ...formData,
                routeData: route,
                pricing: { ...formData.pricing, travelPrice: price },
                senderData: { ...formData.senderData, ...newSender },
                recipientData: { ...formData.recipientData, ...newRecipient },
                currentStep: 5,
              })
            }
            onBack={() => setFormData({ ...formData, currentStep: 3 })}
          />
        );

      case 5:
        return (
          <SignatureStep
            onSubmit={(signatureUrl) =>
              setFormData((prev) => ({
                ...prev,
                signatureData: { signatureUrl },
                currentStep: 6,
              }))
            }
            onBack={() => setFormData((prev) => ({ ...prev, currentStep: 4 }))}
          />
        );
      case 6:
        // 1. Separate 'isSender' from the senderData
        // We extract 'isSender' and put everything else into 'cleanSenderData'
        const { isSender, ...cleanSenderData } = formData.senderData;

        // Construction de l'objet final pour le composant de paiement
        // Conversion forcée et nettoyage des types
        const fullDataForPayment = {
          ...cleanSenderData, // Use the cleaned sender data without 'isSender'
          ...formData.senderData,
          ...formData.recipientData,
          ...formData.packageData,
          // Gérer explicitement le type File/String de la photo
          photo:
            typeof formData.packageData.photo === "string"
              ? formData.packageData.photo
              : null,
          ...formData.routeData,
          ...formData.signatureData,
          // Ne pas caster en Number() si ce sont des UUIDs (chaines)
          departurePointId: formData.routeData.departurePointId as any,
          arrivalPointId: formData.routeData.arrivalPointId as any,
          basePrice: formData.pricing.basePrice,
          travelPrice: formData.pricing.travelPrice,
        };
        return (
          <PaymentStep
            allData={fullDataForPayment}
            onPaymentFinalized={(finalData) => {
              const tNumber = finalData.trackingNumber || "";

              setTrackingNum(tNumber);

              setFormData((prev) => ({
                ...prev,
                pricing: {
                  ...prev.pricing,
                  operatorFee: finalData.operatorFee,
                  totalPrice: finalData.totalPrice, // the actual final amount paid
                },
                currentStep: 7,
              }));
              localStorage.removeItem(STORAGE_KEY);
            }}
            onBack={() => setFormData((prev) => ({ ...prev, currentStep: 5 }))}
            currentUser={user}
          />
        );
      case 7:
        return (
          <SuccessStep
            trackingNumber={trackingNum}
            onDownloadPDF={handleDownloadPDF}
            onReset={handleReset}
          />
        );
      default:
        console.error("Step not found for ID:", formData.currentStep);
        return (
          <div className="p-10 text-red-500">
            Erreur: Étape {formData.currentStep} introuvable.
          </div>
        );
    }
  };

  if (isLoading) return <div className="p-20 text-center">Chargement...</div>;

  return (
    <main className="container mx-auto p-4">
      <ProgressBar currentStep={formData.currentStep} />
      <AnimatePresence mode="wait">
        <motion.div
          key={formData.currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}