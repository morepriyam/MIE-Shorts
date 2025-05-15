import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AntDesign, Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = colorScheme === 'dark' 
    ? 'rgba(21, 23, 24, 0.8)'
    : 'rgba(255, 255, 255, 0.8)';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            height: 80,
            paddingBottom: 20,
            backgroundColor: backgroundColor,
            borderTopWidth: 0,
          },
          android: {
            position: "absolute",
            height: 60, 
            backgroundColor: backgroundColor,
            borderTopWidth: 0,
          },
          default: {
            position: "absolute",
            backgroundColor: backgroundColor,
            borderTopWidth: 0,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Record",
          tabBarIcon: ({ color }) => (
            <AntDesign size={28} name="videocamera" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Shorts",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="play-circle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
