import api from './axiosInstance';

/**
 * GET /health
 */
export const checkHealth = async () => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error: any) {
        throw new Error('Server tidak dapat dijangkau');
    }
};

/**
 * GET /health/details
 */
export const checkHealthDetails = async () => {
    try {
        const response = await api.get('/health/details');
        return response.data;
    } catch (error: any) {
        throw new Error('Server tidak dapat dijangkau');
    }
};