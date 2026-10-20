import type { SQLiteDatabase } from 'expo-sqlite';
import { reviewDates } from '../lib/dates';

type MigrationDatabase = Pick<SQLiteDatabase, 'getFirstSync' | 'getAllSync' | 'withTransactionSync' | 'execSync' | 'runSync'>;

export function migrateReviews(database: MigrationDatabase) {
  database.withTransactionSync(() => {
    const version = database.getFirstSync<{ user_version: number }>('PRAGMA user_version');
    if ((version?.user_version ?? 0) >= 2) return;
    const sentences = database.getAllSync<{ id: number; learning_date: string }>('SELECT id, learning_date FROM sentences');
    for (const sentence of sentences) {
      for (const day of reviewDates(sentence.learning_date)) {
        database.runSync('INSERT OR IGNORE INTO reviews (sentence_id, review_date) VALUES (?, ?)', sentence.id, day);
      }
    }
    database.execSync('PRAGMA user_version = 2');
  });
}
