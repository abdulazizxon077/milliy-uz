import fs from 'node:fs';
import path from 'node:path';

const PLACES_MAP = {
  'auto-pro-chilonzor': './images/places/auto-pro-chilonzor.jpg',
  'auto-gas-metan-express': './images/places/auto-gas-metan-express.jpg',
  'gas-ung-petro-tashkent': './images/places/gas-ung-petro-tashkent.jpg',
  'gas-avtogaz-metan-tokbor': './images/places/gas-avtogaz-metan-tokbor.jpg',
  'med-16-shoshilinch-tashkent': './images/places/med-16-shoshilinch-tashkent.jpg',
  'med-oksimed-grand-tashkent': './images/places/med-oksimed-grand-tashkent.jpg',
  'police-tashkent-iibb-102': './images/places/police-tashkent-iibb-102.jpg',
  'gov-dxm-chilonzor': './images/places/gov-dxm-chilonzor.jpg',
  'food-besh-qozon-osh': './images/places/besh-qozon.jpg',
  'market-chorsu-bozor': './images/places/chorsu.jpg',
  'edu-ozmu-universitet': './images/places/edu-ozmu-universitet.jpg',
  'edu-pdp-academy': './images/places/edu-pdp-academy.jpg',
  'sport-befit-pro': './images/places/sport-befit-pro.jpg',
  'park-navoiy-milliy': './images/places/park-navoiy-milliy.jpg',
  'auto-samarkand-registon': './images/places/auto-samarkand-registon.jpg',
  'gas-samarkand-afrosiyob': './images/places/gas-samarkand-afrosiyob.jpg',
  'med-samarkand-shoshilinch': './images/places/med-samarkand-shoshilinch.jpg',
  'gov-samarkand-dxm': './images/places/gov-samarkand-dxm.jpg',
  'food-samarkand-registon-osh': './images/places/food-samarkand-registon-osh.jpg',
  'auto-fergana-vodiy-mator': './images/places/auto-fergana-vodiy-mator.jpg',
  'med-fergana-shoshilinch': './images/places/med-fergana-shoshilinch.jpg',
  'gas-andijan-vodiy-metan': './images/places/gas-andijan-vodiy-metan.jpg',
  'gov-andijan-dxm': './images/places/gov-andijan-dxm.jpg',
  'food-namangan-chustiy': './images/places/food-namangan-chustiy.jpg',
  'auto-bukhara-karvon': './images/places/auto-bukhara-karvon.jpg',
  'med-bukhara-ibn-sino': './images/places/med-bukhara-ibn-sino.jpg',
  'food-bukhara-labi-hovuz': './images/places/food-bukhara-labi-hovuz.jpg',
  'med-qarshi-shoshilinch': './images/places/med-qarshi-shoshilinch.jpg',
  'gov-qarshi-dxm': './images/places/gov-qarshi-dxm.jpg',
  'med-termiz-shoshilinch': './images/places/med-termiz-shoshilinch.jpg',
  'gov-termiz-dxm': './images/places/gov-termiz-dxm.jpg',
  'gov-navoiy-dxm': './images/places/gov-navoiy-dxm.jpg',
  'auto-navoiy-servis': './images/places/auto-navoiy-servis.jpg',
  'market-urganch-markaziy': './images/places/market-urganch-markaziy.jpg',
  'med-xorazm-shoshilinch': './images/places/med-xorazm-shoshilinch.jpg',
  'food-jizzax-somsa': './images/places/jizzax-somsa.jpg',
  'med-jizzax-shoshilinch': './images/places/med-jizzax-shoshilinch.jpg',
  'gov-guliston-dxm': './images/places/gov-guliston-dxm.jpg',
  'gas-sirdaryo-metan': './images/places/gas-sirdaryo-metan.jpg',
  'edu-berdaq-nukus': './images/places/edu-berdaq-nukus.png',
  'med-nukus-shoshilinch': './images/places/med-nukus-shoshilinch.jpg',
  'tashkent-vil-hospital': './images/places/tashkent-vil-hospital.jpg',
  'chirchiq-auto-servis': './images/places/chirchiq-auto-servis.jpg',
  'chorvoq-dam-olish': './images/places/chorvoq-dam-olish.jpg',
};

// 1. Update server/seed/places.json
const seedPath = path.resolve('server/seed/places.json');
const seedPlaces = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
seedPlaces.forEach((p) => {
  if (PLACES_MAP[p.id]) {
    p.image = PLACES_MAP[p.id];
  }
});
fs.writeFileSync(seedPath, JSON.stringify(seedPlaces, null, 2) + '\n');
console.log('Updated server/seed/places.json');

// 2. Update web/src/lib/default-places.js
const defaultPath = path.resolve('web/src/lib/default-places.js');
const defaultContent = fs.readFileSync(defaultPath, 'utf8');

// Parse the JSON array inside `export const DEFAULT_PLACES = [...];`
const match = defaultContent.match(/export const DEFAULT_PLACES =\s*(\[[\s\S]*\]);/);
if (!match) {
  throw new Error('Could not find DEFAULT_PLACES array in web/src/lib/default-places.js');
}

const defaultPlaces = JSON.parse(match[1]);
defaultPlaces.forEach((p) => {
  if (PLACES_MAP[p.id]) {
    p.image = PLACES_MAP[p.id];
  }
});

const newContent = `/**
 * Offline-first catalog snapshot for Milliy.uz.
 * Bundled with the web client so the catalog renders instantly on first load
 * and remains fully searchable offline without any network connectivity.
 */

export const DEFAULT_PLACES = ${JSON.stringify(defaultPlaces, null, 2)};
`;

fs.writeFileSync(defaultPath, newContent);
console.log('Updated web/src/lib/default-places.js');
