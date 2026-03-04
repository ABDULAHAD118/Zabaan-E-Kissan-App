import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { fetchPrices, fetchCities, fetchCrops } from './useApi';
import { queryClient } from '@/providers/QueryProvider';

const PRICES_CACHE_KEY = 'prices_cache';
const PRICES_CACHE_TIMESTAMP_KEY = 'prices_cache_timestamp';
const INITIAL_PRICES_PAGE = 1;
const INITIAL_PRICES_LIMIT = 20;

SplashScreen.preventAutoHideAsync().catch(() => {
});

export const useAppInitialization = () => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                await fetchAndCacheInitialData(queryClient);
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error('❌ Error initializing app:', error);
            } finally {
                setIsReady(true);
                await SplashScreen.hideAsync();
            }
        };

        initializeApp();
    }, []);

    return isReady;
};

export const fetchAndCacheInitialData = async (queryClient: any) => {
    try {
        const pricesData = await fetchPrices({
            page: INITIAL_PRICES_PAGE,
            limit: INITIAL_PRICES_LIMIT,
        });
        const citiesData = await fetchCities();
        const cropsData = await fetchCrops();
        const now = Date.now();
        await AsyncStorage.setItem(PRICES_CACHE_KEY, JSON.stringify(pricesData));
        await AsyncStorage.setItem(PRICES_CACHE_TIMESTAMP_KEY, now.toString());
        queryClient.setQueryData(
            ['prices', { page: INITIAL_PRICES_PAGE, limit: INITIAL_PRICES_LIMIT }],
            pricesData
        );
        queryClient.setQueryData(['cities'], citiesData);
        queryClient.setQueryData(['crops'], cropsData);
    } catch (error) {
        console.error('❌ Error during app initialization:', error);
        try {
            const cachedPrices = await AsyncStorage.getItem(PRICES_CACHE_KEY);
            if (cachedPrices) {
                const parsedData = JSON.parse(cachedPrices);
                queryClient.setQueryData(
                  ['prices', { page: INITIAL_PRICES_PAGE, limit: INITIAL_PRICES_LIMIT }],
                  parsedData
                );
            }
        } catch (fallbackError) {
            console.error('Error loading fallback cache:', fallbackError);
        }
    }
};