export const SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS sentences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    japanese TEXT NOT NULL CHECK(length(trim(japanese)) > 0),
    translation TEXT NOT NULL DEFAULT '',
    learning_date TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS reviews (
    sentence_id INTEGER NOT NULL REFERENCES sentences(id) ON DELETE CASCADE,
    review_date TEXT NOT NULL,
    PRIMARY KEY (sentence_id, review_date)
  );
  CREATE INDEX IF NOT EXISTS reviews_date ON reviews(review_date);
  CREATE INDEX IF NOT EXISTS sentences_date ON sentences(learning_date);
`;
