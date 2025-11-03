import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import {FontAwesome5, Ionicons} from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  getColor,
  getSpacing,
  getInputStyle,
  getButtonStyle,
  getTextStyle
} from '@/utils/styles';
import MapView, {Marker, UrlTile} from "react-native-maps";

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (latitude: number, longitude: number, address?: string) => void;
  initialLocation?: { latitude: number; longitude: number };
}

interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function LocationPicker({
  visible,
  onClose,
  onLocationSelect,
  initialLocation
}: LocationPickerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const mapRef = useRef<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  }>(initialLocation || { latitude: 31.5497, longitude: 74.3436 });
  
  const [showResults, setShowResults] = useState(false);
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 31.5497,
    longitude: initialLocation?.longitude || 74.3436,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Search cities using Nominatim (OpenStreetMap geocoding API)
  const searchCity = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Search in Pakistan primarily, but allow global search
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&countrycodes=pk&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Zabaan-E-Kisaan-App' // Required by Nominatim
        }
      });
      
      const data: GeocodeResult[] = await response.json();
      
      if (data && data.length > 0) {
        setSearchResults(data);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Failed to search location. Please try again.');
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    // Debounce search
    const timeout = setTimeout(() => {
      searchCity(text);
    }, 500);
    return () => clearTimeout(timeout);
  };

  const handleLocationSelect = (result: GeocodeResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setSelectedLocation({
      latitude: lat,
      longitude: lng,
      address: result.display_name
    });
    
    setSearchQuery(result.display_name);
    setShowResults(false);
    
    // Animate map to selected location
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }, 1000);
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({
      latitude,
      longitude
    });
  };

  const handleConfirm = () => {
    onLocationSelect(
      selectedLocation.latitude,
      selectedLocation.longitude,
      selectedLocation.address || `${selectedLocation.latitude}, ${selectedLocation.longitude}`
    );
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: getColor(colorScheme, 'background')
      }}>
        {/* Header */}
        <View style={{
          paddingTop: Platform.OS === 'ios' ? 50 : 20,
          paddingHorizontal: getSpacing('md'),
          paddingBottom: getSpacing('md'),
          backgroundColor: getColor(colorScheme, 'primary'),
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          shadowColor: getColor(colorScheme, 'shadow'),
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: getSpacing('sm')
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                padding: getSpacing('xs'),
                marginRight: getSpacing('sm')
              }}
            >
              <Ionicons name="arrow-back" size={24} color={getColor(colorScheme, 'buttonText')} />
            </TouchableOpacity>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'heading'),
              fontSize: 22,
              color: getColor(colorScheme, 'buttonText'),
              flex: 1
            }}>
              Select Location
            </ThemedText>
          </View>

          {/* Search Input */}
          <View style={{ position: 'relative' }}>
            <Ionicons
              name="search"
              size={20}
              color={getColor(colorScheme, 'textSecondary')}
              style={{
                position: 'absolute',
                left: getSpacing('md'),
                top: 7,
                zIndex: 1
              }}
            />
            <TextInput
              style={{
                ...getInputStyle(colorScheme),
                paddingLeft: 48,
                backgroundColor: getColor(colorScheme, 'surface'),
                borderRadius: 12
              }}
              placeholder="Search city or location..."
              placeholderTextColor={getColor(colorScheme, 'textSecondary')}
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
            {isSearching && (
              <View style={{
                position: 'absolute',
                right: getSpacing('md'),
                top: 7
              }}>
                <ActivityIndicator size="small" color={getColor(colorScheme, 'primary')} />
              </View>
            )}
          </View>

          {/* Search Results */}
          {showResults && searchResults.length > 0 && (
            <ScrollView
              style={{
                maxHeight: 150,
                backgroundColor: getColor(colorScheme, 'surface'),
                borderRadius: 12,
                marginTop: getSpacing('sm'),
                borderWidth: 1,
                borderColor: getColor(colorScheme, 'outline')
              }}
            >
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleLocationSelect(result)}
                  style={{
                    padding: getSpacing('md'),
                    borderBottomWidth: index < searchResults.length - 1 ? 1 : 0,
                    borderBottomColor: getColor(colorScheme, 'outline')
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Ionicons
                      name="location"
                      size={18}
                      color={getColor(colorScheme, 'primary')}
                      style={{ marginRight: getSpacing('sm'), marginTop: 2 }}
                    />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={{
                        ...getTextStyle(colorScheme, 'body'),
                        color: getColor(colorScheme, 'text')
                      }}>
                        {result.display_name}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Map */}
        <View style={{ flex: 1 }}>
          {Platform.OS === 'web' ? (
            // Web fallback: Show coordinates and allow manual entry
            <ScrollView style={{ flex: 1, padding: getSpacing('md') }}>
              <View style={{
                backgroundColor: getColor(colorScheme, 'surface'),
                padding: getSpacing('lg'),
                borderRadius: 12,
                marginBottom: getSpacing('md')
              }}>
                <ThemedText style={{
                  ...getTextStyle(colorScheme, 'heading'),
                  marginBottom: getSpacing('sm')
                }}>
                  Select Location (Web Mode)
                </ThemedText>
                <ThemedText style={{
                  ...getTextStyle(colorScheme, 'body'),
                  color: getColor(colorScheme, 'textSecondary'),
                  marginBottom: getSpacing('md')
                }}>
                  On web, please use the search above or enter coordinates manually.
                </ThemedText>
                
                <View style={{ marginBottom: getSpacing('md') }}>
                  <ThemedText style={{
                    ...getTextStyle(colorScheme, 'caption'),
                    marginBottom: getSpacing('xs')
                  }}>
                    Latitude
                  </ThemedText>
                  <TextInput
                    style={{
                      ...getInputStyle(colorScheme),
                      marginBottom: getSpacing('sm')
                    }}
                    placeholder="e.g., 31.5497"
                    placeholderTextColor={getColor(colorScheme, 'outline')}
                    value={selectedLocation.latitude.toString()}
                    onChangeText={(text) => {
                      const lat = parseFloat(text);
                      if (!isNaN(lat)) {
                        setSelectedLocation({
                          ...selectedLocation,
                          latitude: lat
                        });
                      }
                    }}
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ marginBottom: getSpacing('md') }}>
                  <ThemedText style={{
                    ...getTextStyle(colorScheme, 'caption'),
                    marginBottom: getSpacing('xs')
                  }}>
                    Longitude
                  </ThemedText>
                  <TextInput
                    style={{
                      ...getInputStyle(colorScheme),
                      marginBottom: getSpacing('sm')
                    }}
                    placeholder="e.g., 74.3436"
                    placeholderTextColor={getColor(colorScheme, 'outline')}
                    value={selectedLocation.longitude.toString()}
                    onChangeText={(text) => {
                      const lng = parseFloat(text);
                      if (!isNaN(lng)) {
                        setSelectedLocation({
                          ...selectedLocation,
                          longitude: lng
                        });
                      }
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={{
                backgroundColor: getColor(colorScheme, 'info'),
                padding: getSpacing('md'),
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Ionicons 
                  name="information-circle" 
                  size={20} 
                  color={getColor(colorScheme, 'buttonText')}
                  style={{ marginRight: getSpacing('sm') }}
                />
                <ThemedText style={{
                  ...getTextStyle(colorScheme, 'caption'),
                  color: getColor(colorScheme, 'buttonText'),
                  flex: 1
                }}>
                  Use the search bar above to find locations. Maps are available on iOS and Android.
                </ThemedText>
              </View>
            </ScrollView>
          ) : MapView ? (
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              initialRegion={region}
              onRegionChangeComplete={setRegion}
              onPress={handleMapPress}
              mapType="none"
            >
                <UrlTile
                  urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maximumZ={19}
                  flipY={false}
                  zIndex={1}
                />
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude
                  }}
                  draggable
                  onDragEnd={(e:any) => {
                    setSelectedLocation({
                      latitude: e.nativeEvent.coordinate.latitude,
                      longitude: e.nativeEvent.coordinate.longitude
                    });
                  }}
                />
            </MapView>
          ) : (
            <View style={{ 
              flex: 1, 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: getSpacing('lg')
            }}>
              <ActivityIndicator size="large" color={getColor(colorScheme, 'primary')} />
              <ThemedText style={{
                ...getTextStyle(colorScheme, 'body'),
                marginTop: getSpacing('md'),
                color: getColor(colorScheme, 'textSecondary')
              }}>
                Loading map...
              </ThemedText>
            </View>
          )}
        </View>

        {/* Bottom Bar */}
        <View style={{
          padding: getSpacing('md'),
          backgroundColor: getColor(colorScheme, 'surface'),
          borderTopWidth: 1,
          borderTopColor: getColor(colorScheme, 'outline')
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: getSpacing('md')
          }}>
            <FontAwesome5
              name="map-marker-alt"
              size={20}
              color={getColor(colorScheme, 'primary')}
              style={{ marginRight: getSpacing('sm') }}
            />
            <View style={{ flex: 1 }}>
              <ThemedText style={{
                ...getTextStyle(colorScheme, 'caption'),
                color: getColor(colorScheme, 'textSecondary')
              }}>
                Selected Location
              </ThemedText>
              <ThemedText style={{
                ...getTextStyle(colorScheme, 'body'),
                color: getColor(colorScheme, 'text'),
                marginTop: 4
              }}>
                {selectedLocation.address || `${selectedLocation.latitude.toFixed(2)}, ${selectedLocation.longitude.toFixed(2)}`}
              </ThemedText>
            </View>
          </View>

          <TouchableOpacity
            style={{
              ...getButtonStyle(colorScheme, 'primary'),
              paddingVertical: getSpacing('md')
            }}
            onPress={handleConfirm}
          >
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'body'),
              color: getColor(colorScheme, 'buttonText'),
              fontWeight: '600'
            }}>
              Confirm Location
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

