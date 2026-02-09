/**
 * @component ProgressBar
 * @description Visual indicator of the current step in the expedition flow.
 */
import {
  CreditCardIcon,
  MapPinIcon,
  PencilIcon,
  TruckIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as SolidCheckIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

const steps = [
  { id: 1, title: "Expéditeur", icon: UserIcon },
  { id: 2, title: "Destinataire", icon: UserIcon },
  { id: 3, title: "Colis", icon: TruckIcon },
  { id: 4, title: "Trajet", icon: MapPinIcon },
  { id: 5, title: "Signature", icon: PencilIcon },
  { id: 6, title: "Paiement", icon: CreditCardIcon },
];

export default function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex justify-between items-start mb-10 w-full max-w-4xl mx-auto relative px-4">
      {/* Background Line */}
      <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-200 dark:bg-gray-700" />

      {/* Animated Progress Line */}
      <motion.div
        className="absolute top-5 left-10 h-0.5 bg-orange-500"
        initial={{ width: "0%" }}
        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 80}%` }}
      />

      {steps.map((step) => {
        const Icon = step.icon;
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <div
            key={step.id}
            className="flex flex-col items-center relative z-10"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isCompleted || isActive
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 border-2 border-gray-200 text-gray-400"
              }`}
            >
              {isCompleted ? (
                <SolidCheckIcon className="w-6 h-6" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>
            <span
              className={`text-[10px] mt-2 font-bold uppercase tracking-tighter ${
                isCompleted || isActive ? "text-orange-600" : "text-gray-400"
              }`}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
