import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
axios.defaults.baseURL = API_BASE_URL;

axios.interceptors.request.use(
    (config) => {
        const noAuthRequired = [

            '/api/authors/login',
            '/api/authors/register'
        ];

        const token = localStorage.getItem('token');


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