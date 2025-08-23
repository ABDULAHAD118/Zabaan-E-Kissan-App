import React, { useState } from "react";
import { 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  View, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { 
  useCities, 
  usePrices, 
  useSearchPrices, 
  filterCropsWithPrices,
  type CropPrice,
  type City 
} from "@/hooks/useApi";
import {
  getContainerStyle,
  getHeaderStyle,
  getSectionStyle,
  getContentStyle,
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
  const colors = Colors[colorScheme];
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // TanStack Query hooks
  const { 
    data: cities = [], 
    isLoading: citiesLoading, 
    error: citiesError,
    refetch: refetchCities 
  } = useCities();

  const { 
    data: cropPrices = [], 
    isLoading: pricesLoading, 
    error: pricesError,
    refetch: refetchPrices 
  } = usePrices(selectedCity);

  const { 
    data: searchResults = [], 
    isLoading: searchLoading,
    refetch: refetchSearch 
  } = useSearchPrices(searchQuery);

  // Filter crops with prices only - but be less restrictive
  const filteredPrices = filterCropsWithPrices(cropPrices);
  const filteredSearchResults = filterCropsWithPrices(searchResults);

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
    
    // If search query is empty, show all prices
    if (!text.trim()) {
      setShowSuggestions(false);
      return;
    }

    // If search query is a city name, search by city
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

  // Handle crop item press - navigate to detail page
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

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
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

  // Set initial city when cities are loaded - but don't restrict to just one city initially
  React.useEffect(() => {
    if (cities.length > 0 && !selectedCity) {
      // Don't set a default city - show all cities' data initially
      setSelectedCity("");
    }
  }, [cities, selectedCity]);

  // Handle errors
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
    <View style={getContainerStyle(colorScheme)}>
      {/* Header */}
      <View style={getHeaderStyle(colorScheme)}>
        <ThemedText style={getTextStyle(colorScheme, 'title')}>
          Crop Prices
        </ThemedText>
        <ThemedText style={{
          ...getTextStyle(colorScheme, 'body'),
          textAlign: 'center',
          marginBottom: getSpacing('sm'),
          color: getColor(colorScheme, 'buttonText'),
          opacity: 0.9
        }}>
          Real-time market rates across Pakistan
        </ThemedText>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <MaterialIcons name="update" size={16} color={getColor(colorScheme, 'buttonText')} />
          <ThemedText style={{
            marginLeft: getSpacing('xs'),
            fontSize: 14,
            color: getColor(colorScheme, 'buttonText'),
            opacity: 0.9
          }}>
            Live data from official sources
          </ThemedText>
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

        {/* City Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: getSpacing('md') }}
        >
          {/* Show "All Cities" option first */}
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
          
          {/* Show individual cities */}
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

      {/* Content */}
      <ScrollView 
        style={getContentStyle(colorScheme)}
        refreshControl={
          <RefreshControl 
            refreshing={citiesLoading || pricesLoading || searchLoading}
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
                    {searchQuery ? filteredSearchResults.length : filteredPrices.length} Crops with Prices
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
            {searchQuery && filteredSearchResults.length > 0 && (
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
                    Search Results for "{searchQuery}"
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
                      {filteredSearchResults.length} Crops
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
              const cropsToShow = searchQuery ? filteredSearchResults : filteredPrices;
              
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
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: getSpacing('md')
                  }}>
                    <View style={{ flex: 1  }}>
                      <ThemedText style={{
                        fontSize: 18,
                        fontWeight: '600',
                        marginBottom: getSpacing('xs'),
                        color: getColor(colorScheme, 'text')
                      }}>
                        {getCleanCropName(crop.crop)}
                      </ThemedText>
                      <View style={{
                        flexDirection: 'column',
                        marginBottom: getSpacing('sm')
                      }}>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}>
                          
                        <Ionicons name="location" size={16} color={getColor(colorScheme, 'outline')} />
                        <ThemedText style={{
                          marginLeft: getSpacing('xs'),
                          color: getColor(colorScheme, 'text')
                        }}>
                          {crop.city}
                        </ThemedText>
                          </View>
                          <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'flex-start'
                        }}>
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          marginHorizontal: getSpacing('sm'),
                          backgroundColor: getColor(colorScheme, 'outline')
                        }} />
                        <ThemedText style={{
                          fontSize: 14,
                          color: getColor(colorScheme, 'outline')
                        }}>
                          {formatDate(crop.date)}
                        </ThemedText>
                        </View>
                      </View>
                    </View>
                    
                    <View style={{
                      paddingHorizontal: getSpacing('md'),
                      paddingVertical: getSpacing('sm'),
                      borderRadius: 12,
                      borderWidth: 1,
                      backgroundColor: colorScheme === 'dark' ? getColor(colorScheme, 'surfaceVariant') : getColor(colorScheme, 'surface'),
                      borderColor: getColor(colorScheme, 'primary')
                    }}>
                      <ThemedText style={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: getColor(colorScheme, 'primary')
                      }}>
                        {getPriceDisplay(crop.min_price, crop.max_price)}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Additional Info */}
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <MaterialIcons name="scale" size={16} color={getColor(colorScheme, 'outline')} />
                      <ThemedText style={{
                        marginLeft: getSpacing('xs'),
                        fontSize: 14,
                        color: getColor(colorScheme, 'text')
                      }}>
                        Qty: {crop.quantity !== '-' ? crop.quantity : 'N/A'}
                      </ThemedText>
                    </View>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <MaterialIcons name="trending-up" size={16} color={getColor(colorScheme, 'outline')} />
                      <ThemedText style={{
                        marginLeft: getSpacing('xs'),
                        fontSize: 14,
                        color: getColor(colorScheme, 'outline')
                      }}>
                        FQP: {crop.fqp !== '-' ? crop.fqp : 'N/A'}
                      </ThemedText>
                    </View>
                  </View>

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
      </ScrollView>
    </View>
  );
}
