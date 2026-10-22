import { randomUUID } from 'node:crypto';

function rowToReport(row) {
  return {
    id: row.id,
    placeId: row.place_id,
    placeName: row.place_name ?? undefined,
    reason: row.reason,
    details: row.details,
    contact: row.contact,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  };
}

export function createReportsRepository(db) {
  const getRow = db.prepare(
    `SELECT r.*, p.name AS place_name FROM reports r JOIN places p ON p.id = r.place_id
     WHERE r.id = ?`,
  );
  const placeExists = db.prepare('SELECT 1 FROM places WHERE id = ?');

  return {
    create(placeId, { reason, details = '', contact = '' }) {
      if (!placeExists.get(placeId)) return null;
      const id = randomUUID();
      db.prepare(
        'INSERT INTO reports (id, place_id, reason, details, contact) VALUES (?, ?, ?, ?, ?)',
      ).run(id, placeId, reason, details, contact);
      return rowToReport(getRow.get(id));
    },

    list({ status, limit = 200 } = {}) {
      const where = status ? 'WHERE r.status = @status' : '';
      return db
        .prepare(
          `SELECT r.*, p.name AS place_name FROM reports r JOIN places p ON p.id = r.place_id
           ${where} ORDER BY r.created_at DESC LIMIT @limit`,
        )
        .all({ status, limit })
        .map(rowToReport);
    },

    setStatus(id, status) {
      const changed = db
        .prepare(
          `UPDATE reports SET status = @status,
             resolved_at = CASE WHEN @status = 'open' THEN NULL
                                ELSE strftime('%Y-%m-%dT%H:%M:%fZ', 'now') END
           WHERE id = @id`,
        )
        .run({ id, status }).changes;
      return changed ? rowToReport(getRow.get(id)) : null;
    },

    count(status) {
      const row = status
        ? db.prepare('SELECT COUNT(*) AS n FROM reports WHERE status = ?').get(status)
        : db.prepare('SELECT COUNT(*) AS n FROM reports').get();
      return row.n;
    },
  };
}
