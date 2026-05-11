// API Configuration - Update this with your production backend URL
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Replace with your actual Render backend URL when deployed
const PRODUCTION_API_URL = 'https://taskflow-backend.onrender.com/api';
const DEVELOPMENT_API_URL = '/api';

export const API_BASE_URL = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;

export const getApiUrl = () => API_BASE_URL;

// Log configuration in development
if (!isProduction) {
    console.log('🔧 Running in development mode');
    console.log(`📡 API URL: ${API_BASE_URL}`);
}