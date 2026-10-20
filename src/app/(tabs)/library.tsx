import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Empty, Gate, SentenceCard, s } from '../../components/ui';
import { useStore } from '../../data/store';
import { dateKey } from '../../lib/dates';
export default function LibraryScreen() {
  const { sentences } = useStore();
  return <SafeAreaView edges={['top']} style={s.page}><Gate><FlatList data={sentences} keyExtractor={(item) => String(item.id)} contentContainerStyle={s.content} ListHeaderComponent={<View style={{ marginBottom: 24, marginTop: 12 }}><Text style={s.title}>我的句子</Text><Text style={[s.muted, { marginTop: 10 }]}>一点点积累，共 {sentences.length} 句。</Text><Pressable onPress={() => router.push({ pathname: '/add', params: { date: dateKey() } })}><Text style={s.link}>＋ 添加句子</Text></Pressable></View>} renderItem={({ item }) => <SentenceCard sentence={item} fresh={item.learning_date === dateKey()} />} ListEmptyComponent={<Empty text="还没有句子，先记录今天学到的一句吧。" />} /></Gate></SafeAreaView>;
}
