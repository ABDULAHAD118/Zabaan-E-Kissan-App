import React, { useState, useRef, useEffect } from "react";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  Animated,
  ActivityIndicator,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useNavigation } from "@react-navigation/native";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";

// Using regular React Native components with Tailwind classes directly

type Message = {
  id: number;
  text: string;
  isUser: boolean;
};

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "مرحبا! کیا میں آپ کی مدد کر سکتا ہوں؟ (Hello! How can I help you?)",
      isUser: false,
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigation = useNavigation<DrawerNavigationProp<{}>>();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Add keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (inputText.trim() === "") return;

    // Add user message
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      isUser: true,
    };

    setMessages([...messages, newUserMessage]);
    setInputText("");
    setIsProcessing(true);

    // Simulate response (in a real app, this would be an API call)
    setTimeout(async () => {
      const botResponses = [
        "یہ ایک اچھا سوال ہے۔ (That's a good question.)",
        "میں آپ کی مدد کرنے کے لیے یہاں ہوں۔ (I'm here to help you.)",
        "کیا آپ مزید معلومات فراہم کر سکتے ہیں؟ (Can you provide more information?)",
        "میں آپ کے سوال پر کام کر رہا ہوں۔ (I'm working on your question.)",
        "یہ معلومات مفید ہو سکتی ہے۔ (This information might be helpful.)",
      ];

      const randomResponse =
        botResponses[Math.floor(Math.random() * botResponses.length)];

      const newBotMessage: Message = {
        id: messages.length + 2,
        text: randomResponse,
        isUser: false,
      };

      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
      setIsProcessing(false);

      // Speak the bot's response
      await speakText(randomResponse);
    }, 1500);
  };

  // Function to speak text using expo-speech
  const speakText = async (text: string) => {
    try {
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }

      // Use Urdu voice if available
      await Speech.speak(text, {
        language: "ur", // Urdu language code
        pitch: 1.0,
        rate: 0.9,
        onDone: () => console.log("Speech finished"),
        onError: (error) => console.log("Speech error:", error),
      });
    } catch (error) {
      console.log("Speech error:", error);
    }
  };

  // Function to handle voice recognition
  const toggleRecording = async () => {
    try {
      // Toggle recording state
      setIsRecording(!isRecording);

      if (!isRecording) {
        // Start recording - in a real app, this would use a voice recognition API
        // For now, we'll simulate with a timeout
        Keyboard.dismiss();

        // Speak a prompt to let the user know recording has started
        await speakText("Please speak now");
      } else {
        // Stop recording and process
        setIsProcessing(true);

        // In a real app, this would process the recorded audio
        // For now, we'll simulate with predefined texts
        setTimeout(() => {
          const voiceTexts = [
            "کیا آپ مجھے فصل کی قیمتوں کے بارے میں بتا سکتے ہیں؟",
            "میرے کھیت میں ٹماٹر کی فصل میں کیڑے لگ گئے ہیں",
            "گندم کی کاشت کا بہترین وقت کیا ہے؟",
          ];

          const recognizedText =
            voiceTexts[Math.floor(Math.random() * voiceTexts.length)];
          setInputText(recognizedText);
          setIsProcessing(false);
        }, 2000);
      }
    } catch (error) {
      console.log("Voice recognition error:", error);
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const openSettings = () => {
    router.push("/settings");
  };

  const openDrawer = () => {
    navigation.openDrawer();
  };

  return (
    <Animated.View
      className="flex-1 bg-white dark:bg-[#1B5E20]"
      style={{ opacity: fadeAnim }}
    >
      {/* Header with drawer toggle and settings */}
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#1B5E20", "#2E7D32"]
            : ["#4CAF50", "#2E7D32"]
        }
        className="pt-12 px-4 pb-4"
      >
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
            onPress={openDrawer}
            className="p-2 rounded-full bg-opacity-20 bg-white"
          >
            <Ionicons name="menu" size={24} color="green" />
          </TouchableOpacity>
          <ThemedText
            type="title"
            className="text-center text-2xl font-bold text-white"
          >
            Chat Assistant
          </ThemedText>

          <TouchableOpacity
            onPress={openSettings}
            className="p-2 rounded-full bg-opacity-20 bg-white"
          >
            <Ionicons name="settings-outline" size={22} color="green" />
          </TouchableOpacity>
        </View>

        <View className="bg-white bg-opacity-20 rounded-full px-4 py-2 mt-2">
          <ThemedText className="text-center text-white">
            Ask questions in Urdu or English
          </ThemedText>
        </View>
      </LinearGradient>

      {/* Chat messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: isKeyboardVisible ? 80 : 20 }}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            className={`mb-4 max-w-[80%] p-3 rounded-lg shadow-sm ${
              message.isUser
                ? "bg-primary-light dark:bg-primary-dark self-end rounded-tr-none"
                : "bg-gray-100 dark:bg-[#33691E] self-start rounded-tl-none"
            }`}
          >
            <ThemedText className={message.isUser ? "text-white" : ""}>
              {message.text}
            </ThemedText>
          </View>
        ))}

        {isProcessing && (
          <View className="self-start bg-gray-100 dark:bg-[#33691E] p-3 rounded-lg rounded-tl-none mb-4 max-w-[80%] flex-row items-center">
            <ActivityIndicator
              size="small"
              color={colorScheme === "dark" ? "#FFFFFF" : "#4CAF50"}
            />
            <ThemedText className="ml-2">Processing...</ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Input area */}
      <View className="p-4 border-t border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 bg-gray-100 dark:bg-[#33691E] rounded-full px-4 py-3 mr-2 shadow-sm"
            placeholder="Type your message..."
            placeholderTextColor={
              colorScheme === "dark" ? "#A1A1AA" : "#71717A"
            }
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            multiline={Platform.OS === "ios"}
            numberOfLines={1}
          />

          <TouchableOpacity
            className={`w-12 h-12 rounded-full items-center justify-center shadow-sm ${
              isRecording
                ? "bg-red-500"
                : "bg-primary-light dark:bg-primary-dark"
            }`}
            onPress={toggleRecording}
          >
            {isRecording ? (
              <MaterialIcons size={24} name="mic" color="white" />
            ) : (
              <FontAwesome size={22} name="microphone" color="white" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="w-12 h-12 rounded-full bg-primary-light dark:bg-primary-dark items-center justify-center ml-2 shadow-sm"
            onPress={sendMessage}
            disabled={inputText.trim() === ""}
          >
            <AntDesign size={22} name="arrowup" color="white" />
          </TouchableOpacity>
        </View>

        {isRecording && (
          <View className="mt-2 bg-red-100 dark:bg-red-900 p-2 rounded-lg items-center">
            <ThemedText className="text-red-500 dark:text-red-200">
              Recording... Tap mic to stop
            </ThemedText>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
