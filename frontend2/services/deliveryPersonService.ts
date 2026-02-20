import apiClient from '@/lib/axios';

const API_URL = '/api/delivery-persons';

export interface DeliveryPersonUpdateDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    commercialName?: string;
    commercialRegister?: string;
    logisticsType?: string;
    plateNumber?: string;
    color?: string;
    city?: string;
    street?: string;
    district?: string;
    country?: string;
    description?: string;
}

export const getDeliveryPerson = async (id: string) => {
    try {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching delivery person:', error);
        throw error;
    }
};

export const updateDeliveryPerson = async (id: string, data: DeliveryPersonUpdateDTO) => {
    try {
        const response = await apiClient.put(`${API_URL}/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating delivery person:', error);
        throw error;
    }
};

export const deleteDeliveryPerson = async (id: string) => {
    try {
        const response = await apiClient.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting delivery person:', error);
        throw error;
    }
};

export const updateLocation = async (id: string, latitude: number, longitude: number) => {
    try {
        const response = await apiClient.patch(`${API_URL}/${id}/location`, {
            latitude,
            longitude
        });
        return response.data;
    } catch (error) {
        console.error('Error updating delivery person location:', error);
        throw error;
    }
};
