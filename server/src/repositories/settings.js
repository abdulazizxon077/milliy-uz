export function createSettingsRepository(db) {
  const getStmt = db.prepare('SELECT value FROM settings WHERE key = ?').pluck();
  const setStmt = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value',
  );
  return {
    get(key, fallback = null) {
      return getStmt.get(key) ?? fallback;
    },
    set(key, value) {
      setStmt.run(key, value);
    },
  };
}
