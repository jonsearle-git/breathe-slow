import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { alpha } from '../../constants/colors';

const CIRCLE_MIN = 110;
const CIRCLE_MAX = 290;
const CIRCLE_OUTER = 290;

// The first inhale targets 65% — the marker ring sits at this diameter.
const SECOND_INHALE_RATIO = 0.65;
const MARKER_SIZE = Math.round(CIRCLE_MAX * SECOND_INHALE_RATIO); // 143

export default function PhysiologicalSighAnimation({ technique, status, phase, phaseIndex, sessionKey }) {
  const accent = technique.accentColor;

  const scale   = useRef(new Animated.Value(CIRCLE_MIN)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  const pulse   = useRef(new Animated.Value(1)).current;

  // Marker ring pulses to draw attention when circle is near that size
  const markerOpacity = useRef(new Animated.Value(0.5)).current;

  const borderRadius = useRef(Animated.divide(scale, 2)).current;
  const activeAnim   = useRef(null);

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
      markerOpacity.setValue(0.5);
    }

    const duration = (phase?.duration ?? 4) * 1000;
    const type = phase?.type ?? '';
    const ratio = phase?.targetRatio ?? 1;

    const sizeTarget =
      type === 'inhale' ? Math.round(CIRCLE_MAX * ratio)
      : type === 'hold' ? null
      : CIRCLE_MIN;
    const opacityTarget =
      type === 'inhale' ? 1
      : type === 'hold' ? null
      : 0.55;

    if (sizeTarget === null) return;

    // On the second inhale (phaseIndex 1, ratio 1.0) the marker is no longer
    // needed — fade it out. On first inhale, keep it visible as a target.
    const markerTarget = phaseIndex === 1 ? 0 : 0.5;

    const anim = Animated.parallel([
      Animated.timing(scale,         { toValue: sizeTarget,   duration, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
      Animated.timing(opacity,       { toValue: opacityTarget, duration, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
      Animated.timing(markerOpacity, { toValue: markerTarget,  duration, useNativeDriver: false }),
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
      Animated.timing(scale,         { toValue: CIRCLE_MIN, duration: 600, useNativeDriver: false }),
      Animated.timing(opacity,       { toValue: 0.6,        duration: 600, useNativeDriver: false }),
      Animated.timing(markerOpacity, { toValue: 0.5,        duration: 600, useNativeDriver: false }),
    ]).start();
  }, [status]);

  return (
    <View style={styles.container}>
      {status === 'idle' ? (
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <View style={[styles.outerRing, { borderColor: alpha(accent, 0.25) }]}>
            <View style={[styles.innerCircle, { backgroundColor: alpha(accent, 0.3) }]} />
          </View>
        </Animated.View>
      ) : (
        <>
          {/* Outer boundary ring */}
          <View style={[styles.outerRing, { borderColor: alpha(accent, 0.3) }]} />

          {/* Second-inhale marker ring */}
          <Animated.View
            style={[
              styles.markerRing,
              {
                borderColor: accent,
                opacity: markerOpacity,
              },
            ]}
          />

          {/* Marker label */}
          <Animated.Text
            style={[
              styles.markerLabel,
              { color: accent, opacity: markerOpacity },
            ]}
          >
            2nd inhale
          </Animated.Text>

          {/* Main expanding circle */}
          <Animated.View
            style={[
              styles.mainCircle,
              {
                width: scale,
                height: scale,
                borderRadius,
                backgroundColor: accent,
                opacity,
              },
            ]}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  markerRing: {
    position: 'absolute',
    alignSelf: 'center',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  markerLabel: {
    position: 'absolute',
    alignSelf: 'center',
    top: (CIRCLE_OUTER + 40) / 2 - MARKER_SIZE / 2 - 22,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  mainCircle: {
    position: 'absolute',
    alignSelf: 'center',
  },
});
