import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from './ThemedText';
import { useLanguage } from '@/providers/LanguageProvider';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getColor, getSpacing } from '@/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function LanguageModal() {
  const { showLanguageModal, setLanguage } = useLanguage();
  const colorScheme = useColorScheme() ?? 'light';
  const { t } = useTranslation();

  const handleLanguageSelect = async (lang: string) => {
    await setLanguage(lang);
  };

  return (
    <Modal
      visible={showLanguageModal}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[
          styles.modalContainer,
          { backgroundColor: getColor(colorScheme, 'surface') }
        ]}>
          {/* Icon */}
          <View style={[
            styles.iconContainer,
            { backgroundColor: getColor(colorScheme, 'highlight') }
          ]}>
            <Ionicons
              name="language"
              size={48}
              color={getColor(colorScheme, 'primary')}
            />
          </View>

          {/* Title */}
          <ThemedText style={[
            styles.title,
            { color: getColor(colorScheme, 'onSurface') }
          ]}>
            {t('languageModal.title')}
          </ThemedText>

          {/* Subtitle */}
          <ThemedText style={[
            styles.subtitle,
            { color: getColor(colorScheme, 'onSurfaceVariant') }
          ]}>
            {t('languageModal.subtitle')}
          </ThemedText>

          {/* Language Options */}
          <View style={styles.languagesContainer}>
            {/* English Button */}
            <TouchableOpacity
              style={[
                styles.languageButton,
                {
                  backgroundColor: getColor(colorScheme, 'surfaceVariant'),
                  borderColor: getColor(colorScheme, 'outline')
                }
              ]}
              onPress={() => handleLanguageSelect('en')}
              activeOpacity={0.7}
            >
              <View style={styles.languageContent}>
                <View style={[
                  styles.flagContainer,
                  { backgroundColor: getColor(colorScheme, 'highlight') }
                ]}>
                  <ThemedText style={styles.flag}>🇺🇸</ThemedText>
                </View>
                <View style={styles.languageTextContainer}>
                  <ThemedText style={[
                    styles.languageName,
                    { color: getColor(colorScheme, 'onSurface') }
                  ]}>
                    English
                  </ThemedText>
                  <ThemedText style={[
                    styles.languageLocal,
                    { color: getColor(colorScheme, 'onSurfaceVariant') }
                  ]}>
                    English
                  </ThemedText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={getColor(colorScheme, 'onSurfaceVariant')}
                />
              </View>
            </TouchableOpacity>

            {/* Urdu Button */}
            <TouchableOpacity
              style={[
                styles.languageButton,
                {
                  backgroundColor: getColor(colorScheme, 'surfaceVariant'),
                  borderColor: getColor(colorScheme, 'outline')
                }
              ]}
              onPress={() => handleLanguageSelect('ur')}
              activeOpacity={0.7}
            >
              <View style={styles.languageContent}>
                <View style={[
                  styles.flagContainer,
                  { backgroundColor: getColor(colorScheme, 'highlight') }
                ]}>
                  <ThemedText style={styles.flag}>🇵🇰</ThemedText>
                </View>
                <View style={styles.languageTextContainer}>
                  <ThemedText style={[
                    styles.languageName,
                    { color: getColor(colorScheme, 'onSurface') }
                  ]}>
                    اردو
                  </ThemedText>
                  <ThemedText style={[
                    styles.languageLocal,
                    { color: getColor(colorScheme, 'onSurfaceVariant') }
                  ]}>
                    Urdu
                  </ThemedText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={getColor(colorScheme, 'onSurfaceVariant')}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing('lg'),
  },
  modalContainer: {
    width: Math.min(width - 40, 400),
    borderRadius: 24,
    padding: getSpacing('xl'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing('lg'),
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: getSpacing('sm'),
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: getSpacing('xl'),
  },
  languagesContainer: {
    width: '100%',
    gap: getSpacing('md'),
  },
  languageButton: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getSpacing('md'),
  },
  flagContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing('md'),
  },
  flag: {
    fontSize: 32,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  languageLocal: {
    fontSize: 14,
  },
});


