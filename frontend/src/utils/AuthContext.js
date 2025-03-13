import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Errore nel caricamento dello stato:', error);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (token) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        try {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Errore durante il logout:', error);
        }
    };

    const getToken = () => {
        return localStorage.getItem('token');
    };

    if (loading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            login,
            logout,
            getToken,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);