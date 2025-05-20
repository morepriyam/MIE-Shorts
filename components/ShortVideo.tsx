import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ShortVideoProps {
  item: {
    id: string;
    title: string;
    username: string;
  };
  isActive?: boolean;
}

const { height } = Dimensions.get("window");
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 90 : 70;

export default function ShortVideo({
  item,
  isActive = false,
}: ShortVideoProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  if (isActive) {
    StatusBar.setBarStyle("light-content");
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000" : "#f5f5f5" },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.videoContainer,
          { backgroundColor: isDark ? "#222" : "#e0e0e0" },
        ]}
        activeOpacity={0.9}
      >
        <Text
          style={[
            styles.videoPlaceholder,
            { color: isDark ? "white" : Colors.light.text },
          ]}
        >
          {item.title}
        </Text>
        {!isActive && (
          <View
            style={[
              styles.playButtonOverlay,
              {
                backgroundColor: isDark
                  ? "rgba(0,0,0,0.3)"
                  : "rgba(0,0,0,0.15)",
              },
            ]}
          >
            <Ionicons
              name="play"
              size={50}
              color={isDark ? "white" : Colors.light.text}
            />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text
          style={[
            styles.username,
            { color: isDark ? "white" : Colors.light.text },
          ]}
        >
          {item.username}
        </Text>
        <Text
          style={[
            styles.title,
            { color: isDark ? "white" : Colors.light.text },
          ]}
        >
          {item.title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: height,
    position: "relative",
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlaceholder: {
    fontSize: 24,
    fontWeight: "bold",
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT + 10,
    left: 10,
    right: 10,
    padding: 10,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
  },
});
