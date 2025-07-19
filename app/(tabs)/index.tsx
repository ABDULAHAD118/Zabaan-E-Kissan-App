import { Image } from "expo-image";
import { ScrollView, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function DiseaseDetectionScreen() {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <View className="flex-1 bg-white dark:bg-[#1B5E20]">
      <View className="pt-12 px-4 bg-primary-light dark:bg-primary-dark">
        <ThemedText
          type="title"
          className="text-white text-center text-2xl font-bold mb-2"
        >
          Disease Detection
        </ThemedText>
        <ThemedText className="text-center mb-4">
          Upload an image to detect plant diseases
        </ThemedText>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="items-center justify-center py-8 bg-gray-100 dark:bg-[#33691E] rounded-xl mb-4">
          <View className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center mb-4">
            <Image
              source={require("@/assets/images/partial-react-logo.png")}
              style={{ width: 60, height: 60 }}
              contentFit="contain"
            />
          </View>
          <TouchableOpacity className="bg-primary-light dark:bg-primary-dark py-3 px-6 rounded-full">
            <ThemedText className="text-white font-semibold">
              Upload Image
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText type="subtitle" className="mb-2 font-semibold">
          Recent Scans
        </ThemedText>

        <View className="mb-4">
          {[1, 2, 3].map((item) => (
            <View
              key={item}
              className="bg-white dark:bg-[#33691E] p-4 rounded-lg mb-3 shadow-sm"
            >
              <ThemedText type="defaultSemiBold">Scan #{item}</ThemedText>
              <ThemedText className="text-gray-600 dark:text-gray-300">
                No disease detected
              </ThemedText>
            </View>
          ))}
        </View>

        <ThemedText type="subtitle" className="mb-2 font-semibold">
          Common Plant Diseases
        </ThemedText>

        <View className="mb-8">
          {["Leaf Blight", "Powdery Mildew", "Rust"].map((disease) => (
            <View
              key={disease}
              className="bg-white dark:bg-[#33691E] p-4 rounded-lg mb-3 shadow-sm"
            >
              <ThemedText type="defaultSemiBold">{disease}</ThemedText>
              <ThemedText className="text-gray-600 dark:text-gray-300">
                Tap to learn more
              </ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
