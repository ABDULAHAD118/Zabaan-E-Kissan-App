import {useInfiniteQuery, useQuery, useQueryClient} from '@tanstack/react-query';
import axios from 'axios';
import {API_ENDPOINTS, ENV} from '@/env';

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

export type Crop = {
    _id: string;
    name: string;
};

// Chat API Types
export type ChatMessage = {
    query: string;
    language?: 'english' | 'urdu';
};

export type ChatResponse = {
    response: string;
    field_analysis: any | null;
};

export type ChatHistoryMessage = {
    type: 'HumanMessage' | 'AIMessage';
    content: string;
};

export type ChatHistory = {
    thread_id: string;
    message_count: number;
    messages: ChatHistoryMessage[];
};

export type TranscribeAudioPayload = {
    uri: string;
    language: 'en-US' | 'ur-PK';
};

export type TranscribeAudioResponse = {
    transcript?: string;
    text?: string;
};

// Disease Detection Types
export type DiseaseDetectionResponse = {
    predicted_class: string;
    confidence_percent: number;
    is_healthy: boolean;
    status: string;
    severity_range: string;
    description: string;
    description_ur: string;
    recommended_action: string;
    recommended_action_ur: string;
    confidence_level: string;
    top_3_predictions: {
        class_name: string;
        confidence: number;
    }[];
};

export type DiseaseScanResult = DiseaseDetectionResponse & {
    id: string;
    timestamp: string;
    imageUri: string;
};

export type DiseaseClassesResponse = {
    total: number;
    classes: string[];
};

// API Functions
export const fetchCities = async (): Promise<City[]> => {
    const response = await axios.get(API_ENDPOINTS.CITIES);
    const data = response.data;
    if (data && data.status === 'success' && data.data && Array.isArray(data.data)) {
        return data.data.map((cityName: string, index: number) => ({
            _id: `city_${index}`,
            name: cityName
        }));
    } else {
        throw new Error('Invalid cities data format');
    }
};

export const fetchCrops = async (): Promise<Crop[]> => {
    const response = await axios.get(API_ENDPOINTS.CROPS);
    const data = response.data;
    if (data && data.status === 'success' && data.data && Array.isArray(data.data)) {
        return data.data.map((cropName: string, index: number) => ({
            _id: `crop_${index}`,
            name: cropName
        }));
    } else {
        throw new Error('Invalid crops data format');
    }
};


export type PricesResponse = {
    data: CropPrice[];
    pagination: {
        page: number;
        limit: number;
        total_pages: number;
        total_records: number;
        returned_records: number;
        has_next: boolean;
        has_prev: boolean;
    };
};

export const fetchPrices = async (filters?: {
    city?: string;
    crop?: string;
    date?: string;
    page?: number;
    limit?: number;
}): Promise<PricesResponse> => {
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

    // Add pagination parameters
    if (filters?.page) {
        queryParams.append('page', filters.page.toString());
    }

    if (filters?.limit) {
        queryParams.append('limit', filters.limit.toString());
    }

    if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
    }
    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data && data.data && Array.isArray(data.data) && data.pagination) {
            return {
                data: data.data,
                pagination: data.pagination
            };
        } else {
            throw new Error('Invalid prices data format');
        }
    } catch (error) {
        // @ts-ignore
        console.error('Error fetching prices:', error.message || error);
        throw error;
    }
};

export const sendChatMessage = async (
    message: string,
    threadId: string = 'default-thread',
    language: 'english' | 'urdu' = 'english'
): Promise<ChatResponse> => {
    const response = await axios.post(`${API_ENDPOINTS.CHAT}/${threadId}`, {
        query: message,
        language,
    }, {
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        }
    });

    return response.data;
};

export const transcribeAudio = async ({uri, language}: TranscribeAudioPayload): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', {
        uri,
        type: 'audio/mp4',
        name: 'recording.m4a',
    } as any);
    formData.append('language', language);

    const response = await axios.post<TranscribeAudioResponse>(API_ENDPOINTS.TRANSCRIBE, formData, {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
        },
    });

    const transcribedText = response.data?.transcript || response.data?.text;
    if (!transcribedText?.trim()) {
        throw new Error('Empty transcription');
    }

    return transcribedText.trim();
};

// Streaming chat message function
export const sendChatMessageSocket = (
    message: string,
    threadId: string = "default-thread",
    language: 'english' | 'urdu' = 'english',
    onChunk: (chunk: string, fullText: string) => void,
    onComplete?: (fullText: string) => void,
    onError?: (error: Error) => void
) => {
    try {
        const ws = new WebSocket(`${ENV.SOCKET_URL}/chat/${threadId}`);

        let fullText = "";
        ws.onopen = () => {
            console.log("✅ WebSocket connected");
            ws.send(JSON.stringify({query: message, language}));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.response) {
                    fullText += data.response;
                    onChunk(data.response, fullText);
                }
                if (data.done) {
                    onComplete?.(fullText.trim());
                    ws.close();
                }

            } catch (err) {
                console.error("❌ JSON parse error:", err);
            }
        };

        ws.onerror = (error: any) => {
            console.error("⚠️ WebSocket error:", error.message || error);
            onError?.(new Error(error.message || "WebSocket error"));
            ws.close();
        };

        ws.onclose = () => {
            console.log("🔒 WebSocket closed");
        };
    } catch (error) {
        console.error("Streaming setup error:", error);
        onError?.(error as Error);
    }
};

export const useCities = () => {
    return useQuery({
        queryKey: ['cities'],
        queryFn: fetchCities,
        staleTime: 1000 * 60 * 30,

    });
};

export const useCrops = () => {
    return useQuery({
        queryKey: ['crops'],
        queryFn: fetchCrops,
        staleTime: 1000 * 60 * 30,
    });
};

export const usePrices = (filters?: {
    city?: string;
    crop?: string;
    date?: string;
    page?: number;
    limit?: number;
}) => {
    const queryClient = useQueryClient();

    // Check if we have active filters
    const hasFilters = filters?.city || filters?.crop || filters?.date;
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;

    return useQuery({
        queryKey: ['prices', filters || {}],
        queryFn: () => fetchPrices(filters),
        initialData: !hasFilters ? () => {
            const cachedData = queryClient.getQueryData(['prices', {page, limit}]);
            return cachedData as PricesResponse | undefined;
        } : undefined,
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        enabled: true,
    });
};

export const useInfinitePrices = (filters?: {
    city?: string;
    crop?: string;
    date?: string;
    limit?: number;
}) => {
    const limit = filters?.limit ?? 20;

    return useInfiniteQuery({
        queryKey: ['prices-infinite', filters || {}],
        queryFn: ({ pageParam }) => fetchPrices({
            ...filters,
            page: Number(pageParam) || 1,
            limit,
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (!lastPage.pagination.has_next) {
                return undefined;
            }
            return lastPage.pagination.page + 1;
        },
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60,
    });
};

// Disease Detection API Functions
export const detectDisease = async (imageUri: string): Promise<DiseaseDetectionResponse> => {
    const formData = new FormData();

    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'image.jpg';

    // Create file object for React Native
    const file = {
        uri: imageUri,
        type: 'image/jpeg',
        name: filename,
    } as any;

    formData.append('file', file);

    const response = await axios.post(API_ENDPOINTS.PREDICT, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const fetchDiseaseClasses = async (): Promise<DiseaseClassesResponse> => {
    const response = await axios.get(API_ENDPOINTS.CLASSES);
    return response.data;
};

export const useDiseaseClasses = () => {
    return useQuery({
        queryKey: ['diseaseClasses'],
        queryFn: fetchDiseaseClasses,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });
};

