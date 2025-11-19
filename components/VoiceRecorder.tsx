import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { 
  useAudioRecorder, 
  useAudioRecorderState,
  requestRecordingPermissionsAsync,
  AndroidOutputFormat, 
  AndroidAudioEncoder 
} from 'expo-audio';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getColor, getSpacing, getButtonStyle, getTextStyle } from '@/utils/styles';
import { API_ENDPOINTS } from '@/env';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  language?: string;
}

// Transcription function for Urdu and other languages
const transcribeAudio = async (audioUri: string, language: string = 'ur'): Promise<string> => {
  try {
    const formData = new FormData();
    
    // React Native FormData expects an object with uri, type, and name
    // This works for both web and native platforms
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    
    formData.append('language', language);

    const transcriptionUrl = `${API_ENDPOINTS.CHAT}/transcribe`;
    
    const response = await fetch(transcriptionUrl, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type - let the browser/native set it with boundary for multipart/form-data
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Transcription API error:', response.status, errorText);
      
      if (response.status === 404) {
        throw new Error('Transcription endpoint not found');
      }
      throw new Error(`Transcription failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    if (data.transcript) {
      return data.transcript;
    } else if (data.text) {
      return data.text;
    } else if (typeof data === 'string') {
      return data;
    } else {
      throw new Error('Unexpected response format from transcription API');
    }
  } catch (error) {
    console.error('Transcription error:', error);
    throw error; // Re-throw to let caller handle it
  }
};

export default function VoiceRecorder({ onTranscript, language = 'ur' }: VoiceRecorderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingDuration = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Use expo-audio recorder hook with proper string enum values
  // AndroidOutputFormat: 'default' | '3gp' | 'mpeg4' | 'amrnb' | 'amrwb' | 'aac_adts' | 'mpeg2ts' | 'webm'
  // AndroidAudioEncoder: 'default' | 'amr_nb' | 'amr_wb' | 'aac' | 'he_aac' | 'aac_eld'
  const recorder = useAudioRecorder({
    extension: '.m4a',
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    android: {
      extension: '.m4a',
      outputFormat: 'mpeg4' as AndroidOutputFormat,
      audioEncoder: 'aac' as AndroidAudioEncoder,
    },
    ios: {
      extension: '.m4a',
      outputFormat: 'mpeg4',
      audioQuality: 127,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 128000,
    },
  });
  
  // Get recording state from the recorder - updates every 500ms
  const recorderState = useAudioRecorderState(recorder, 500);
  const isRecording = recorder?.isRecording ?? false;
  
  // Track duration using an interval when recording
  useEffect(() => {
    if (isRecording) {
      // Start interval to update duration display
      const intervalId = setInterval(() => {
        if (recorder?.currentTime !== undefined) {
          recordingDuration.current = Math.floor(recorder.currentTime);
        } else {
          recordingDuration.current = recordingDuration.current + 1;
        }
      }, 1000);
      intervalRef.current = intervalId;
    } else {
      // Clear interval when not recording
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      recordingDuration.current = 0;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, recorder]);

  const handleStartRecording = async () => {
    try {
      // Check if recorder is available
      if (!recorder) {
        throw new Error('Recorder not available');
      }

      // Request permissions using expo-audio function
      const permissionResult = await requestRecordingPermissionsAsync();
      if (!permissionResult || !permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please grant microphone permission to use voice input.'
        );
        return;
      }

      // Prepare the recorder first
      await recorder.prepareToRecordAsync();
      
      // Then start recording
      recorder.record();
      recordingDuration.current = 0;
      
      console.log('Recording started, isRecording:', recorder.isRecording);
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      Alert.alert(
        'Recording Error', 
        error?.message || 'Failed to start recording. Please try again.'
      );
    }
  };

  const handleStopRecording = async () => {
    // Check if recording exists and recorder is available
    if (!isRecording || !recorder) {
      console.warn('No active recording to stop or recorder not available');
      return;
    }

    try {
      // Stop the recording
      await recorder.stop();
      console.log('Recording stopped, URI:', recorder.uri);
      
      // Wait for recording to finalize - wait a bit for URI to be available
      await new Promise(resolve => setTimeout(resolve, 800));
      
      try {
        // Get URI from recorder - it's a property, not a method
        const uri = recorder.uri;
        console.log('Final URI after stop:', uri);
        
        if (!uri || typeof uri !== 'string') {
          throw new Error('No recording URI available');
        }
        
        setIsProcessing(true);
        
        try {
          // Transcribe audio
          const transcript = await transcribeAudio(uri, language);
          
          if (transcript && transcript.trim()) {
            onTranscript(transcript.trim());
            setIsProcessing(false);
          } else {
            setIsProcessing(false);
            // Empty transcript - might be silence or unclear audio
            Alert.alert(
              'No Speech Detected',
              'We couldn\'t detect any speech in your recording. Please try again or type your message manually.',
              [
                { text: 'Try Again', style: 'cancel' },
                {
                  text: 'Type Manually',
                  style: 'default',
                  onPress: () => {
                    // User will type in the input field
                  },
                },
              ]
            );
          }
        } catch (error: any) {
          console.error('Transcription error:', error);
          setIsProcessing(false);
          
          // Show specific error messages
          let errorMessage = 'Voice transcription service is currently unavailable. Please type your message manually.';
          
          if (error?.message?.includes('404') || error?.message?.includes('not found')) {
            errorMessage = 'Transcription service is not configured. Please type your message manually.';
          } else if (error?.message?.includes('failed')) {
            errorMessage = 'Could not process your recording. Please try again or type your message manually.';
          }
          
          Alert.alert(
            'Transcription Error',
            errorMessage,
            [{ text: 'OK' }]
          );
        }
      } catch (uriError: any) {
        console.error('Failed to get recording URI:', uriError);
        setIsProcessing(false);
        
        // More specific error message
        let uriErrorMessage = 'Could not access the recording file. Please try recording again.';
        if (uriError?.message?.includes('extension')) {
          uriErrorMessage = 'Recording file format error. Please try recording again.';
        }
        
        Alert.alert(
          'Recording Error',
          uriErrorMessage,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Failed to stop recording:', error);
      setIsProcessing(false);
      
      const errorMsg = error?.message?.includes('extension') 
        ? 'Recording format error. Please try again.'
        : 'Failed to process recording. Please try again.';
      
      Alert.alert('Error', errorMsg);
    }
  };

  const handlePress = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={isProcessing}
        activeOpacity={0.8}
        style={{
          width: 35,
          height: 35,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isRecording
            ? getColor(colorScheme, 'error')
            : isProcessing
            ? getColor(colorScheme, 'primary')
            : getColor(colorScheme, 'primary'),
          shadowColor: getColor(colorScheme, 'shadow'),
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isRecording ? 0.4 : 0.2,
          shadowRadius: isRecording ? 8 : 4,
          elevation: isRecording ? 8 : 4,
          transform: [{ scale: isRecording ? 1.05 : 1 }],
          borderWidth: isRecording ? 2 : 0,
          borderColor: isRecording ? getColor(colorScheme, 'buttonText') : 'transparent',
        }}
      >
        {isProcessing ? (
          <ActivityIndicator 
            size="small" 
            color={getColor(colorScheme, 'buttonText')} 
          />
        ) : (
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={22}
            color={getColor(colorScheme, 'buttonText')}
          />
        )}
      </TouchableOpacity>

      {(isRecording || isProcessing) && (
        <View style={{ 
          marginTop: getSpacing('xs'), 
          alignItems: 'center',
          minHeight: 20,
          justifyContent: 'center'
        }}>
          <ThemedText style={{
            fontSize: 11,
            color: isRecording 
              ? getColor(colorScheme, 'error')
              : getColor(colorScheme, 'textSecondary'),
            fontWeight: isRecording ? '600' : '400'
          }}>
            {isProcessing
              ? 'Transcribing...'
              : `● ${formatDuration(recordingDuration.current)}`}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

