import React, { useState } from "react";
import { 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  View, 
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Speech from 'expo-speech';
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

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `I understand you're asking about "${inputText}". As a farming expert, I can help you with crop management, disease identification, market prices, and best practices. What specific information do you need?`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 2000);
  };

  const handleQuickAction = (action: string) => {
    const quickMessage: Message = {
      id: Date.now().toString(),
      text: action,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, quickMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `Great question about ${action}! Let me provide you with detailed information and recommendations.`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const speakText = (text: string) => {
    Speech.speak(text, {
      language: 'en',
      pitch: 1,
      rate: 0.9,
    });
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
      <View style={getHeaderStyle(colorScheme)}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: getSpacing('md')
        }}>
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: getColor(colorScheme, 'highlight'),
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: getSpacing('md')
          }}>
            <Ionicons name="chatbubble-ellipses" size={24} color={getColor(colorScheme, 'primary')} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={getTextStyle(colorScheme, 'title')}>
              AI Chat Assistant
            </ThemedText>
            <ThemedText style={{
              ...getTextStyle(colorScheme, 'body'),
              color: getColor(colorScheme, 'buttonText'),
              opacity: 0.9
            }}>
              Your personal farming expert
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={getSectionStyle(colorScheme)}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: getSpacing('md')
        }}>
          {[
            { icon: 'leaf', title: 'Disease Help', color: getColor(colorScheme, 'primary') },
            { icon: 'trending-up', title: 'Market Prices', color: getColor(colorScheme, 'secondary') },
            { icon: 'calendar', title: 'Farming Tips', color: getColor(colorScheme, 'accent') },
            { icon: 'help-circle', title: 'General Help', color: getColor(colorScheme, 'info') }
          ].map((action, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flex: 1,
                marginHorizontal: index === 1 || index === 2 ? getSpacing('xs') : 0,
                padding: getSpacing('sm'),
                borderRadius: 12,
                backgroundColor: getColor(colorScheme, 'surface'),
                borderWidth: 1,
                borderColor: getColor(colorScheme, 'outline'),
                alignItems: 'center'
              }}
              onPress={() => handleQuickAction(action.title)}
              activeOpacity={0.7}
            >
              <Ionicons name={action.icon as any} size={20} color={action.color} />
              <ThemedText style={{
                ...getTextStyle(colorScheme, 'small'),
                marginTop: getSpacing('xs'),
                color: getColor(colorScheme, 'text'),
                textAlign: 'center'
              }}>
                {action.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
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
              <ThemedText style={{
                ...getTextStyle(colorScheme, 'body'),
                color: message.isUser 
                  ? getColor(colorScheme, 'buttonText')
                  : getColor(colorScheme, 'text'),
                lineHeight: 20
              }}>
                {message.text}
              </ThemedText>
              
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
          
          <TouchableOpacity
            style={{
              ...getButtonStyle(colorScheme, 'primary'),
              width: 48,
              height: 48,
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
        
        <ThemedText style={{
          ...getTextStyle(colorScheme, 'small'),
          textAlign: 'center',
          marginTop: getSpacing('sm'),
          color: getColor(colorScheme, 'textTertiary')
        }}>
          Tap the voice icon to hear responses
        </ThemedText>
      </View>
    </KeyboardAvoidingView>
  );
}
