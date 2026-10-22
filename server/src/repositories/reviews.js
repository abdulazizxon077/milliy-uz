import { randomUUID } from 'node:crypto';
import { rowToReview } from './places.js';

export function createReviewsRepository(db) {
  const getRow = db.prepare('SELECT * FROM reviews WHERE id = ?');
  const getPlace = db.prepare('SELECT rating, reviews_count FROM places WHERE id = ?');
  const setPlaceRating = db.prepare('UPDATE places SET rating = ?, reviews_count = ? WHERE id = ?');

  /** Adds (+1) or removes (-1) one review's contribution to the place's running average. */
  function applyToRating(placeId, rating, direction) {
    const place = getPlace.get(placeId);
    if (!place) return;
    const count = place.reviews_count + direction;
    const total = place.rating * place.reviews_count + direction * rating;
    const avg = count > 0 ? Math.min(5, Math.max(0, total / count)) : 0;
    setPlaceRating.run(avg, Math.max(0, count), placeId);
  }

  return {
    get(id) {
      const row = getRow.get(id);
      return row ? rowToReview(row) : null;
    },

    list({ status, limit = 200 } = {}) {
      const rows = status
        ? db
            .prepare(
              `SELECT r.*, p.name AS place_name FROM reviews r JOIN places p ON p.id = r.place_id
               WHERE r.status = ? ORDER BY r.created_at DESC LIMIT ?`,
            )
            .all(status, limit)
        : db
            .prepare(
              `SELECT r.*, p.name AS place_name FROM reviews r JOIN places p ON p.id = r.place_id
               ORDER BY r.created_at DESC LIMIT ?`,
            )
            .all(limit);
      return rows.map((row) => ({ ...rowToReview(row), placeName: row.place_name }));
    },

    create: db.transaction((placeId, { author, rating, comment }) => {
      if (!getPlace.get(placeId)) return null;
      const id = randomUUID();
      db.prepare(
        'INSERT INTO reviews (id, place_id, author, rating, comment) VALUES (?, ?, ?, ?, ?)',
      ).run(id, placeId, author, rating, comment);
      applyToRating(placeId, rating, +1);
      return rowToReview(getRow.get(id));
    }),

    setStatus: db.transaction((id, status) => {
      const row = getRow.get(id);
      if (!row) return null;
      if (row.status !== status) {
        db.prepare('UPDATE reviews SET status = ? WHERE id = ?').run(status, id);
        applyToRating(row.place_id, row.rating, status === 'published' ? +1 : -1);
      }
      return rowToReview(getRow.get(id));
    }),

    remove: db.transaction((id) => {
      const row = getRow.get(id);
      if (!row) return false;
      db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
      if (row.status === 'published') applyToRating(row.place_id, row.rating, -1);
      return true;
    }),

    count(status) {
      return status
        ? db.prepare('SELECT COUNT(*) FROM reviews WHERE status = ?').pluck().get(status)
        : db.prepare('SELECT COUNT(*) FROM reviews').pluck().get();
    },
  };
}
