import apiClient from '@/lib/axios';

// Use relative path to leverage Next.js rewrites (see next.config.mjs)
// This allows the frontend to be accessed from other devices (like a phone)
// while correctly proxying requests to the backend (e.g. localhost:8081).
const API_URL = '/api/clients';

export interface ClientDTO {
    lastName: string;
    firstName: string;
    phone: string;
    email: string;
    password: string;
    nationalId: string;
    photoCard: string;
    criminalRecord: string;
    loyaltyStatus: string;
}

export const checkEmail = async (email: string): Promise<boolean> => {
    try {
        const response = await apiClient.get(`${API_URL}/check-email`, {
            params: { email }
        });
        return response.data;
    } catch (error) {
        console.error('Error checking email:', error);
        throw error;
    }
};

export const checkNationalId = async (nationalId: string): Promise<boolean> => {
    try {
        const response = await apiClient.get(`${API_URL}/check-national-id`, {
            params: { nationalId }
        });
        return response.data;
    } catch (error) {
        console.error('Error checking nationalId:', error);
        throw error;
    }
};

export const createClient = async (clientData: any) => {
    try {
        // Mapping to ClientDTO.java
        // Note: ClientDTO requires nationalId, photoCard, loyaltyStatus which are not in the Client form.
        // We will send placeholders for now or map if available.
        // We'll use defaults to pass validation if they are missing.

        const payload: ClientDTO = {
            lastName: clientData.nom,
            firstName: clientData.prenom,
            phone: clientData.telephone,
            email: clientData.email,
            password: clientData.motDePasse,
            // Required by Backend DTO but not in Client Form
            nationalId: clientData.numeroCNI,
            photoCard: "NOT_PROVIDED", // Placeholder
            criminalRecord: "CLEAN", // Placeholder
            loyaltyStatus: "REGULAR" // Default
        };

        const response = await apiClient.post(API_URL, payload);
        return response.data;
    } catch (error) {
        console.error('Error creating client:', error);
        throw error;
    }
};
export const updateClient = async (id: string, clientData: any) => {
    try {
        console.log('Updating client with ID:', id, 'Payload:', clientData);

        const payload: ClientDTO = {
            lastName: clientData.lastName,
            firstName: clientData.firstName,
            phone: clientData.phone,
            email: clientData.email,
            password: clientData.password,
            nationalId: clientData.nationalId,
            photoCard: clientData.photoCard || "NOT_PROVIDED",
            criminalRecord: clientData.criminalRecord || "CLEAN",
            loyaltyStatus: clientData.loyaltyStatus || "REGULAR"
        };

        const response = await apiClient.put(`${API_URL}/${id}`, payload);
        console.log('Update response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error updating client:', error.response?.data || error.message);
        throw error;
    }
};

export const getClientById = async (id: string) => {
    try {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching client by ID:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteClient = async (id: string) => {
    try {
        await apiClient.delete(`${API_URL}/${id}`);
    } catch (error: any) {
        console.error('Error deleting client:', error.response?.data || error.message);
        throw error;
    }
};
