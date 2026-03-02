import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n/config';

export const LANGUAGE_KEY = '@app_language';
let storageAvailable = true;

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  showLanguageModal: boolean;
  setShowLanguageModal: (show: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<string>('en');
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      // Check if AsyncStorage is available
      if (storageAvailable) {
        try {
          const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
          if (savedLanguage) {
            setLanguageState(savedLanguage);
            i18n.changeLanguage(savedLanguage);
          }
        } catch (storageError: any) {
          // Handle native module not available error gracefully
          if (storageError.message?.includes('Native module is null')) {
            console.warn('AsyncStorage native module not initialized, using default language');
            storageAvailable = false;
          } else {
            console.error('Error loading saved language:', storageError);
          }
        }
      }
      // Always show modal on app start (every time)
      setShowLanguageModal(true);
    } catch (error) {
      console.error('Error in language initialization:', error);
      // Still show modal even if there's an error
      setShowLanguageModal(true);
    } finally {
      setIsInitialized(true);
    }
  };

  const setLanguage = async (lang: string) => {
    try {
      // Only attempt to save if storage is available
      if (storageAvailable) {
        try {
          await AsyncStorage.setItem(LANGUAGE_KEY, lang);
        } catch (storageError: any) {
          // Handle native module not available error gracefully
          if (storageError.message?.includes('Native module is null')) {
            console.warn('AsyncStorage native module not initialized, language not persisted');
            storageAvailable = false;
          } else {
            console.error('Error saving language:', storageError);
          }
        }
      }
      setLanguageState(lang);
      i18n.changeLanguage(lang);
      setShowLanguageModal(false);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  // Don't render children until initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, showLanguageModal, setShowLanguageModal }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};



