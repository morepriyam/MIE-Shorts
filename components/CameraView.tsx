import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 90 : 70;
const REQUIRED_HOLD_TIME = 1000; // 1 second hold time

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [recording, setRecording] = useState(false);
  const [holdTimer, setHoldTimer] = useState(0);
  const [showHoldPopup, setShowHoldPopup] = useState(false);
  const cameraRef = useRef<any>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      setRecording(true);
      console.log('📹 Recording STARTED', new Date().toISOString());
      try {
        const video = await cameraRef.current.recordAsync();
        console.log('📹 Video recorded successfully:', video);
      } catch (error) {
        console.error('❌ Error recording video:', error);
      } finally {
        setRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && recording) {
      console.log('📹 Recording STOPPED', new Date().toISOString());
      cameraRef.current.stopRecording();
      setRecording(false);
    }
  };

  const handlePressIn = () => {
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
          <Text style={styles.holdPopupText}>
            Hold for {holdTimer}s
          </Text>
        </View>
      )}
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={toggleCameraFacing}
        >
          <Ionicons name="camera-reverse" size={30} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.recordButton}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
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
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT + 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  holdPopup: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT + 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  holdPopupText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  flipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  recordButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  notRecording: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'red',
  },
  recording: {
    width: 30,
    height: 30,
    borderRadius: 3,
    backgroundColor: 'red',
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
}); 