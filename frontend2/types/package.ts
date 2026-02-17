/**
 * @file types/package.ts
 * @description Centralized TypeScript definitions.
 */

import { ElementType } from 'react';

// --- CORE DATA MODELS ---
export interface SenderData {
  senderFirstName: string;
  senderLastName: string;
  senderPhone: string;
  senderEmail: string;
  senderCountry: string;
  senderRegion: string;
  senderCity: string;
  senderAddress: string;
  senderLieuDit: string;
  latitude?: number;
  longitude?: number;
  isSender?: boolean; // <--- Add this as an optional UI helper
}

export interface RecipientData {
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  recipientCountry: string;
  recipientRegion: string;
  recipientCity: string;
  recipientAddress: string;
  recipientLieuDit: string;
}

export interface PackageData {
  photo: string | null; 
  designation: string;
  description: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  isFragile: boolean;
  isPerishable: boolean;
  transportMethod: 'truck' | 'tricycle' | 'moto' | 'bike' | 'car' | '';
  logistics: 'standard' | 'express_48h' | 'express_24h';
  pickup: boolean;
  delivery: boolean;
}


export interface RouteData {
  departurePointId: string | null;
  arrivalPointId: string | null;
  departurePointName: string;
  arrivalPointName: string;
  distanceKm: number;
  durationMinutes: number;
}

export interface SignatureData {
  signatureUrl: string | null;
}

// --- APP STATE ---
export interface ExpeditionFormData {
  currentStep: number;
  senderData: SenderData;
  recipientData: RecipientData;
  packageData: PackageData;
  routeData: RouteData;
  signatureData: SignatureData;
  pricing: {
    basePrice: number;
    travelPrice: number;
    operatorFee: number;
    totalPrice: number;
  };
}

// --- ALL EXPEDITION DATA ---
export type AllExpeditionData = SenderData &
 RecipientData &
 PackageData &
 RouteData &
 SignatureData &
 {
  basePrice: number; 
    travelPrice: number; 
 };

// --- COMPONENT PROPS ---
export interface SenderInfoStepProps {
  initialData: SenderData;
  onContinue: (data: SenderData) => void;
  currentUser?: any;
}

export interface RecipientInfoStepProps {
  initialData: RecipientData;
  onContinue: (data: RecipientData) => void;
  onBack: () => void;
}

export interface PackageRegistrationProps {
  initialData?: Partial<PackageData>;
  onContinue: (data: PackageData, totalPrice: number) => void;
  onBack?: () => void;
}

export interface RouteSelectionStepProps {
  onContinue: (
    data: RouteData,
    travelPrice: number,
    updatedSender?: Partial<SenderData>,
    updatedRecipient?: Partial<RecipientData>
  ) => void;
  onBack: () => void;
  initialDepartureAddress?: string;
  initialArrivalAddress?: string;
}


export interface PaymentStepProps {
  allData: AllExpeditionData;
  onBack: () => void;
  onPaymentFinalized: (pricing: {
    basePrice: number;
    travelPrice: number;
    operatorFee: number;
    totalPrice: number;
    trackingNumber: string;
  }) => void;
  currentUser: LoggedInUser | null; // if there is a problem, look here
}

export interface PaymentOptionProps {
  id: 'mobile' | 'recipient';
  label: string;
  description: string;
  icon: ElementType;
  fee: number;
  selected: 'mobile' | 'recipient';
  setSelected: (id: 'mobile' | 'recipient') => void;
  badge?: string;
}

export interface SignatureStepProps {
  onBack: () => void;
  onSubmit: (signatureData: string) => void;
}

export interface SuccessStepProps {
  trackingNumber: string;
  onDownloadPDF: () => void;
  onReset: () => void;
}


//for the login, when we will integrate
export interface LoggedInUser {
  id: string;
  full_name: string | null;
  phone: string | null;
  email?: string;
  address?: string | null;
  lieu_dit?: string | null;
}