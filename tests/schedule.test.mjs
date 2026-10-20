import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { reviewDates, parseDay, addDays } from '../src/lib/dates.ts';
import { SCHEMA } from '../src/data/schema.ts';

test('fixed reviews are offsets from the original day', () => {
  assert.deepEqual(reviewDates('2026-10-01'), ['2026-10-02', '2026-10-04', '2026-10-08', '2026-10-15', '2026-10-31', '2026-11-30', '2026-12-31', '2027-01-31', '2027-02-28', '2027-03-31', '2027-04-30', '2027-05-31', '2027-06-30', '2027-07-31', '2027-08-31']);
});
test('monthly dates keep the anchor day after a short month and support leap years', () => {
  const dates = reviewDates('2027-12-31');
  assert.deepEqual(dates.slice(4, 8), ['2028-01-30', '2028-02-29', '2028-03-30', '2028-04-30']);
  assert.equal(new Set(dates).size, 15);
});
test('calendar arithmetic handles leap days, year boundaries and daylight saving', () => {
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2026-03-07', 3), '2026-03-10');
  assert.throws(() => parseDay('2026-02-30'));
  assert.throws(() => parseDay('2026-2-01'));
});
test('review-day deletion removes the source and every schedule, preserving other sentences', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(SCHEMA);
  const insert = db.prepare('INSERT INTO sentences (japanese, learning_date, created_at) VALUES (?, ?, ?)');
  const id = insert.run('今日も少しずつ。', '2026-10-01', new Date().toISOString()).lastInsertRowid;
  const other = insert.run('明日も。', '2026-10-02', new Date().toISOString()).lastInsertRowid;
  for (const sentenceId of [id, other]) for (const day of reviewDates(sentenceId === id ? '2026-10-01' : '2026-10-02')) db.prepare('INSERT INTO reviews VALUES (?, ?)').run(sentenceId, day);
  const review = db.prepare('SELECT sentence_id FROM reviews WHERE review_date = ?').get('2026-10-02');
  db.prepare('DELETE FROM sentences WHERE id = ?').run(review.sentence_id);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM reviews WHERE sentence_id = ?').get(id).n, 0);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM sentences WHERE id = ?').get(id).n, 0);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM reviews WHERE sentence_id = ?').get(other).n, 15);
  db.close();
});

test('existing schedules migrate once, keep sentences intact, and roll back on failure', async () => {
  const { readFileSync } = await import('node:fs');
  const { default: ts } = await import('typescript');
  const source = readFileSync(new URL('../src/data/migrations.ts', import.meta.url), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText.replace('../lib/dates', new URL('../src/lib/dates.ts', import.meta.url).href);
  const { migrateReviews } = await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);
  const db = new DatabaseSync(':memory:');
  db.exec(SCHEMA);
  db.exec("PRAGMA user_version = 1; INSERT INTO sentences (japanese, learning_date, created_at) VALUES ('原句', '2026-10-01', 'original');");
  for (const day of reviewDates('2026-10-01').slice(0, 5)) db.prepare('INSERT INTO reviews VALUES (1, ?)').run(day);
  const adapter = {
    getFirstSync: (sql) => db.prepare(sql).get(),
    getAllSync: (sql) => db.prepare(sql).all(),
    runSync: (sql, ...params) => db.prepare(sql).run(...params),
    execSync: (sql) => db.exec(sql),
    withTransactionSync: (callback) => {
      db.exec('BEGIN');
      try { callback(); db.exec('COMMIT'); } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
  };
  assert.throws(() => migrateReviews({ ...adapter, runSync: () => { throw new Error('disk error'); } }));
  assert.equal(db.prepare('PRAGMA user_version').get().user_version, 1);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM reviews').get().n, 5);
  migrateReviews(adapter);
  migrateReviews(adapter);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM reviews').get().n, 15);
  assert.equal(db.prepare('SELECT japanese FROM sentences').get().japanese, '原句');
  assert.equal(db.prepare('PRAGMA user_version').get().user_version, 2);
  db.close();
});
