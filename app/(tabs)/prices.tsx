import React, { useState } from "react";
import { Image } from "expo-image";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";

type CropPrice = {
  id: number;
  name: string;
  urduName: string;
  price: number;
  unit: string;
  trend: "up" | "down" | "stable";
};

type City = {
  id: number;
  name: string;
  urduName: string;
};

const cities: City[] = [
  { id: 1, name: "Lahore", urduName: "لاہور" },
  { id: 2, name: "Karachi", urduName: "کراچی" },
  { id: 3, name: "Islamabad", urduName: "اسلام آباد" },
  { id: 4, name: "Peshawar", urduName: "پشاور" },
  { id: 5, name: "Quetta", urduName: "کوئٹہ" },
];

const cropPrices: Record<number, CropPrice[]> = {
  1: [
    // Lahore
    {
      id: 1,
      name: "Wheat",
      urduName: "گندم",
      price: 1800,
      unit: "per 40kg",
      trend: "up",
    },
    {
      id: 2,
      name: "Rice",
      urduName: "چاول",
      price: 2500,
      unit: "per 40kg",
      trend: "stable",
    },
    {
      id: 3,
      name: "Cotton",
      urduName: "کپاس",
      price: 7200,
      unit: "per 40kg",
      trend: "down",
    },
    {
      id: 4,
      name: "Sugarcane",
      urduName: "گنا",
      price: 280,
      unit: "per 40kg",
      trend: "up",
    },
  ],
  2: [
    // Karachi
    {
      id: 1,
      name: "Wheat",
      urduName: "گندم",
      price: 1850,
      unit: "per 40kg",
      trend: "up",
    },
    {
      id: 2,
      name: "Rice",
      urduName: "چاول",
      price: 2600,
      unit: "per 40kg",
      trend: "up",
    },
    {
      id: 3,
      name: "Cotton",
      urduName: "کپاس",
      price: 7100,
      unit: "per 40kg",
      trend: "down",
    },
    {
      id: 4,
      name: "Sugarcane",
      urduName: "گنا",
      price: 270,
      unit: "per 40kg",
      trend: "stable",
    },
  ],
  3: [
    // Islamabad
    {
      id: 1,
      name: "Wheat",
      urduName: "گندم",
      price: 1820,
      unit: "per 40kg",
      trend: "stable",
    },
    {
      id: 2,
      name: "Rice",
      urduName: "چاول",
      price: 2550,
      unit: "per 40kg",
      trend: "up",
    },
    {
      id: 3,
      name: "Cotton",
      urduName: "کپاس",
      price: 7150,
      unit: "per 40kg",
      trend: "stable",
    },
    {
      id: 4,
      name: "Sugarcane",
      urduName: "گنا",
      price: 275,
      unit: "per 40kg",
      trend: "down",
    },
  ],
  4: [
    // Peshawar
    {
      id: 1,
      name: "Wheat",
      urduName: "گندم",
      price: 1780,
      unit: "per 40kg",
      trend: "down",
    },
    {
      id: 2,
      name: "Rice",
      urduName: "چاول",
      price: 2480,
      unit: "per 40kg",
      trend: "down",
    },
    {
      id: 3,
      name: "Cotton",
      urduName: "کپاس",
      price: 7050,
      unit: "per 40kg",
      trend: "down",
    },
    {
      id: 4,
      name: "Sugarcane",
      urduName: "گنا",
      price: 265,
      unit: "per 40kg",
      trend: "stable",
    },
  ],
  5: [
    // Quetta
    {
      id: 1,
      name: "Wheat",
      urduName: "گندم",
      price: 1750,
      unit: "per 40kg",
      trend: "down",
    },
    {
      id: 2,
      name: "Rice",
      urduName: "چاول",
      price: 2520,
      unit: "per 40kg",
      trend: "stable",
    },
    {
      id: 3,
      name: "Cotton",
      urduName: "کپاس",
      price: 7000,
      unit: "per 40kg",
      trend: "down",
    },
    {
      id: 4,
      name: "Sugarcane",
      urduName: "گنا",
      price: 260,
      unit: "per 40kg",
      trend: "down",
    },
  ],
};

export default function PricesScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const [selectedCity, setSelectedCity] = useState<number>(1); // Default to Lahore
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCrops = cropPrices[selectedCity].filter(
    (crop) =>
      crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.urduName.includes(searchQuery)
  );

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <IconSymbol size={16} name="arrow.up" color="#22C55E" />;
      case "down":
        return <IconSymbol size={16} name="arrow.down" color="#EF4444" />;
      case "stable":
        return <IconSymbol size={16} name="arrow.right" color="#F59E0B" />;
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#1B5E20]">
      <View className="pt-12 px-4 bg-primary-light dark:bg-primary-dark">
        <ThemedText
          type="title"
          className="text-center text-2xl font-bold mb-2"
        >
          Crop Prices
        </ThemedText>
        <ThemedText className="text-center mb-4">
          Current market rates by city
        </ThemedText>
      </View>

      <View className="px-4 py-3">
        <TextInput
          className="bg-gray-100 dark:bg-[#33691E] rounded-full px-4 py-2 mb-4"
          placeholder="Search crops..."
          placeholderTextColor={colorScheme === "dark" ? "#A1A1AA" : "#71717A"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {cities.map((city) => (
            <TouchableOpacity
              key={city.id}
              className={`mr-2 px-4 py-2 rounded-full ${
                selectedCity === city.id
                  ? "bg-primary-light dark:bg-primary-dark"
                  : "bg-gray-200 dark:bg-[#33691E]"
              }`}
              onPress={() => setSelectedCity(city.id)}
            >
              <ThemedText
                className={selectedCity === city.id ? "text-white" : ""}
              >
                {city.name} ({city.urduName})
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="bg-gray-100 dark:bg-[#33691E] rounded-lg p-3 mb-4">
          <ThemedText type="defaultSemiBold" className="text-center">
            {cities.find((city) => city.id === selectedCity)?.name} Market
            Prices
          </ThemedText>
          <ThemedText className="text-center text-gray-600 dark:text-gray-300">
            Last updated: Today
          </ThemedText>
        </View>

        {filteredCrops.map((crop) => (
          <View
            key={crop.id}
            className="bg-white dark:bg-[#33691E] p-4 rounded-lg mb-3 shadow-sm"
          >
            <View className="flex-row justify-between items-center">
              <View>
                <ThemedText type="defaultSemiBold">
                  {crop.name} ({crop.urduName})
                </ThemedText>
                <ThemedText className="text-gray-600 dark:text-gray-300">
                  {crop.unit}
                </ThemedText>
              </View>

              <View className="flex-row items-center">
                <ThemedText type="defaultSemiBold" className="mr-1">
                  Rs. {crop.price}
                </ThemedText>
                {getTrendIcon(crop.trend)}
              </View>
            </View>
          </View>
        ))}

        <View className="h-4" />
      </ScrollView>
    </View>
  );
}
