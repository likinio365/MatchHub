import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from '../api/axios'; 
import { jwtDecode } from 'jwt-decode'; 
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userRole');

        setToken(null);
        setUser(null);
        
        delete axios.defaults.headers.common['Authorization'];
        
        navigate('/');
        toast.info('Αποσυνδεθήκατε επιτυχώς');
    }, [navigate]);


    useEffect(() => {
        const checkLoggedIn = async () => {
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    
                    if (decoded.exp * 1000 < Date.now()) {
                        logout();
                    } else {
                        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        
                        const storedUser = localStorage.getItem('userInfo');
                        if (storedUser) {
                            setUser(JSON.parse(storedUser));
                        } else {
                            const role = decoded.role || localStorage.getItem('userRole') || 'user';
                            setUser({ _id: decoded.id, role: role });
                        }
                    }
                } catch (error) {
                    console.error("Token Error:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, [token, logout]);


    const login = async (email, password) => {
        try {
            
            const { data } = await axios.post('/users/login', { email, password });

            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data));
            
            const role = data.role || (data.user && data.user.role);
            if (role) {
                localStorage.setItem('userRole', role);
            }

            setToken(data.token);
            setUser(data);
            
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            
            return data; 

        } catch (error) {
            throw error; 
        }
    };


    const register = async (userData) => {
        try {
            
            const { data } = await axios.post('/users', userData);
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data));
            
            const role = data.role || 'user';
            localStorage.setItem('userRole', role);
            
            setToken(data.token);
            setUser(data);
            
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            
            toast.success('Η εγγραφή ολοκληρώθηκε!');
            navigate('/'); 
            
            return data;
            
        } catch (error) {
            const message = error.response?.data?.message || 'Η εγγραφή απέτυχε';
            toast.error(message);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;