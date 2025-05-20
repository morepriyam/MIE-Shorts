import { Image } from "expo-image";
import { Alert, Button, StyleSheet } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { usePermissions } from "expo-media-library";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";

export default function OnboardingScreen() {
  const [cameraPermission, setCameraPermission] = useCameraPermissions();
  const [microphonePermission, setMicrophonePermission] =
    useMicrophonePermissions();
  const [mediaLibraryPermission, setMediaLibraryPermission] = usePermissions();

  async function handleGrantPermissions() {
    const allPermissionsGranted = await requestAllPermissions();
    if (allPermissionsGranted) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("To continue, please grant all permissions");
    }
  }

  async function requestAllPermissions() {
    const cameraPermission = await setCameraPermission();
    if (!cameraPermission.granted) {
      Alert.alert("Error", "Camera permissions is required");
      return false;
    }
    const microphonePermission = await setMicrophonePermission();
    if (!microphonePermission.granted) {
      Alert.alert("Error", "Microphone permissions is required");
      return false;
    }

    const mediaLibraryPermission = await setMediaLibraryPermission();
    if (!mediaLibraryPermission.granted) {
      Alert.alert("Error", "Media library permissions is required");
      return false;
    }
    await AsyncStorage.setItem("hasOpened", "true");
    return true;
  }
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <SymbolView
          name="camera.aperture"
          size={250}
          type="hierarchical"
          tintColor={Colors.light.miePrmiary}
          animationSpec={{ effect: { type: "bounce" } }}
          fallback={
            <Image
              source={require("@/assets/images/partial-react-logo.png")}
              style={styles.reactLogo}
            />
          }
        /> //change this to logo for both andriod and ios
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">MIE Shorts!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText>
          Welcome friend! To provide the best experience, this app requires
          permissions for the following:
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Camera Permissions</ThemedText>
        <ThemedText>🎥 For taking pictures and videos</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Microphone Permissions</ThemedText>
        <ThemedText>🎙️ For taking videos with audio</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Media Library Permissions</ThemedText>
        <ThemedText>📸 To save/view your amazing shots </ThemedText>
      </ThemedView>
      <Button title="Grant Permissions" onPress={handleGrantPermissions} />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
