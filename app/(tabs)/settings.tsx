import React, {useState} from "react";
import { ScrollView, Switch, TouchableOpacity, View, StatusBar, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTheme } from "@/providers/ThemeProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { useTranslation } from "react-i18next";
import { clearRecentScans } from "@/utils/storage";
import {
  getContainerStyle,
  getHeaderStyle,
  getSectionStyle,
  getCardStyle,
  getTextStyle,
  getColor,
  getSpacing
} from "@/utils/styles";

type LanguageOption = {
  id: string;
  name: string;
  localName: string;
  flag: string;
};

const languages: LanguageOption[] = [
  { id: "en", name: "English", localName: "English", flag: "🇺🇸" },
  { id: "ur", name: "Urdu", localName: "اردو", flag: "🇵🇰" },
];

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { setThemeMode, isDarkMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [isClearing, setIsClearing] = useState(false);


  const handleLanguageChange = async (langId: string) => {
    await setLanguage(langId);
  };

  const handleDarkModeToggle = (nextValue: boolean) => {
    void setThemeMode(nextValue ? 'dark' : 'light');
  };

  const handleClearRecentScans = () => {
    Alert.alert(
      t('settings.clearRecentScans'),
      t('settings.clearRecentScansMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('settings.clear'),
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              await clearRecentScans();
              Alert.alert(t('common.success'), t('settings.recentScansCleared'));
            } catch  {
              Alert.alert(t('common.error'), t('settings.recentScansClearFailed'));
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[getContainerStyle(colorScheme), { flex: 1 }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={getColor(colorScheme, 'primary')}
      />

      {/* Header */}
        <View style={getHeaderStyle(colorScheme)}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: getSpacing('sm')
            }}>
                <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: getColor(colorScheme, 'highlight'),
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: getSpacing('sm')
                }}>
                    <Ionicons name="settings-outline" size={18} color={getColor(colorScheme, 'primary')}/>
                </View>
                <View style={{flex: 1}}>
                    <ThemedText style={{
                        ...getTextStyle(colorScheme, 'title'),
                        fontSize: 30,
                        fontWeight: '600'
                    }}>
                        {t('settings.title')}
                    </ThemedText>
                </View>
            </View>

        </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: getColor(colorScheme, 'background') }}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Section */}
        <View style={getSectionStyle(colorScheme)}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: getSpacing('md')
          }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: getColor(colorScheme, 'highlight'),
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: getSpacing('sm')
            }}>
              <Ionicons name="language" size={18} color={getColor(colorScheme, 'primary')} />
            </View>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'subtitle'),
              fontWeight: '600',
              color: getColor(colorScheme, 'text')
            }}>
              {t('settings.language')}
            </ThemedText>
          </View>

          <View style={{ marginBottom: getSpacing('md') }}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.id}
                style={{
                  padding: getSpacing('md'),
                  borderRadius: 16,
                  borderWidth: 2,
                  marginBottom: getSpacing('sm'),
                  backgroundColor: language === lang.id
                    ? getColor(colorScheme, 'highlight')
                    : getColor(colorScheme, 'surface'),
                  borderColor: language === lang.id
                    ? getColor(colorScheme, 'primary')
                    : getColor(colorScheme, 'outline')
                }}
                onPress={() => handleLanguageChange(lang.id)}
                activeOpacity={0.8}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1
                  }}>
                    <ThemedText style={{
                      fontSize: 24,
                      marginRight: getSpacing('sm')
                    }}>
                      {lang.flag}
                    </ThemedText>
                    <View>
                      <ThemedText style={{
                        ...getTextStyle(colorScheme, 'body'),
                        fontWeight: '600',
                        color: getColor(colorScheme, 'text')
                      }}>
                        {lang.name}
                      </ThemedText>
                      <ThemedText style={{
                        fontSize: 14,
                        color: getColor(colorScheme, 'outline')
                      }}>
                        {lang.localName}
                      </ThemedText>
                    </View>
                  </View>
                  {language === lang.id && (
                    <View style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: getColor(colorScheme, 'primary'),
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Ionicons size={14} name="checkmark" color={getColor(colorScheme, 'buttonText')} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Appearance Section */}
        <View style={getSectionStyle(colorScheme)}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: getSpacing('md')
          }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: getColor(colorScheme, 'highlight'),
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: getSpacing('sm')
            }}>
              <Ionicons name="color-palette" size={18} color={getColor(colorScheme, 'primary')} />
            </View>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'subtitle'),
              fontWeight: '600',
              color: getColor(colorScheme, 'text')
            }}>
              {t('settings.appearance')}
            </ThemedText>
          </View>

          <View style={getCardStyle(colorScheme)}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1
              }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: getColor(colorScheme, 'highlight'),
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: getSpacing('sm')
                }}>
                  <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={getColor(colorScheme, 'primary')} />
                </View>
                <View>
                  <ThemedText style={{
                    ...getTextStyle(colorScheme, 'body'),
                    fontWeight: '600',
                    color: getColor(colorScheme, 'text')
                  }}>
                    {t('settings.darkMode')}
                  </ThemedText>
                  <ThemedText style={{
                    fontSize: 14,
                    color: getColor(colorScheme, 'outline')
                  }}>
                    {t('settings.darkModeDescription')}
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={handleDarkModeToggle}
                trackColor={{
                  false: getColor(colorScheme, 'outline'),
                  true: getColor(colorScheme, 'primary')
                }}
                thumbColor={isDarkMode ? getColor(colorScheme, 'buttonText') : getColor(colorScheme, 'surface')}
                ios_backgroundColor={getColor(colorScheme, 'outline')}
              />
            </View>
          </View>
        </View>

        {/* Data & Storage Section */}
        <View style={getSectionStyle(colorScheme)}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: getSpacing('md')
          }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: getColor(colorScheme, 'highlight'),
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: getSpacing('sm')
            }}>
              <Ionicons name="server" size={18} color={getColor(colorScheme, 'primary')} />
            </View>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'subtitle'),
              fontWeight: '600',
              color: getColor(colorScheme, 'text')
            }}>
              {t('settings.dataStorage')}
            </ThemedText>
          </View>

          <TouchableOpacity
            style={getCardStyle(colorScheme)}
            onPress={handleClearRecentScans}
            activeOpacity={0.7}
            disabled={isClearing}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1
              }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: getColor(colorScheme, 'highlight'),
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: getSpacing('sm')
                }}>
                  <Ionicons name="trash-outline" size={20} color={getColor(colorScheme, 'error')} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{
                    ...getTextStyle(colorScheme, 'body'),
                    fontWeight: '600',
                    color: getColor(colorScheme, 'text')
                  }}>
                    {t('settings.clearRecentScans')}
                  </ThemedText>
                  <ThemedText style={{
                    fontSize: 14,
                    color: getColor(colorScheme, 'outline')
                  }}>
                    {t('settings.clearRecentScansSubtitle')}
                  </ThemedText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={getColor(colorScheme, 'outline')} />
            </View>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={getSectionStyle(colorScheme)}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: getSpacing('md')
          }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: getColor(colorScheme, 'highlight'),
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: getSpacing('sm')
            }}>
              <Ionicons name="information-circle" size={18} color={getColor(colorScheme, 'primary')} />
            </View>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'subtitle'),
              fontWeight: '600',
              color: getColor(colorScheme, 'text')
            }}>
              {t('settings.about')}
            </ThemedText>
          </View>

          <View style={getCardStyle(colorScheme)}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: getSpacing('md')
            }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: getColor(colorScheme, 'primary'),
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: getSpacing('sm')
              }}>
                <Ionicons name="leaf" size={24} color={getColor(colorScheme, 'buttonText')} />
              </View>
              <View>
                <ThemedText style={{
                  ...getTextStyle(colorScheme, 'heading'),
                  color: getColor(colorScheme, 'text')
                }}>
                  {t('common.appName')}
                </ThemedText>
                <ThemedText style={{
                  fontSize: 14,
                  color: getColor(colorScheme, 'primary')
                }}>
                  {t('settings.version')} 1.0.1
                </ThemedText>
              </View>
            </View>
            <ThemedText style={{
              fontSize: 14,
              color: getColor(colorScheme, 'outline')
            }}>
              {t('settings.aboutDescription')}
            </ThemedText>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
