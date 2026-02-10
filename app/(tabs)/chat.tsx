import React, { useState, useEffect, useRef } from "react";
import { 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  View, 
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import {FontAwesome5, Ionicons} from "@expo/vector-icons";
import * as Speech from 'expo-speech';
import {sendChatMessage, fetchChatHistory, sendChatMessageSocket} from "@/hooks/useApi";
import LocationPicker from "@/components/LocationPicker";
// import VoiceRecorder from "@/components/VoiceRecorder";
import { generateUUID } from "@/utils/uuid";
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
   const [hasPermission, setHasPermission] = useState(false);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');

  const [threadId] = useState(() => {
    const uuid = generateUUID();
    console.log('Generated 36-character thread UUID:', uuid);
    return uuid;
  });

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await fetchChatHistory(threadId);
        if (history.messages && history.messages.length > 0) {
          // Convert history messages to our Message format
          const loadedMessages: Message[] = history.messages
            .filter(msg => msg.type === 'HumanMessage' || msg.type === 'AIMessage')
            .map((msg, index) => ({
              id: `history-${index}`,
              text: msg.content,
              isUser: msg.type === 'HumanMessage',
              timestamp: new Date() // You might want to parse actual timestamps from API
            }));
          
          // Only set if we have messages (don't override the welcome message if empty)
          if (loadedMessages.length > 0) {
            setMessages(loadedMessages);
          }
        }
      } catch (error) {
        // Silently fail - history might not exist for new threads
        console.log('No chat history found or error loading:', error);
      }
    };

    loadHistory();
  }, [threadId]);

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

  
  // Location state
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");
  
  // Streaming state
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const handleSend = async (useStreaming: boolean = true) => {
      if (!inputText.trim()) return;

      let queryText = inputText.trim();
      if (locationEnabled && latitude !== null && longitude !== null) {
          queryText = `${queryText} ${latitude} ${longitude}`;
      }

      const userMessage: Message = {
          id: Date.now().toString(),
          text: inputText.trim(),
          isUser: true,
          timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      const aiMessageId = (Date.now() + 1).toString();
      setStreamingMessageId(aiMessageId);

      setMessages((prev) => [
          ...prev,
          { id: aiMessageId, text: "", isUser: false, timestamp: new Date() },
      ]);

      setInputText("");
      setIsProcessing(true);

      try {
          if (useStreaming) {
              sendChatMessageSocket(
                  queryText,
                  threadId,
                  (chunk, fullText) => {
                      setMessages((prev) =>
                          prev.map((msg) =>
                              msg.id === aiMessageId ? { ...msg, text: fullText } : msg
                          )
                      );
                  },
                  (fullText) => {
                      setMessages((prev) =>
                          prev.map((msg) =>
                              msg.id === aiMessageId ? { ...msg, text: fullText } : msg
                          )
                      );
                      setIsProcessing(false);
                      setStreamingMessageId(null);
                  },
                  (error) => {
                      console.error("Streaming error:", error);
                      setIsProcessing(false);
                      setStreamingMessageId(null);
                      setMessages((prev) =>
                          prev.map((msg) =>
                              msg.id === aiMessageId
                                  ? {
                                      ...msg,
                                      text:
                                          "Sorry, I'm having trouble connecting to the server. Please try again later.",
                                  }
                                  : msg
                          )
                      );
                  }
              );
          } else {
              // Fallback normal API
              const response = await sendChatMessage(queryText, threadId);
              setMessages((prev) =>
                  prev.map((msg) =>
                      msg.id === aiMessageId
                          ? { ...msg, text: response.response }
                          : msg
                  )
              );
              setIsProcessing(false);
              setStreamingMessageId(null);
          }
      } catch (error) {
          console.error("Chat API error:", error);
          setMessages((prev) =>
              prev.map((msg) =>
                  msg.id === aiMessageId
                      ? {
                          ...msg,
                          text:
                              "Sorry, I'm having trouble connecting to the server. Please try again later.",
                      }
                      : msg
              )
          );
          setIsProcessing(false);
          setStreamingMessageId(null);
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
          <TouchableOpacity
            onPress={() => setShowLocationPicker(true)}
            style={{
              padding: getSpacing('xs'),
              borderRadius: 8,
              backgroundColor: locationEnabled 
                ? getColor(colorScheme, 'success') 
                : 'transparent',
              borderWidth: 1,
              borderColor: locationEnabled 
                ? getColor(colorScheme, 'success')
                : getColor(colorScheme, 'outline'),
            }}
          >
            <Ionicons 
              name={locationEnabled ? "location" : "location-outline"} 
              size={20} 
              color={getColor(colorScheme, 'buttonText')}
            />
          </TouchableOpacity>
        </View>
        {locationEnabled && latitude !== null && longitude !== null && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: getSpacing('xs'),
            paddingHorizontal: getSpacing('sm'),
            paddingVertical: getSpacing('xs'),
            backgroundColor: getColor(colorScheme, 'surface'),
            borderRadius: 8,
          }}>
            <FontAwesome5 name="map-marker-alt" size={14} color={getColor(colorScheme, 'primary')} />
            <ThemedText style={{
              fontSize: 12,
              color: getColor(colorScheme, 'textSecondary'),
              marginLeft: getSpacing('xs'),
              flex: 1
            }}>
              {locationAddress || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`}
            </ThemedText>
            <TouchableOpacity
              onPress={() => {
                setLocationEnabled(false);
                setLatitude(null);
                setLongitude(null);
                setLocationAddress("");
              }}
              style={{ marginLeft: 'auto', padding: 4 }}
            >
              <Ionicons name="close-circle" size={16} color={getColor(colorScheme, 'error')} />
            </TouchableOpacity>
          </View>
        )}
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
                <ThemedText>
                  {message.text}
                </ThemedText>
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
            placeholder="Ask anything about farming..."
            placeholderTextColor={getColor(colorScheme, 'outline')}
            value={inputText}
            onChangeText={setInputText}
            
            multiline
            maxLength={500}
          />

          <View style={{
            marginRight: getSpacing('sm'),
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* <VoiceRecorder
              onTranscript={(text) => {
                setInputText(text);
              }}
            /> */}
          </View>

          <TouchableOpacity
            style={{
                alignItems: 'center' as const,
                justifyContent: 'center' as const,
              width: 35,
              height: 35,
              borderRadius: 24,
                backgroundColor:getColor(colorScheme,'primary')
            }}
            onPress={() => handleSend(true)}
            disabled={!inputText.trim() || isProcessing}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="send" 
              size={18}
              color={getColor(colorScheme, 'buttonText')} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Picker */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={(lat, lng, address) => {
          setLatitude(lat);
          setLongitude(lng);
          setLocationAddress(address || '');
          setLocationEnabled(true);
          setShowLocationPicker(false);
        }}
        initialLocation={latitude !== null && longitude !== null ? {
          latitude,
          longitude
        } : undefined}
      />

    </KeyboardAvoidingView>
  );
}
