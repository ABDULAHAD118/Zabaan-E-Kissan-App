import React, {useEffect, useState} from "react";
import { 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  View, 
  ActivityIndicator,
  RefreshControl,
  Modal,
  FlatList
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { 
  useCities, 
  usePrices, 
  useSearchPrices, 
  filterCropsWithPrices,
  getKgPriceDisplay,
  type CropPrice 
} from "@/hooks/useApi";
import {
  getContainerStyle,
  getHeaderStyle,
  getSectionStyle,
  getCardStyle,
  getSearchInputStyle,
  getCityChipStyle,
  getPriceCardStyle,
  getTextStyle,
  getColor,
  getSpacing
} from "@/utils/styles";

export default function PricesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
    const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Enhanced filter states
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [availableCrops, setAvailableCrops] = useState<string[]>([]);

  // TanStack Query hooks
  const { 
    data: cities = [], 
    isLoading: citiesLoading, 
    error: citiesError,
    refetch: refetchCities 
  } = useCities();

  // Build filter object for API
  const buildFilters = () => {
    const filters: { city?: string; crop?: string; date?: string } = {};
    
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
      const today = new Date();
      let dateString = '';
      
      switch (selectedDateRange) {
        case 'today':
          dateString = today.toLocaleDateString('en-GB').replace(/\//g, '-');
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          dateString = weekAgo.toLocaleDateString('en-GB').replace(/\//g, '-');
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          dateString = monthAgo.toLocaleDateString('en-GB').replace(/\//g, '-');
          break;
      }
      
      if (dateString) {
        filters.date = dateString;
      }
    }
    
    return filters;
  };

  const { 
    data: cropPrices = [], 
    isLoading: pricesLoading, 
    refetch: refetchPrices 
  } = usePrices(buildFilters());

  const { 
    data: searchResults = [], 
    isLoading: searchLoading,
    refetch: refetchSearch 
  } = useSearchPrices(searchQuery);

  // Filter crops with prices only - but be less restrictive
  const filteredPrices = filterCropsWithPrices(cropPrices);
  const filteredSearchResults = filterCropsWithPrices(searchResults);

  // Extract unique crops from all prices for the crop filter
    useEffect(() => {
        const allPrices = searchQuery ? filteredSearchResults : filteredPrices;
        const uniqueCrops = Array.from(
            new Set(allPrices.map(crop => getCleanCropName(crop.crop)))
        ).sort();

        setAvailableCrops(prev =>
            JSON.stringify(prev) === JSON.stringify(uniqueCrops) ? prev : uniqueCrops
        );
    }, [filteredPrices, filteredSearchResults, searchQuery]);


    // Use backend filtered results directly
  const finalFilteredPrices = filteredPrices;
  const finalFilteredSearchResults = filteredSearchResults;

  // Generate search suggestions based on city names
  const generateSearchSuggestions = (query: string) => {
    if (!query.trim()) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const suggestions = cities
      .filter(city => city.name.toLowerCase().includes(query.toLowerCase()))
      .map(city => city.name)
      .slice(0, 5); // Limit to 5 suggestions

    setSearchSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  };

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    generateSearchSuggestions(text);
    
    if (!text.trim()) {
      setShowSuggestions(false);
      return;
    }

    const isCitySearch = cities.some(city =>
      city.name.toLowerCase().includes(text.toLowerCase())
    );

    if (isCitySearch) {
      // Search by city name - TanStack Query will handle this
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (cityName: string) => {
    setSearchQuery(cityName);
    setShowSuggestions(false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCity("");
    setSelectedCrop("");
    setSelectedDateRange("");
    setSearchQuery("");
    setShowSuggestions(false);
  };

  // Check if any filters are active
  const hasActiveFilters = selectedCity || selectedCrop || selectedDateRange || searchQuery;

  const handleCropPress = (crop: CropPrice) => {
    const cropData = encodeURIComponent(JSON.stringify(crop));
    router.push(`/crop-detail?crop=${cropData}`);
  };

  // Refresh data
  const onRefresh = async () => {
    await Promise.all([
      refetchCities(),
      refetchPrices(),
      refetchSearch()
    ]);
  };
  

  const getCleanCropName = (cropString: string) => {
    return cropString.replace(/^\d+/, '').trim();
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
            Failed to load cities
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
              Try Again
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={getContainerStyle(colorScheme)}
      refreshControl={
        <RefreshControl 
          refreshing={citiesLoading || pricesLoading || searchLoading}
          onRefresh={onRefresh}
          colors={[getColor(colorScheme, 'primary')]}
          tintColor={getColor(colorScheme, 'primary')}
        />
      }
    >
      {/* Header */}
      <View style={[getHeaderStyle(colorScheme), { paddingVertical: getSpacing('sm') }]}>
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
            <Ionicons name="trending-up" size={18} color={getColor(colorScheme, 'primary')} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'title'),
              fontSize: 30,
              fontWeight: '600'
            }}>
              Crop Prices
            </ThemedText>
          </View>
        </View>
      
      </View>

      {/* Search and Filters */}
      <View style={getSectionStyle(colorScheme)}>
        {/* Search Bar */}
        <View style={{
          position: 'relative',
          marginBottom: getSpacing('md')
        }}>
          <TextInput
            placeholder="Search crops or cities..."
            placeholderTextColor={getColor(colorScheme, 'outline')}
            value={searchQuery}
            onChangeText={handleSearchChange}
            style={getSearchInputStyle(colorScheme)}
          />
          <Ionicons 
            name="search" 
            size={20} 
            color={getColor(colorScheme, 'outline')}
            style={{
              position: 'absolute',
              left: getSpacing('md'),
              top: 12
            }}
          />
          
          {/* Clear Search Button */}
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: getSpacing('md'),
                top: 12
              }}
              onPress={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
            >
              <Ionicons name="close-circle" size={24} color={getColor(colorScheme, 'outline')} />
            </TouchableOpacity>
          )}
          
          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <View style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 10,
              marginTop: getSpacing('xs'),
              borderRadius: 12,
              borderWidth: 1,
              backgroundColor: getColor(colorScheme, 'surface'),
              borderColor: getColor(colorScheme, 'outline'),
              shadowColor: getColor(colorScheme, 'text'),
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 5
            }}>
              {searchSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    paddingHorizontal: getSpacing('md'),
                    paddingVertical: getSpacing('md'),
                    borderBottomWidth: index === searchSuggestions.length - 1 ? 0 : 1,
                    borderBottomColor: getColor(colorScheme, 'outline'),
                    backgroundColor: 'transparent'
                  }}
                  onPress={() => handleSuggestionSelect(suggestion)}
                >
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <Ionicons name="location" size={16} color={getColor(colorScheme, 'primary')} />
                    <ThemedText style={{
                      marginLeft: getSpacing('sm'),
                      color: getColor(colorScheme, 'text')
                    }}>
                      {suggestion}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Filter Toggle Button */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: getSpacing('md')
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
              Filters {hasActiveFilters ? `(${[selectedCity, selectedCrop, selectedDateRange].filter(Boolean).length})` : ''}
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
                Clear All
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
                Location
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
                    All Cities
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
                      {city.name}
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
                Crop Type
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
                  {selectedCrop || 'Select Crop Type'}
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
                Date Range
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
                  {selectedDateRange ? 
                    selectedDateRange === 'today' ? 'Today' :
                    selectedDateRange === 'week' ? 'Last 7 Days' :
                    selectedDateRange === 'month' ? 'Last 30 Days' : 'All Time'
                    : 'Select Date Range'
                  }
                </ThemedText>
                <Ionicons name="chevron-down" size={20} color={getColor(colorScheme, 'outline')} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Content */}
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
              Loading crop prices...
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
                  {selectedCity ? cities.find(city => city._id === selectedCity)?.name : 'All Cities'} Market
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
                    {searchQuery ? finalFilteredSearchResults.length : finalFilteredPrices.length} Crops with Prices
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={{
                fontSize: 14,
                color: getColor(colorScheme, 'text')
              }}>
                Last updated: {new Date().toLocaleDateString()}
              </ThemedText>
            </View>

            {/* Search Results */}
            {searchQuery && finalFilteredSearchResults.length > 0 && (
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
                    Search Results for &#34; {searchQuery} &#34;
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
                      {finalFilteredSearchResults.length} Crops
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={{
                  fontSize: 14,
                  color: getColor(colorScheme, 'text')
                }}>
                  Last updated: {new Date().toLocaleDateString()}
                </ThemedText>
              </View>
            )}

            {/* Crop Prices List */}
            {(() => {
              const cropsToShow = searchQuery ? finalFilteredSearchResults : finalFilteredPrices;
              
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
                      {searchQuery 
                        ? 'No crops with prices found for this search'
                        : hasActiveFilters
                        ? 'No crops match your current filters'
                        : 'No crops with prices available in this city'
                      }
                    </ThemedText>
                    <ThemedText style={{
                      fontSize: 14,
                      textAlign: 'center',
                      color: getColor(colorScheme, 'outline'),
                      marginTop: getSpacing('sm')
                    }}>
                      {searchQuery 
                        ? 'Try searching for a different city or crop'
                        : hasActiveFilters
                        ? 'Try adjusting your filters or clear them to see all results'
                        : 'Try selecting a different city or check back later'
                      }
                    </ThemedText>
                  </View>
                );
              }

              return cropsToShow.map((crop) => (
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
                        {getCleanCropName(crop.crop)}
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
                          {crop.city}
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
                    const priceData = getKgPriceDisplay(crop.min_price, crop.max_price);
                    
                    if (!priceData.hasValidPrices) {
                      return (
                        <View style={{
                          paddingVertical: getSpacing('xl'),
                          alignItems: 'center',
                          backgroundColor: getColor(colorScheme, 'surface'),
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: getColor(colorScheme, 'outline'),
                          borderStyle: 'dashed'
                        }}>
                          <Ionicons name="alert-circle" size={32} color={getColor(colorScheme, 'outline')} />
                          <ThemedText style={{
                            marginTop: getSpacing('sm'),
                            fontSize: 16,
                            fontWeight: '600',
                            color: getColor(colorScheme, 'outline')
                          }}>
                            Price Not Available
                          </ThemedText>
                        </View>
                      );
                    }
                    
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
                          shadowColor: getColor(colorScheme, 'primary'),
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 3
                        }}>
                          <ThemedText style={{
                            fontSize: 12,
                            color: getColor(colorScheme, 'outline'),
                            marginBottom: getSpacing('xs'),
                            fontWeight: '600',
                            letterSpacing: 0.5
                          }}>
                            MIN PRICE
                          </ThemedText>
                          <ThemedText style={{
                            fontSize: 20,
                            fontWeight: '700',
                            color: getColor(colorScheme, 'primary'),
                            marginBottom: getSpacing('xs')
                          }}>
                            Rs. {priceData.minKg}
                          </ThemedText>
                          <ThemedText style={{
                            fontSize: 10,
                            color: getColor(colorScheme, 'outline'),
                            fontWeight: '600'
                          }}>
                            PER KG
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
                          shadowColor: getColor(colorScheme, 'primary'),
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 3
                        }}>
                          <ThemedText style={{
                            fontSize: 12,
                            color: getColor(colorScheme, 'outline'),
                            marginBottom: getSpacing('xs'),
                            fontWeight: '600',
                            letterSpacing: 0.5
                          }}>
                            MAX PRICE
                          </ThemedText>
                          <ThemedText style={{
                            fontSize: 20,
                            fontWeight: '700',
                            color: getColor(colorScheme, 'primary'),
                            marginBottom: getSpacing('xs')
                          }}>
                            Rs. {priceData.maxKg}
                          </ThemedText>
                          <ThemedText style={{
                            fontSize: 10,
                            color: getColor(colorScheme, 'outline'),
                            fontWeight: '600'
                          }}>
                            PER KG
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
                      Tap for details
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ));
            })()}

            {/* Loading indicator for search */}
            {searchLoading && (
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 40
              }}>
                <ActivityIndicator size="small" color={getColor(colorScheme, 'primary')} />
                <ThemedText style={{
                  marginTop: getSpacing('sm'),
                  fontSize: 14,
                  color: getColor(colorScheme, 'outline')
                }}>
                  Searching for prices...
                </ThemedText>
              </View>
            )}

            <View style={{ height: 80 }} />
          </>
        )}
      </View>

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
                Select Crop Type
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
                    {item || 'All Crops'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Date Range Selection Modal */}
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
            maxHeight: '50%',
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
                Select Date Range
              </ThemedText>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Ionicons name="close" size={24} color={getColor(colorScheme, 'text')} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[
                { value: '', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'Last 7 Days' },
                { value: 'month', label: 'Last 30 Days' }
              ]}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    paddingVertical: getSpacing('md'),
                    paddingHorizontal: getSpacing('md'),
                    borderBottomWidth: 1,
                    borderBottomColor: getColor(colorScheme, 'outline'),
                    backgroundColor: selectedDateRange === item.value ? getColor(colorScheme, 'primary') + '20' : 'transparent'
                  }}
                  onPress={() => {
                    setSelectedDateRange(item.value);
                    setShowDateModal(false);
                  }}
                >
                  <ThemedText style={{
                    fontSize: 16,
                    color: selectedDateRange === item.value ? getColor(colorScheme, 'primary') : getColor(colorScheme, 'text')
                  }}>
                    {item.label}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
