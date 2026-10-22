# Seed data

`places.json` contains 146 real places across Uzbekistan's regions.

## Sources

- **OpenStreetMap** (© OpenStreetMap contributors, ODbL 1.0): names, coordinates,
  addresses, opening hours, phone numbers and websites. Each record keeps its
  origin in `source`, e.g. `OpenStreetMap way/203545472`.
- **Wikidata** (CC0): used to cross-check names and coordinates.
- **Wikimedia Commons**: the only source of photos. Each photo carries
  `imageCredit` (author and licence) and `imageSource` (the Commons file page).

## Rules

- Phones are only included when present in the source; nothing is invented.
  Places without a phone show "Aloqa ma'lumoti ko'rsatilmagan".
- Ratings start at 0 and come only from user reviews.
- Missing opening hours stay empty instead of being guessed.

Re-seed a local database with `node server/scripts/seed.js --force`.
