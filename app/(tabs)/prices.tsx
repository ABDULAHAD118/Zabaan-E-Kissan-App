import React, {useEffect, useState} from "react";
import {
    ScrollView,
    TouchableOpacity,
    View,
    ActivityIndicator,
    RefreshControl,
    Modal,
    FlatList,
    Platform,
    StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import {
    useCities,
    usePrices,
    filterCropsWithPrices,
    type CropPrice
} from "@/hooks/useApi";
import {
    getContainerStyle,
    getHeaderStyle,
    getSectionStyle,
    getCardStyle,
    getCityChipStyle,
    getPriceCardStyle,
    getTextStyle,
    getColor,
    getSpacing
} from "@/utils/styles";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getCleanCropName, getDisplayPrice, getUrduCityName, getUrduCropName } from "@/utils/helper";

export default function PricesScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? "light";
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [selectedCrop, setSelectedCrop] = useState<string>("");
    const [selectedDateRange, setSelectedDateRange] = useState<string>("");
    const [selectedSpecificDate, setSelectedSpecificDate] = useState<Date | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempPickerDate, setTempPickerDate] = useState<Date>(new Date());
    const [availableCrops, setAvailableCrops] = useState<string[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageLimit] = useState(20); // Items per page

    // TanStack Query hooks
    const {
        data: cities = [],
        isLoading: citiesLoading,
        error: citiesError,
        refetch: refetchCities
    } = useCities();

    // Build filter object for API
    const buildFilters = () => {
        const filters: { city?: string; crop?: string; date?: string; page?: number; limit?: number } = {};

        if (selectedCity) {
            const city = cities.find(c => c._id === selectedCity);
            if (city) {
                filters.city = city.name;
            }
        }

        if (selectedCrop) {
            filters.crop = selectedCrop;
        }

        if (selectedDateRange) {
            let dateString = '';
            const formatDateForApi = (d: Date) => d.toLocaleDateString('en-GB').replace(/\//g, '-');

            if (selectedDateRange === 'specific' && selectedSpecificDate) {
                dateString = formatDateForApi(selectedSpecificDate);
            } else {
                const today = new Date();
                switch (selectedDateRange) {
                    case 'today':
                        dateString = formatDateForApi(today);
                        break;
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(today.getDate() - 7);
                        dateString = formatDateForApi(weekAgo);
                        break;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(today.getMonth() - 1);
                        dateString = formatDateForApi(monthAgo);
                        break;
                }
            }

            if (dateString) {
                filters.date = dateString;
            }
        }

        // Add pagination
        filters.page = currentPage;
        filters.limit = pageLimit;

        return filters;
    };

    const {
        data: pricesResponse,
        isLoading: pricesLoading,
        refetch: refetchPrices
    } = usePrices(buildFilters());

    // Extract data and pagination from response
    const cropPrices = pricesResponse?.data || [];
    const pagination = pricesResponse?.pagination;

    // Filter crops with prices only - but be less restrictive
    const filteredPrices = filterCropsWithPrices(cropPrices);

    // Extract unique crops from all prices for the crop filter
    useEffect(() => {
        const cropsFromApi = filteredPrices.map(crop =>
            getCleanCropName(crop.crop)
        );
        setAvailableCrops(cropsFromApi);
    }, [filteredPrices]);

    // Clear all filters
    const clearAllFilters = () => {
        setSelectedCity("");
        setSelectedCrop("");
        setSelectedDateRange("");
        setSelectedSpecificDate(null);
        setCurrentPage(1); // Reset to first page
    };

    // Check if any filters are active
    const hasActiveFilters = selectedCity || selectedCrop || selectedDateRange || selectedSpecificDate;

    // Handle date picker change
    const onDatePickerChange = (event: { type: string }, date?: Date) => {
        if (event.type === 'dismissed') {
            if (Platform.OS === 'android') setShowDatePicker(false);
            return;
        }
        if (date) {
            const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            setTempPickerDate(normalized);
            if (Platform.OS === 'android') {
                setSelectedSpecificDate(normalized);
                setSelectedDateRange('specific');
                setTimeout(() => setShowDatePicker(false), 100);
            }
        }
    };

    const onConfirmDateIOS = () => {
        const normalized = new Date(tempPickerDate.getFullYear(), tempPickerDate.getMonth(), tempPickerDate.getDate());
        setSelectedSpecificDate(normalized);
        setSelectedDateRange('specific');
        setShowDatePicker(false);
    };

    const handleCropPress = (crop: CropPrice) => {
        const cropData = encodeURIComponent(JSON.stringify(crop));
        router.push(`/crop-detail?crop=${cropData}`);
    };

    // Refresh data
    const onRefresh = async () => {
        await Promise.all([
            refetchCities(),
            refetchPrices()
        ]);
    };



    useEffect(() => {
        if (cities.length > 0 && selectedCity === undefined) {
            setSelectedCity("");
        }
    }, [cities, selectedCity]);


    if (citiesError) {
        return (
            <View style={getContainerStyle(colorScheme)}>
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 80
                }}>
                    <MaterialIcons name="error-outline" size={64} color={getColor(colorScheme, 'error')} />
                    <ThemedText style={{
                        marginTop: getSpacing('md'),
                        textAlign: 'center',
                        fontSize: 18,
                        color: getColor(colorScheme, 'error')
                    }}>
                        شہر لوڈ کرنے میں ناکام
                    </ThemedText>
                    <TouchableOpacity
                        style={{
                            marginTop: getSpacing('lg'),
                            paddingHorizontal: getSpacing('lg'),
                            paddingVertical: getSpacing('md'),
                            borderRadius: 24,
                            backgroundColor: getColor(colorScheme, 'primary')
                        }}
                        onPress={() => refetchCities()}
                    >
                        <ThemedText style={{
                            color: getColor(colorScheme, 'buttonText'),
                            fontWeight: '600'
                        }}>
                            دوبارہ کوشش کریں
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[getContainerStyle(colorScheme), { flex: 1 }]}>
            <StatusBar 
                barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={getColor(colorScheme, 'primary')}
            />
            {/* Fixed Header */}
            <View style={getHeaderStyle(colorScheme)}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: getSpacing('md')
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
                        <Ionicons name="trending-up" size={18} color={getColor(colorScheme, 'primary')} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <ThemedText style={{
                            ...getTextStyle(colorScheme, 'title'),
                            fontSize: 30,
                            fontWeight: '600'
                        }}>
                            فصلیں کی قیمتیں
                        </ThemedText>
                    </View>
                </View>

            </View>

            {/* Filters */}
            <View style={[getSectionStyle(colorScheme),
                {
                    borderBottomColor: getColor(colorScheme, 'outline'),
                    borderBottomWidth: 1,
                    paddingBottom: getSpacing('sm'),
                }
                ]}>
                {/* Filter Toggle Button */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: getSpacing('sm'),
                
                }}>
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: getSpacing('md'),
                            paddingVertical: getSpacing('sm'),
                            borderRadius: 20,
                            backgroundColor: hasActiveFilters ? getColor(colorScheme, 'primary') : getColor(colorScheme, 'surface'),
                            borderWidth: 1,
                            borderColor: getColor(colorScheme, 'outline')
                        }}
                        onPress={() => setShowFilters(!showFilters)}
                    >
                        <Ionicons
                            name="filter"
                            size={16}
                            color={hasActiveFilters ? getColor(colorScheme, 'buttonText') : getColor(colorScheme, 'text')}
                        />
                        <ThemedText style={{
                            marginLeft: getSpacing('xs'),
                            fontWeight: '600',
                            color: hasActiveFilters ? getColor(colorScheme, 'buttonText') : getColor(colorScheme, 'text')
                        }}>
                            فلٹرز {hasActiveFilters ? `(${[selectedCity, selectedCrop, selectedDateRange, selectedSpecificDate].filter(Boolean).length})` : ''}
                        </ThemedText>
                    </TouchableOpacity>

                    {hasActiveFilters && (
                        <TouchableOpacity
                            style={{
                                paddingHorizontal: getSpacing('md'),
                                paddingVertical: getSpacing('sm'),
                                borderRadius: 20,
                                backgroundColor: getColor(colorScheme, 'error'),
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                            onPress={clearAllFilters}
                        >
                            <Ionicons name="close" size={16} color={getColor(colorScheme, 'buttonText')} />
                            <ThemedText style={{
                                marginLeft: getSpacing('xs'),
                                fontWeight: '600',
                                color: getColor(colorScheme, 'buttonText')
                            }}>
                                تمام صاف کریں
                            </ThemedText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Collapsible Filters */}
                {showFilters && (
                    <View style={{
                        backgroundColor: getColor(colorScheme, 'surface'),
                        borderRadius: 12,
                        padding: getSpacing('md'),
                        marginBottom: getSpacing('md'),
                        borderWidth: 1,
                        borderColor: getColor(colorScheme, 'outline')
                    }}>
                        {/* City Filter */}
                        <View style={{ marginBottom: getSpacing('md') }}>
                            <ThemedText style={{
                                fontSize: 16,
                                fontWeight: '600',
                                marginBottom: getSpacing('sm'),
                                color: getColor(colorScheme, 'text')
                            }}>
                                مقام
                            </ThemedText>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            >
                                <TouchableOpacity
                                    style={getCityChipStyle(colorScheme, selectedCity === "")}
                                    onPress={() => setSelectedCity("")}
                                >
                                    <ThemedText style={{
                                        fontWeight: '600',
                                        color: selectedCity === "" ? getColor(colorScheme, 'buttonText') : getColor(colorScheme, 'text')
                                    }}>
                                        تمام شہر
                                    </ThemedText>
                                </TouchableOpacity>

                                {cities.map((city) => (
                                    <TouchableOpacity
                                        key={city._id}
                                        style={getCityChipStyle(colorScheme, selectedCity === city._id)}
                                        onPress={() => setSelectedCity(city._id)}
                                    >
                                        <ThemedText style={{
                                            fontWeight: '600',
                                            color: selectedCity === city._id ? getColor(colorScheme, 'buttonText') : getColor(colorScheme, 'text')
                                        }}>
                                            {getUrduCityName(city.name)}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Crop Filter */}
                        <View style={{ marginBottom: getSpacing('md') }}>
                            <ThemedText style={{
                                fontSize: 16,
                                fontWeight: '600',
                                marginBottom: getSpacing('sm'),
                                color: getColor(colorScheme, 'text')
                            }}>
                                فصل کی قسم
                            </ThemedText>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: getSpacing('md'),
                                    paddingVertical: getSpacing('md'),
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: getColor(colorScheme, 'outline'),
                                    backgroundColor: getColor(colorScheme, 'background')
                                }}
                                onPress={() => setShowCropModal(true)}
                            >
                                <ThemedText style={{
                                    color: selectedCrop ? getColor(colorScheme, 'text') : getColor(colorScheme, 'outline')
                                }}>
                                    {getUrduCropName(selectedCrop) || 'فصل کی قسم منتخب کریں'}
                                </ThemedText>
                                <Ionicons name="chevron-down" size={20} color={getColor(colorScheme, 'outline')} />
                            </TouchableOpacity>
                        </View>

                        {/* Date Filter */}
                        <View>
                            <ThemedText style={{
                                fontSize: 16,
                                fontWeight: '600',
                                marginBottom: getSpacing('sm'),
                                color: getColor(colorScheme, 'text')
                            }}>
                                تاریخ
                            </ThemedText>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: getSpacing('md'),
                                    paddingVertical: getSpacing('md'),
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: getColor(colorScheme, 'outline'),
                                    backgroundColor: getColor(colorScheme, 'background')
                                }}
                                onPress={() => setShowDateModal(true)}
                            >
                                <ThemedText style={{
                                    color: selectedDateRange ? getColor(colorScheme, 'text') : getColor(colorScheme, 'outline')
                                }}>
                                    {selectedDateRange === 'specific' && selectedSpecificDate
                                        ? selectedSpecificDate.toLocaleDateString()
                                        : selectedDateRange === 'today' ? 'آج' :
                                            selectedDateRange === 'week' ? 'آخری 7 دن' :
                                                selectedDateRange === 'month' ? 'آخری 30 دن'
                                                : 'تاریخ منتخب کریں'
                                    }
                                </ThemedText>
                                <Ionicons name="chevron-down" size={20} color={getColor(colorScheme, 'outline')} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {/* Scrollable Content */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80, paddingTop: getSpacing('md') }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={citiesLoading || pricesLoading}
                        onRefresh={onRefresh}
                        colors={[getColor(colorScheme, 'primary')]}
                        tintColor={getColor(colorScheme, 'primary')}
                    />
                }
            >
                {citiesLoading || pricesLoading ? (
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 80
                    }}>
                        <ActivityIndicator size="large" color={getColor(colorScheme, 'primary')} />
                        <ThemedText style={{
                            marginTop: getSpacing('md'),
                            color: getColor(colorScheme, 'text')
                        }}>
                            فصلیں کی قیمتیں لوڈ ہو رہی ہیں...
                        </ThemedText>
                    </View>
                ) : (
                    <>
                        {/* Market Info Card */}
                        <View style={getCardStyle(colorScheme)}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: getSpacing('sm')
                            }}>
                                <ThemedText style={{
                                    ...getTextStyle(colorScheme, 'heading'),
                                    color: getColor(colorScheme, 'primary')
                                }}>
                                    {selectedCity ? getUrduCityName(cities.find(city => city._id === selectedCity)?.name || '') : 'تمام شہر'} مارکیٹ
                                </ThemedText>
                                <View style={{
                                    paddingHorizontal: getSpacing('sm'),
                                    paddingVertical: getSpacing('xs'),
                                    borderRadius: 12,
                                    backgroundColor: getColor(colorScheme, 'primary')
                                }}>
                                    <ThemedText style={{
                                        fontSize: 12,
                                        fontWeight: '600',
                                        color: getColor(colorScheme, 'buttonText')
                                    }}>
                                        {filteredPrices.length} قیمتوں والی فصلیں
                                    </ThemedText>
                                </View>
                            </View>
                            <ThemedText style={{
                                fontSize: 14,
                                color: getColor(colorScheme, 'text')
                            }}>
                                آخری تازہ کاری: {new Date().toLocaleDateString()}
                            </ThemedText>
                        </View>

                        {/* Crop Prices List */}
                        {(() => {
                            const cropsToShow = filteredPrices;

                            if (cropsToShow.length === 0) {
                                return (
                                    <View style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        paddingVertical: 80
                                    }}>
                                        <FontAwesome6 name="search" size={48} color={getColor(colorScheme, 'outline')} />
                                        <ThemedText style={{
                                            marginTop: getSpacing('md'),
                                            textAlign: 'center',
                                            color: getColor(colorScheme, 'text')
                                        }}>
                                            {hasActiveFilters
                                                ? 'آپ کے موجودہ فلٹرز سے کوئی فصل نہیں ملی'
                                                : 'اس شہر میں قیمتوں والی کوئی فصل دستیاب نہیں'
                                            }
                                        </ThemedText>
                                        <ThemedText style={{
                                            fontSize: 14,
                                            textAlign: 'center',
                                            color: getColor(colorScheme, 'outline'),
                                            marginTop: getSpacing('sm')
                                        }}>
                                            {hasActiveFilters
                                                ? 'تمام نتائج دیکھنے کے لیے اپنے فلٹرز کو ایڈجسٹ کریں یا صاف کریں'
                                                : 'مختلف شہر منتخب کریں یا بعد میں دوبارہ چیک کریں'
                                            }
                                        </ThemedText>
                                    </View>
                                );
                            }

                            return (
                                <>
                                    {cropsToShow.map((crop) => (
                                        <TouchableOpacity
                                            key={crop._id}
                                            style={getPriceCardStyle(colorScheme)}
                                            onPress={() => handleCropPress(crop)}
                                            activeOpacity={0.7}
                                        >
                                            {/* Card Header - Title and Date */}
                                            <View style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: getSpacing('lg')
                                            }}>
                                                <View style={{ flex: 1 }}>
                                                    <ThemedText style={{
                                                        fontSize: 22,
                                                        fontWeight: '700',
                                                        marginBottom: getSpacing('xs'),
                                                        color: getColor(colorScheme, 'text')
                                                    }}>
                                                        {getUrduCropName(crop.crop)}
                                                    </ThemedText>

                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        marginBottom: getSpacing('sm')
                                                    }}>
                                                        <Ionicons name="location" size={18} color={getColor(colorScheme, 'primary')} />
                                                        <ThemedText style={{
                                                            marginLeft: getSpacing('xs'),
                                                            fontSize: 16,
                                                            fontWeight: '600',
                                                            color: getColor(colorScheme, 'text')
                                                        }}>
                                                            {getUrduCityName(crop.city)}
                                                        </ThemedText>
                                                    </View>
                                                </View>

                                                <View style={{
                                                    alignItems: 'flex-end'
                                                }}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        paddingHorizontal: getSpacing('md'),
                                                        paddingVertical: getSpacing('sm'),
                                                        backgroundColor: getColor(colorScheme, 'primary') + '10',
                                                        borderRadius: 12,
                                                        borderWidth: 1,
                                                        borderColor: getColor(colorScheme, 'primary') + '30'
                                                    }}>
                                                        <Ionicons name="calendar" size={16} color={getColor(colorScheme, 'primary')} />
                                                        <ThemedText style={{
                                                            marginLeft: getSpacing('xs'),
                                                            fontSize: 14,
                                                            fontWeight: '600',
                                                            color: getColor(colorScheme, 'primary')
                                                        }}>
                                                            {crop.date}
                                                        </ThemedText>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Price Display - Min/Max Only */}
                                            {(() => {
                                                const priceData = getDisplayPrice(crop);
                                                return (
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        gap: getSpacing('md')
                                                    }}>
                                                        {/* Min Price Card */}
                                                        <View style={{
                                                            flex: 1,
                                                            paddingVertical: getSpacing('lg'),
                                                            paddingHorizontal: getSpacing('md'),
                                                            backgroundColor: getColor(colorScheme, 'primary') + '10',
                                                            borderRadius: 16,
                                                            borderWidth: 2,
                                                            borderColor: getColor(colorScheme, 'primary'),
                                                            alignItems: 'center',
                                                        }}>
                                                            <ThemedText style={{
                                                                fontSize: 12,
                                                                color: getColor(colorScheme, 'outline'),
                                                                marginBottom: getSpacing('xs'),
                                                                fontWeight: '600',
                                                                letterSpacing: 0.5
                                                            }}>
                                                                کم از کم قیمت
                                                            </ThemedText>
                                                            <ThemedText style={{
                                                                fontSize: 20,
                                                                fontWeight: '700',
                                                                color: getColor(colorScheme, 'primary'),
                                                                marginBottom: getSpacing('xs')
                                                            }}>
                                                                Rs. {priceData.min}
                                                            </ThemedText>
                                                            <ThemedText style={{
                                                                fontSize: 10,
                                                                color: getColor(colorScheme, 'outline'),
                                                                fontWeight: '600'
                                                            }}>
                                                                {priceData.unitLabel}
                                                            </ThemedText>
                                                        </View>

                                                        {/* Max Price Card */}
                                                        <View style={{
                                                            flex: 1,
                                                            paddingVertical: getSpacing('lg'),
                                                            paddingHorizontal: getSpacing('md'),
                                                            backgroundColor: getColor(colorScheme, 'primary') + '10',
                                                            borderRadius: 16,
                                                            borderWidth: 2,
                                                            borderColor: getColor(colorScheme, 'primary'),
                                                            alignItems: 'center',
                                                        }}>
                                                            <ThemedText style={{
                                                                fontSize: 12,
                                                                color: getColor(colorScheme, 'outline'),
                                                                marginBottom: getSpacing('xs'),
                                                                fontWeight: '600',
                                                                letterSpacing: 0.5
                                                            }}>
                                                                زیادہ سے زیادہ قیمت
                                                            </ThemedText>
                                                            <ThemedText style={{
                                                                fontSize: 20,
                                                                fontWeight: '700',
                                                                color: getColor(colorScheme, 'primary'),
                                                                marginBottom: getSpacing('xs')
                                                            }}>
                                                                Rs. {priceData.max}
                                                            </ThemedText>
                                                            <ThemedText style={{
                                                                fontSize: 10,
                                                                color: getColor(colorScheme, 'outline'),
                                                                fontWeight: '600'
                                                            }}>
                                                                {priceData.unitLabel}
                                                            </ThemedText>
                                                        </View>
                                                    </View>
                                                );
                                            })()}

                                            {/* Tap indicator */}
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginTop: getSpacing('md'),
                                                paddingTop: getSpacing('md'),
                                                borderTopWidth: 1,
                                                borderTopColor: getColor(colorScheme, 'outline')
                                            }}>
                                                <Ionicons name="information-circle" size={16} color={getColor(colorScheme, 'primary')} />
                                                <ThemedText style={{
                                                    marginLeft: getSpacing('sm'),
                                                    fontSize: 14,
                                                    color: getColor(colorScheme, 'primary')
                                                }}>
                                                    تفصیلات کے لیے ٹیپ کریں
                                                </ThemedText>
                                            </View>
                                        </TouchableOpacity>
                                    ))}

                                    {/* Pagination Controls */}
                                    {pagination && pagination.total_pages > 1 && (
                                        <View style={{
                                            marginTop: getSpacing('lg'),
                                            marginBottom: getSpacing('md'),
                                            paddingHorizontal: getSpacing('md'),
                                            paddingVertical: getSpacing('lg'),
                                            backgroundColor: getColor(colorScheme, 'surface'),
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: getColor(colorScheme, 'outline')
                                        }}>
                                        

                                            {/* Pagination Buttons */}
                                            <View style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: getSpacing('md')
                                            }}>
                                                {/* Previous Button */}
                                                <TouchableOpacity
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 20,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: pagination.has_prev
                                                            ? getColor(colorScheme, 'primary')
                                                            : getColor(colorScheme, 'outline') + '30',
                                                        opacity: pagination.has_prev ? 1 : 0.5
                                                    }}
                                                    onPress={() => {
                                                        if (pagination.has_prev) {
                                                            setCurrentPage(prev => Math.max(1, prev - 1));
                                                        }
                                                    }}
                                                    disabled={!pagination.has_prev || pricesLoading}
                                                >
                                                    <Ionicons
                                                        name="chevron-back"
                                                        size={20}
                                                        color={pagination.has_prev
                                                            ? getColor(colorScheme, 'buttonText')
                                                            : getColor(colorScheme, 'outline')}
                                                    />
                                            
                                                </TouchableOpacity>

                                                {/* Page Numbers */}
                                                <View style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: getSpacing('xs')
                                                }}>
                                                    {[...Array(Math.min(4, pagination.total_pages))].map((_, index) => {
                                                        let pageNum: number;

                                                        if (pagination.total_pages <= 5) {
                                                            pageNum = index + 1;
                                                        } else if (pagination.page <= 3) {
                                                            pageNum = index + 1;
                                                        } else if (pagination.page >= pagination.total_pages - 2) {
                                                            pageNum = pagination.total_pages - 4 + index;
                                                        } else {
                                                            pageNum = pagination.page - 2 + index;
                                                        }

                                                        return (
                                                            <TouchableOpacity
                                                                key={pageNum}
                                                                style={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    borderRadius: 20,
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    backgroundColor: pagination.page === pageNum
                                                                        ? getColor(colorScheme, 'primary')
                                                                        : 'transparent',
                                                                    borderWidth: 1,
                                                                    borderColor: pagination.page === pageNum
                                                                        ? getColor(colorScheme, 'primary')
                                                                        : getColor(colorScheme, 'outline')
                                                                }}
                                                                onPress={() => setCurrentPage(pageNum)}
                                                                disabled={pricesLoading}
                                                            >
                                                                <ThemedText style={{
                                                                    fontWeight: '600',
                                                                    color: pagination.page === pageNum
                                                                        ? getColor(colorScheme, 'buttonText')
                                                                        : getColor(colorScheme, 'text')
                                                                }}>
                                                                    {pageNum}
                                                                </ThemedText>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>

                                                {/* Next Button */}
                                                <TouchableOpacity
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 20,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: pagination.has_next
                                                            ? getColor(colorScheme, 'primary')
                                                            : getColor(colorScheme, 'outline') + '30',
                                                        opacity: pagination.has_next ? 1 : 0.5
                                                    }}
                                                    onPress={() => {
                                                        if (pagination.has_next) {
                                                            setCurrentPage(prev => Math.min(pagination.total_pages, prev + 1));
                                                        }
                                                    }}
                                                    disabled={!pagination.has_next || pricesLoading}
                                                >
                                        
                                                    <Ionicons
                                                        name="chevron-forward"
                                                        size={20}
                                                        color={pagination.has_next
                                                            ? getColor(colorScheme, 'buttonText')
                                                            : getColor(colorScheme, 'outline')}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </>
                            );
                        })()}

                        <View style={{ height: 80 }} />
                    </>
                )}
            </ScrollView>

            {/* Crop Selection Modal */}
            <Modal
                visible={showCropModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCropModal(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'flex-end'
                }}>
                    <View style={{
                        backgroundColor: getColor(colorScheme, 'surface'),
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        maxHeight: '70%',
                        padding: getSpacing('lg')
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: getSpacing('lg')
                        }}>
                            <ThemedText style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: getColor(colorScheme, 'text')
                            }}>
                                فصل کی قسم منتخب کریں
                            </ThemedText>
                            <TouchableOpacity onPress={() => setShowCropModal(false)}>
                                <Ionicons name="close" size={24} color={getColor(colorScheme, 'text')} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={['', ...availableCrops]}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={{
                                        paddingVertical: getSpacing('md'),
                                        paddingHorizontal: getSpacing('md'),
                                        borderBottomWidth: 1,
                                        borderBottomColor: getColor(colorScheme, 'outline'),
                                        backgroundColor: selectedCrop === item ? getColor(colorScheme, 'primary') + '20' : 'transparent'
                                    }}
                                    onPress={() => {
                                        setSelectedCrop(item);
                                        setShowCropModal(false);
                                    }}
                                >
                                    <ThemedText style={{
                                        fontSize: 16,
                                        color: selectedCrop === item ? getColor(colorScheme, 'primary') : getColor(colorScheme, 'text')
                                    }}>
                                        {getUrduCropName(item) || 'تمام فصلیں۔'}
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Date Selection Modal */}
            <Modal
                visible={showDateModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDateModal(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'flex-end'
                }}>
                    <View style={{
                        backgroundColor: getColor(colorScheme, 'surface'),
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        maxHeight: '60%',
                        padding: getSpacing('lg')
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: getSpacing('lg')
                        }}>
                            <ThemedText style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: getColor(colorScheme, 'text')
                            }}>
                                تاریخ منتخب کریں
                            </ThemedText>
                            <TouchableOpacity onPress={() => setShowDateModal(false)}>
                                <Ionicons name="close" size={24} color={getColor(colorScheme, 'text')} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={[
                                { value: '', label: 'تمام وقت' },
                                { value: 'today', label: 'آج' },
                                { value: 'week', label: 'آخری 7 دن' },
                                { value: 'month', label: 'آخری 30 دن' },
                                { value: 'calendar', label: 'مخصوص تاریخ منتخب کریں', isCalendar: true }
                            ]}
                            keyExtractor={(item) => item.isCalendar ? 'calendar' : item.value || 'all'}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: getSpacing('md'),
                                        paddingHorizontal: getSpacing('md'),
                                        borderBottomWidth: 1,
                                        borderBottomColor: getColor(colorScheme, 'outline'),
                                        backgroundColor: (item.isCalendar ? selectedDateRange === 'specific' : selectedDateRange === item.value) ? getColor(colorScheme, 'primary') + '20' : 'transparent'
                                    }}
                                    onPress={() => {
                                        if (item.isCalendar) {
                                            setShowDateModal(false);
                                            setTempPickerDate(selectedSpecificDate ?? new Date());
                                            setShowDatePicker(true);
                                        } else {
                                            setSelectedDateRange(item.value);
                                            if (item.value === '') setSelectedSpecificDate(null);
                                            setShowDateModal(false);
                                        }
                                    }}
                                >
                                    <Ionicons
                                        name={item.isCalendar ? 'calendar' : 'today'}
                                        size={20}
                                        color={(item.isCalendar ? selectedDateRange === 'specific' : selectedDateRange === item.value) ? getColor(colorScheme, 'primary') : getColor(colorScheme, 'outline')}
                                        style={{ marginRight: getSpacing('sm') }}
                                    />
                                    <ThemedText style={{
                                        fontSize: 16,
                                        color: (item.isCalendar ? selectedDateRange === 'specific' : selectedDateRange === item.value) ? getColor(colorScheme, 'primary') : getColor(colorScheme, 'text')
                                    }}>
                                        {item.label}
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Date Picker (Calendar) */}
            {showDatePicker && (
                Platform.OS === 'ios' ? (
                    <Modal visible={true} transparent animationType="slide">
                        <TouchableOpacity
                            style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
                            activeOpacity={1}
                            onPress={() => setShowDatePicker(false)}
                        >
                            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                                <View style={{
                                    backgroundColor: getColor(colorScheme, 'surface'),
                                    borderTopLeftRadius: 20,
                                    borderTopRightRadius: 20,
                                    padding: getSpacing('lg')
                                }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: getSpacing('md'), marginBottom: getSpacing('sm') }}>
                                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                            <ThemedText style={{ color: getColor(colorScheme, 'outline'), fontWeight: '600' }}>منسوخ</ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={onConfirmDateIOS}>
                                            <ThemedText style={{ color: getColor(colorScheme, 'primary'), fontWeight: '600' }}>ٹھیک ہے</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        value={tempPickerDate}
                                        mode="date"
                                        display="spinner"
                                        onChange={onDatePickerChange}
                                        maximumDate={new Date()}
                                    />
                                </View>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>
                ) : (
                    <DateTimePicker
                        value={tempPickerDate}
                        mode="date"
                        display="calendar"
                        onChange={onDatePickerChange}
                        maximumDate={new Date()}
                    />
                )
            )}
        </View>
    );
}
