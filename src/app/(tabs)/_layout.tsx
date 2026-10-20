import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../components/ui';
export default function TabLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.green, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.line }, tabBarLabelStyle: { fontSize: 12 } }}>
    <Tabs.Screen name="index" options={{ title: '日历', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 23 }}>▦</Text> }} />
    <Tabs.Screen name="today" options={{ title: '今天', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 23 }}>◉</Text> }} />
    <Tabs.Screen name="library" options={{ href: null }} />
  </Tabs>;
}
