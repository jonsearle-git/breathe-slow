import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { alpha, colors } from '../constants/colors';
import { ANIMATION_COMPONENTS } from '../components/animations';

export default function BreathingScreen({ technique, onBack }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'done'
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [sessionKey, setSessionKey] = useState(0);

  const timerRef = useRef(null);
  const currentPhase = technique.phases[phaseIndex];
  const AnimationComponent = ANIMATION_COMPONENTS[technique.animationType];

  const clearTimer = useCallback(() => clearTimeout(timerRef.current), []);

  const handleBack = useCallback(() => {
    clearTimer();
    onBack();
  }, [clearTimer, onBack]);

  const runPhase = useCallback((pIdx, cCount) => {
    if (cCount >= technique.cycles) {
      setStatus('done');
      setPhaseIndex(0);
      setCycleCount(0);
      return;
    }

    const phase = technique.phases[pIdx];
    setPhaseIndex(pIdx);
    setCycleCount(cCount);
    setCountdown(phase.duration);

    let remaining = phase.duration;
    const tick = () => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining > 0) {
        timerRef.current = setTimeout(tick, 1000);
      } else {
        const nextIdx = pIdx + 1;
        const isLast = nextIdx >= technique.phases.length;
        runPhase(isLast ? 0 : nextIdx, isLast ? cCount + 1 : cCount);
      }
    };
    timerRef.current = setTimeout(tick, 1000);
  }, [technique]);

  const handleStart = useCallback(() => {
    clearTimer();
    setStatus('running');
    setPhaseIndex(0);
    setCycleCount(0);
    setCountdown(null);
    setSessionKey(k => k + 1);
    runPhase(0, 0);
  }, [clearTimer, runPhase]);

  const handleStop = useCallback(() => {
    clearTimer();
    setStatus('idle');
    setPhaseIndex(0);
    setCycleCount(0);
    setCountdown(null);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  const phaseLabel = status === 'running' ? (currentPhase?.label ?? '') : '';

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
          <View style={styles.statusTextArea}>
            <Text style={[styles.description, status !== 'idle' && styles.hidden]}>
              {technique.description}
            </Text>
            <Text style={[styles.cycleText, styles.statusOverlay, status !== 'running' && styles.hidden]}>
              Cycle {cycleCount + 1} of {technique.cycles}
            </Text>
            <Text style={[styles.doneText, styles.statusOverlay, status !== 'done' && styles.hidden]}>
              Well done. Take a moment to rest.
            </Text>
          </View>
        </View>

        {/* Animation */}
        <View style={styles.animArea}>
          {AnimationComponent && (
            <AnimationComponent
              technique={technique}
              status={status}
              phase={currentPhase}
              phaseIndex={phaseIndex}
              sessionKey={sessionKey}
            />
          )}
        </View>

        {/* Phase label + countdown — fixed height so layout never shifts */}
        <View style={styles.labelArea}>
          <Text style={[styles.phaseLabel, { color: technique.accentColor }, (status !== 'running' || technique.dualNostril) && styles.hidden]}>
            {phaseLabel || ' '}
          </Text>
          <Text style={[styles.countdown, { color: technique.accentColor }, (status !== 'running' || countdown === null || technique.dualNostril) && styles.hidden]}>
            {countdown ?? ' '}
          </Text>
        </View>

        {/* Controls */}
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
            <TouchableOpacity
              onPress={handleStart}
              style={[styles.primaryBtn, { backgroundColor: technique.accentColor }]}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Again</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Phase steps — always rendered to hold layout space */}
        <View style={[styles.stepsRow, status !== 'idle' && styles.stepsHidden]}>
          {technique.phases.map((phase, i) => (
            <View key={`${phase.type}-${i}`} style={styles.step}>
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
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12 },
  backBtn: { alignSelf: 'flex-start', padding: 8 },
  backText: { fontSize: 18, fontWeight: '400' },
  titleArea: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 12 },
  name: { fontSize: 30, fontWeight: '300', color: colors.textPrimary, letterSpacing: 0.5 },
  subtitle: { fontSize: 15, color: colors.textSecondary, fontWeight: '400', marginTop: 2, marginBottom: 10 },
  description: { fontSize: 14, color: colors.textMuted, lineHeight: 21, fontWeight: '300' },
  cycleText: { fontSize: 14, color: colors.textSecondary, fontWeight: '400' },
  doneText: { fontSize: 15, color: '#3a5060', fontWeight: '300', fontStyle: 'italic' },
  animArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  labelArea: {
    alignItems: 'center',
    height: 90,
    justifyContent: 'center',
  },
  phaseLabel: { fontSize: 17, fontWeight: '300', letterSpacing: 0.5, textAlign: 'center' },
  countdown: { fontSize: 48, fontWeight: '200', marginTop: 2 },
  controls: { alignItems: 'center', paddingBottom: 20, paddingTop: 4, height: 80, justifyContent: 'center' },
  primaryBtn: {
    paddingHorizontal: 60, paddingVertical: 16, borderRadius: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  primaryBtnText: { color: colors.white, fontSize: 18, fontWeight: '400', letterSpacing: 1 },
  secondaryBtn: { paddingHorizontal: 50, paddingVertical: 16, borderRadius: 50, borderWidth: 1.5 },
  secondaryBtnText: { fontSize: 16, fontWeight: '400', letterSpacing: 0.5 },
  stepsRow: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    paddingHorizontal: 20, paddingBottom: 28, gap: 12,
  },
  stepsHidden: {
    opacity: 0,
  },
  hidden: {
    opacity: 0,
  },
  statusTextArea: {
    minHeight: 60,
  },
  statusOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  step: { alignItems: 'center', minWidth: 70 },
  stepDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  stepLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  stepDuration: { fontSize: 11, fontWeight: '300' },
});
