import { loadConfig } from '../src/config.js';
import { migrate, openDatabase } from '../src/db.js';

const config = loadConfig();
const db = openDatabase(config.databasePath);
const applied = migrate(db);
db.close();

console.log(applied.length ? `Applied: ${applied.join(', ')}` : 'Database is up to date');
