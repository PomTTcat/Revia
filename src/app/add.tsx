import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput } from 'react-native';
import { Gate, colors, s } from '../components/ui';
import { useStore } from '../data/store';
import { dateKey, prettyDay, reviewDates } from '../lib/dates';
export default function AddScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const [date, setDate] = useState(params.date ?? dateKey());
  const [japanese, setJapanese] = useState('');
  const [translation, setTranslation] = useState('');
  const [saving, setSaving] = useState(false);
  const { add } = useStore();
  let schedule = '';
  try { schedule = reviewDates(date).map(prettyDay).join('、'); } catch { /* Validate again when saving. */ }
  function save() {
    if (saving) return;
    setSaving(true);
    try {
      add(japanese, translation, date);
      router.back();
    } catch (error) {
      Alert.alert('未能保存', error instanceof Error ? error.message : '请稍后重试');
      setSaving(false);
    }
  }
  return <KeyboardAvoidingView style={s.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}><Gate>
    <Text style={s.title}>留住一句日语</Text><Text style={[s.muted, { marginTop: 10 }]}>今天记下，未来再见。</Text>
    <Text style={s.section}>日语句子</Text><TextInput accessibilityLabel="日语句子" style={[s.input, { minHeight: 120 }]} multiline placeholder="今日も、少しずつ。" placeholderTextColor={colors.muted} value={japanese} onChangeText={setJapanese} maxLength={4000} />
    <Text style={s.section}>中文释义（可选）</Text><TextInput accessibilityLabel="中文释义" style={[s.input, { minHeight: 90 }]} multiline placeholder="写下你对这句话的理解" placeholderTextColor={colors.muted} value={translation} onChangeText={setTranslation} maxLength={4000} />
    <Text style={s.section}>学习日期</Text><TextInput accessibilityLabel="学习日期 YYYY-MM-DD" style={s.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" autoCapitalize="none" autoCorrect={false} maxLength={10} />
    <Text style={[s.muted, { marginTop: 18 }]}>{schedule ? `将出现在这些复习日期：${schedule}。` : '请输入有效的日期，例如 2026-10-01。'}</Text>
    <Pressable disabled={saving || !japanese.trim() || !schedule} style={[s.button, (saving || !japanese.trim() || !schedule) && { opacity: 0.4 }]} onPress={save}><Text style={s.buttonText}>{saving ? '保存中…' : '保存句子'}</Text></Pressable>
    <Pressable onPress={() => router.back()} style={{ alignItems: 'center', marginTop: 12 }}><Text style={s.link}>取消</Text></Pressable>
  </Gate></ScrollView></KeyboardAvoidingView>;
}
