import React, { useEffect, useState } from 'react';
import {ActivityIndicator, Alert, Linking, Modal, TouchableOpacity, View} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getColor, getSpacing } from '@/utils/styles';
import { useTranslation } from 'react-i18next';
import {
    useAudioRecorder,
    useAudioRecorderState,
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { API_ENDPOINTS } from "@/env";

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    disabled?: boolean;
}

export default function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const { t } = useTranslation();

    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);

    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        (async () => {
            const status = await AudioModule.requestRecordingPermissionsAsync();

            if (!status.granted) {
                Alert.alert(
                    t('chat.permissionDenied'),
                    t('chat.micPermissionMessage'),
                    [
                        { text: t('common.cancel'), style: 'cancel' },
                        { text: t('common.settings'), onPress: () => Linking.openSettings() },
                    ]
                );
            }

            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
            });
        })();
    }, []);

    const startRecording = async () => {
        try {
            setIsProcessing(true);

            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();

            setIsProcessing(false);
        } catch  {
            setIsProcessing(false);
            Alert.alert(t('common.error'), t('chat.failedToStartRecording'));
        }
    };
    const stopRecording = async () => {
        try {
            setIsProcessing(true);

            await audioRecorder.stop();

            const uri = audioRecorder.uri;
            if (!uri) throw new Error('No recording URI');

            await transcribeAudio(uri);
        } catch {
            setIsProcessing(false);
            Alert.alert(t('common.error'), t('chat.failedToStopRecording'));
        }
    };

    const transcribeAudio = async (uri: string) => {
        try {
            const formData = new FormData();
            const language = 'ur';

            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) throw new Error('Recording file not found');

            formData.append('audio', {
                uri,
                type: 'audio/mp4',
                name: 'recording.m4a',
            } as any);

            formData.append('language', language);

            const response = await fetch(API_ENDPOINTS.TRANSCRIBE, {
                method: 'POST',
                body: formData,
                headers: { Accept: 'application/json' },
            });

            const textResponse = await response.text();
            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const result = JSON.parse(textResponse);
            const transcribedText = result.transcript || result.text;

            if (transcribedText?.trim()) {
                onTranscript(transcribedText.trim());
            } else {
                throw new Error('Empty transcription');
            }
        } catch (error: any) {
            Alert.alert(
                t('common.error'),
                error.message || t('chat.voiceTranscriptionFailed')
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = async () => {
        try {
            if (recorderState.isRecording) {
                await audioRecorder.stop();
            }
            setIsProcessing(false);
        } catch {
            setIsProcessing(false);
        }
    };

    const isRecording = recorderState.isRecording;

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
                        : getColor(colorScheme, 'primary'),
                    marginRight: getSpacing('xs'),
                    opacity: disabled ? 0.5 : 1,
                }}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={disabled || isProcessing}
                activeOpacity={0.7}
            >
                {isProcessing ? (
                    <ActivityIndicator size="small" color={getColor(colorScheme, 'buttonText')} />
                ) : (
                    <Ionicons
                        name={isRecording ? 'mic' : 'mic-outline'}
                        size={20}
                        color={getColor(colorScheme, 'buttonText')}
                    />
                )}
            </TouchableOpacity>

            <Modal
                transparent
                visible={isRecording}
                animationType="fade"
                onRequestClose={handleCancel}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View style={{
                        backgroundColor: getColor(colorScheme, 'surface'),
                        borderRadius: 20,
                        padding: getSpacing('lg'),
                        alignItems: 'center',
                        width: '85%',
                    }}>
                        <Ionicons
                            name="mic"
                            size={40}
                            color={getColor(colorScheme, 'primary')}
                        />

                        <ThemedText style={{ marginVertical: 20 }}>
                            {isProcessing ? 'Processing...' : t('chat.listening')}
                        </ThemedText>

                        <TouchableOpacity
                            style={{
                                backgroundColor: getColor(colorScheme, 'error'),
                                paddingHorizontal: getSpacing('lg'),
                                paddingVertical: getSpacing('md'),
                                borderRadius: 24,
                            }}
                            onPress={stopRecording}
                            disabled={isProcessing}
                        >
                            <ThemedText style={{
                                color: getColor(colorScheme, 'buttonText'),
                                fontWeight: '600'
                            }}>
                                {t('chat.stopRecording')}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}