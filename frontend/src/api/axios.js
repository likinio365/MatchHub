import axios from 'axios';


const api = axios.create({

    baseURL: 'http://localhost:5000/api',
    //baseURL: `http://192.168.1.3:5000/api`,

});


api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem('token');
        
        if (token) {

            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;