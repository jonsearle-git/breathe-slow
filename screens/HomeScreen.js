import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TECHNIQUES } from '../constants/techniques';
import { colors } from '../constants/colors';
import TechniqueCard from '../components/TechniqueCard';

export default function HomeScreen({ onSelect, scrollOffset }) {
  const scrollRef = useRef(null);

  // Restore scroll position after mount
  useEffect(() => {
    if (scrollOffset.current > 0 && scrollRef.current) {
      scrollRef.current.scrollTo({ y: scrollOffset.current, animated: false });
    }
  }, []);

  return (
    <LinearGradient colors={['#e8f4f8', '#f0e8f5', '#e8f5ee']} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Breathe Slow</Text>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            For educational and wellness purposes only — not medical advice, diagnosis, or treatment. Consult a healthcare professional before use if you have any medical condition. Stop immediately if you feel unwell.
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onScroll={(e) => { scrollOffset.current = e.nativeEvent.contentOffset.y; }}
          scrollEventThrottle={16}
          style={styles.scroll}
        >
          {TECHNIQUES.map((technique) => (
            <TechniqueCard
              key={technique.id}
              technique={technique}
              onPress={onSelect}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    color: '#2a4a5e',
    letterSpacing: 1,
  },
  scroll: {
    backgroundColor: 'transparent',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 14,
  },
  disclaimer: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    fontWeight: '300',
    textAlign: 'center',
  },
});
