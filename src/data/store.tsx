import * as SQLite from 'expo-sqlite';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { parseDay, reviewDates } from '../lib/dates';
import { SCHEMA } from './schema';
import { migrateReviews } from './migrations';

export type Sentence = { id: number; japanese: string; translation: string; learning_date: string; created_at: string };
type Review = { sentence_id: number; review_date: string };
type Store = {
  sentences: Sentence[]; reviews: Review[]; ready: boolean; error: string;
  add: (japanese: string, translation: string, date: string) => void;
  remove: (id: number) => void; retry: () => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  function refresh(database: SQLite.SQLiteDatabase) {
    setSentences(database.getAllSync<Sentence>('SELECT * FROM sentences ORDER BY learning_date DESC, id DESC'));
    setReviews(database.getAllSync<Review>('SELECT * FROM reviews ORDER BY review_date'));
  }
  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        const database = await SQLite.openDatabaseAsync('revia.db');
        await database.execAsync(SCHEMA);
        migrateReviews(database);
        if (!cancelled) {
          refresh(database);
          setDb(database);
          setError('');
        }
      } catch {
        if (!cancelled) setError('无法打开本地数据，请重试。');
      }
    }
    void initialize();
    return () => { cancelled = true; };
  }, [attempt]);
  function add(japanese: string, translation: string, date: string) {
    if (!db) throw new Error('数据库尚未就绪');
    if (!japanese.trim()) throw new Error('请输入日语句子');
    parseDay(date);
    db.withTransactionSync(() => {
      const result = db.runSync('INSERT INTO sentences (japanese, translation, learning_date, created_at) VALUES (?, ?, ?, ?)', japanese.trim(), translation.trim(), date, new Date().toISOString());
      for (const day of reviewDates(date)) db.runSync('INSERT INTO reviews (sentence_id, review_date) VALUES (?, ?)', result.lastInsertRowId, day);
    });
    refresh(db);
  }
  function remove(id: number) {
    if (!db) throw new Error('数据库尚未就绪');
    db.runSync('DELETE FROM sentences WHERE id = ?', id);
    refresh(db);
  }
  return <Context.Provider value={{ sentences, reviews, ready: !!db, error, add, remove, retry: () => setAttempt((value) => value + 1) }}>{children}</Context.Provider>;
}
export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error('StoreProvider is missing');
  return store;
}
