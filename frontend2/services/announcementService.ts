import apiClient from '@/lib/axios';

const API_URL = '/api/announcements';

export interface AnnouncementResponseDTO {
    id: string;
    clientId: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    recipientName: string;
    recipientNumber: string;
    recipientEmail: string;
    recipientPhone: string;
    shipperFirstName: string;
    shipperLastName: string;
    shipperEmail: string;
    shipperPhone: string;
    amount: number;
    pickupAddress: {
        street: string;
        city: string;
        district: string;
        country: string;
        description: string;
        type: string;
    };
    deliveryAddress: {
        street: string;
        city: string;
        district: string;
        country: string;
        description: string;
        type: string;
    };
    packet: {
        width: number;
        length: number;
        fragile: boolean;
        description: string;
        photoPacket: string;
        isPerishable: boolean;
        thickness: number;
        designation: string;
    };
}

export const getAnnouncementById = async (id: string): Promise<AnnouncementResponseDTO> => {
    try {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching announcement by ID:', error.response?.data?.message || error.response?.data || error.message);
        throw error;
    }
};

export const getAnnouncementByClientId = async (clientId: string): Promise<AnnouncementResponseDTO[]> => {
    if (!clientId) {
        console.error('getAnnouncementByClientId: clientId is missing');
        return [];
    }
    try {
        const response = await apiClient.get(`${API_URL}/client/${clientId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching announcements by client ID:', error.response?.data?.message || error.response?.data || error.message);
        throw error;
    }
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`${API_URL}/${id}`);
    } catch (error: any) {
        console.error('Error deleting announcement:', error.response?.data || error.message);
        throw error;
    }
};

export const publishAnnouncement = async (id: string): Promise<AnnouncementResponseDTO> => {
    try {
        const response = await apiClient.patch(`${API_URL}/${id}/publish`);
        return response.data;
    } catch (error: any) {
        console.error('Error publishing announcement:', error.response?.data || error.message);
        throw error;
    }
};
