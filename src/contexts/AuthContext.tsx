import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
// Android OAuth works via SHA-1 fingerprint registered in Google Cloud Console
GoogleSignin.configure({
    webClientId: '432943984764-tmahc4jdevnuj0grgv92pg74rjf1hsle.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    offlineAccess: true,
});

interface User {
    id: string;
    email: string;
    name: string;
    photo?: string;
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
            // Check if Google Play Services is available
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Sign in with Google
            const userInfo = await GoogleSignin.signIn();
            console.log('[AuthContext] Google Sign-In success:', userInfo);

            const googleUser: User = {
                id: userInfo.data?.user?.id || 'google_' + Date.now(),
                email: userInfo.data?.user?.email || '',
                name: userInfo.data?.user?.name || 'Google User',
                photo: userInfo.data?.user?.photo || undefined,
            };

            // Save token and user data
            const idToken = userInfo.data?.idToken || 'google_token_' + Date.now();
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, idToken);
            await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(googleUser));

            setUser(googleUser);
            setIsAuthenticated(true);
            return true;
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('[AuthContext] User cancelled Google Sign-In');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('[AuthContext] Google Sign-In already in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('[AuthContext] Play Services not available');
            } else {
                console.error('[AuthContext] Google Sign-In error:', error);
            }
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
