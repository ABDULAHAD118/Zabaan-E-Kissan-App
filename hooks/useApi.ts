import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../env';

// Types
export type CropPrice = {
  _id: string;
  city: string;
  date: string;
  crop: string;
  min_price: string;
  max_price: string;
  fqp: string;
  quantity: string;
  scraped_at: string;
};

export type City = {
  _id: string;
  name: string;
};

// API Functions
const fetchCities = async (): Promise<City[]> => {
  const response = await fetch(API_ENDPOINTS.CITIES);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  if (data && data.status === 'success' && data.data && Array.isArray(data.data)) {
    // Convert the array of city names to the expected format
    return data.data.map((cityName: string, index: number) => ({
      _id: `city_${index}`,
      name: cityName
    }));
  } else {
    throw new Error('Invalid cities data format');
  }
};

const fetchPrices = async (cityId?: string): Promise<CropPrice[]> => {
  let url = API_ENDPOINTS.PRICES;
  if (cityId && cityId.trim() !== '') {
    // Find the city name by ID and use it in the query
    const cities = await fetchCities();
    const city = cities.find(c => c._id === cityId);
    if (city) {
      url += `?city=${encodeURIComponent(city.name)}`;
    }
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data && data.data && Array.isArray(data.data)) {
    return data.data;
  } else if (data && Array.isArray(data)) {
    return data;
  } else {
    throw new Error('Invalid prices data format');
  }
};

const searchPricesByCity = async (cityName: string): Promise<CropPrice[]> => {
  if (!cityName.trim()) {
    return [];
  }

  const url = `${API_ENDPOINTS.PRICES}?city=${encodeURIComponent(cityName)}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data && data.data && Array.isArray(data.data)) {
    return data.data;
  } else if (data && Array.isArray(data)) {
    return data;
  } else {
    return [];
  }
};

// Custom Hooks
export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: fetchCities,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const usePrices = (cityId?: string) => {
  return useQuery({
    queryKey: ['prices', cityId],
    queryFn: () => fetchPrices(cityId),
    enabled: true, // Always enabled to fetch all prices when no city is selected
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useSearchPrices = (searchQuery: string) => {
  return useQuery({
    queryKey: ['searchPrices', searchQuery],
    queryFn: () => searchPricesByCity(searchQuery),
    enabled: !!searchQuery.trim(),
    staleTime: 1000 * 60 * 2, // 2 minutes for search results
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Helper function to filter crops with actual prices
export const filterCropsWithPrices = (crops: CropPrice[]): CropPrice[] => {
  return crops.filter(crop => {
    // Show crops that have either min_price or max_price that's not "-"
    return crop.min_price !== '-' || crop.max_price !== '-';
  });
};
