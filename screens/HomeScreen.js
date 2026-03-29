import React from 'react';
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

export default function HomeScreen({ onSelect }) {
  return (
    <LinearGradient colors={['#e8f4f8', '#f0e8f5', '#e8f5ee']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Breathe Slow</Text>
          <Text style={styles.subtitle}>Choose a technique to begin</Text>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            For general wellness only. Consult a healthcare professional if you have a
            respiratory, cardiovascular, or other medical condition. Stop if you feel
            dizzy or unwell.
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {TECHNIQUES.map((technique) => (
            <TechniqueCard
              key={technique.id}
              technique={technique}
              onPress={onSelect}
            />
          ))}
          <View style={styles.footer} />
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
    paddingTop: 32,
    paddingBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    color: '#2a4a5e',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '300',
  },
  list: {
    paddingHorizontal: 20,
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
  footer: {
    height: 24,
  },
});
