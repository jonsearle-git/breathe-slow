import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { alpha } from '../../constants/colors';

const CIRCLE_MIN  = 90;
const CIRCLE_MAX  = 220;
const CIRCLE_OUTER = 220;
const NOSTRIL_DOT = 16;

export default function AlternateNostrilAnimation({ technique, status, phase, phaseIndex, sessionKey }) {
  const accent = technique.accentColor;

  const scale        = useRef(new Animated.Value(CIRCLE_MIN)).current;
  const opacity      = useRef(new Animated.Value(0.6)).current;
  const borderRadius = useRef(Animated.divide(scale, 2)).current;
  const pulse        = useRef(new Animated.Value(1)).current;

  const leftOpacity  = useRef(new Animated.Value(0.25)).current;
  const rightOpacity = useRef(new Animated.Value(0.25)).current;

  const activeAnim = useRef(null);

  const stopAnim = () => {
    if (activeAnim.current) { activeAnim.current.stop(); activeAnim.current = null; }
  };

  useEffect(() => () => stopAnim(), []);

  // Idle — gentle pulse
  useEffect(() => {
    if (status !== 'idle') return;
    stopAnim();
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulse, { toValue: 1,    duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    activeAnim.current = anim;
    anim.start();
  }, [status]);

  // Phase animation
  useEffect(() => {
    if (status !== 'running') return;
    stopAnim();

    if (phaseIndex === 0) {
      scale.setValue(CIRCLE_MIN);
      opacity.setValue(0.6);
      leftOpacity.setValue(0.25);
      rightOpacity.setValue(0.25);
    }

    const duration = (phase?.duration ?? 4) * 1000;
    const type    = phase?.type ?? '';
    const nostril = phase?.nostril;

    const tL = nostril === 'left'  ? 1.0 : nostril === 'right' ? 0.12 : 0.25;
    const tR = nostril === 'right' ? 1.0 : nostril === 'left'  ? 0.12 : 0.25;

    // Nostril dot transitions are short and native-driver — run independently
    Animated.parallel([
      Animated.timing(leftOpacity,  { toValue: tL, duration: 300, useNativeDriver: true }),
      Animated.timing(rightOpacity, { toValue: tR, duration: 300, useNativeDriver: true }),
    ]).start();

    if (type === 'hold') return () => stopAnim();

    const sizeTarget    = type === 'inhale' ? CIRCLE_MAX : CIRCLE_MIN;
    const opacityTarget = type === 'inhale' ? 1 : 0.55;

    const anim = Animated.parallel([
      Animated.timing(scale,   { toValue: sizeTarget,    duration, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
      Animated.timing(opacity, { toValue: opacityTarget, duration, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
    ]);
    activeAnim.current = anim;
    anim.start();

    return () => stopAnim();
  }, [phaseIndex, status, sessionKey]);

  // Done
  useEffect(() => {
    if (status !== 'done') return;
    stopAnim();
    Animated.parallel([
      Animated.timing(scale,        { toValue: CIRCLE_MIN, duration: 600, useNativeDriver: false }),
      Animated.timing(opacity,      { toValue: 0.6,        duration: 600, useNativeDriver: false }),
      Animated.timing(leftOpacity,  { toValue: 0.25,       duration: 600, useNativeDriver: true }),
      Animated.timing(rightOpacity, { toValue: 0.25,       duration: 600, useNativeDriver: true }),
    ]).start();
  }, [status]);

  const nostril = phase?.nostril;
  const label   = status === 'running' ? (phase?.label ?? '') : '';
  const isBoth  = !nostril || nostril === 'both';

  return (
    <View style={styles.container}>
      {/* Circle */}
      <View style={styles.circleArea}>
        {status === 'idle' ? (
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <View style={[styles.outerRing, { borderColor: alpha(accent, 0.25) }]}>
              <View style={[styles.innerCircle, { backgroundColor: alpha(accent, 0.3) }]} />
            </View>
          </Animated.View>
        ) : (
          <>
            <View style={[styles.outerRing, { borderColor: alpha(accent, 0.3) }]} />
            <Animated.View
              style={[styles.mainCircle, { width: scale, height: scale, borderRadius, backgroundColor: accent, opacity }]}
            />
          </>
        )}
      </View>

      {/* Nostril indicators with grouped labels */}
      {isBoth ? (
        <View style={styles.holdContainer}>
          <Text style={[styles.actionLabel, { color: accent }]}>{label}</Text>
          <View style={styles.nostrilRow}>
            <Animated.View style={[styles.nostrilGroupLeft, { opacity: leftOpacity }]}>
              <View style={[styles.nostrilDot, { backgroundColor: accent }]} />
              <Text style={[styles.nostrilLabel, { color: accent }]}>Left</Text>
            </Animated.View>
            <Animated.View style={[styles.nostrilGroupRight, { opacity: rightOpacity }]}>
              <View style={[styles.nostrilDot, { backgroundColor: accent }]} />
              <Text style={[styles.nostrilLabel, { color: accent }]}>Right</Text>
            </Animated.View>
          </View>
        </View>
      ) : (
        <View style={styles.sidesRow}>
          <Animated.View style={[styles.nostrilGroupLeft, { opacity: leftOpacity }]}>
            <Text style={[styles.actionLabel, { color: accent }]}>{nostril === 'left' ? label : ' '}</Text>
            <View style={[styles.nostrilDot, { backgroundColor: accent }]} />
            <Text style={[styles.nostrilLabel, { color: accent }]}>Left</Text>
          </Animated.View>
          <Animated.View style={[styles.nostrilGroupRight, { opacity: rightOpacity }]}>
            <Text style={[styles.actionLabel, { color: accent }]}>{nostril === 'right' ? label : ' '}</Text>
            <View style={[styles.nostrilDot, { backgroundColor: accent }]} />
            <Text style={[styles.nostrilLabel, { color: accent }]}>Right</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circleArea: {
    width: CIRCLE_OUTER + 40,
    height: CIRCLE_OUTER + 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    width: CIRCLE_OUTER,
    height: CIRCLE_OUTER,
    borderRadius: CIRCLE_OUTER / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: CIRCLE_MIN,
    height: CIRCLE_MIN,
    borderRadius: CIRCLE_MIN / 2,
  },
  mainCircle: {
    position: 'absolute',
    alignSelf: 'center',
  },
  holdContainer: {
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  sidesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: CIRCLE_OUTER,
    marginTop: 14,
  },
  nostrilRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: CIRCLE_OUTER,
  },
  nostrilGroupLeft: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 5,
  },
  nostrilGroupRight: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 5,
  },
  nostrilDot: {
    width: NOSTRIL_DOT,
    height: NOSTRIL_DOT,
    borderRadius: NOSTRIL_DOT / 2,
  },
  actionLabel: {
    fontSize: 17,
    fontWeight: '300',
    letterSpacing: 0.5,
    height: 24,
  },
  nostrilLabel: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
});
