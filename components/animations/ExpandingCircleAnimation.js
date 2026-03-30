import React, { useRef, useEffect } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { alpha } from '../../constants/colors';

const CIRCLE_MIN = 90;
const CIRCLE_MAX = 220;
const CIRCLE_OUTER = 220;

export default function ExpandingCircleAnimation({ technique, status, phase, phaseIndex, sessionKey }) {
  const accent = technique.accentColor;

  const scale   = useRef(new Animated.Value(CIRCLE_MIN)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  const pulse   = useRef(new Animated.Value(1)).current;

  // Derived once — avoids allocating a new node on every render.
  const borderRadius = useRef(Animated.divide(scale, 2)).current;

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
    }

    const duration = (phase?.duration ?? 4) * 1000;
    const type = phase?.type ?? '';

    const sizeTarget =
      type === 'inhale' ? Math.round(CIRCLE_MAX * (phase?.targetRatio ?? 1))
      : type === 'hold' ? null
      : CIRCLE_MIN;
    const opacityTarget =
      type === 'inhale' ? 1
      : type === 'hold' ? null
      : 0.55;

    if (sizeTarget === null) return; // hold — no animation

    const anim = Animated.parallel([
      Animated.timing(scale,   { toValue: sizeTarget,   duration, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
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
      Animated.timing(scale,   { toValue: CIRCLE_MIN, duration: 600, useNativeDriver: false }),
      Animated.timing(opacity, { toValue: 0.6,        duration: 600, useNativeDriver: false }),
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
          <View style={[styles.outerRing, { borderColor: alpha(accent, 0.3) }]} />
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
  mainCircle: {
    position: 'absolute',
    alignSelf: 'center',
  },
});
