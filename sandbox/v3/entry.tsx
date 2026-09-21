import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StyleSheet, Text, View } from 'react-native';
import { HoldToComplete } from './HoldToComplete';

function Demo() {
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(false);
  return (
    <View style={styles.page}>
      <Text style={styles.eyebrow}>MEMENTO JR V3</Text>
      <Text style={styles.title}>{streak} day streak</Text>
      <Text style={styles.copy}>Press and hold for three seconds. Release early and the fill resets.</Text>
      <HoldToComplete done={done} onComplete={() => { setStreak(value => value + 1); setDone(true); }} />
      <Text accessibilityRole="button" onPress={() => setDone(false)} style={styles.reset}>Reset the button</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { minHeight: '100vh', backgroundColor: '#0b0b0d', padding: 24, alignItems: 'center', justifyContent: 'center', gap: 16 },
  eyebrow: { color: '#8e8e97', fontSize: 12, fontWeight: '700' },
  title: { color: '#f3f3f5', fontSize: 32, fontWeight: '700' },
  copy: { color: '#c9c9cf', maxWidth: 360, textAlign: 'center', fontSize: 16, lineHeight: 24 },
  reset: { color: '#8e8e97', fontSize: 14, textDecorationLine: 'underline', padding: 12 },
});

createRoot(document.getElementById('root')!).render(<Demo />);
