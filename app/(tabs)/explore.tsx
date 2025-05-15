import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useState } from 'react';
import { Dimensions, FlatList, StatusBar, StyleSheet, View, ViewToken } from 'react-native';

import ShortVideo from '@/components/ShortVideo';

interface Short {
  id: string;
  title: string;
  username: string;
}

const DUMMY_SHORTS: Short[] = [
  { id: '1', title: 'First Short', username: '@user1' },
  { id: '2', title: 'Second Short', username: '@user2' },
  { id: '3', title: 'Third Short', username: '@user3' },
  { id: '4', title: 'Fourth Short', username: '@user4' },
  { id: '5', title: 'Fifth Short', username: '@user5' },
];

export default function FeedScreen() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const { height } = Dimensions.get('window');
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // Ensure status bar is visible with appropriate style
  StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');

  const handleViewableItemsChanged = ({ viewableItems }: {
    viewableItems: ViewToken[]
  }) => {
    if (viewableItems.length > 0) {
      setActiveVideoIndex(Number(viewableItems[0].index));
    }
  };

  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDark ? '#000' : '#f5f5f5' }
    ]}>
      <FlatList
        data={DUMMY_SHORTS}
        renderItem={({ item, index }) => (
          <ShortVideo 
            item={item} 
            isActive={index === activeVideoIndex}
          />
        )}
        keyExtractor={item => item.id}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
