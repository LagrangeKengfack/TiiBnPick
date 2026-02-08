import axios from 'axios';

const API_URL = '/api/auth';

export interface AuthResponse {
    token: string;
    id: string;
    lastName: string;
    firstName: string;
    email: string;
    phone: string;
    userType: 'ADMIN' | 'CLIENT' | 'LIVREUR';
    isActive: boolean;
    clientId?: string;
    deliveryPersonId?: string;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password
        });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error("Une erreur s'est produite lors de la connexion.");
    }
};
