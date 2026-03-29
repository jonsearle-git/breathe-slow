import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PHASE_TYPES } from '../constants/techniques';
import { alpha, colors } from '../constants/colors';

const CIRCLE_MIN = 90;
const CIRCLE_MAX = 240;
const CIRCLE_OUTER = 240;

const DUAL_MIN = 50;
const DUAL_MAX = 130;
const DUAL_OUTER = 130;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const SingleCircle = React.memo(function SingleCircle({
  technique,
  status,
  scaleAnim,
  opacityAnim,
  borderRadiusAnim,
  pulseAnim,
  phaseLabel,
  countdown,
}) {
  const accent = technique.accentColor;
  return (
    <View style={styles.circleWrapper}>
      {status === 'idle' ? (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View
            style={[
              styles.circleOuter,
              {
                width: CIRCLE_OUTER,
                height: CIRCLE_OUTER,
                borderRadius: CIRCLE_OUTER / 2,
                borderColor: alpha(accent, 0.19),
              },
            ]}
          >
            <View
              style={[
                styles.circleInner,
                {
                  width: CIRCLE_MIN,
                  height: CIRCLE_MIN,
                  borderRadius: CIRCLE_MIN / 2,
                  backgroundColor: alpha(accent, 0.25),
                },
              ]}
            />
          </View>
        </Animated.View>
      ) : (
        <>
          <View
            style={[
              styles.glowRing,
              {
                width: CIRCLE_OUTER,
                height: CIRCLE_OUTER,
                borderRadius: CIRCLE_OUTER / 2,
                borderColor: alpha(accent, 0.25),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.mainCircle,
              {
                width: scaleAnim,
                height: scaleAnim,
                borderRadius: borderRadiusAnim,
                backgroundColor: accent,
                opacity: opacityAnim,
              },
            ]}
          />
          <View style={styles.labelOverlay} pointerEvents="none">
            <Text style={styles.phaseLabel}>{phaseLabel}</Text>
            {countdown !== null && (
              <Text style={styles.countdown}>{countdown}</Text>
            )}
          </View>
        </>
      )}
    </View>
  );
});

const DualNostrilCircles = React.memo(function DualNostrilCircles({
  technique,
  status,
  leftScaleAnim,
  rightScaleAnim,
  leftOpacityAnim,
  rightOpacityAnim,
  leftBorderRadiusAnim,
  rightBorderRadiusAnim,
  pulseAnim,
  phaseLabel,
  countdown,
}) {
  const accent = technique.accentColor;

  return (
    <View style={styles.dualContainer}>
      <View style={styles.dualLabelArea}>
        <Text style={[styles.dualPhaseLabel, { color: accent }]}>{phaseLabel}</Text>
        {status === 'running' && countdown !== null && (
          <Text style={[styles.dualCountdown, { color: accent }]}>{countdown}</Text>
        )}
      </View>

      <View style={styles.dualCirclesRow}>
        <NostrilCircle
          label="Left"
          accent={accent}
          status={status}
          scaleAnim={leftScaleAnim}
          opacityAnim={leftOpacityAnim}
          borderRadiusAnim={leftBorderRadiusAnim}
          pulseAnim={pulseAnim}
        />
        <NostrilCircle
          label="Right"
          accent={accent}
          status={status}
          scaleAnim={rightScaleAnim}
          opacityAnim={rightOpacityAnim}
          borderRadiusAnim={rightBorderRadiusAnim}
          pulseAnim={pulseAnim}
        />
      </View>
    </View>
  );
});

// Individual nostril circle — not memoised since it only renders inside DualNostrilCircles.
function NostrilCircle({ label, accent, status, scaleAnim, opacityAnim, borderRadiusAnim, pulseAnim }) {
  return (
    <View style={styles.nostrilColumn}>
      {status === 'idle' ? (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View
            style={[
              styles.dualOuterRing,
              {
                width: DUAL_OUTER,
                height: DUAL_OUTER,
                borderRadius: DUAL_OUTER / 2,
                borderColor: alpha(accent, 0.19),
              },
            ]}
          >
            <View
              style={[
                styles.dualInnerCircle,
                {
                  width: DUAL_MIN,
                  height: DUAL_MIN,
                  borderRadius: DUAL_MIN / 2,
                  backgroundColor: alpha(accent, 0.25),
                },
              ]}
            />
          </View>
        </Animated.View>
      ) : (
        <View style={styles.dualCircleContainer}>
          <View
            style={[
              styles.dualFixedRing,
              {
                width: DUAL_OUTER,
                height: DUAL_OUTER,
                borderRadius: DUAL_OUTER / 2,
                borderColor: alpha(accent, 0.22),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dualCircle,
              {
                width: scaleAnim,
                height: scaleAnim,
                borderRadius: borderRadiusAnim,
                backgroundColor: accent,
                opacity: opacityAnim,
              },
            ]}
          />
        </View>
      )}
      <Text style={[styles.nostrilLabel, { color: accent }]}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function BreathingScreen({ technique, onBack }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'done'
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [countdown, setCountdown] = useState(null);

  const isDual = !!technique.dualNostril;

  // Single-circle animated values
  const scaleAnim = useRef(new Animated.Value(CIRCLE_MIN)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  // Dual-nostril animated values
  const leftScaleAnim = useRef(new Animated.Value(DUAL_MIN)).current;
  const rightScaleAnim = useRef(new Animated.Value(DUAL_MIN)).current;
  const leftOpacityAnim = useRef(new Animated.Value(0.4)).current;
  const rightOpacityAnim = useRef(new Animated.Value(0.4)).current;

  // Derived border-radius nodes — created once to avoid allocating on every render.
  const singleBorderRadius = useRef(Animated.divide(scaleAnim, 2)).current;
  const leftBorderRadius = useRef(Animated.divide(leftScaleAnim, 2)).current;
  const rightBorderRadius = useRef(Animated.divide(rightScaleAnim, 2)).current;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const animRef = useRef(null);

  const currentPhase = technique.phases[phaseIndex];

  const clearAll = useCallback(() => {
    clearTimeout(timerRef.current);
    if (animRef.current) {
      animRef.current.stop();
      animRef.current = null;
    }
  }, []);

  const handleBack = useCallback(() => {
    clearAll();
    onBack();
  }, [clearAll, onBack]);

  // Idle gentle pulse — only runs when status is 'idle'.
  useEffect(() => {
    if (status !== 'idle') return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
    // pulseAnim is a stable ref — intentionally omitted from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const runPhase = useCallback(
    (pIdx, cCount) => {
      if (cCount >= technique.cycles) {
        setStatus('done');
        setPhaseIndex(0);
        setCycleCount(0);

        const resetAnim = isDual
          ? Animated.parallel([
              Animated.timing(leftScaleAnim, { toValue: DUAL_MIN, duration: 600, useNativeDriver: false }),
              Animated.timing(rightScaleAnim, { toValue: DUAL_MIN, duration: 600, useNativeDriver: false }),
              Animated.timing(leftOpacityAnim, { toValue: 0.4, duration: 600, useNativeDriver: false }),
              Animated.timing(rightOpacityAnim, { toValue: 0.4, duration: 600, useNativeDriver: false }),
            ])
          : Animated.parallel([
              Animated.timing(scaleAnim, { toValue: CIRCLE_MIN, duration: 600, useNativeDriver: false }),
              Animated.timing(opacityAnim, { toValue: 0.6, duration: 600, useNativeDriver: false }),
            ]);

        animRef.current = resetAnim;
        resetAnim.start();
        return;
      }

      const phase = technique.phases[pIdx];
      setPhaseIndex(pIdx);
      setCycleCount(cCount);
      setCountdown(phase.duration);

      // Stop any in-progress animation before starting the next.
      if (animRef.current) {
        animRef.current.stop();
        animRef.current = null;
      }

      let phaseAnim = null;

      if (isDual) {
        if (phase.type !== PHASE_TYPES.HOLD) {
          const leftTarget = phase.nostril === 'left' ? DUAL_MAX : DUAL_MIN;
          const rightTarget = phase.nostril === 'right' ? DUAL_MAX : DUAL_MIN;
          const leftOpTarget = phase.nostril === 'left' ? 0.95 : 0.25;
          const rightOpTarget = phase.nostril === 'right' ? 0.95 : 0.25;

          phaseAnim = Animated.parallel([
            Animated.timing(leftScaleAnim, {
              toValue: leftTarget,
              duration: phase.duration * 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(rightScaleAnim, {
              toValue: rightTarget,
              duration: phase.duration * 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(leftOpacityAnim, {
              toValue: leftOpTarget,
              duration: phase.duration * 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(rightOpacityAnim, {
              toValue: rightOpTarget,
              duration: phase.duration * 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
          ]);
        }
      } else {
        const sizeTarget =
          phase.type === PHASE_TYPES.INHALE ? Math.round(CIRCLE_MAX * (phase.targetRatio ?? 1))
          : phase.type === PHASE_TYPES.HOLD ? null
          : CIRCLE_MIN;
        const opacityTarget =
          phase.type === PHASE_TYPES.INHALE ? 1
          : phase.type === PHASE_TYPES.HOLD ? null
          : 0.55;

        if (sizeTarget !== null) {
          phaseAnim = Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: sizeTarget,
              duration: phase.duration * 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(opacityAnim, {
              toValue: opacityTarget,
              duration: phase.duration * 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
          ]);
        }
      }

      if (phaseAnim) {
        animRef.current = phaseAnim;
        phaseAnim.start();
      }

      // Countdown tick — advances to the next phase when it reaches zero.
      let remaining = phase.duration;
      const tick = () => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining > 0) {
          timerRef.current = setTimeout(tick, 1000);
        } else {
          const nextIdx = pIdx + 1;
          const isLastPhase = nextIdx >= technique.phases.length;
          runPhase(isLastPhase ? 0 : nextIdx, isLastPhase ? cCount + 1 : cCount);
        }
      };
      timerRef.current = setTimeout(tick, 1000);
    },
    // Animated values are stable refs — intentionally omitted from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [technique, isDual]
  );

  const handleStart = useCallback(() => {
    clearAll();
    setStatus('running');
    setCycleCount(0);
    setPhaseIndex(0);

    if (isDual) {
      leftScaleAnim.setValue(DUAL_MIN);
      rightScaleAnim.setValue(DUAL_MIN);
      leftOpacityAnim.setValue(0.4);
      rightOpacityAnim.setValue(0.4);
      runPhase(0, 0);
    } else {
      scaleAnim.setValue(CIRCLE_MIN);
      opacityAnim.setValue(0.6);
      runPhase(0, 0);
    }
    // Animated values are stable refs — intentionally omitted from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearAll, runPhase, isDual]);

  const handleStop = useCallback(() => {
    clearAll();
    setStatus('idle');
    setPhaseIndex(0);
    setCycleCount(0);
    setCountdown(null);

    const resetAnim = isDual
      ? Animated.parallel([
          Animated.timing(leftScaleAnim, { toValue: DUAL_MIN, duration: 400, useNativeDriver: false }),
          Animated.timing(rightScaleAnim, { toValue: DUAL_MIN, duration: 400, useNativeDriver: false }),
          Animated.timing(leftOpacityAnim, { toValue: 0.4, duration: 400, useNativeDriver: false }),
          Animated.timing(rightOpacityAnim, { toValue: 0.4, duration: 400, useNativeDriver: false }),
        ])
      : Animated.parallel([
          Animated.timing(scaleAnim, { toValue: CIRCLE_MIN, duration: 400, useNativeDriver: false }),
          Animated.timing(opacityAnim, { toValue: 0.6, duration: 400, useNativeDriver: false }),
        ]);

    resetAnim.start();
    // Animated values are stable refs — intentionally omitted from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearAll, isDual]);

  useEffect(() => clearAll, [clearAll]);

  const phaseLabel =
    status === 'running'
      ? isDual && currentPhase?.nostril !== 'both'
        ? `${currentPhase?.label} — ${currentPhase?.nostril === 'left' ? 'Left' : 'Right'}`
        : currentPhase?.label ?? ''
      : status === 'done'
      ? 'Complete'
      : '';

  return (
    <LinearGradient
      colors={technique.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={[styles.backText, { color: technique.accentColor }]}>‹ Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleArea}>
          <Text style={styles.name}>{technique.name}</Text>
          <Text style={styles.subtitle}>{technique.subtitle}</Text>
          {status === 'idle' && (
            <Text style={styles.description}>{technique.description}</Text>
          )}
          {status === 'running' && (
            <Text style={styles.cycleText}>
              Cycle {cycleCount + 1} of {technique.cycles}
            </Text>
          )}
          {status === 'done' && (
            <Text style={styles.doneText}>Well done. Take a moment to rest.</Text>
          )}
        </View>

        <View style={styles.circleArea}>
          {isDual ? (
            <DualNostrilCircles
              technique={technique}
              status={status}
              leftScaleAnim={leftScaleAnim}
              rightScaleAnim={rightScaleAnim}
              leftOpacityAnim={leftOpacityAnim}
              rightOpacityAnim={rightOpacityAnim}
              leftBorderRadiusAnim={leftBorderRadius}
              rightBorderRadiusAnim={rightBorderRadius}
              pulseAnim={pulseAnim}
              phaseLabel={phaseLabel}
              countdown={countdown}
            />
          ) : (
            <SingleCircle
              technique={technique}
              status={status}
              scaleAnim={scaleAnim}
              opacityAnim={opacityAnim}
              borderRadiusAnim={singleBorderRadius}
              pulseAnim={pulseAnim}
              phaseLabel={phaseLabel}
              countdown={countdown}
            />
          )}
        </View>

        <View style={styles.controls}>
          {status === 'idle' && (
            <TouchableOpacity
              onPress={handleStart}
              style={[styles.primaryBtn, { backgroundColor: technique.accentColor }]}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Begin</Text>
            </TouchableOpacity>
          )}
          {status === 'running' && (
            <TouchableOpacity
              onPress={handleStop}
              style={[styles.secondaryBtn, { borderColor: technique.accentColor }]}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryBtnText, { color: technique.accentColor }]}>Stop</Text>
            </TouchableOpacity>
          )}
          {status === 'done' && (
            <View style={styles.doneButtons}>
              <TouchableOpacity
                onPress={handleStart}
                style={[styles.primaryBtn, { backgroundColor: technique.accentColor }]}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBack}
                style={[styles.secondaryBtn, { borderColor: technique.accentColor, marginTop: 12 }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.secondaryBtnText, { color: technique.accentColor }]}>
                  Back to techniques
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {status === 'idle' && (
          <View style={styles.stepsRow}>
            {technique.phases.map((phase, i) => (
              <View key={`${phase.type}-${phase.duration}-${i}`} style={styles.step}>
                <View style={[styles.stepDot, { backgroundColor: alpha(technique.accentColor, 0.31) }]} />
                <Text style={[styles.stepLabel, { color: technique.accentColor }]}>
                  {phase.nostril && phase.nostril !== 'both'
                    ? `${phase.label} (${phase.nostril})`
                    : phase.label}
                </Text>
                <Text style={[styles.stepDuration, { color: alpha(technique.accentColor, 0.67) }]}>
                  {phase.duration}s
                </Text>
              </View>
            ))}
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backBtn: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  backText: {
    fontSize: 18,
    fontWeight: '400',
  },
  titleArea: {
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 16,
  },
  name: {
    fontSize: 30,
    fontWeight: '300',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '400',
    marginTop: 2,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
    fontWeight: '300',
  },
  cycleText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  doneText: {
    fontSize: 15,
    color: '#3a5060',
    fontWeight: '300',
    fontStyle: 'italic',
  },

  // Circle area
  circleArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Single circle
  circleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleOuter: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleInner: {},
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  mainCircle: {
    position: 'absolute',
  },
  labelOverlay: {
    width: CIRCLE_OUTER,
    height: CIRCLE_OUTER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseLabel: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '300',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  countdown: {
    fontSize: 42,
    fontWeight: '200',
    marginTop: 4,
    color: colors.white,
  },

  // Dual nostril
  dualContainer: {
    alignItems: 'center',
  },
  dualLabelArea: {
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 72,
    justifyContent: 'center',
  },
  dualPhaseLabel: {
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  dualCountdown: {
    fontSize: 48,
    fontWeight: '200',
    marginTop: 2,
  },
  dualCirclesRow: {
    flexDirection: 'row',
    gap: 36,
    alignItems: 'center',
  },
  nostrilColumn: {
    alignItems: 'center',
    gap: 14,
  },
  nostrilLabel: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  dualOuterRing: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dualInnerCircle: {},
  dualCircleContainer: {
    width: DUAL_OUTER,
    height: DUAL_OUTER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dualFixedRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  dualCircle: {
    position: 'absolute',
  },

  // Controls
  controls: {
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 10,
  },
  primaryBtn: {
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 1,
  },
  secondaryBtn: {
    paddingHorizontal: 50,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  doneButtons: {
    alignItems: 'center',
  },

  // Phase steps preview
  stepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 12,
  },
  step: {
    alignItems: 'center',
    minWidth: 70,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  stepDuration: {
    fontSize: 11,
    fontWeight: '300',
  },
});
