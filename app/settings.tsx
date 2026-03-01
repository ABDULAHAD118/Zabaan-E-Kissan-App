import React, { useState } from "react";
import { ScrollView, Switch, TouchableOpacity, View, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useLanguage } from "@/providers/LanguageProvider";
import { useTranslation } from "react-i18next";
import {
  getContainerStyle,
  getHeaderStyle,
  getSectionStyle,
  getContentStyle,
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
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(
    colorScheme === "dark"
  );

  const handleLanguageChange = async (langId: string) => {
    await setLanguage(langId);
  };

  return (
    <View style={getContainerStyle(colorScheme)}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={getColor(colorScheme, 'primary')}
      />
      
      {/* Header */}
      <View style={getHeaderStyle(colorScheme)}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: getSpacing('md')
        }}>
          <TouchableOpacity 
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: getColor(colorScheme, 'highlight'),
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: getSpacing('md')
            }}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons size={20} name="arrow-back" color={getColor(colorScheme, 'primary')} />
          </TouchableOpacity>
          
          <View style={{ flex: 1 }}>
            <ThemedText style={getTextStyle(colorScheme, 'title')}>
              {t('settings.title')}
            </ThemedText>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'body'),
              color: getColor(colorScheme, 'buttonText'),
              opacity: 0.9
            }}>
              Customize your app experience
            </ThemedText>
          </View>
        </View>
      </View>

      <ScrollView style={getContentStyle(colorScheme)} showsVerticalScrollIndicator={false}>
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
              {t('settings.language')} / زبان
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
              Appearance
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
                  <Ionicons name="moon" size={20} color={getColor(colorScheme, 'primary')} />
                </View>
                <View>
                  <ThemedText style={{
                    ...getTextStyle(colorScheme, 'body'),
                    fontWeight: '600',
                    color: getColor(colorScheme, 'text')
                  }}>
                    Dark Mode
                  </ThemedText>
                  <ThemedText style={{
                    fontSize: 14,
                    color: getColor(colorScheme, 'outline')
                  }}>
                    Switch between light and dark themes
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ 
                  false: getColor(colorScheme, 'outline'), 
                  true: getColor(colorScheme, 'primary') 
                }}
                thumbColor={darkModeEnabled ? getColor(colorScheme, 'buttonText') : getColor(colorScheme, 'surface')}
                ios_backgroundColor={getColor(colorScheme, 'outline')}
              />
            </View>
          </View>
        </View>

        {/* Notifications Section */}
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
              <Ionicons name="notifications" size={18} color={getColor(colorScheme, 'primary')} />
            </View>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'subtitle'),
              fontWeight: '600',
              color: getColor(colorScheme, 'text')
            }}>
              Notifications
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
                  <Ionicons name="notifications" size={20} color={getColor(colorScheme, 'primary')} />
                </View>
                <View>
                  <ThemedText style={{
                    ...getTextStyle(colorScheme, 'body'),
                    fontWeight: '600',
                    color: getColor(colorScheme, 'text')
                  }}>
                    Enable Notifications
                  </ThemedText>
                  <ThemedText style={{
                    fontSize: 14,
                    color: getColor(colorScheme, 'outline')
                  }}>
                    Get alerts for important updates
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ 
                  false: getColor(colorScheme, 'outline'), 
                  true: getColor(colorScheme, 'primary') 
                }}
                thumbColor={notificationsEnabled ? getColor(colorScheme, 'buttonText') : getColor(colorScheme, 'surface')}
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
              <Ionicons name="cloud-download" size={18} color={getColor(colorScheme, 'primary')} />
            </View>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'subtitle'),
              fontWeight: '600',
              color: getColor(colorScheme, 'text')
            }}>
              Data & Storage
            </ThemedText>
          </View>

          <View style={{ marginBottom: getSpacing('md') }}>
            {[
              { icon: 'refresh', title: 'Clear Cache', subtitle: 'Free up storage space' },
              { icon: 'download', title: 'Download Data', subtitle: 'Export your farming data' }
            ].map((item, index) => (
              <TouchableOpacity 
                key={index}
                style={getCardStyle(colorScheme)}
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
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: getColor(colorScheme, 'highlight'),
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: getSpacing('sm')
                    }}>
                      <Ionicons name={item.icon as any} size={20} color={getColor(colorScheme, 'primary')} />
                    </View>
                    <View>
                      <ThemedText style={{
                        ...getTextStyle(colorScheme, 'body'),
                        fontWeight: '600',
                        color: getColor(colorScheme, 'text')
                      }}>
                        {item.title}
                      </ThemedText>
                      <ThemedText style={{
                        fontSize: 14,
                        color: getColor(colorScheme, 'outline')
                      }}>
                        {item.subtitle}
                      </ThemedText>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={getColor(colorScheme, 'outline')} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
              About
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
                  Zabaan-e-Kisaan
                </ThemedText>
                <ThemedText style={{
                  fontSize: 14,
                  color: getColor(colorScheme, 'primary')
                }}>
                  Version 1.0.0
                </ThemedText>
              </View>
            </View>
            <ThemedText style={{
              fontSize: 14,
              lineHeight: 20,
              color: getColor(colorScheme, 'outline')
            }}>
              A comprehensive farming app with AI-powered disease detection, 
              intelligent chat assistance, and real-time crop price monitoring. 
              Built for the farming community with love and care.
            </ThemedText>
          </View>
        </View>

        {/* Support Section */}
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
              <Ionicons name="help-buoy" size={18} color={getColor(colorScheme, 'primary')} />
            </View>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'subtitle'),
              fontWeight: '600',
              color: getColor(colorScheme, 'text')
            }}>
              Support & Feedback
            </ThemedText>
          </View>

          <View style={{ marginBottom: getSpacing('md') }}>
            {[
              { icon: 'help-circle', title: 'Help Center', subtitle: 'Find answers to common questions' },
              { icon: 'chatbubble-ellipses', title: 'Contact Us', subtitle: 'Get in touch with our team' },
              { icon: 'star', title: 'Rate App', subtitle: 'Share your experience' },
              { icon: 'share-social', title: 'Share App', subtitle: 'Tell friends about Zabaan-e-Kisaan' }
            ].map((item, index) => (
              <TouchableOpacity 
                key={index}
                style={getCardStyle(colorScheme)}
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
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: getColor(colorScheme, 'highlight'),
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: getSpacing('sm')
                    }}>
                      <Ionicons name={item.icon as any} size={20} color={getColor(colorScheme, 'primary')} />
                    </View>
                    <View>
                      <ThemedText style={{
                        ...getTextStyle(colorScheme, 'body'),
                        fontWeight: '600',
                        color: getColor(colorScheme, 'text')
                      }}>
                        {item.title}
                      </ThemedText>
                      <ThemedText style={{
                        fontSize: 14,
                        color: getColor(colorScheme, 'outline')
                      }}>
                        {item.subtitle}
                      </ThemedText>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={getColor(colorScheme, 'outline')} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}
