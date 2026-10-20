import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DayContent } from '../../components/DayContent';
import { s } from '../../components/ui';
import { dateKey } from '../../lib/dates';

export default function TodayScreen() {
  const [date, setDate] = useState(dateKey);
  useFocusEffect(useCallback(() => {
    const update = () => setDate(dateKey());
    update();
    const timer = setInterval(update, 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') update();
    });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []));
  return <SafeAreaView edges={['top']} style={s.page}><DayContent key={date} date={date} /></SafeAreaView>;
}
