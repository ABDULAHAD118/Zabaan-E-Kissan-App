import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiseaseScanResult } from '@/hooks/useApi';

const STORAGE_KEYS = {
    RECENT_SCANS: '@zabaan_recent_scans',
} as const;

const MAX_RECENT_SCANS = 3;

// Get recent scans from storage
export const getRecentScans = async (): Promise<DiseaseScanResult[]> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SCANS);
        if (data) {
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Error getting recent scans:', error);
        return [];
    }
};

// Save a new scan result
export const saveRecentScan = async (scan: DiseaseScanResult): Promise<void> => {
    try {
        const scans = await getRecentScans();

        // Add new scan at the beginning
        const updatedScans = [scan, ...scans];

        // Keep only the last MAX_RECENT_SCANS
        const trimmedScans = updatedScans.slice(0, MAX_RECENT_SCANS);

        await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SCANS, JSON.stringify(trimmedScans));
    } catch (error) {
        console.error('Error saving recent scan:', error);
        throw error;
    }
};

// Clear all recent scans
export const clearRecentScans = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_SCANS);
    } catch (error) {
        console.error('Error clearing recent scans:', error);
        throw error;
    }
};

// Clear all app cache
export const clearAllCache = async (): Promise<void> => {
    try {
        await AsyncStorage.clear();
    } catch (error) {
        console.error('Error clearing cache:', error);
        throw error;
    }
};

