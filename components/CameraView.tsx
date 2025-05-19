import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 90 : 70;
const REQUIRED_HOLD_TIME = 1000; // 1 second hold time
const MAX_RECORDING_TIME = 60; // 60 seconds max recording time

interface VideoSegment {
  id: string;
  uri: string;
  duration: number;
}

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [recording, setRecording] = useState(false);
  const [holdTimer, setHoldTimer] = useState(0);
  const [showHoldPopup, setShowHoldPopup] = useState(false);
  const [remainingTime, setRemainingTime] = useState(MAX_RECORDING_TIME);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);

  const cameraRef = useRef<any>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    if (recording) {
      recordingTimerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [recording]);

  // Update remaining time whenever total duration changes
  useEffect(() => {
    setRemainingTime(MAX_RECORDING_TIME - totalDuration);
  }, [totalDuration]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      setRecording(true);
      const startTime = Date.now();
      console.log("📹 Recording STARTED", new Date().toISOString());
      try {
        const video = await cameraRef.current.recordAsync();
        console.log("📹 Video recorded successfully:", video);

        const endTime = Date.now();
        const segmentDuration = Math.round((endTime - startTime) / 1000);

        const newSegment: VideoSegment = {
          id: Date.now().toString(),
          uri: video.uri,
          duration: segmentDuration,
        };

        setSegments((prev) => [...prev, newSegment]);
        setTotalDuration((prev) => prev + segmentDuration);
      } catch (error) {
        console.error("❌ Error recording video:", error);
      } finally {
        setRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && recording) {
      console.log("📹 Recording STOPPED", new Date().toISOString());
      cameraRef.current.stopRecording();
      setRecording(false);
    }
  };

  const handlePressIn = () => {
    // Only allow recording if there's time left
    if (remainingTime <= 0) return;

    setShowHoldPopup(true);
    setHoldTimer(1);

    holdTimerRef.current = setTimeout(() => {
      setShowHoldPopup(false);
      startRecording();
    }, REQUIRED_HOLD_TIME);
  };

  const handlePressOut = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    setShowHoldPopup(false);

    if (recording) {
      stopRecording();
    }
  };

  const resetAllSegments = () => {
    setSegments([]);
    setTotalDuration(0);
    setRemainingTime(MAX_RECORDING_TIME);
  };

  const deleteSegment = (segmentId: string) => {
    const segmentToDelete = segments.find(
      (segment) => segment.id === segmentId
    );
    if (!segmentToDelete) return;

    setTotalDuration((prev) => prev - segmentToDelete.duration);
    setSegments((prev) => prev.filter((segment) => segment.id !== segmentId));
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="video"
      />

      {showHoldPopup && (
        <View style={styles.holdPopup}>
          <Text style={styles.holdPopupText}>Hold for {holdTimer}s</Text>
        </View>
      )}

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
      </View>

      {/* Segments Bar */}
      <View style={styles.segmentsBarContainer}>
        <View style={styles.segmentsProgressContainer}>
          {/* Total progress bar background */}
          <View style={styles.totalProgressBar}>
            {/* Dynamic progress visualization */}
            <View
              style={[
                styles.completedProgress,
                { width: `${(totalDuration / MAX_RECORDING_TIME) * 100}%` },
              ]}
            />
          </View>

          {/* Segment indicators - moved outside progress bar for better visibility */}
          <View style={styles.segmentIndicatorsContainer}>
            {segments.map((segment, index) => {
              // Calculate position based on segments that come before this one
              const previousDuration = segments
                .slice(0, index)
                .reduce((sum, seg) => sum + seg.duration, 0);

              const positionPercent =
                (previousDuration / MAX_RECORDING_TIME) * 100;

              return (
                <View
                  key={segment.id}
                  style={[
                    styles.segmentIndicator,
                    {
                      left: `${positionPercent}%`,
                    },
                  ]}
                >
                  <View style={styles.segmentLabelContainer}>
                    <Text style={styles.segmentNumber}>{index + 1}</Text>
                    <TouchableOpacity
                      style={styles.segmentDeleteButton}
                      onPress={() => deleteSegment(segment.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close-circle" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {segments.length > 0 && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetAllSegments}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={22} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={toggleCameraFacing}
        >
          <Ionicons name="camera-reverse" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.recordButton,
            remainingTime <= 0 && styles.disabledRecordButton,
          ]}
          onPressIn={remainingTime > 0 ? handlePressIn : undefined}
          onPressOut={remainingTime > 0 ? handlePressOut : undefined}
        >
          <View style={recording ? styles.recording : styles.notRecording} />
        </TouchableOpacity>

        <View style={styles.placeholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT + 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  holdPopup: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT + 120,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  holdPopupText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  timerContainer: {
    position: "absolute",
    top: "7%",
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
  },
  flipButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  recordButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  disabledRecordButton: {
    opacity: 0.5,
  },
  notRecording: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "red",
  },
  recording: {
    width: 30,
    height: 30,
    borderRadius: 3,
    backgroundColor: "red",
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  text: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  segmentsBarContainer: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT + 80,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  segmentsProgressContainer: {
    flex: 1,
    height: 50, // Increased height for better visibility
    justifyContent: "center",
  },
  totalProgressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  completedProgress: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    borderRadius: 4,
  },
  segmentIndicatorsContainer: {
    position: "absolute",
    top: -20,
    left: 0,
    right: 0,
    height: 50, // Increased height
    zIndex: 10, // Ensure indicators stay on top
  },
  segmentIndicator: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  segmentLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  segmentNumber: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 3,
  },
  segmentDeleteButton: {
    padding: 2,
  },
  resetButton: {
    backgroundColor: "rgba(255, 0, 0, 0.6)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    zIndex: 10, // Ensure button stays on top
  },
});
