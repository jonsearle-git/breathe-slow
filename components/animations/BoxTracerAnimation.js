import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { alpha } from '../../constants/colors';

const CONTAINER = 320;
const BOX = 200;
const HALF = BOX / 2;
const O = (CONTAINER - BOX) / 2;
const DOT_SIZE = 24;
const CORNER = 12;
const LINE = 7;

// Corner positions relative to container center (container is 260x260)
const CORNERS = [
  { x: -HALF, y: -HALF }, // top-left
  { x: HALF,  y: -HALF }, // top-right
  { x: HALF,  y: HALF  }, // bottom-right
  { x: -HALF, y: HALF  }, // bottom-left
];

export default function BoxTracerAnimation({ technique, status, phase, phaseIndex, sessionKey }) {
  const accent = technique.accentColor;

  const dotTX = useRef(new Animated.Value(-HALF)).current;
  const dotTY = useRef(new Animated.Value(-HALF)).current;

  const activeAnim = useRef(null);

  const stopAnim = () => {
    if (activeAnim.current) { activeAnim.current.stop(); activeAnim.current = null; }
  };

  useEffect(() => () => stopAnim(), []);

  // Idle — dot sits still at the start corner
  useEffect(() => {
    if (status !== 'idle') return;
    stopAnim();
    dotTX.setValue(-HALF);
    dotTY.setValue(-HALF);
  }, [status]);

  // Phase animation — one side per phase (box has 4 phases cycling)
  useEffect(() => {
    if (status !== 'running') return;
    stopAnim();

    const duration = (phase?.duration ?? 4) * 1000;
    const side = phaseIndex % 4;

    // Snap dot to start of this side
    switch (side) {
      case 0: dotTX.setValue(-HALF); dotTY.setValue(-HALF); break; // inhale: top-left
      case 1: dotTX.setValue(HALF);  dotTY.setValue(-HALF); break; // hold:   top-right
      case 2: dotTX.setValue(HALF);  dotTY.setValue(HALF);  break; // exhale: bottom-right
      case 3: dotTX.setValue(-HALF); dotTY.setValue(HALF);  break; // hold:   bottom-left
    }

    let anim;
    switch (side) {
      case 0: anim = Animated.timing(dotTX, { toValue: HALF,  duration, useNativeDriver: true, easing: Easing.linear }); break;
      case 1: anim = Animated.timing(dotTY, { toValue: HALF,  duration, useNativeDriver: true, easing: Easing.linear }); break;
      case 2: anim = Animated.timing(dotTX, { toValue: -HALF, duration, useNativeDriver: true, easing: Easing.linear }); break;
      case 3: anim = Animated.timing(dotTY, { toValue: -HALF, duration, useNativeDriver: true, easing: Easing.linear }); break;
    }

    if (anim) { activeAnim.current = anim; anim.start(); }
    return () => stopAnim();
  }, [phaseIndex, status, sessionKey]);

  // Done
  useEffect(() => {
    if (status !== 'done') return;
    stopAnim();
    Animated.parallel([
      Animated.timing(dotTX, { toValue: -HALF, duration: 400, useNativeDriver: true }),
      Animated.timing(dotTY, { toValue: -HALF, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [status]);

  const activeSide = status === 'running' ? phaseIndex % 4 : -1;

  const sideColor     = (i) => i === activeSide ? accent : alpha(accent, 0.2);
  const labelColor    = (i) => i === activeSide ? accent : alpha(accent, 0.6);
  const labelWeight   = (i) => i === activeSide ? '600' : '400';

  // Labels come from the technique's phase data so they stay in sync
  const labels = technique.phases.map(p => p.label);

  return (
    <View style={styles.container}>
      {/* Edge labels */}
      <Text style={[styles.labelTop,    { color: labelColor(0), fontWeight: labelWeight(0) }]}>{labels[0]}</Text>
      <Text style={[styles.labelRight,  { color: labelColor(1), fontWeight: labelWeight(1) }]}>{labels[1]}</Text>
      <Text style={[styles.labelBottom, { color: labelColor(2), fontWeight: labelWeight(2) }]}>{labels[2]}</Text>
      <Text style={[styles.labelLeft,   { color: labelColor(3), fontWeight: labelWeight(3) }]}>{labels[3]}</Text>

      {/* Box sides */}
      <View style={[styles.sideTop,    { backgroundColor: sideColor(0) }]} />
      <View style={[styles.sideRight,  { backgroundColor: sideColor(1) }]} />
      <View style={[styles.sideBottom, { backgroundColor: sideColor(2) }]} />
      <View style={[styles.sideLeft,   { backgroundColor: sideColor(3) }]} />

      {/* Corner dots */}
      {CORNERS.map((c, i) => (
        <View
          key={i}
          style={[
            styles.corner,
            {
              backgroundColor: alpha(accent, 0.55),
              left: CONTAINER / 2 + c.x - CORNER / 2,
              top:  CONTAINER / 2 + c.y - CORNER / 2,
            },
          ]}
        />
      ))}

      {/* Moving dot — only visible when running or done */}
      {status !== 'idle' && (
        <Animated.View
          style={[
            styles.dot,
            {
              backgroundColor: accent,
              shadowColor: accent,
              transform: [{ translateX: dotTX }, { translateY: dotTY }],
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideTop: {
    position: 'absolute',
    top: O - LINE / 2,
    left: O,
    width: BOX,
    height: LINE,
    borderRadius: LINE / 2,
  },
  sideRight: {
    position: 'absolute',
    top: O,
    left: O + BOX - LINE / 2,
    width: LINE,
    height: BOX,
    borderRadius: LINE / 2,
  },
  sideBottom: {
    position: 'absolute',
    top: O + BOX - LINE / 2,
    left: O,
    width: BOX,
    height: LINE,
    borderRadius: LINE / 2,
  },
  sideLeft: {
    position: 'absolute',
    top: O,
    left: O - LINE / 2,
    width: LINE,
    height: BOX,
    borderRadius: LINE / 2,
  },
  labelTop: {
    position: 'absolute',
    top: O - 26,
    left: 0,
    width: CONTAINER,
    textAlign: 'center',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  labelBottom: {
    position: 'absolute',
    top: O + BOX + 14,
    left: 0,
    width: CONTAINER,
    textAlign: 'center',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  labelRight: {
    position: 'absolute',
    top: CONTAINER / 2 - 8,
    left: O + BOX + 10,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  labelLeft: {
    position: 'absolute',
    top: CONTAINER / 2 - 8,
    right: O + BOX + 10,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderRadius: CORNER / 2,
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
});
