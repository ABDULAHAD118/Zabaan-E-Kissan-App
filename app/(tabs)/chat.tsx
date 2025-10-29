import React, { useState, useEffect, useRef } from "react";
import { 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  View, 
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Speech from 'expo-speech';
// import Markdown from 'react-native-markdown-display';
// Voice input simulation without expo-av dependency
import { sendChatMessage } from "@/hooks/useApi";

// Simple markdown renderer function
const renderMarkdown = (text: string, colorScheme: "light" | "dark") => {
  // Split text into lines and process each line
  const lines = text.split('\n');
  
  return (
    <View>
      {lines.map((line, index) => {
        if (line.trim() === '') {
          return <View key={index} style={{ height: 4 }} />;
        }
        
        // Headers
        if (line.startsWith('### ')) {
          return (
            <ThemedText key={index} style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 4,
              marginTop: 8,
              color: getColor(colorScheme, 'text'),
            }}>
              {line.substring(4)}
            </ThemedText>
          );
        } else if (line.startsWith('## ')) {
          return (
            <ThemedText key={index} style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 6,
              marginTop: 8,
              color: getColor(colorScheme, 'text'),
            }}>
              {line.substring(3)}
            </ThemedText>
          );
        } else if (line.startsWith('# ')) {
          return (
            <ThemedText key={index} style={{
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 8,
              marginTop: 8,
              color: getColor(colorScheme, 'text'),
            }}>
              {line.substring(2)}
            </ThemedText>
          );
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <View key={index} style={{ flexDirection: 'row', marginVertical: 2, paddingLeft: 8 }}>
              <ThemedText style={{ color: getColor(colorScheme, 'text'), marginRight: 8, fontSize: 16 }}>•</ThemedText>
              <ThemedText style={{
                fontSize: 16,
                color: getColor(colorScheme, 'text'),
                flex: 1,
                lineHeight: 22,
              }}>
                {line.substring(2)}
              </ThemedText>
            </View>
          );
        } else if (/^\d+\. /.test(line)) {
          const number = line.match(/^\d+/)?.[0] || '1';
          return (
            <View key={index} style={{ flexDirection: 'row', marginVertical: 2, paddingLeft: 8 }}>
              <ThemedText style={{ color: getColor(colorScheme, 'text'), marginRight: 8, fontSize: 16 }}>
                {number}.
              </ThemedText>
              <ThemedText style={{
                fontSize: 16,
                color: getColor(colorScheme, 'text'),
                flex: 1,
                lineHeight: 22,
              }}>
                {line.replace(/^\d+\. /, '')}
              </ThemedText>
            </View>
          );
        } else {
          // Regular text - handle bold formatting
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <ThemedText key={index} style={{
              fontSize: 16,
              color: getColor(colorScheme, 'text'),
              lineHeight: 22,
              marginVertical: 2,
            }}>
              {parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <ThemedText key={partIndex} style={{ fontWeight: 'bold' }}>
                      {part.slice(2, -2)}
                    </ThemedText>
                  );
                }
                return part;
              })}
            </ThemedText>
          );
        }
      })}
    </View>
  );
};
import {
  getContainerStyle,
  getHeaderStyle,
  getSectionStyle,
  getContentStyle,
  getCardStyle,
  getInputStyle,
  getButtonStyle,
  getTextStyle,
  getColor,
  getSpacing
} from "@/utils/styles";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI farming expert. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [voiceInput, setVoiceInput] = useState("");
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // Cleanup effect
  // useEffect(() => {
  //   return () => {
  //     if (recording) {
  //       recording.stopAndUnloadAsync();
  //     }
  //   };
  // }, [recording]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    setIsProcessing(true);

    try {
      const response = await sendChatMessage(currentInput,Math.random().toString(36).substring(2, 15));
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat API error:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsProcessing(false);
    }
  };


  const speakText = (text: string) => {
    try {
      // Detect if text contains Urdu/Arabic characters
      const hasUrdu = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
      
      // Stop any current speech first
      Speech.stop();
      
      // Use appropriate language settings
      const speechOptions = {
        language: hasUrdu ? 'ur' : 'en',
        pitch: 1.0,
        rate: 0.8,
        quality: 'default' as const,
      };
      
      Speech.speak(text, speechOptions);
    } catch (error) {
      console.error('Speech error:', error);
      Alert.alert('Speech Error', 'Unable to speak the text. Please try again.');
    }
  };

  const startRecording = async () => {
    try {
      // Simulate voice recording start
      setIsRecording(true);
      setIsHolding(true);
      setVoiceInput(""); // Clear previous input
      
      // Clear any existing timeout
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      
      // Auto-stop after 60 seconds if still holding
      // @ts-ignore
        recordingTimeoutRef.current = setTimeout(() => {
        if (isHolding) {
          stopRecording();
        }
      }, 60000);
      
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsHolding(false);
      
      // Clear timeout
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
      
      // Show prompt for user to enter their voice input
      Alert.prompt(
        '🎤 Voice Input Captured',
        'Please type what you said:',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Send',
            onPress: (text) => {
              if (text && text.trim()) {
                const voiceMessage = `🎤 Voice: "${text.trim()}"`;
                
                // Add user message
                const userMessage: Message = {
                  id: Date.now().toString(),
                  text: voiceMessage,
                  isUser: true,
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, userMessage]);
                
                // Send to API
                setIsProcessing(true);
                sendChatMessage(text.trim(), '123')
                  .then(response => {
                    const aiResponse: Message = {
                      id: (Date.now() + 1).toString(),
                      text: response.response,
                      isUser: false,
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, aiResponse]);
                  })
                  .catch(error => {
                    console.error('Chat API error:', error);
                    const errorResponse: Message = {
                      id: (Date.now() + 1).toString(),
                      text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
                      isUser: false,
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, errorResponse]);
                  })
                  .finally(() => {
                    setIsProcessing(false);
                  });
              }
            },
          },
        ],
        'plain-text',
        '', // Default text
        'default'
      );
      
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const handleVoicePressIn = () => {
    startRecording();
  };

  const handleVoicePressOut = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <KeyboardAvoidingView 
      style={getContainerStyle(colorScheme)}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[getHeaderStyle(colorScheme), { paddingVertical: getSpacing('sm'),marginBottom: getSpacing('sm') }]}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: getSpacing('sm')
        }}>
          <View style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: getColor(colorScheme, 'highlight'),
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: getSpacing('sm')
          }}>
            <Ionicons name="chatbubble-ellipses" size={18} color={getColor(colorScheme, 'primary')} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'title'),
              fontSize: 30,
              fontWeight: '600'
            }}>
              AI Chat Assistant
            </ThemedText>
          </View>
        </View>
      </View>


      {/* Messages */}
      <ScrollView 
        style={getContentStyle(colorScheme)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: getSpacing('lg') }}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={{
              marginBottom: getSpacing('md'),
              alignItems: message.isUser ? 'flex-end' : 'flex-start'
            }}
          >
            <View style={{
              maxWidth: '80%',
              padding: getSpacing('md'),
              borderRadius: 20,
              backgroundColor: message.isUser 
                ? getColor(colorScheme, 'primary')
                : getColor(colorScheme, 'surface'),
              borderWidth: 1,
              borderColor: message.isUser 
                ? getColor(colorScheme, 'primary')
                : getColor(colorScheme, 'outline'),
              shadowColor: getColor(colorScheme, 'shadow'),
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}>
              {message.isUser ? (
                <ThemedText style={{
                  ...getTextStyle(colorScheme, 'body'),
                  color: getColor(colorScheme, 'buttonText'),
                  lineHeight: 20
                }}>
                  {message.text}
                </ThemedText>
              ) : (
                renderMarkdown(message.text, colorScheme)
              )}
              
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: getSpacing('sm')
              }}>
                <ThemedText style={{
                  fontSize: 12,
                  color: message.isUser 
                    ? getColor(colorScheme, 'buttonText')
                    : getColor(colorScheme, 'textSecondary')
                }}>
                  {formatTime(message.timestamp)}
                </ThemedText>
                
                {!message.isUser && (
                  <TouchableOpacity
                    onPress={() => speakText(message.text)}
                    style={{
                      padding: getSpacing('xs'),
                      marginLeft: getSpacing('sm')
                    }}
                  >
                    <Ionicons 
                      name="volume-high" 
                      size={16} 
                      color={getColor(colorScheme, 'textSecondary')} 
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}

        {/* Processing Indicator */}
        {isProcessing && (
          <View style={{
            marginBottom: getSpacing('md'),
            alignItems: 'flex-start'
          }}>
            <View style={{
              padding: getSpacing('md'),
              borderRadius: 20,
              backgroundColor: getColor(colorScheme, 'surface'),
              borderWidth: 1,
              borderColor: getColor(colorScheme, 'outline'),
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <View style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: getColor(colorScheme, 'primary'),
                marginRight: getSpacing('sm')
              }} />
              <ThemedText style={{
                ...getTextStyle(colorScheme, 'caption'),
                color: getColor(colorScheme, 'textSecondary')
              }}>
                AI is thinking...
              </ThemedText>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Section */}
      <View style={{
        padding: getSpacing('md'),
        backgroundColor: getColor(colorScheme, 'background'),
        borderTopWidth: 1,
        borderTopColor: getColor(colorScheme, 'outline')
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <TextInput
            style={{
              flex: 1,
              alignItems: 'center',
              ...getInputStyle(colorScheme),
              marginRight: getSpacing('sm')
            }}
            placeholder="Ask me anything about farming..."
            placeholderTextColor={getColor(colorScheme, 'outline')}
            value={inputText}
            onChangeText={setInputText}
            
            multiline
            maxLength={500}
          />
          
          <Pressable
            style={({ pressed }) => ({
              ...getButtonStyle(colorScheme, isRecording ? 'secondary' : 'primary'),
              width: 35,
              height: 35,
              borderRadius: 24,
              padding: 0,
              marginRight: getSpacing('sm'),
              backgroundColor: isRecording 
                ? getColor(colorScheme, 'error') 
                : pressed 
                  ? getColor(colorScheme, 'primary')
                  : getColor(colorScheme, 'accent'),
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
            onPressIn={handleVoicePressIn}
            onPressOut={handleVoicePressOut}
            disabled={isProcessing}
          >
            <Ionicons 
              name={isRecording ? "stop" : "mic"} 
              size={20} 
              color={getColor(colorScheme, 'buttonText')} 
            />
          </Pressable>
          
          <TouchableOpacity
            style={{
              ...getButtonStyle(colorScheme, 'primary'),
              width: 35,
              height: 35,
              borderRadius: 24,
              padding: 0
            }}
            onPress={handleSend}
            disabled={!inputText.trim() || isProcessing}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={getColor(colorScheme, 'buttonText')} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
