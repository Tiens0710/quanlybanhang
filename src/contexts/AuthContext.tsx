import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    loginWithEmail: (email: string, password: string) => Promise<boolean>;
    loginWithGoogle: () => Promise<boolean>;
    loginWithBiometric: () => Promise<boolean>;
    logout: () => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    // Check authentication status on app start
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            const userData = await AsyncStorage.getItem(USER_DATA_KEY);

            if (token && userData) {
                setUser(JSON.parse(userData));
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
        try {
            // TODO: Replace with actual API call
            // For demo purposes, accept any email/password with valid format
            if (email && password.length >= 6) {
                const mockUser: User = {
                    id: '1',
                    email: email,
                    name: email.split('@')[0],
                };

                await AsyncStorage.setItem(AUTH_TOKEN_KEY, 'mock_token_' + Date.now());
                await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(mockUser));

                setUser(mockUser);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const loginWithGoogle = async (): Promise<boolean> => {
        try {
            // TODO: Replace with actual Google Sign-In implementation
            // For demo purposes, simulate successful Google login
            console.log('[AuthContext] Simulating Google Sign-In...');

            const mockUser: User = {
                id: 'google_' + Date.now(),
                email: 'user@gmail.com',
                name: 'Google User',
            };

            await AsyncStorage.setItem(AUTH_TOKEN_KEY, 'google_token_' + Date.now());
            await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(mockUser));

            setUser(mockUser);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Google login error:', error);
            return false;
        }
    };

    const loginWithBiometric = async (): Promise<boolean> => {
        try {
            // Biometric authentication is already verified before calling this
            // Just restore the saved session or create a new one
            const userData = await AsyncStorage.getItem(USER_DATA_KEY);

            if (userData) {
                setUser(JSON.parse(userData));
                setIsAuthenticated(true);
                return true;
            } else {
                // Create a new session for biometric login
                const mockUser: User = {
                    id: '1',
                    email: 'biometric@user.com',
                    name: 'Biometric User',
                };

                await AsyncStorage.setItem(AUTH_TOKEN_KEY, 'biometric_token_' + Date.now());
                await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(mockUser));

                setUser(mockUser);
                setIsAuthenticated(true);
                return true;
            }
        } catch (error) {
            console.error('Biometric login error:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
            await AsyncStorage.removeItem(USER_DATA_KEY);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const register = async (email: string, password: string, name: string): Promise<boolean> => {
        try {
            // TODO: Replace with actual API call
            const mockUser: User = {
                id: Date.now().toString(),
                email: email,
                name: name,
            };

            await AsyncStorage.setItem(AUTH_TOKEN_KEY, 'mock_token_' + Date.now());
            await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(mockUser));

            setUser(mockUser);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Register error:', error);
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                user,
                loginWithEmail,
                loginWithGoogle,
                loginWithBiometric,
                logout,
                register,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
