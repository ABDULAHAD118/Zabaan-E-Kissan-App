import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useState } from 'react';

export function useUrduSpeechRecognition(onTranscript: (text: string) => void) {
  const [recognizing, setRecognizing] = useState(false);

  // Listen to events
  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => setRecognizing(false));
  useSpeechRecognitionEvent('result', (event: any) => {
    const text = event.results[0]?.transcript || '';
    if (text) onTranscript(text);
  });
  useSpeechRecognitionEvent('error', (event: any) => {
    console.error('Speech recognition error:', event.error, event.message);
  });

  const startListening = async () => {
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      console.warn('Microphone / speech recognition permission denied');
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: 'ur-PK', // Urdu
      continuous: true,
      interimResults: true,
    });
  };

  const stopListening = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  return { recognizing, startListening, stopListening };
}
