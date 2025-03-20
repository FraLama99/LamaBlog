import axios from 'axios';

// Imposta URL base per tutte le chiamate API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
axios.defaults.baseURL = API_BASE_URL;

// Interceptor per aggiungere automaticamente token alle richieste
axios.interceptors.request.use(
    (config) => {
        // Escludi le rotte che non richiedono autenticazione
        const noAuthRequired = [
            '/api/posts', // Esempio di route pubbliche
            '/api/authors/login',
            '/api/authors/register'
        ];

        const token = localStorage.getItem('token');

        // Verifica se la rotta richiede autenticazione
        const requiresAuth = !noAuthRequired.some(route =>
            config.url.includes(route) && config.method === 'get'
        );

        if (token && requiresAuth) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default axios;