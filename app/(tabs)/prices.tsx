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
import {useRouter} from "expo-router";
import {ThemedText} from "@/components/ThemedText";
import {useColorScheme} from "@/hooks/useColorScheme";
import {Ionicons, FontAwesome6, MaterialIcons} from "@expo/vector-icons";
import {useTranslation} from "react-i18next";
import {
    useCities,
    useCrops,
    usePrices,
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
import {getDisplayPrice, getCropName, getCityName} from "@/utils/helper";

export default function PricesScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? "light";
    const {t, i18n} = useTranslation();
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [selectedCrop, setSelectedCrop] = useState<string>("");
    const [selectedDateRange, setSelectedDateRange] = useState<string>("");
    const [selectedSpecificDate, setSelectedSpecificDate] = useState<Date | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempPickerDate, setTempPickerDate] = useState(new Date());

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

    const {
        data: crops = [],
        isLoading: cropsLoading,
        refetch: refetchCrops
    } = useCrops();

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

        if (selectedSpecificDate) {
            const formatDateForApi = (d: Date) =>
                d.toLocaleDateString('en-GB').replace(/\//g, '-');

            filters.date = formatDateForApi(selectedSpecificDate);
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

    // Clear all filters
    const clearAllFilters = () => {
        setSelectedCity("");
        setSelectedCrop("");
        setSelectedDateRange("");
        setSelectedSpecificDate(null);
        setCurrentPage(1);
        setShowFilters(false);
    };

    // Check if any filters are active
    const hasActiveFilters = selectedCity || selectedCrop || selectedDateRange || selectedSpecificDate;

    // Handle date picker change
    const onDatePickerChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            if (event.type === 'dismissed') {
                setShowDatePicker(false);
                return;
            }

            if (event.type === 'set' && date) {
                const normalized = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate()
                );

                setTempPickerDate(normalized);
                setSelectedSpecificDate(normalized);
                setSelectedDateRange('specific');
                setShowDatePicker(false);
                setShowFilters(!showFilters)
            }

            return;
        }

        // iOS
        if (date) {
            const normalized = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            );
            setTempPickerDate(normalized);
            setShowFilters(!showFilters)
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
            refetchPrices(),
            refetchCrops()
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
                    <MaterialIcons name="error-outline" size={64} color={getColor(colorScheme, 'error')}/>
                    <ThemedText style={{
                        marginTop: getSpacing('md'),
                        textAlign: 'center',
                        fontSize: 18,
                        color: getColor(colorScheme, 'error')
                    }}>
                        {t('common.error')}
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
                            {t('common.retry')}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[getContainerStyle(colorScheme), {flex: 1}]}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={getColor(colorScheme, 'primary')}
            />
            {/* Fixed Header */}
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
                        <Ionicons name="trending-up" size={18} color={getColor(colorScheme, 'primary')}/>
                    </View>
                    <View style={{flex: 1}}>
                        <ThemedText style={{
                            ...getTextStyle(colorScheme, 'title'),
                            fontSize: 30,
                            fontWeight: '600'
                        }}>
                            {t('prices.title')}
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
                            {t('prices.filters')} {hasActiveFilters ? `(${[selectedCity, selectedCrop, selectedDateRange, selectedSpecificDate].filter(Boolean).length})` : ''}
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
                            <Ionicons name="close" size={16} color={getColor(colorScheme, 'buttonText')}/>
                            <ThemedText style={{
                                marginLeft: getSpacing('xs'),
                                fontWeight: '600',
                                color: getColor(colorScheme, 'buttonText')
                            }}>
                                {t('prices.clearFilters')}
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
                        <View style={{marginBottom: getSpacing('md')}}>
                            <ThemedText style={{
                                fontSize: 16,
                                fontWeight: '600',
                                marginBottom: getSpacing('sm'),
                                color: getColor(colorScheme, 'text')
                            }}>
                                {t('prices.location')}
                            </ThemedText>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            >
                                <TouchableOpacity
                                    style={getCityChipStyle(colorScheme, selectedCity === "")}
                                    onPress={() => {
                                        setSelectedCity("");
                                        setShowFilters(!showFilters)
                                    }}
                                >
                                    <ThemedText style={{
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: selectedCity === "" ? getColor(colorScheme, 'buttonText') : getColor(colorScheme, 'text')
                                    }}>
                                        {t('prices.allCities')}
                                    </ThemedText>
                                </TouchableOpacity>

                                {cities.map((city) => (
                                    <TouchableOpacity
                                        key={city._id}
                                        style={getCityChipStyle(colorScheme, selectedCity === city._id)}
                                        onPress={() => {
                                            setSelectedCity(city._id);
                                            setShowFilters(!showFilters)
                                        }}
                                    >
                                    <ThemedText style={{
                                        fontWeight: '600',
                                        color: selectedCity === city._id ? getColor(colorScheme, 'buttonText') : getColor(colorScheme, 'text')
                                    }}>
                                        {getCityName(city.name, i18n.language)}
                                    </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Crop Filter */}
                        <View style={{marginBottom: getSpacing('md')}}>
                            <ThemedText style={{
                                fontSize: 16,
                                fontWeight: '600',
                                marginBottom: getSpacing('sm'),
                                color: getColor(colorScheme, 'text')
                            }}>
                                {t('prices.cropType')}
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
                                    {getCropName(selectedCrop, i18n.language) || t('prices.selectCrop')}
                                </ThemedText>
                                <Ionicons name="chevron-down" size={20} color={getColor(colorScheme, 'outline')}/>
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
                                {t('prices.date')}
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
                                onPress={() => {
                                    setTempPickerDate(selectedSpecificDate ?? new Date());
                                    setShowDatePicker(true);
                                }}
                            >
                                <ThemedText style={{
                                    color: selectedDateRange ? getColor(colorScheme, 'text') : getColor(colorScheme, 'outline')
                                }}>
                                    {selectedSpecificDate
                                        ? selectedSpecificDate.toLocaleDateString()
                                        : t('prices.selectDate')
                                    }
                                </ThemedText>
                                <Ionicons name="chevron-down" size={20} color={getColor(colorScheme, 'outline')}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>


            {/* Scrollable Content */}
            <ScrollView
                style={{flex: 1}}
                contentContainerStyle={{paddingHorizontal: 16, paddingTop: getSpacing('md')}}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={citiesLoading || pricesLoading || cropsLoading}
                        onRefresh={onRefresh}
                        colors={[getColor(colorScheme, 'primary')]}
                        tintColor={getColor(colorScheme, 'primary')}
                    />
                }
            >
                {citiesLoading || pricesLoading || cropsLoading ? (
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 80
                    }}>
                        <ActivityIndicator size="large" color={getColor(colorScheme, 'primary')}/>
                        <ThemedText style={{
                            marginTop: getSpacing('md'),
                            color: getColor(colorScheme, 'text')
                        }}>
                            {t('prices.loading')}
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
                                    {selectedCity ? getCityName(cities.find(city => city._id === selectedCity)?.name || '', i18n.language) : t('prices.allCities')} {t('prices.cityMarket')}
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
                                        {cropPrices.length} {t('prices.noOfCrops')}
                                    </ThemedText>
                                </View>
                            </View>
                            <ThemedText style={{
                                fontSize: 14,
                                color: getColor(colorScheme, 'text')
                            }}>
                                {t('prices.lastUpdated')}: {new Date().toLocaleDateString()}
                            </ThemedText>
                        </View>

                        {/* Crop Prices List */}
                        {(() => {
                            if (cropPrices.length === 0) {
                                return (
                                    <View style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        paddingVertical: 80
                                    }}>
                                        <FontAwesome6 name="search" size={48} color={getColor(colorScheme, 'outline')}/>
                                        <ThemedText style={{
                                            marginTop: getSpacing('md'),
                                            textAlign: 'center',
                                            color: getColor(colorScheme, 'text')
                                        }}>
                                            {hasActiveFilters
                                                ? t('prices.filterAdjustMessage')
                                                : t('prices.noFiltersMessage')
                                            }
                                        </ThemedText>
                                        <ThemedText style={{
                                            fontSize: 14,
                                            textAlign: 'center',
                                            color: getColor(colorScheme, 'outline'),
                                            marginTop: getSpacing('sm')
                                        }}>
                                            {hasActiveFilters
                                                ? t('prices.filterAdjustMessage')
                                                : t('prices.selectDifferentCity')
                                            }
                                        </ThemedText>
                                    </View>
                                );
                            }

                            return (
                                <>
                                    {cropPrices.map((crop) => (
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
                                                <View style={{flex: 1}}>
                                                    <ThemedText style={{
                                                        fontSize: 22,
                                                        fontWeight: '700',
                                                        marginBottom: getSpacing('xs'),
                                                        color: getColor(colorScheme, 'text')
                                                    }}>
                                                        {getCropName(crop.crop, i18n.language)}
                                                    </ThemedText>

                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        marginBottom: getSpacing('sm')
                                                    }}>
                                                        <Ionicons name="location" size={18}
                                                                  color={getColor(colorScheme, 'primary')}/>
                                                        <ThemedText style={{
                                                            marginLeft: getSpacing('xs'),
                                                            fontSize: 16,
                                                            fontWeight: '600',
                                                            color: getColor(colorScheme, 'text')
                                                        }}>
                                                            {getCityName(crop.city, i18n.language)}
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
                                                        <Ionicons name="calendar" size={16}
                                                                  color={getColor(colorScheme, 'primary')}/>
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
                                                const priceData = getDisplayPrice(crop, i18n.language);
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
                                                                {t('prices.minPrice')}
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
                                                                {t('prices.maxPrice')}
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
                                                <Ionicons name="information-circle" size={16}
                                                          color={getColor(colorScheme, 'primary')}/>
                                                <ThemedText style={{
                                                    marginLeft: getSpacing('sm'),
                                                    fontSize: 14,
                                                    color: getColor(colorScheme, 'primary')
                                                }}>
                                                    {t('prices.tapForDetails')}
                                                </ThemedText>
                                            </View>
                                        </TouchableOpacity>
                                    ))}

                                    {/* Pagination Controls */}
                                    {pagination && pagination.total_pages > 1 && (
                                        <View style={{
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
                                {t('prices.selectCrop')}
                            </ThemedText>
                            <TouchableOpacity onPress={() => setShowCropModal(false)}>
                                <Ionicons name="close" size={24} color={getColor(colorScheme, 'text')}/>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={['', ...crops.map(c => c.name)]}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item}) => (
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
                                        setShowFilters(!showFilters)
                                    }}
                                >
                                    <ThemedText style={{
                                        fontSize: 16,
                                        color: selectedCrop === item ? getColor(colorScheme, 'primary') : getColor(colorScheme, 'text')
                                    }}>
                                        {getCropName(item, i18n.language) || t('prices.allCrops')}
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
                            style={{flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)'}}
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
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                        gap: getSpacing('md'),
                                        marginBottom: getSpacing('sm')
                                    }}>
                                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                            <ThemedText style={{
                                                color: getColor(colorScheme, 'outline'),
                                                fontWeight: '600'
                                            }}>{t('prices.cancel')}</ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={onConfirmDateIOS}>
                                            <ThemedText style={{
                                                color: getColor(colorScheme, 'primary'),
                                                fontWeight: '600'
                                            }}>{t('prices.confirm')}</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        key={tempPickerDate.toISOString()}
                                        value={tempPickerDate}
                                        mode="date"
                                        display="calendar"
                                        onChange={onDatePickerChange}
                                    />
                                </View>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>
                ) : (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={tempPickerDate!}
                        mode="date"
                        onChange={onDatePickerChange}
                        maximumDate={new Date()}

                    />
                )
            )}
        </View>
    );
}
