import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, Gate, s } from '../../components/ui';
import { useStore } from '../../data/store';
import { dateKey } from '../../lib/dates';
export default function CalendarScreen() {
  const today = dateKey();
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1, 12); });
  const { sentences, reviews } = useStore();
  const newDays = new Set(sentences.map((sentence) => sentence.learning_date));
  const reviewDays = new Set(reviews.map((review) => review.review_date));
  const padding = (month.getDay() + 6) % 7;
  const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Math.ceil((padding + total) / 7) * 7;
  function move(amount: number) { setMonth(new Date(month.getFullYear(), month.getMonth() + amount, 1, 12)); }
  return <SafeAreaView edges={['top']} style={s.page}><ScrollView contentContainerStyle={s.content}><Gate>
    <Text style={c.brand}>REVIA / 日々のことば</Text><Text style={s.title}>每天一句，慢慢记住。</Text><Text style={[s.muted, { marginTop: 10 }]}>让每一次重逢，都比上次更熟悉。</Text>
    <View style={[s.row, { marginTop: 34, marginBottom: 20 }]}><Text style={c.month}>{month.getFullYear()}年 {month.getMonth() + 1}月</Text><View style={{ flexDirection: 'row', gap: 18 }}><Pressable accessibilityLabel="上个月" hitSlop={10} onPress={() => move(-1)}><Text style={c.arrow}>‹</Text></Pressable><Pressable onPress={() => { const d = new Date(); setMonth(new Date(d.getFullYear(), d.getMonth(), 1, 12)); }}><Text style={s.link}>今天</Text></Pressable><Pressable accessibilityLabel="下个月" hitSlop={10} onPress={() => move(1)}><Text style={c.arrow}>›</Text></Pressable></View></View>
    <View style={c.grid}>{['一', '二', '三', '四', '五', '六', '日'].map((day) => <View key={day} style={c.cell}><Text style={s.muted}>{day}</Text></View>)}
      {Array.from({ length: cells }, (_, index) => {
        const number = index - padding + 1;
        if (number < 1 || number > total) return <View key={index} style={c.cell} />;
        const key = dateKey(new Date(month.getFullYear(), month.getMonth(), number, 12));
        return <Pressable key={index} accessibilityLabel={`${key}${newDays.has(key) ? ' 有新句子' : ''}${reviewDays.has(key) ? ' 有复习' : ''}`} style={c.cell} onPress={() => router.push({ pathname: '/day/[date]', params: { date: key } })}>
          <View style={[c.day, key === today && c.today]}><Text style={[c.number, key === today && { color: '#fff' }]}>{number}</Text></View>
          <View style={c.dots}>{newDays.has(key) && <View style={[c.dot, { backgroundColor: '#6B9C6A' }]} />}{reviewDays.has(key) && <View style={[c.dot, { backgroundColor: '#A4ACA5' }]} />}</View>
        </Pressable>;
      })}
    </View>
    <Pressable style={s.button} onPress={() => router.push({ pathname: '/add', params: { date: today } })}><Text style={s.buttonText}>＋ 记录今天的句子</Text></Pressable>
    <View style={c.note}><Text style={{ color: colors.ink, fontWeight: '600', marginBottom: 8 }}>给记忆一点时间</Text><Text style={s.muted}>共安排 15 次复习：第 1、3、7、14、30 天，之后每月一次，共 10 次。点击日期查看当天的内容。</Text></View>
  </Gate></ScrollView></SafeAreaView>;
}
const c = StyleSheet.create({ brand: { fontSize: 11, color: colors.green, letterSpacing: 2, marginTop: 12, marginBottom: 22 }, month: { fontSize: 22, fontWeight: '600', color: colors.ink }, arrow: { fontSize: 30, color: colors.green }, grid: { flexDirection: 'row', flexWrap: 'wrap' }, cell: { width: '14.285714%', height: 58, alignItems: 'center', justifyContent: 'center' }, day: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, today: { backgroundColor: colors.green }, number: { fontSize: 16, color: colors.ink }, dots: { flexDirection: 'row', height: 8, gap: 3, marginTop: 3 }, dot: { width: 5, height: 5, borderRadius: 3 }, note: { borderTopWidth: 1, borderColor: colors.line, marginTop: 32, paddingTop: 24 } });
