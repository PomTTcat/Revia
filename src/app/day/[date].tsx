import { Stack, useLocalSearchParams } from 'expo-router';
import { DayContent } from '../../components/DayContent';
import { parseDay, prettyDay } from '../../lib/dates';

export default function DayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  let title = '当天内容';
  try { parseDay(date); title = `${prettyDay(date)} · ${date.slice(0, 4)}`; } catch { /* DayContent displays the invalid-date message. */ }
  return <><Stack.Screen options={{ title }} /><DayContent date={date} /></>;
}
