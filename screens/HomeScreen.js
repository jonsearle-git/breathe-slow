import { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';
import { TECHNIQUES } from '../constants/techniques';
import { colors } from '../constants/colors';
import { REWARDED_AD_UNIT_ID } from '../constants/ads';
import TechniqueCard from '../components/TechniqueCard';

const ad = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
  requestNonPersonalizedAdsOnly: false,
  immersiveModeEnabled: true,
});

export default function HomeScreen({ onSelect, scrollOffset }) {
  const scrollRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const pendingShow = useRef(false);

  useEffect(() => {
    if (scrollOffset.current > 0 && scrollRef.current) {
      scrollRef.current.scrollTo({ y: scrollOffset.current, animated: false });
    }
  }, []);

  useEffect(() => {
    const onLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setAdLoaded(true);
      if (pendingShow.current) {
        pendingShow.current = false;
        ad.show();
      }
    });
    const onEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {});
    const onClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      ad.load();
    });
    const onError = ad.addAdEventListener(AdEventType.ERROR, () => {
      setAdLoaded(false);
      setTimeout(() => ad.load(), 5000);
    });
    ad.load();

    return () => {
      onLoaded();
      onEarned();
      onClosed();
      onError();
    };
  }, []);

  const handleSupport = useCallback(() => {
    if (adLoaded) {
      ad.show();
    } else {
      pendingShow.current = true;
    }
  }, [adLoaded]);

  return (
    <LinearGradient colors={['#e8f4f8', '#f0e8f5', '#e8f5ee']} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.appIconWrapper}>
            <Image source={require('../assets/icon.png')} style={styles.appIcon} />
          </View>
          <TouchableOpacity onPress={handleSupport} style={styles.supportBtn} activeOpacity={0.7}>
            <Text style={styles.supportText}>{"Enjoying the app?\nWatch an advert\nto support it"}</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  appIconWrapper: {
    alignSelf: 'stretch',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  appIcon: {
    width: '100%',
    height: '100%',
  },
  supportBtn: {
    flex: 1,
    marginLeft: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: '#5ba3c9',
    justifyContent: 'center',
  },
  supportText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    letterSpacing: 0.3,
    textAlign: 'center',
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
