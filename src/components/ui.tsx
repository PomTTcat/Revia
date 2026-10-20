import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { type Sentence, useStore } from '../data/store';
import { prettyDay } from '../lib/dates';
export const colors = { ink: '#233A32', muted: '#78847D', green: '#34755B', background: '#FAFBF7', line: '#E7EBE3' };
export function Gate({ children }: { children: React.ReactNode }) {
  const store = useStore();
  if (store.error) return <View style={s.empty}><Text>{store.error}</Text><Pressable onPress={store.retry}><Text style={s.link}>重试</Text></Pressable></View>;
  if (!store.ready) return <ActivityIndicator style={{ marginTop: 80 }} color={colors.green} />;
  return <>{children}</>;
}
export function Empty({ text }: { text: string }) { return <View style={s.empty}><Text style={s.muted}>{text}</Text></View>; }
export function SentenceCard({ sentence, fresh = false }: { sentence: Sentence; fresh?: boolean }) {
  const { remove } = useStore();
  function confirmDelete() {
    Alert.alert('删除这条句子？', '原句和所有日期的复习内容都会一起删除，无法撤销。', [
      { text: '取消', style: 'cancel' },
      { text: '删除全部', style: 'destructive', onPress: () => {
        try { remove(sentence.id); } catch { Alert.alert('删除失败', '请稍后重试。'); }
      } },
    ]);
  }
  return <View style={[s.card, fresh ? s.fresh : s.review]}>
    <View style={s.row}><Text style={s.meta}>{prettyDay(sentence.learning_date)}添加</Text><Pressable accessibilityLabel="删除句子及全部复习日程" hitSlop={12} onPress={confirmDelete}><Text style={s.delete}>删除</Text></Pressable></View>
    <Text selectable style={s.japanese}>{sentence.japanese}</Text>
    {!!sentence.translation && <Text selectable style={s.translation}>{sentence.translation}</Text>}
  </View>;
}
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: '700', color: colors.ink, letterSpacing: -1 },
  muted: { fontSize: 14, lineHeight: 22, color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { color: colors.green, fontSize: 15, fontWeight: '600', paddingVertical: 10 },
  section: { fontSize: 18, fontWeight: '600', color: colors.ink, marginTop: 28, marginBottom: 14 },
  empty: { padding: 24, alignItems: 'center', gap: 12 },
  card: { padding: 20, borderRadius: 20, marginBottom: 12 },
  fresh: { backgroundColor: '#E2F0DE' }, review: { backgroundColor: '#ECEEEB' },
  meta: { fontSize: 12, color: '#5A6D5F' }, delete: { fontSize: 12, color: '#846B64', padding: 4 },
  japanese: { fontSize: 21, lineHeight: 34, color: colors.ink, marginTop: 14, fontWeight: '500' },
  translation: { fontSize: 15, lineHeight: 24, color: '#67746C', marginTop: 10 },
  button: { backgroundColor: colors.green, borderRadius: 16, padding: 17, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#DCE2D8', borderRadius: 14, padding: 16, fontSize: 17, backgroundColor: '#fff', color: colors.ink, marginTop: 10, textAlignVertical: 'top' },
});
