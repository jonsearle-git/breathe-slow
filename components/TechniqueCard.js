import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { alpha, colors } from '../constants/colors';

function TechniqueCard({ technique, onPress }) {
  const handlePress = useCallback(() => onPress(technique), [onPress, technique]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <LinearGradient
        colors={technique.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardText}>
            <Text style={styles.cardName}>{technique.name}</Text>
            <Text style={styles.cardSubtitle}>{technique.subtitle}</Text>
            <Text style={styles.cardDescription}>
              {technique.description}
            </Text>
          </View>
          <View style={[styles.arrowCircle, { backgroundColor: alpha(technique.accentColor, 0.13) }]}>
            <Text style={[styles.arrow, { color: technique.accentColor }]}>›</Text>
          </View>
        </View>

      </LinearGradient>
    </TouchableOpacity>
  );
}

export default React.memo(TechniqueCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    marginRight: 12,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '400',
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    fontWeight: '300',
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 26,
    lineHeight: 30,
    marginLeft: 2,
  },
});
