import { useState, useRef, useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import BreathingScreen from './screens/BreathingScreen';

export default function App() {
  const [selected, setSelected] = useState(null);
  const scrollOffset = useRef(0);
  const handleBack = useCallback(() => setSelected(null), []);

  return (
    <SafeAreaProvider>
      {selected
        ? <BreathingScreen technique={selected} onBack={handleBack} />
        : <HomeScreen onSelect={setSelected} scrollOffset={scrollOffset} />
      }
    </SafeAreaProvider>
  );
}
