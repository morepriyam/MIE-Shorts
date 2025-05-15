import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function TabBarBackground() {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = colorScheme === 'dark' 
    ? 'rgba(21, 23, 24, 0.9)'
    : 'rgba(255, 255, 255, 0.9)';

  return (
    <View 
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor }
      ]} 
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
} 