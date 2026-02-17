/**
 * @component SuccessStep
 * @description Clean UI for finished expedition. 
 * Separated from page.tsx to keep the orchestrator lean.
 */
import { SuccessStepProps } from '@/types/package';
import { ArrowPathIcon, CheckCircleIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function SuccessStep({ trackingNumber, onDownloadPDF, onReset }: SuccessStepProps) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-orange-100 dark:border-orange-800">
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Expédition confirmée !</h2>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4 my-6 border border-orange-100 dark:border-orange-900">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Numéro de suivi</p>
            <p className="text-2xl font-black text-orange-600 font-mono tracking-tighter">{trackingNumber}</p>
          </div>

          <div className="space-y-3">
            <button onClick={onDownloadPDF} className="w-full flex items-center justify-center bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-all shadow-lg">
              <PrinterIcon className="w-5 h-5 mr-2" /> Télécharger le Bordereau
            </button>
            
            {/* Prominent Reset Button */}
            <button 
              onClick={onReset} 
              className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border-2 border-orange-600 text-orange-600 dark:text-orange-400 font-bold py-3 rounded-xl hover:bg-orange-50 transition-all"
            >
              <ArrowPathIcon className="w-5 h-5" /> Nouvelle expédition
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}