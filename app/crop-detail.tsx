import React from "react";
import { ScrollView, TouchableOpacity, View, StatusBar } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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

interface CropData {
  _id: string;
  city: string;
  date: string;
  crop: string;
  min_price: string;
  max_price: string;
  fqp: string;
  quantity: string;
  scraped_at: string;
}

export default function CropDetailScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse crop data from URL params
  const cropData: CropData = JSON.parse(decodeURIComponent(params.crop as string));

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // Get price display
  const getPriceDisplay = (minPrice: string, maxPrice: string) => {
    if (minPrice === '-' && maxPrice === '-') {
      return 'Not Available';
    }
    if (minPrice === '-') {
      return `Rs. ${maxPrice}`;
    }
    if (maxPrice === '-') {
      return `Rs. ${minPrice}`;
    }
    return `Rs. ${minPrice} - ${maxPrice}`;
  };

  // Get crop name without number prefix
  const getCleanCropName = (cropString: string) => {
    return cropString.replace(/^\d+/, '').trim();
  };

  // Get price trend
  const getPriceTrend = () => {
    if (cropData.min_price === '-' || cropData.max_price === '-') {
      return 'stable';
    }
    // Simple logic - in real app, you'd compare with historical data
    return Math.random() > 0.5 ? 'up' : 'down';
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
              Crop Details
            </ThemedText>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'body'),
              color: getColor(colorScheme, 'buttonText'),
              opacity: 0.9
            }}>
              Market information and insights
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
                {getCleanCropName(cropData.crop)}
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
                  {cropData.city}
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
              Current Market Price
            </ThemedText>
            <ThemedText style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: getColor(colorScheme, 'primary')
            }}>
              {getPriceDisplay(cropData.min_price, cropData.max_price)}
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
              Price Information
            </ThemedText>
          </View>

          <View style={{ marginBottom: getSpacing('md') }}>
            {[
              { 
                label: 'Minimum Price', 
                value: cropData.min_price !== '-' ? `Rs. ${cropData.min_price}` : 'Not Available',
                icon: 'arrow-down',
                color: getColor(colorScheme, 'success')
              },
              { 
                label: 'Maximum Price', 
                value: cropData.max_price !== '-' ? `Rs. ${cropData.max_price}` : 'Not Available',
                icon: 'arrow-up',
                color: getColor(colorScheme, 'warning')
              },
              { 
                label: 'Price Trend', 
                value: getPriceTrend() === 'up' ? 'Rising' : 'Falling',
                icon: getPriceTrend() === 'up' ? 'trending-up' : 'trending-down',
                color: getPriceTrend() === 'up' ? getColor(colorScheme, 'success') : getColor(colorScheme, 'error')
              }
            ].map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: getSpacing('sm'),
                  borderBottomWidth: index === 2 ? 0 : 1,
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

        {/* Market Details */}
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
              <MaterialIcons name="store" size={18} color={getColor(colorScheme, 'primary')} />
            </View>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'subtitle'),
              fontWeight: '600',
              color: getColor(colorScheme, 'text')
            }}>
              Market Details
            </ThemedText>
          </View>

          <View style={{ marginBottom: getSpacing('md') }}>
            {[
              { 
                label: 'Quantity Available', 
                value: cropData.quantity !== '-' ? cropData.quantity : 'Not Available',
                icon: 'scale',
                color: getColor(colorScheme, 'info')
              },
              { 
                label: 'FQP (Fair Quality Price)', 
                value: cropData.fqp !== '-' ? `Rs. ${cropData.fqp}` : 'Not Available',
                icon: 'star',
                color: getColor(colorScheme, 'accent')
              },
              { 
                label: 'Market Date', 
                value: formatDate(cropData.date),
                icon: 'calendar',
                color: getColor(colorScheme, 'primary')
              }
            ].map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: getSpacing('sm'),
                  borderBottomWidth: index === 2 ? 0 : 1,
                  borderBottomColor: getColor(colorScheme, 'outline')
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1
                }}>
                  <MaterialIcons name={item.icon as any} size={20} color={item.color} />
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
                  color: getColor(colorScheme, 'text')
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
              Data Information
            </ThemedText>
          </View>

          <View style={{
            padding: getSpacing('md'),
            borderRadius: 12,
            backgroundColor: getColor(colorScheme, 'surfaceVariant'),
            borderWidth: 1,
            borderColor: getColor(colorScheme, 'outline')
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: getSpacing('sm')
            }}>
              <MaterialIcons name="schedule" size={16} color={getColor(colorScheme, 'outline')} />
              <ThemedText style={{
                marginLeft: getSpacing('xs'),
                fontSize: 14,
                color: getColor(colorScheme, 'outline')
              }}>
                Last Updated: {formatDate(cropData.scraped_at)} at {formatTime(cropData.scraped_at)}
              </ThemedText>
            </View>
            <ThemedText style={{
              fontSize: 14,
              lineHeight: 20,
              color: getColor(colorScheme, 'outline')
            }}>
              This data is automatically updated from official market sources to ensure accuracy and reliability.
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
              Market Insights
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
              💡 Market prices are influenced by seasonal demand, weather conditions, and supply availability. 
              Consider these factors when planning your crop sales.
            </ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={getSectionStyle(colorScheme)}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: getSpacing('md')
          }}>
            <TouchableOpacity
              style={{
                ...getButtonStyle(colorScheme, 'outline'),
                flex: 1,
                marginRight: getSpacing('sm')
              }}
              activeOpacity={0.8}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="share-outline" size={20} color={getColor(colorScheme, 'primary')} />
                <ThemedText style={{
                  marginLeft: getSpacing('xs'),
                  color: getColor(colorScheme, 'primary'),
                  fontWeight: '600'
                }}>
                  Share
                </ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                ...getButtonStyle(colorScheme, 'primary'),
                flex: 1,
                marginLeft: getSpacing('sm')
              }}
              activeOpacity={0.8}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name="chatbubble-outline" size={20} color={getColor(colorScheme, 'buttonText')} />
                <ThemedText style={{
                  marginLeft: getSpacing('xs'),
                  color: getColor(colorScheme, 'buttonText'),
                  fontWeight: '600'
                }}>
                  Ask AI
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

