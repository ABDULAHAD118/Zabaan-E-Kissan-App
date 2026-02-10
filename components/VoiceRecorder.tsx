import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getColor, getSpacing } from '@/utils/styles';
import { useUrduSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

export default function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const recordingDuration = useRef(0); // Optional, can still show duration

  // Use the new hook
  const { recognizing, startListening, stopListening } = useUrduSpeechRecognition(onTranscript);

  const handlePress = () => {
    if (recognizing) {
      stopListening();
    } else {
      startListening();
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
        activeOpacity={0.8}
        style={{
          width: 35,
          height: 35,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: recognizing ? getColor(colorScheme, 'error') : getColor(colorScheme, 'primary'),
          shadowColor: getColor(colorScheme, 'shadow'),
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: recognizing ? 0.4 : 0.2,
          shadowRadius: recognizing ? 8 : 4,
          elevation: recognizing ? 8 : 4,
          transform: [{ scale: recognizing ? 1.05 : 1 }],
          borderWidth: recognizing ? 2 : 0,
          borderColor: recognizing ? getColor(colorScheme, 'buttonText') : 'transparent',
        }}
      >
        <Ionicons
          name={recognizing ? 'stop' : 'mic'}
          size={22}
          color={getColor(colorScheme, 'buttonText')}
        />
      </TouchableOpacity>

      <View style={{ marginTop: getSpacing('xs'), alignItems: 'center', minHeight: 20, justifyContent: 'center' }}>
        <ThemedText style={{
          fontSize: 11,
          color: recognizing ? getColor(colorScheme, 'error') : getColor(colorScheme, 'textSecondary'),
          fontWeight: recognizing ? '600' : '400'
        }}>
          {recognizing ? `● ${formatDuration(recordingDuration.current)}` : ''}
        </ThemedText>
      </View>
    </View>
  );
}
