import apiClient from '@/lib/axios';

const API_URL = '/api/announcements';

export enum AddressType {
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY"
}

export type AddressDTO = {
  street: string;
  city: string;
  district: string;
  country: string;
  description?: string;
  type: AddressType;
  latitude?: number;
  longitude?: number;
};

export type PacketDTO = {
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  fragile: boolean;
  description?: string;
  photoPacket?: string;
  isPerishable: boolean;
  thickness?: number;
  designation: string;
};

export type PackageCreationPayload = {
  clientId: string;
  title: string;
  description?: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientNumber?: string;
  recipientEmail: string;
  recipientPhone: string;
  shipperFirstName: string;
  shipperLastName: string;
  shipperEmail: string;
  shipperPhone: string;
  amount: number;
  signatureUrl?: string | null;
  paymentMethod: string;
  transportMethod: string;
  distance?: number;
  duration?: number;

  pickupAddress: AddressDTO;
  deliveryAddress: AddressDTO;
  packet: PacketDTO;
};

export const packageService = {
  createPackage: async (payload: PackageCreationPayload) => {
    try {
      const response = await apiClient.post(API_URL, payload);
      return response.data;
    } catch (error: any) {
      console.error('Error creating package/announcement:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default packageService;
