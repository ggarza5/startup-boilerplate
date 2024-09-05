import axios from 'axios';

export const fetchSections = async () => {
    try {
        const response = await axios.get('/api/sections');
        return response.data;
    } catch (error) {
        console.error('Error fetching sections:', error);
        return [];
    }
};