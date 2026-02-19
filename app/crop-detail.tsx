import React from "react";
import { ScrollView, TouchableOpacity, View, StatusBar, Share, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getUrduCropName, getUrduCityName, getDisplayPrice } from "@/utils/helper";
import {
  getContainerStyle,
  getHeaderStyle,
  getSectionStyle,
  getContentStyle,
  getCardStyle,
  getButtonStyle,
  getTextStyle,
  getColor,
  getSpacing
} from "@/utils/styles";
import { CropPrice } from "@/hooks/useApi";

export default function CropDetailScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse crop data from URL params
  const cropData: CropPrice = JSON.parse(decodeURIComponent(params.crop as string));

  // Get price display using helper (matches prices page - shows per kg for 100KG crops)
  const priceData = getDisplayPrice(cropData);
  const minDisplay = (cropData.min_price === '-' || Number.isNaN(Number(priceData.min))) ? 'دستیاب نہیں' : `Rs. ${priceData.min}`;
  const maxDisplay = (cropData.max_price === '-' || Number.isNaN(Number(priceData.max))) ? 'دستیاب نہیں' : `Rs. ${priceData.max}`;
  const mainPriceDisplay = (minDisplay === 'دستیاب نہیں' && maxDisplay === 'دستیاب نہیں') 
    ? 'دستیاب نہیں' 
    : minDisplay === maxDisplay 
      ? `${minDisplay} ${priceData.unitLabel}`.trim()
      : `${minDisplay} - ${maxDisplay} ${priceData.unitLabel}`.trim();

  const handleShare = async () => {
    try {
      const shareMessage = `${getUrduCropName(cropData.crop)} - ${getUrduCityName(cropData.city)}\nقیمت: ${mainPriceDisplay}\nتاریخ: ${cropData.date}`;
      const result = await Share.share({
        message: shareMessage,
        title: 'زرعی منڈی کی قیمت - Zabaan-e-Kisaan',
      });
      if (result.action === Share.sharedAction) {
        // Shared successfully
      }
    } catch (error) {
        console.log(error);
      Alert.alert('خطا', 'شیئر کرنے میں مسئلہ پیش آیا۔ دوبارہ کوشش کریں۔');
    }
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
              فصل کی تفصیلات
            </ThemedText>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'body'),
              color: getColor(colorScheme, 'buttonText'),
              opacity: 0.9
            }}>
              مارکیٹ کی معلومات اور بصیرت
            </ThemedText>
          </View>
        </View>
      </View>

      <ScrollView style={{...getContentStyle(colorScheme),paddingTop:10}} showsVerticalScrollIndicator={false}>
        {/* Crop Header Card */}
        <View style={getCardStyle(colorScheme)}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: getSpacing('md')
          }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: getColor(colorScheme, 'highlight'),
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: getSpacing('md')
            }}>
              <Ionicons name="leaf" size={32} color={getColor(colorScheme, 'primary')} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{
                ...getTextStyle(colorScheme, 'title'),
                color: getColor(colorScheme, 'text')
              }}>
                {getUrduCropName(cropData.crop)}
              </ThemedText>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: getSpacing('xs')
              }}>
                <Ionicons name="location" size={16} color={getColor(colorScheme, 'outline')} />
                <ThemedText style={{
                  marginLeft: getSpacing('xs'),
                  fontSize: 16,
                  color: getColor(colorScheme, 'outline')
                }}>
                  {getUrduCityName(cropData.city)}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Price Badge */}
          <View style={{
            padding: getSpacing('md'),
            borderRadius: 16,
            backgroundColor: getColor(colorScheme, 'highlight'),
            borderWidth: 2,
            borderColor: getColor(colorScheme, 'primary'),
            alignItems: 'center'
          }}>
            <ThemedText style={{
              fontSize: 14,
              color: getColor(colorScheme, 'primary'),
              marginBottom: getSpacing('xs')
            }}>
              موجودہ مارکیٹ قیمت ({priceData.unitLabel})
            </ThemedText>
            <ThemedText style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: getColor(colorScheme, 'primary')
            }}>
              {mainPriceDisplay}
            </ThemedText>
          </View>
        </View>

        {/* Price Details */}
        <View style={getCardStyle(colorScheme)}>
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
              <MaterialIcons name="trending-up" size={18} color={getColor(colorScheme, 'primary')} />
            </View>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'subtitle'),
              fontWeight: '600',
              color: getColor(colorScheme, 'text')
            }}>
              قیمت کی معلومات
            </ThemedText>
          </View>

          <View style={{ marginBottom: getSpacing('md') }}>
            {[
              { 
                label: 'کم از کم قیمت (' + priceData.unitLabel + ')', 
                value: minDisplay,
                icon: 'arrow-down',
                color: getColor(colorScheme, 'success')
              },
              { 
                label: 'زیادہ سے زیادہ قیمت (' + priceData.unitLabel + ')', 
                value: maxDisplay,
                icon: 'arrow-up',
                color: getColor(colorScheme, 'warning')
              }
            ].map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: getSpacing('sm'),
                  borderBottomWidth: index === 1 ? 0 : 1,
                  borderBottomColor: getColor(colorScheme, 'outline')
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1
                }}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                  <ThemedText style={{
                    marginLeft: getSpacing('sm'),
                    fontSize: 16,
                    color: getColor(colorScheme, 'text')
                  }}>
                    {item.label}
                  </ThemedText>
                </View>
                <ThemedText style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: item.color
                }}>
                  {item.value}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        

        {/* Data Information */}
        <View style={getCardStyle(colorScheme)}>
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
              <MaterialIcons name="info" size={18} color={getColor(colorScheme, 'primary')} />
            </View>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'subtitle'),
              fontWeight: '600',
              color: getColor(colorScheme, 'text')
            }}>
              ڈیٹا کی معلومات
            </ThemedText>
          </View>

          <View style={{
            padding: getSpacing('md'),
            borderRadius: 12,
            backgroundColor: getColor(colorScheme, 'surfaceVariant'),
            borderWidth: 1,
            borderColor: getColor(colorScheme, 'outline')
          }}>
          
            <ThemedText style={{
              fontSize: 14,
              lineHeight: 20,
              color: getColor(colorScheme, 'outline'),
              textAlign: 'right'
            }}>
              یہ ڈیٹا درستگی اور قابل اعتمادیت یقینی بنانے کے لیے سرکاری مارکیٹ ذرائع سے خودکار طور پر اپڈیٹ ہوتا ہے۔
            </ThemedText>
          </View>
        </View>

        {/* Market Insights */}
        <View style={getCardStyle(colorScheme)}>
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
              <MaterialIcons name="lightbulb" size={18} color={getColor(colorScheme, 'accent')} />
            </View>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'subtitle'),
              fontWeight: '600',
              color: getColor(colorScheme, 'text')
            }}>
              مارکیٹ کی بصیرتیں
            </ThemedText>
          </View>

          <View style={{
            padding: getSpacing('md'),
            borderRadius: 12,
            backgroundColor: getColor(colorScheme, 'highlight'),
            borderWidth: 1,
            borderColor: getColor(colorScheme, 'primary')
          }}>
            <ThemedText style={{
              fontSize: 16,
              lineHeight: 24,
              color: getColor(colorScheme, 'primary'),
              textAlign: 'center'
            }}>
              💡 مارکیٹ کی قیمتیں موسمی طلب، موسمی حالات اور رسد کی دستیابی سے متاثر ہوتی ہیں۔ اپنی فصل کی فروخت کی منصوبہ بندی کرتے وقت ان عوامل کو مدنظر رکھیں۔
            </ThemedText>
          </View>
        </View>

        {/* Share Button */}
        <View style={getSectionStyle(colorScheme)}>
          <TouchableOpacity
            style={{
              ...getButtonStyle(colorScheme, 'primary'),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: getSpacing('md')
            }}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={20} color={getColor(colorScheme, 'buttonText')} />
            <ThemedText style={{
              marginLeft: getSpacing('xs'),
              color: getColor(colorScheme, 'buttonText'),
              fontWeight: '600'
            }}>
              شیئر کریں
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

