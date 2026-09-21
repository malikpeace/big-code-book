import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const HOLD_MS = 3000;

export function HoldToComplete(props: { done: boolean; onComplete: () => void }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frame = useRef<number | null>(null);
  const started = useRef(0);
  const holdingNow = useRef(false);

  function clearWork() {
    if (timer.current) clearTimeout(timer.current);
    if (frame.current) cancelAnimationFrame(frame.current);
    timer.current = null;
    frame.current = null;
  }

  useEffect(() => () => clearWork(), []);

  function tick(now: number) {
    const next = Math.min(1, (now - started.current) / HOLD_MS);
    setProgress(next);
    if (next < 1) frame.current = requestAnimationFrame(tick);
  }

  function begin() {
    if (props.done || holdingNow.current) return;
    clearWork();
    holdingNow.current = true;
    setHolding(true);
    setProgress(0);
    started.current = performance.now();
    frame.current = requestAnimationFrame(tick);
    timer.current = setTimeout(() => {
      clearWork();
      holdingNow.current = false;
      setHolding(false);
      setProgress(1);
      props.onComplete();
    }, HOLD_MS);
  }

  function cancel() {
    if (!holdingNow.current) return;
    clearWork();
    holdingNow.current = false;
    setHolding(false);
    setProgress(0);
  }

  const label = props.done ? 'Done for today' : holding ? 'Keep holding' : 'Hold to complete';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Hold for three seconds to mark complete"
      accessibilityState={{ disabled: props.done }}
      disabled={props.done}
      onPressIn={begin}
      onPressOut={cancel}
      style={styles.button}
    >
      <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 280, minHeight: 52, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#3fd94e' },
  label: { color: '#0b1112', fontSize: 15, fontWeight: '700' },
});
