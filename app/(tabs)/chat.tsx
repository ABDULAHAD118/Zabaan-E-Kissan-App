import React, {useEffect, useRef, useState} from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import {ThemedText} from "@/components/ThemedText";
import {useColorScheme} from "@/hooks/useColorScheme";
import {FontAwesome5, Ionicons} from "@expo/vector-icons";
import * as Speech from 'expo-speech';
import {sendChatMessage, sendChatMessageSocket} from "@/hooks/useApi";
import LocationPicker from "@/components/LocationPicker";
import VoiceInput from "@/components/VoiceInput";
import {useTranslation} from "react-i18next";
import {generateUUID} from "@/utils/uuid";
import {
    getColor,
    getContainerStyle,
    getContentStyle,
    getHeaderStyle,
    getSpacing,
    getTextStyle
} from "@/utils/styles";


interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export default function ChatScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const {t} = useTranslation();

    const [threadId] = useState(() => {
        return generateUUID();
    });

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: t('chat.welcomeMessage'),
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [locationAddress, setLocationAddress] = useState<string>("");
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
    const [preparingMessageId, setPreparingMessageId] = useState<string | null>(null);
    const [dotCount, setDotCount] = useState(1);

    useEffect(() => {
        if (!isProcessing) return;

        const interval = setInterval(() => {
            setDotCount(prev => (prev % 6) + 1);
        }, 500);

        return () => clearInterval(interval);
    }, [isProcessing]);
    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({animated: true});
        }
    }, [messages]);

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

        setMessages((prev) => [
            ...prev,
            {id: aiMessageId, text: "", isUser: false, timestamp: new Date()},
        ]);

        setInputText("");
        setIsProcessing(true);

        try {
            if (useStreaming) {
                sendChatMessageSocket(
                    queryText,
                    threadId,
                    (_, fullText) => {
                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg.id === aiMessageId ? {...msg, text: fullText} : msg
                            )
                        );
                    },
                    (fullText) => {
                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg.id === aiMessageId ? {...msg, text: fullText} : msg
                            )
                        );
                        setIsProcessing(false);
                    },
                    (error) => {
                        console.error("Streaming error:", error);
                        setIsProcessing(false);
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
                const response = await sendChatMessage(queryText, threadId);
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === aiMessageId
                            ? {...msg, text: response.response}
                            : msg
                    )
                );
                setIsProcessing(false);
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
        }
    };

    const speakText = async (text: string, messageId: string) => {
        try {
            if (speakingMessageId === messageId) {
                await Speech.stop();
                setSpeakingMessageId(null);
                setPreparingMessageId(null);
                return;
            }
            if (preparingMessageId === messageId) {
                return;
            }

            setPreparingMessageId(messageId);
            await Speech.stop();

            const hasUrdu = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);

            setPreparingMessageId(null);
            setSpeakingMessageId(messageId);
            Speech.speak(text, {
                voice: 'ur-In-language',
                language: hasUrdu ? 'ur-PK' : 'en-US',
                pitch: 1,
                rate: 1,
                onStart: () => {
                    setPreparingMessageId(null);
                    setSpeakingMessageId(messageId);
                },
                onDone: () => {
                    setPreparingMessageId(null);
                    setSpeakingMessageId(null);
                },
                onStopped: () => {
                    setPreparingMessageId(null);
                    setSpeakingMessageId(null);
                },
                onError: () => {
                    setPreparingMessageId(null);
                    setSpeakingMessageId(null);
                },
            });
        } catch (error) {
            console.error('Speech error:', error);
            setPreparingMessageId(null);
            setSpeakingMessageId(null);
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
            style={[getContainerStyle(colorScheme), {flex: 1}]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
            {/* Header */}
            <View style={[getHeaderStyle(colorScheme), {
                paddingVertical: getSpacing('sm'),
                marginBottom: getSpacing('sm')
            }]}>
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
                        <Ionicons name="chatbubble-ellipses" size={18} color={getColor(colorScheme, 'primary')}/>
                    </View>
                    <View style={{flex: 1}}>
                        <ThemedText style={{
                            ...getTextStyle(colorScheme, 'title'),
                            fontSize: 30,
                            fontWeight: '600'
                        }}>
                            {t('chat.title')}
                        </ThemedText>
                    </View>

                    <TouchableOpacity
                        onPress={() => setShowLocationPicker(true)}
                        style={{
                            padding: getSpacing('sm'),
                            borderRadius: 30,
                            backgroundColor: getColor(colorScheme, 'highlight'),
                        }}
                    >
                        <Ionicons
                            name={locationEnabled ? "location" : "location-outline"}
                            size={20}
                            color={getColor(colorScheme, 'primary')}
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
                        <FontAwesome5 name="map-marker-alt" size={14} color={getColor(colorScheme, 'primary')}/>
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
                            style={{marginLeft: 'auto', padding: 4}}
                        >
                            <Ionicons name="close-circle" size={16} color={getColor(colorScheme, 'error')}/>
                        </TouchableOpacity>
                    </View>
                )}
            </View>


            {/* Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={getContentStyle()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingVertical: getSpacing('md'), paddingBottom: getSpacing('lg')}}
            >
                {messages.map((message) => (
                    <View
                        key={message.id}
                        style={{
                            marginBottom: getSpacing('md'),
                            flexDirection: 'row',
                            justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                            paddingHorizontal: getSpacing('sm'),
                        }}
                    >
                        {/* Bubble */}
                        <View
                            style={{
                                maxWidth: '75%',
                                minWidth: '30%',
                                backgroundColor: message.isUser
                                    ? getColor(colorScheme, 'primary')
                                    : getColor(colorScheme, 'highlight'),
                                paddingVertical: getSpacing('sm'),
                                paddingHorizontal: getSpacing('md'),
                                borderWidth: 1,
                                borderColor: getColor(colorScheme, 'border'),
                                borderRadius: 20,
                                borderTopLeftRadius: message.isUser ? 20 : 4,
                                borderTopRightRadius: message.isUser ? 4 : 20,

                            }}
                        >
                            {/* Message Text / Dots */}
                            {message.isUser ? (
                                <ThemedText
                                    style={{
                                        ...getTextStyle(colorScheme, 'body'),
                                        color: getColor(colorScheme, 'buttonText'),
                                        lineHeight: 22,
                                    }}
                                >
                                    {message.text}
                                </ThemedText>
                            ) : (
                                <ThemedText
                                    style={{
                                        ...getTextStyle(colorScheme, 'body'),
                                        color: getColor(colorScheme, 'primary'),
                                        lineHeight: 22,
                                    }}
                                >
                                    {message.text
                                        ? message.text
                                        : isProcessing &&
                                        message.id === messages[messages.length - 1].id && (
                                            <>
                                                <ThemedText style={{fontWeight: '600'}}>Thinking </ThemedText>
                                                <ThemedText
                                                    style={{fontSize: 18, fontWeight: 'bold', letterSpacing: 2}}>
                                                    {"•".repeat(dotCount)}
                                                </ThemedText>
                                            </>
                                        )}
                                </ThemedText>
                            )}

                            {/* Time + Volume Icon */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    marginTop: getSpacing('xs'),
                                }}
                            >
                                <ThemedText
                                    style={{
                                        fontSize: 11,
                                        color: message.isUser
                                            ? getColor(colorScheme, 'buttonText')
                                            : getColor(colorScheme, 'textSecondary'),
                                        marginRight: getSpacing('xs'),
                                    }}
                                >
                                    {formatTime(message.timestamp)}
                                </ThemedText>

                                {!message.isUser && message.text && (
                                    <TouchableOpacity
                                        onPress={() => speakText(message.text, message.id)}
                                        style={{padding: getSpacing('xs')}}
                                        disabled={preparingMessageId === message.id}
                                    >
                                        {preparingMessageId === message.id ? (
                                            <ActivityIndicator size="small" color={getColor(colorScheme, 'primary')}/>
                                        ) : (
                                            <Ionicons
                                                name={speakingMessageId === message.id ? "stop-circle" : "volume-high"}
                                                size={18}
                                                color={
                                                    speakingMessageId === message.id
                                                        ? getColor(colorScheme, 'error')
                                                        : getColor(colorScheme, 'primary')
                                                }
                                            />
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Input Section */}
            <View style={{
                padding: getSpacing('md'),
                backgroundColor: getColor(colorScheme, 'background'),
                borderTopWidth: 1,
                borderTopColor: getColor(colorScheme, 'inputBorder')
            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <TextInput
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            backgroundColor: getColor(colorScheme, 'highlight'),
                            marginRight: getSpacing('sm'),
                            borderRadius: 10,
                            paddingHorizontal: 15
                        }}
                        placeholder={t('chat.inputPlaceholder')}
                        placeholderTextColor={getColor(colorScheme, 'outline')}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        numberOfLines={4}
                        autoFocus={true}
                        autoCorrect={false}
                        autoCapitalize="sentences"
                        maxLength={500}
                    />

                    <View style={{
                        marginRight: getSpacing('sm'),
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <VoiceInput
                            onTranscript={(text) => {
                                setInputText(text);
                            }}
                            disabled={isProcessing}
                        />
                    </View>

                    <TouchableOpacity
                        style={{
                            alignItems: 'center' as const,
                            justifyContent: 'center' as const,
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: getColor(colorScheme, 'primary')
                        }}
                        onPress={() => handleSend(true)}
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
