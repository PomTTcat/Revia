import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider } from '../data/store';
import { colors } from '../components/ui';
export default function RootLayout() {
  return <StoreProvider><StatusBar style="dark" /><Stack screenOptions={{ headerTintColor: colors.ink, headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false, contentStyle: { backgroundColor: colors.background } }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="day/[date]" options={{ title: '当天内容', headerBackTitle: '日历' }} />
    <Stack.Screen name="add" options={{ title: '添加句子', presentation: 'modal' }} />
  </Stack></StoreProvider>;
}
