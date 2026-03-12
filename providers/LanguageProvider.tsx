import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n/config';

export const LANGUAGE_KEY = '@app_language';
const LANGUAGE_ONBOARDING_DONE_KEY = '@app_language_onboarding_done';
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
      if (storageAvailable) {
        try {
            const [savedLanguage, onboardingDone] = await Promise.all([
              AsyncStorage.getItem(LANGUAGE_KEY),
              AsyncStorage.getItem(LANGUAGE_ONBOARDING_DONE_KEY),
            ]);

            if (savedLanguage) {
              setLanguageState(savedLanguage);
              i18n.changeLanguage(savedLanguage);
              setShowLanguageModal(false);
              return;
            }

            setShowLanguageModal(onboardingDone !== 'true');
            return;
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
      setShowLanguageModal(true);
    } catch (error) {
      console.error('Error in language initialization:', error);
      setShowLanguageModal(true);
    } finally {
      setIsInitialized(true);
    }
  };

  const setLanguage = async (lang: string) => {
    try {
      if (storageAvailable) {
        try {
          await Promise.all([
            AsyncStorage.setItem(LANGUAGE_KEY, lang),
            AsyncStorage.setItem(LANGUAGE_ONBOARDING_DONE_KEY, 'true'),
          ]);
        } catch (storageError: any) {
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



