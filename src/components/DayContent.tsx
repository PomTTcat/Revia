import { router } from 'expo-router';
import { Pressable, ScrollView, Text } from 'react-native';
import { Empty, Gate, SentenceCard, s } from './ui';
import { useStore } from '../data/store';
import { parseDay, prettyDay } from '../lib/dates';

export function DayContent({ date }: { date: string }) {
  const { sentences, reviews } = useStore();
  try { parseDay(date); } catch { return <Empty text="日期无效，请返回日历重新选择。" />; }
  const fresh = sentences.filter((sentence) => sentence.learning_date === date);
  const ids = new Set(reviews.filter((review) => review.review_date === date).map((review) => review.sentence_id));
  const old = sentences.filter((sentence) => ids.has(sentence.id));
  return <ScrollView style={s.page} contentContainerStyle={s.content}><Gate>
    <Text style={s.title}>{prettyDay(date)}</Text><Text style={[s.muted, { marginTop: 8 }]}>{fresh.length} 条新增 · {old.length} 条复习</Text>
    <Text style={s.section}>新的相遇 · {fresh.length}</Text>
    {fresh.length ? fresh.map((sentence) => <SentenceCard key={sentence.id} sentence={sentence} fresh />) : <Empty text="这一天还没有新增句子" />}
    <Pressable style={s.button} onPress={() => router.push({ pathname: '/add', params: { date } })}><Text style={s.buttonText}>＋ 添加这一天的句子</Text></Pressable>
    <Text style={s.section}>再次重逢 · {old.length}</Text>
    {old.length ? old.map((sentence) => <SentenceCard key={sentence.id} sentence={sentence} />) : <Empty text="这一天没有安排复习" />}
  </Gate></ScrollView>;
}
