import React, { useState } from "react";
import { 
  ScrollView, 
  TouchableOpacity, 
  View, 
  Image,
  Alert
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons, Entypo, MaterialIcons } from "@expo/vector-icons";
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

export default function DiseaseDetectionScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const handleUpload = () => {
    Alert.alert("Upload", "Upload functionality will be implemented here");
  };

  const handleQuickAction = (action: string) => {
    Alert.alert("Quick Action", `${action} functionality will be implemented here`);
  };

  const recentScans = [
    { id: 1, crop: "Wheat", status: "Healthy", date: "2 hours ago", confidence: 95 },
    { id: 2, crop: "Rice", status: "Disease Detected", date: "1 day ago", confidence: 87 },
    { id: 3, crop: "Corn", status: "Healthy", date: "3 days ago", confidence: 92 },
  ];

  const commonDiseases = [
    { name: "Leaf Blight", severity: "High", crop: "Wheat", description: "Fungal disease affecting leaves" },
    { name: "Root Rot", severity: "Medium", crop: "Rice", description: "Soil-borne disease affecting roots" },
    { name: "Powdery Mildew", severity: "Low", crop: "Corn", description: "Fungal disease with white powdery spots" },
  ];

  return (
    <View style={getContainerStyle(colorScheme)}>
      {/* Header */}
      <View style={getHeaderStyle(colorScheme)}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: getSpacing('md')
        }}>
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: getColor(colorScheme, 'highlight'),
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: getSpacing('md')
          }}>
            <Entypo name="leaf" size={24} color={getColor(colorScheme, 'primary')} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={getTextStyle(colorScheme, 'title')}>
              Disease Detection
            </ThemedText>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'body'),
              color: getColor(colorScheme, 'buttonText'),
              opacity: 0.9
            }}>
              AI-powered crop health analysis
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Upload Section */}
      <View style={getSectionStyle(colorScheme)}>
        <TouchableOpacity
          style={{
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: getColor(colorScheme, 'outline'),
            borderRadius: 16,
            padding: getSpacing('xl'),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: getColor(colorScheme, 'surfaceVariant'),
            marginBottom: getSpacing('lg')
          }}
          onPress={handleUpload}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="camera" 
            size={48} 
            color={getColor(colorScheme, 'primary')} 
          />
          <ThemedText style={{
            ...getTextStyle(colorScheme, 'heading'),
            marginTop: getSpacing('md'),
            marginBottom: getSpacing('sm'),
            color: getColor(colorScheme, 'text')
          }}>
            Upload Crop Image
          </ThemedText>
          <ThemedText style={{
            ...getTextStyle(colorScheme, 'body'),
            textAlign: 'center',
            color: getColor(colorScheme, 'textSecondary')
          }}>
            Take a photo or select from gallery to analyze crop health
          </ThemedText>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: getSpacing('lg')
        }}>
          {[
            { icon: 'camera', title: 'Camera', color: getColor(colorScheme, 'primary') },
            { icon: 'images', title: 'Gallery', color: getColor(colorScheme, 'secondary') },
            { icon: 'scan', title: 'Scan', color: getColor(colorScheme, 'accent') }
          ].map((action, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flex: 1,
                marginHorizontal: index === 1 ? getSpacing('sm') : 0,
                padding: getSpacing('md'),
                borderRadius: 12,
                backgroundColor: getColor(colorScheme, 'surface'),
                borderWidth: 1,
                borderColor: getColor(colorScheme, 'outline'),
                alignItems: 'center'
              }}
              onPress={() => handleQuickAction(action.title)}
              activeOpacity={0.7}
            >
              <Ionicons name={action.icon as any} size={24} color={action.color} />
              <ThemedText style={{
                ...getTextStyle(colorScheme, 'caption'),
                marginTop: getSpacing('xs'),
                color: getColor(colorScheme, 'text')
              }}>
                {action.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={getContentStyle(colorScheme)} showsVerticalScrollIndicator={false}>
        {/* Recent Scans */}
        <View style={getCardStyle(colorScheme)}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: getSpacing('md')
          }}>
            <MaterialIcons name="history" size={20} color={getColor(colorScheme, 'primary')} />
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'heading'),
              marginLeft: getSpacing('sm'),
              color: getColor(colorScheme, 'text')
            }}>
              Recent Scans
            </ThemedText>
          </View>
          
          {recentScans.map((scan) => (
            <View
              key={scan.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: getSpacing('sm'),
                borderBottomWidth: 1,
                borderBottomColor: getColor(colorScheme, 'outline'),
                marginBottom: getSpacing('sm')
              }}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: scan.status === 'Healthy' 
                  ? getColor(colorScheme, 'success') 
                  : getColor(colorScheme, 'warning'),
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: getSpacing('md')
              }}>
                <Ionicons 
                  name={scan.status === 'Healthy' ? 'checkmark' : 'warning'} 
                  size={20} 
                  color={getColor(colorScheme, 'buttonText')} 
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <ThemedText style={{
                  ...getTextStyle(colorScheme, 'body'),
                  fontWeight: '600',
                  color: getColor(colorScheme, 'text')
                }}>
                  {scan.crop}
                </ThemedText>
                <ThemedText style={{
                  ...getTextStyle(colorScheme, 'caption'),
                  color: getColor(colorScheme, 'textSecondary')
                }}>
                  {scan.status} • {scan.date}
                </ThemedText>
              </View>
              
              <View style={{
                paddingHorizontal: getSpacing('sm'),
                paddingVertical: getSpacing('xs'),
                borderRadius: 8,
                backgroundColor: getColor(colorScheme, 'highlight')
              }}>
                <ThemedText style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: getColor(colorScheme, 'primary')
                }}>
                  {scan.confidence}%
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Common Diseases */}
        <View style={getCardStyle(colorScheme)}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: getSpacing('md')
          }}>
            <MaterialIcons name="warning" size={20} color={getColor(colorScheme, 'warning')} />
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'heading'),
              marginLeft: getSpacing('sm'),
              color: getColor(colorScheme, 'text')
            }}>
              Common Diseases
            </ThemedText>
          </View>
          
          {commonDiseases.map((disease, index) => (
            <View
              key={index}
              style={{
                padding: getSpacing('md'),
                borderRadius: 12,
                backgroundColor: getColor(colorScheme, 'surfaceVariant'),
                marginBottom: getSpacing('sm'),
                borderLeftWidth: 4,
                borderLeftColor: disease.severity === 'High' 
                  ? getColor(colorScheme, 'error')
                  : disease.severity === 'Medium'
                  ? getColor(colorScheme, 'warning')
                  : getColor(colorScheme, 'success')
              }}
            >
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: getSpacing('xs')
              }}>
                <ThemedText style={{
                  ...getTextStyle(colorScheme, 'body'),
                  fontWeight: '600',
                  color: getColor(colorScheme, 'text')
                }}>
                  {disease.name}
                </ThemedText>
                <View style={{
                  paddingHorizontal: getSpacing('sm'),
                  paddingVertical: getSpacing('xs'),
                  borderRadius: 12,
                  backgroundColor: disease.severity === 'High' 
                    ? getColor(colorScheme, 'error')
                    : disease.severity === 'Medium'
                    ? getColor(colorScheme, 'warning')
                    : getColor(colorScheme, 'success')
                }}>
                  <ThemedText style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: getColor(colorScheme, 'buttonText')
                  }}>
                    {disease.severity}
                  </ThemedText>
                </View>
              </View>
              
              <ThemedText style={{
                ...getTextStyle(colorScheme, 'caption'),
                color: getColor(colorScheme, 'textSecondary'),
                marginBottom: getSpacing('xs')
              }}>
                {disease.crop}
              </ThemedText>
              
              <ThemedText style={{
                ...getTextStyle(colorScheme, 'caption'),
                color: getColor(colorScheme, 'textTertiary')
              }}>
                {disease.description}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Tips Section */}
        <View style={getCardStyle(colorScheme)}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: getSpacing('md')
          }}>
            <MaterialIcons name="lightbulb" size={20} color={getColor(colorScheme, 'accent')} />
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'heading'),
              marginLeft: getSpacing('sm'),
              color: getColor(colorScheme, 'text')
            }}>
              Pro Tips
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
              ...getTextStyle(colorScheme, 'body'),
              color: getColor(colorScheme, 'primary'),
              textAlign: 'center',
              lineHeight: 24
            }}>
              • Take photos in good lighting for better accuracy{'\n'}
              • Include both healthy and affected areas{'\n'}
              • Scan regularly to catch issues early{'\n'}
              • Keep your camera lens clean
            </ThemedText>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

