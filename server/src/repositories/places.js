import { randomUUID } from 'node:crypto';
import { categoryName } from '../../../shared/catalog.js';
import { normalizeOpeningHours } from '../../../shared/opening-hours.js';

const COLUMNS = {
  name: 'name',
  category: 'category',
  categoryName: 'category_name',
  subCategory: 'sub_category',
  region: 'region',
  rating: 'rating',
  reviewsCount: 'reviews_count',
  experienceYears: 'experience_years',
  experienceText: 'experience_text',
  chiefSpecialist: 'chief_specialist',
  phone: 'phone',
  secondaryPhone: 'secondary_phone',
  lat: 'lat',
  lng: 'lng',
  openTime: 'open_time',
  closeTime: 'close_time',
  is247: 'is_24_7',
  address: 'address',
  landmark: 'landmark',
  priceRange: 'price_range',
  pricingDetails: 'pricing_details',
  features: 'features',
  workDays: 'work_days',
  image: 'image',
  openingHours: 'opening_hours',
  website: 'website',
  imageCredit: 'image_credit',
  imageSource: 'image_source',
  source: 'source',
};

const JSON_FIELDS = new Set(['pricingDetails', 'features']);

export function rowToPlace(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categoryName: row.category_name,
    subCategory: row.sub_category,
    region: row.region,
    rating: row.reviews_count > 0 ? Math.round(row.rating * 10) / 10 : 0,
    reviewsCount: row.reviews_count,
    experienceYears: row.experience_years,
    experienceText: row.experience_text,
    chiefSpecialist: row.chief_specialist,
    phone: row.phone,
    secondaryPhone: row.secondary_phone,
    lat: row.lat,
    lng: row.lng,
    openingHours: row.opening_hours,
    is247: row.opening_hours === '24/7',
    address: row.address,
    landmark: row.landmark,
    priceRange: row.price_range,
    pricingDetails: JSON.parse(row.pricing_details),
    features: JSON.parse(row.features),
    image: row.image,
    imageCredit: row.image_credit,
    imageSource: row.image_source,
    website: row.website,
    source: row.source,
  };
}

export function rowToReview(row) {
  return {
    id: row.id,
    placeId: row.place_id,
    author: row.author,
    rating: row.rating,
    comment: row.comment,
    status: row.status,
    date: row.display_date,
    createdAt: row.created_at,
  };
}

/**
 * Older clients and import files send a single daily range; turn it into the
 * opening_hours text that the catalog now reads.
 */
function withOpeningHours(data) {
  if (data.openingHours !== undefined) {
    return { ...data, openingHours: normalizeOpeningHours(data.openingHours) };
  }
  if (data.is247) return { ...data, openingHours: '24/7' };
  if (data.openTime && data.closeTime) {
    return { ...data, openingHours: `${data.openTime}-${data.closeTime}` };
  }
  if (data.is247 === false) return { ...data, openingHours: '' };
  return data;
}

function toRow(input) {
  const data = withOpeningHours(input);
  const row = {};
  for (const [key, column] of Object.entries(COLUMNS)) {
    if (data[key] === undefined) continue;
    let value = data[key];
    if (JSON_FIELDS.has(key)) value = JSON.stringify(value);
    else if (key === 'is247') value = value ? 1 : 0;
    row[column] = value;
  }
  return row;
}

export function slugify(name) {
  const base = String(name)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `${base || 'place'}-${randomUUID().slice(0, 6)}`;
}

export function createPlacesRepository(db) {
  const insertReview = db.prepare(`
    INSERT INTO reviews (id, place_id, author, rating, comment, status, display_date, created_at)
    VALUES (@id, @place_id, @author, @rating, @comment, @status, @display_date,
            COALESCE(@created_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')))
  `);

  function insert(data) {
    const row = toRow({ categoryName: categoryName(data.category), rating: 0, ...data });
    row.id = data.id ?? slugify(data.name);
    const cols = Object.keys(row);
    db.prepare(
      `INSERT INTO places (${cols.join(', ')}) VALUES (${cols.map((c) => `@${c}`).join(', ')})`,
    ).run(row);

    for (const [i, review] of (data.reviews ?? []).entries()) {
      insertReview.run({
        id: `${row.id}:${review.id ?? i}`,
        place_id: row.id,
        author: review.author,
        rating: review.rating,
        comment: review.comment,
        status: review.status ?? 'published',
        display_date: review.date ?? null,
        // Keep the source order stable: earlier entries in the list are newer.
        created_at: review.createdAt ?? new Date(Date.now() - i * 1000).toISOString(),
      });
    }
    return row.id;
  }

  return {
    list() {
      return db.prepare('SELECT * FROM places ORDER BY rating DESC, name').all().map(rowToPlace);
    },

    get(id) {
      const row = db.prepare('SELECT * FROM places WHERE id = ?').get(id);
      return row ? rowToPlace(row) : null;
    },

    getWithReviews(id, { limit = 50 } = {}) {
      const place = this.get(id);
      if (!place) return null;
      place.reviews = db
        .prepare(
          `SELECT * FROM reviews WHERE place_id = ? AND status = 'published'
           ORDER BY created_at DESC, rowid DESC LIMIT ?`,
        )
        .all(id, limit)
        .map(rowToReview);
      return place;
    },

    create(data) {
      return this.get(insert(data));
    },

    update(id, data) {
      const row = toRow(data);
      if (data.category && data.categoryName === undefined) {
        row.category_name = categoryName(data.category);
      }
      const cols = Object.keys(row);
      if (!cols.length) return this.get(id);
      const info = db
        .prepare(
          `UPDATE places SET ${cols.map((c) => `${c} = @${c}`).join(', ')},
             updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
           WHERE id = @id`,
        )
        .run({ ...row, id });
      return info.changes ? this.get(id) : null;
    },

    remove(id) {
      return db.prepare('DELETE FROM places WHERE id = ?').run(id).changes > 0;
    },

    /** Replaces the whole catalog atomically. Used by the seed script and admin import. */
    replaceAll: db.transaction((places) => {
      db.prepare('DELETE FROM places').run();
      for (const place of places) insert(place);
      return places.length;
    }),

    exportAll() {
      const reviewsByPlace = new Map();
      for (const row of db.prepare('SELECT * FROM reviews ORDER BY created_at').all()) {
        const { placeId: _placeId, ...review } = rowToReview(row);
        review.id = review.id.split(':').pop();
        if (!reviewsByPlace.has(row.place_id)) reviewsByPlace.set(row.place_id, []);
        reviewsByPlace.get(row.place_id).push(review);
      }
      return this.list().map((p) => ({ ...p, reviews: reviewsByPlace.get(p.id) ?? [] }));
    },

    count() {
      return db.prepare('SELECT COUNT(*) FROM places').pluck().get();
    },
  };
}
