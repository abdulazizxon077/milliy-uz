import fs from 'node:fs';
import { loadConfig } from '../src/config.js';
import { migrate, openDatabase } from '../src/db.js';
import { createPlacesRepository } from '../src/repositories/places.js';

const force = process.argv.includes('--force');
const config = loadConfig();
const db = openDatabase(config.databasePath);
migrate(db);

const places = createPlacesRepository(db);
if (places.count() > 0 && !force) {
  console.log(`Database already has ${places.count()} places; use --force to replace them`);
} else {
  const data = JSON.parse(fs.readFileSync(new URL('../seed/places.json', import.meta.url), 'utf8'));
  console.log(`Seeded ${places.replaceAll(data)} places`);
}
db.close();
