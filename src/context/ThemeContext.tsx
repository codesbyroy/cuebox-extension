/**
    * Theme Context
    * 
    * Provides theme toggle functionality for Tailwind dark mode.
    * Persists theme preference in Chrome extension storage.
    * Uses dynamic storage type.
    */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getCurrentStorage } from '../utils/storage';

// Theme context interface
interface ThemeContextType {
    toggleTheme: () => void;
    theme: 'light' | 'dark';
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType>({
    toggleTheme: () => {},
    theme: 'dark'
});

// Custom hook for using the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // Initialize theme from Chrome storage or default to 'dark'
    const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Default until loaded
    const [storageType, setStorageType] = useState<'local' | 'sync'>('local');

    // Load storage type and then theme
    useEffect(() => {
        getCurrentStorage().then(type => {
            setStorageType(type);
            chrome.storage[type].get('theme', (result) => {
                // Default to 'dark' if not set (though this should be handled by initialize.ts)
                setTheme(result.theme || 'dark');
            });
        });
        
        // Listen for storage preference changes
        const storageListener = () => {
            getCurrentStorage().then(setStorageType);
        };
        
        chrome.storage.onChanged.addListener(storageListener);
        return () => chrome.storage.onChanged.removeListener(storageListener);
    }, []);

    // Toggle between light and dark themes
    const toggleTheme = () => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            chrome.storage[storageType].set({ theme: newTheme });
            return newTheme;
        });
    };

    // Apply Tailwind dark mode class
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};