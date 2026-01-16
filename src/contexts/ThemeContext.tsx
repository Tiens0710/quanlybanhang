import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const THEME_KEY = '@app_theme';

// Color definitions
export const lightColors = {
    primary: '#0088CC',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    card: '#F8F8F8',
    text: '#333333',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#E0E0E0',
    inputBackground: '#F5F5F5',
    menuItemBackground: '#FFFFFF',
    menuIconBackground: '#F0F8FF',
    error: '#DC3545',
    success: '#28A745',
    warning: '#FFC107',
};

export const darkColors = {
    primary: '#00AAFF',
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textMuted: '#808080',
    border: '#404040',
    inputBackground: '#2A2A2A',
    menuItemBackground: '#1E1E1E',
    menuIconBackground: '#2A3A4A',
    error: '#FF6B6B',
    success: '#4ADE80',
    warning: '#FBBF24',
};

export type ThemeColors = typeof lightColors;

interface ThemeContextType {
    isDarkMode: boolean;
    colors: ThemeColors;
    toggleTheme: () => void;
    setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_KEY);
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === 'dark');
            } else {
                // Use system theme by default
                setIsDarkMode(systemColorScheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    };

    const saveTheme = async (darkMode: boolean) => {
        try {
            await AsyncStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const toggleTheme = () => {
        const newValue = !isDarkMode;
        setIsDarkMode(newValue);
        saveTheme(newValue);
    };

    const setDarkMode = (value: boolean) => {
        setIsDarkMode(value);
        saveTheme(value);
    };

    const colors = isDarkMode ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ isDarkMode, colors, toggleTheme, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
