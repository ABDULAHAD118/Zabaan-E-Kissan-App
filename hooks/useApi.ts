import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_ENDPOINTS } from '@/env';

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

// Chat API Types
export type ChatMessage = {
  query: string;
};

export type ChatResponse = {
  response: string;
  thread_id: string;
};

// API Functions
const fetchCities = async (): Promise<City[]> => {
  const response = await axios.get(API_ENDPOINTS.CITIES);
  const data = response.data;
  console.log(data);
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

const fetchPrices = async (filters?: {
  city?: string;
  crop?: string;
  date?: string;
}): Promise<CropPrice[]> => {
  let url = API_ENDPOINTS.PRICES;
  const queryParams = new URLSearchParams();
  
  if (filters?.city && filters.city.trim() !== '') {
    queryParams.append('city', filters.city);
  }
  
  if (filters?.crop && filters.crop.trim() !== '') {
    queryParams.append('crop', filters.crop);
  }
  
  if (filters?.date && filters.date.trim() !== '') {
    queryParams.append('date', filters.date);
  }
  
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }
  
  const response = await axios.get(url);
  const data = response.data;
  
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
  const response = await axios.get(url);
  const data = response.data;
  
  if (data && data.data && Array.isArray(data.data)) {
    return data.data;
  } else if (data && Array.isArray(data)) {
    return data;
  } else {
    return [];
  }
};

export const sendChatMessage = async (message: string, threadId: string = '123'): Promise<ChatResponse> => {
  const response = await axios.post(`${API_ENDPOINTS.CHAT}/${threadId}`, {
    query: message
  }, {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });
  
  return response.data;
};

// Custom Hooks
export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: fetchCities,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const usePrices = (filters?: {
  city?: string;
  crop?: string;
  date?: string;
}) => {
  return useQuery({
    queryKey: ['prices', filters],
    queryFn: () => fetchPrices(filters),
    enabled: true, // Always enabled to fetch prices
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

// Price conversion utilities
export const convertPrice = (price: string, fromUnit: '100kg' | '40kg' | '1kg', toUnit: '100kg' | '40kg' | '1kg'): string => {
  if (price === '-' || !price) return '-';
  
  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice)) return '-';
  
  // Convert to base unit (100kg)
  let basePrice: number;
  switch (fromUnit) {
    case '100kg':
      basePrice = numericPrice;
      break;
    case '40kg':
      basePrice = (numericPrice / 40) * 100;
      break;
    case '1kg':
      basePrice = numericPrice * 100;
      break;
    default:
      return price;
  }
  
  // Convert from base unit to target unit
  let convertedPrice: number;
  switch (toUnit) {
    case '100kg':
      convertedPrice = basePrice;
      break;
    case '40kg':
      convertedPrice = (basePrice / 100) * 40;
      break;
    case '1kg':
      convertedPrice = basePrice / 100;
      break;
    default:
      return price;
  }
  
  return convertedPrice.toFixed(2);
};

// Get price display in kg only - show only min/max
export const getKgPriceDisplay = (minPrice: string, maxPrice: string): {
  minKg: string;
  maxKg: string;
  hasValidPrices: boolean;
} => {
  if (minPrice === '-' && maxPrice === '-') {
    return {
      minKg: '-',
      maxKg: '-',
      hasValidPrices: false
    };
  }
  
  const minKg = minPrice === '-' ? '-' : convertPrice(minPrice, '100kg', '1kg');
  const maxKg = maxPrice === '-' ? '-' : convertPrice(maxPrice, '100kg', '1kg');
  
  return {
    minKg,
    maxKg,
    hasValidPrices: minKg !== '-' || maxKg !== '-'
  };
};
