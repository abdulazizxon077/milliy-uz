/**
 * Catalog reference data shared by the API and the web client.
 */

export const CATEGORIES = [
  { id: 'auto', name: 'Avto Ustaxona', desc: 'Mator, Xodovoy, Gaz', icon: 'wrench' },
  { id: 'gas', name: 'Zapravka & EV', desc: 'Metan 220 bar, TokBor', icon: 'fuel' },
  { id: 'medical', name: 'Shifoxona & Dori', desc: 'Davlat, Xususiy, 103', icon: 'stethoscope' },
  { id: 'police', name: 'Militsiya 102', desc: 'IIB, Prokuratura, YHXX', icon: 'shield-alert' },
  { id: 'gov', name: 'Davlat Xizmatlari', desc: 'DXM, FHDYo, E-imzo', icon: 'landmark' },
  { id: 'food', name: 'Choyxona & Osh', desc: 'Milliy taomlar, Kafelar', icon: 'utensils' },
  { id: 'market', name: 'Savdo & Bozor', desc: 'Chorsu, Gipermarketlar', icon: 'shopping-bag' },
  { id: 'edu', name: "Ta'lim & OTM", desc: 'Universitet, IT kurslar', icon: 'graduation-cap' },
  { id: 'sport', name: 'Sport & Fitnes', desc: 'Basseyn, Trenajyor', icon: 'dumbbell' },
  { id: 'parks', name: 'Parklar & Hordiq', desc: "Xiyobon, Muzey, Ko'l", icon: 'trees' },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export const REGIONS = [
  { id: 'tashkent', name: 'Toshkent shahri', center: { lat: 41.3111, lng: 69.2406 } },
  { id: 'samarkand', name: 'Samarqand', center: { lat: 39.6542, lng: 66.9597 } },
  { id: 'fergana', name: "Farg'ona", center: { lat: 40.3842, lng: 71.7843 } },
  { id: 'andijan', name: 'Andijon', center: { lat: 40.7821, lng: 72.3442 } },
  { id: 'namangan', name: 'Namangan', center: { lat: 40.9983, lng: 71.6726 } },
  { id: 'bukhara', name: 'Buxoro', center: { lat: 39.7747, lng: 64.4286 } },
  { id: 'qashqadaryo', name: 'Qashqadaryo', center: { lat: 38.8606, lng: 65.7891 } },
  { id: 'surxondaryo', name: 'Surxondaryo', center: { lat: 37.2242, lng: 67.2783 } },
  { id: 'navoiy', name: 'Navoiy', center: { lat: 40.0844, lng: 65.3792 } },
  { id: 'xorazm', name: 'Xorazm', center: { lat: 41.5562, lng: 60.6317 } },
  { id: 'jizzax', name: 'Jizzax', center: { lat: 40.1158, lng: 67.8422 } },
  { id: 'sirdaryo', name: 'Sirdaryo', center: { lat: 40.4983, lng: 68.7842 } },
  { id: 'karakalpak', name: "Qoraqalpog'iston", center: { lat: 42.458, lng: 59.612 } },
];

export const REGION_IDS = REGIONS.map((r) => r.id);

export const COUNTRY_VIEW = { lat: 41.3775, lng: 64.5853, zoom: 6 };
export const REGION_ZOOM = 13;

export function categoryName(id) {
  return CATEGORIES.find((c) => c.id === id)?.name ?? 'Boshqa';
}

/** Reasons a visitor can pick when reporting outdated or wrong information. */
export const REPORT_REASONS = [
  { id: 'phone', name: "Telefon raqami noto'g'ri" },
  { id: 'hours', name: "Ish vaqti noto'g'ri" },
  { id: 'location', name: "Manzil yoki xaritadagi joy noto'g'ri" },
  { id: 'closed', name: 'Tashkilot yopilgan' },
  { id: 'other', name: 'Boshqa' },
];

export const REPORT_REASON_IDS = REPORT_REASONS.map((r) => r.id);
