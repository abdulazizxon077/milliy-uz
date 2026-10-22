CREATE TABLE places (
  id               TEXT PRIMARY KEY,
  name             TEXT    NOT NULL,
  category         TEXT    NOT NULL,
  category_name    TEXT    NOT NULL,
  sub_category     TEXT    NOT NULL DEFAULT '',
  region           TEXT    NOT NULL,
  rating           REAL    NOT NULL DEFAULT 5.0 CHECK (rating BETWEEN 0 AND 5),
  reviews_count    INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  experience_years INTEGER NOT NULL DEFAULT 0,
  experience_text  TEXT    NOT NULL DEFAULT '',
  chief_specialist TEXT    NOT NULL DEFAULT '',
  phone            TEXT    NOT NULL,
  secondary_phone  TEXT    NOT NULL DEFAULT '',
  lat              REAL    NOT NULL,
  lng              REAL    NOT NULL,
  open_time        TEXT    NOT NULL DEFAULT '08:00',
  close_time       TEXT    NOT NULL DEFAULT '22:00',
  is_24_7          INTEGER NOT NULL DEFAULT 0,
  address          TEXT    NOT NULL DEFAULT '',
  landmark         TEXT    NOT NULL DEFAULT '',
  price_range      TEXT    NOT NULL DEFAULT '',
  pricing_details  TEXT    NOT NULL DEFAULT '[]',
  features         TEXT    NOT NULL DEFAULT '[]',
  work_days        TEXT    NOT NULL DEFAULT '',
  image            TEXT    NOT NULL DEFAULT '',
  created_at       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_places_category ON places (category);
CREATE INDEX idx_places_region ON places (region);

CREATE TABLE reviews (
  id           TEXT PRIMARY KEY,
  place_id     TEXT    NOT NULL REFERENCES places (id) ON DELETE CASCADE,
  author       TEXT    NOT NULL,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT    NOT NULL,
  status       TEXT    NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden')),
  display_date TEXT,
  created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_reviews_place ON reviews (place_id, status, created_at);

CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
