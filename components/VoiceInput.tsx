import React, {useRef, useState} from 'react';
import {ActivityIndicator, Alert, Modal, TouchableOpacity, View,} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {ThemedText} from './ThemedText';
import {useColorScheme} from '@/hooks/useColorScheme';
import {getColor, getSpacing} from '@/utils/styles';
import {useTranslation} from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import {Audio} from 'expo-av';
import {API_ENDPOINTS} from "@/env";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

/**
 * VoiceInput Component
 * Records audio from microphone and converts it to text using Cloud Speech-to-Text API
 */
export default function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const { t } = useTranslation();

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Request microphone permissions and set up audio
  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
      Alert.alert(
        t('chat.permissionDenied'),
        t('chat.micPermissionMessage')
      );
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      await setupAudio();

      setIsRecording(true);
      setIsProcessing(true);

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsProcessing(false);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      setIsProcessing(false);
      Alert.alert(
        t('common.error'),
        'Failed to start recording. Please try again.'
      );
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      setIsProcessing(true);

      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (unloadError) {
        console.warn('Recording already unloaded:', unloadError);
      }

      const uri = recordingRef.current.getURI();
      recordingRef.current = null; // Clear reference

      if (!uri) {
        throw new Error('No recording URI available');
      }

      // Convert audio to text using backend API
      await transcribeAudio(uri);

    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      setIsProcessing(false);
      recordingRef.current = null;

      Alert.alert(
        t('common.error'),
        'Failed to process recording. Please try again.'
      );
    }
  };

  const transcribeAudio = async (uri: string) => {
    try {
      setIsProcessing(true);

      const language = 'ur'; // Urdu language code for Whisper API

      console.log(`🎤 Transcribing audio using OpenAI Whisper API...`);
      console.log(`📍 Language: ${language}`);
      console.log(`📁 Audio URI: ${uri}`);

      try {
        // Fetch audio blob
        console.log('🔄 Fetching audio blob from URI...');
        const response = await fetch(uri);

        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.status}`);
        }

        console.log('✅ Audio blob fetched successfully');

        const blob = await response.blob();
        console.log(`📦 Blob size: ${blob.size} bytes`);
        console.log(`📦 Blob type: ${blob.type}`);

        // Create FormData
        const formData = new FormData();
        formData.append('audio', blob, 'recording.m4a');
        formData.append('language', language);

        console.log(`📤 Sending audio to: ${API_ENDPOINTS.TRANSCRIBE}`);
        console.log('📋 Form data prepared with audio and language');

        // Set timeout for fetch request (90 seconds for OpenAI API)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('⏱️ Request timeout after 90 seconds');
          controller.abort();
        }, 90000);

        console.log('⏳ Waiting for OpenAI Whisper API response...');

        let transcribeResponse;
        try {
          transcribeResponse = await fetch(API_ENDPOINTS.TRANSCRIBE, {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json',
              // Do NOT set Content-Type - browser will set it with correct multipart boundary
            },
            signal: controller.signal,
          });
        } catch (fetchErr: any) {
          clearTimeout(timeoutId);
          console.error('❌ Fetch error during request:', fetchErr);

          // Try alternative approach with JSON payload if multipart fails
          console.log('🔄 Trying alternative approach with base64 encoding...');

          // Read blob as base64
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const base64 = reader.result as string;
              resolve(base64.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          const base64Audio = await base64Promise;

          transcribeResponse = await fetch(API_ENDPOINTS.TRANSCRIBE, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
              },
              body: JSON.stringify({
                  audio_base64: base64Audio,
                  language: language,
                  filename: 'recording.m4a'
              }),
              signal: controller.signal,
          });
        }

        clearTimeout(timeoutId);

        console.log(`📊 API Response Status: ${transcribeResponse.status}`);
        console.log(`📊 Response Headers:`, {
          'content-type': transcribeResponse.headers.get('content-type'),
          'access-control-allow-origin': transcribeResponse.headers.get('access-control-allow-origin'),
        });

        // Try to get response text first for debugging
        const responseText = await transcribeResponse.text();
        console.log(`📊 Raw Response Text (first 500 chars): ${responseText.substring(0, 500)}`);

        if (!transcribeResponse.ok) {
          console.error(`❌ API Error (${transcribeResponse.status}): ${responseText}`);
          throw new Error(`API error: ${transcribeResponse.status}`);
        }

        // Parse JSON response
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Failed to parse JSON response:', parseError);
          console.error('Raw response was:', responseText);
          throw new Error('Invalid JSON response from API');
        }

        console.log(`📊 API Response (Parsed):`, result);

        // OpenAI Whisper API returns { transcript: "text" }
        // Backend wraps it as { transcript: "...", text: "..." }
        const transcribedText = result.transcript || result.text;

        if (transcribedText && transcribedText.trim()) {
          console.log(`✅ Transcription success! Text: "${transcribedText.substring(0, 50)}${transcribedText.length > 50 ? '...' : ''}"`);
          console.log(`✅ Full transcription length: ${transcribedText.length} characters`);

          // Callback to parent component with transcribed text
          onTranscript(transcribedText.trim());

          setIsProcessing(false);
          setIsRecording(false);
        } else {
          console.warn('⚠️ Empty transcript received from API');
          throw new Error('Transcription returned empty text');
        }

        // Clean up recording file
        try {
          await FileSystem.deleteAsync(uri, { idempotent: true });
          console.log('🧹 Recording file cleaned up');
        } catch (deleteError) {
          console.warn('⚠️ Could not delete recording file:', deleteError);
        }

      } catch (fetchError: any) {
        console.error('❌ Fetch/Network Error Details:', {
          message: fetchError.message,
          name: fetchError.name,
          code: fetchError.code,
        });

        let errorMessage = 'Connection failed.';

        if (fetchError.name === 'AbortError') {
          errorMessage = 'Request timeout. OpenAI API took too long to respond. Please try again.';
        } else if (fetchError.message?.includes('Network') || fetchError.message === 'Network request failed') {
          errorMessage = 'Network error. This might be a CORS issue or backend is unreachable. Please check if:\n1. Backend is running\n2. CORS is enabled\n3. Internet connection is active';
        } else if (fetchError.message?.includes('Failed to fetch')) {
          errorMessage = 'Cannot reach API server. Check if backend is running and CORS is enabled.';
        } else if (fetchError.message?.includes('JSON')) {
          errorMessage = 'Invalid response from API. Backend may not be returning correct format.';
        }

        console.error('Final error message:', errorMessage);
        throw new Error(errorMessage);
      }

    } catch (error: any) {
      console.error('❌ Transcription Error Summary:', {
        message: error.message,
        type: error.name,
      });

      setIsProcessing(false);
      setIsRecording(false);

      // Show error dialog with options
      const errorMessage = error.message || 'Voice transcription failed. Please try again.';

      Alert.alert(
        t('common.error'),
        errorMessage,
        [
          {
            text: t('prices.cancel'),
            onPress: () => {},
          },
          {
            text: 'Manual Entry',
            onPress: () => showManualTranscriptionModal(),
          },
          {
            text: 'Retry',
            onPress: () => {
              // User can try again - go back to recording
              setIsRecording(false);
            },
          },
        ]
      );
    }
  };

  const showManualTranscriptionModal = () => {
    // Create a simple fallback - let user manually enter the text
    Alert.prompt(
      t('chat.voiceInput'),
      'Transcription service unavailable. Please enter your message:',
      [
        {
          text: t('prices.cancel'),
          onPress: () => setIsRecording(false),
        },
        {
          text: t('prices.confirm'),
          onPress: (text) => {
            if (text?.trim()) {
              onTranscript(text.trim());
              setIsRecording(false);
            }
          },
        },
      ],
      'plain-text',
      ''
    );
  };

  const handleCancel = async () => {
    try {
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (error) {
          // Recording already unloaded, ignore this error
          console.log('Recording already unloaded',error);
        }
        recordingRef.current = null;
      }
      setIsRecording(false);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error canceling:', error);
      setIsRecording(false);
      setIsProcessing(false);
      recordingRef.current = null;
    }
  };

  return (
    <>
      <TouchableOpacity
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isRecording
            ? getColor(colorScheme, 'error')
            : getColor(colorScheme, 'secondary'),
          marginRight: getSpacing('xs'),
          opacity: disabled ? 0.5 : 1,
        }}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={disabled || isProcessing}
        activeOpacity={0.7}
      >
        {isProcessing ? (
          <ActivityIndicator
            size="small"
            color={getColor(colorScheme, 'buttonText')}
          />
        ) : (
          <Ionicons
            name={isRecording ? 'mic' : 'mic-outline'}
            size={20}
            color={getColor(colorScheme, 'buttonText')}
          />
        )}
      </TouchableOpacity>

      {/* Voice Recording Modal */}
      <Modal
        transparent
        visible={isRecording}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: getColor(colorScheme, 'surface'),
              borderRadius: 20,
              padding: getSpacing('lg'),
              alignItems: 'center',
              width: '85%',
            }}
          >
            {/* Animated Mic Icon */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: getColor(colorScheme, 'primary') + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: getSpacing('lg'),
              }}
            >
              <Ionicons
                name="mic"
                size={40}
                color={getColor(colorScheme, 'primary')}
              />
            </View>

            {/* Status Text */}
            <ThemedText
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: getColor(colorScheme, 'text'),
                marginBottom: getSpacing('md'),
                textAlign: 'center',
              }}
            >
              {isProcessing ? 'Processing...' : t('chat.listening')}
            </ThemedText>

            <ThemedText
              style={{
                fontSize: 14,
                color: getColor(colorScheme, 'textSecondary'),
                marginBottom: getSpacing('lg'),
                textAlign: 'center',
              }}
            >
              {isProcessing
                ? 'Converting speech to text...'
                : t('chat.tapToSpeak')}
            </ThemedText>

            {/* Stop Button */}
            <TouchableOpacity
              style={{
                backgroundColor: getColor(colorScheme, 'error'),
                paddingHorizontal: getSpacing('lg'),
                paddingVertical: getSpacing('md'),
                borderRadius: 24,
                marginBottom: getSpacing('md'),
              }}
              onPress={stopRecording}
              disabled={isProcessing}
              activeOpacity={0.7}
            >
              <ThemedText
                style={{
                  color: getColor(colorScheme, 'buttonText'),
                  fontWeight: '600',
                }}
              >
                {isProcessing ? 'Processing...' : 'Stop Recording'}
              </ThemedText>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={{
                paddingHorizontal: getSpacing('lg'),
                paddingVertical: getSpacing('sm'),
              }}
              onPress={handleCancel}
              disabled={isProcessing}
            >
              <ThemedText
                style={{
                  color: getColor(colorScheme, 'outline'),
                  fontWeight: '600',
                }}
              >
                {t('prices.cancel')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}










