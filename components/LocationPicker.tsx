import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
    Linking,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';
import {
    getColor,
    getSpacing,
    getInputStyle,
    getButtonStyle,
    getTextStyle,
} from '@/utils/styles';

interface LocationPickerProps {
    visible: boolean;
    onClose: () => void;
    onLocationSelect: (
        latitude: number,
        longitude: number,
        address?: string
    ) => void;
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
                                           initialLocation,
                                       }: LocationPickerProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const { t, i18n } = useTranslation();
    const isUrdu = i18n.language === 'ur';
    const mapRef = useRef<MapView>(null);

    const [mapType, setMapType] = useState<
        'standard' | 'satellite' | 'hybrid' | 'terrain'
    >('standard');
    const [showMapTypeSelector, setShowMapTypeSelector] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const defaultLat = initialLocation?.latitude || 31.5497;
    const defaultLng = initialLocation?.longitude || 74.3436;

    const [selectedLocation, setSelectedLocation] = useState({
        latitude: defaultLat,
        longitude: defaultLng,
        address: undefined as string | undefined,
    });

    const [region, setRegion] = useState({
        latitude: defaultLat,
        longitude: defaultLng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });


    // ------------------- LOCATION -------------------

    const requestLocationPermission = useCallback(async () => {
        try {
            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    t('location.permissionDenied'),
                    t('location.enableLocationMessage'),
                    [
                        { text: t('location.cancel'), style: 'cancel' },
                        { text: t('location.openSettings'), onPress: () => Linking.openSettings() },
                    ]
                );
                return;
            }

            const location = await Location.getCurrentPositionAsync({});

            const { latitude, longitude } = location.coords;

            setSelectedLocation({ latitude, longitude, address: undefined });
            setRegion((prev) => ({ ...prev, latitude, longitude }));

            mapRef.current?.animateToRegion(
                {
                    latitude,
                    longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                },
                1000
            );
        } catch  {
            Alert.alert(t('common.error'), t('location.couldNotGetLocation'));
        }
    }, [t]);

    useEffect(() => {
        if (Platform.OS !== 'web') requestLocationPermission();
    }, [requestLocationPermission]);

    // ------------------- SEARCH -------------------

    const searchCity = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                query
            )}&limit=10`;

            const response = await fetch(url, {
                headers: { 'User-Agent': 'Zabaan-E-Kisaan-App' },
            });

            const data: GeocodeResult[] = await response.json();
            setSearchResults(data);
        } catch {
            Alert.alert(t('common.error'), t('location.failedToSearchLocation'));
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        setTimeout(() => searchCity(text), 3000);
    };

    const handleLocationSelect = (result: GeocodeResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        setSelectedLocation({
            latitude: lat,
            longitude: lng,
            address: result.display_name,
        });

        setSearchQuery(result.display_name);
        setSearchResults([]);

        mapRef.current?.animateToRegion(
            {
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            },
            1000
        );
    };

    const handleMapPress = (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedLocation({ latitude, longitude, address: undefined });
    };

    const handleConfirm = () => {
        onLocationSelect(
            selectedLocation.latitude,
            selectedLocation.longitude,
            selectedLocation.address ||
            `${selectedLocation.latitude}, ${selectedLocation.longitude}`
        );
        onClose();
    };

    // ------------------- UI -------------------

    return (
        <Modal visible={visible} animationType="slide">
            <View
                style={{
                    flex: 1,
                }}
            >
                {/* Header */}
                <View
                    style={{
                        paddingTop: Platform.OS === 'ios' ? 50 : 20,
                        paddingHorizontal: getSpacing('md'),
                        paddingBottom: getSpacing('md'),
                        backgroundColor: getColor(colorScheme, 'primary'),
                        borderBottomLeftRadius: 20,
                        borderBottomRightRadius: 20,
                    }}
                >
                    <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>

                        <ThemedText
                            style={{
                                ...getTextStyle(colorScheme, 'heading'),
                                fontSize: 20,
                                color: '#fff',
                                marginLeft: 10,
                            }}
                        >
                            {t('location.selectLocation')}
                        </ThemedText>
                    </View>

                    {/* Search */}
                    <View style={{ marginTop: 15 }}>
                        <TextInput
                            style={{
                                ...getInputStyle(colorScheme),
                                backgroundColor: '#fff',
                                borderRadius: 12,
                                textAlign: isUrdu ? 'right' : 'left',
                                writingDirection: isUrdu ? 'rtl' : 'ltr',
                            }}
                            placeholder={t('location.searchCity')}
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                        />
                        {isSearching && <ActivityIndicator />}
                    </View>

                    {/* Results */}
                    {searchResults.length > 0 && (
                        <ScrollView
                            style={{
                                maxHeight: 150,
                                backgroundColor: '#fff',
                                borderRadius: 12,
                                marginTop: 10,
                            }}
                        >
                            {searchResults.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() =>
                                        handleLocationSelect(item)
                                    }
                                    style={{ padding: 12 }}
                                >
                                    <ThemedText>
                                        {item.display_name}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Map */}
                <View style={{ flex: 1 }}>
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={{ flex: 1 }}
                        initialRegion={region}
                        mapType={mapType}
                        onPress={handleMapPress}
                    >
                        <Marker
                            coordinate={selectedLocation}
                            draggable
                            onDragEnd={(e) =>
                                setSelectedLocation({
                                    latitude: e.nativeEvent.coordinate.latitude,
                                    longitude: e.nativeEvent.coordinate.longitude,
                                    address: undefined,
                                })
                            }
                        />
                    </MapView>

                    {/* Map Type Button */}
                    <TouchableOpacity
                        onPress={() => setShowMapTypeSelector(true)}
                        style={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            backgroundColor: '#fff',
                            padding: 12,
                            borderRadius: 50,
                            elevation: 6,
                        }}
                    >
                        <Ionicons
                            name="layers"
                            size={22}
                            color={getColor(colorScheme, 'primary')}
                        />
                    </TouchableOpacity>
                </View>

                {/* Bottom */}
                <View style={{ padding: 20, backgroundColor:getColor(colorScheme,'surface') }}>
                    <TouchableOpacity
                        style={getButtonStyle(colorScheme, 'primary')}
                        onPress={handleConfirm}
                    >
                        <ThemedText style={{ color: getColor(colorScheme,'buttonText') }}>
                            {t('location.confirmLocation')}
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Map Type Selector */}
                <Modal visible={showMapTypeSelector} transparent animationType="fade">
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            justifyContent: 'center',
                            padding: 30,
                        }}
                        onPress={() =>
                            setShowMapTypeSelector(false)
                        }
                    >
                        <View
                            style={{
                                backgroundColor: getColor(colorScheme, 'surface'),
                                borderRadius: 20,
                                padding: 20,
                            }}
                        >
                            {['standard', 'satellite', 'hybrid', 'terrain'].map(
                                (type) => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => {
                                            setMapType(type as any);
                                            setShowMapTypeSelector(false);
                                        }}
                                        style={{ paddingVertical: 15 }}
                                    >
                                        <ThemedText
                                            style={{
                                                fontSize: 16,
                                                fontWeight:
                                                    mapType === type ? '600' : '400',
                                                color:getColor(colorScheme,'primary')
                                            }}
                                        >
                                            {type.toUpperCase()}
                                        </ThemedText>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </Modal>
    );
}