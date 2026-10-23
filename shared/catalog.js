/**
 * Catalog reference data shared by the API and the web client.
 */

export const CATEGORIES_I18N = {
  auto: {
    uz: { name: 'Avto Ustaxona', desc: 'Mator, Xodovoy, Gaz' },
    ru: { name: 'Автосервис', desc: 'Мотор, Ходовая, ГБО' },
    en: { name: 'Auto Repair', desc: 'Engine, Suspension, CNG' },
  },
  gas: {
    uz: { name: 'Zapravka & EV', desc: 'Metan 220 bar, TokBor' },
    ru: { name: 'Заправки и ЭЗС', desc: 'Метан 220 бар, TokBor' },
    en: { name: 'Fuel & EV Charging', desc: 'CNG 220 bar, TokBor' },
  },
  medical: {
    uz: { name: 'Shifoxona & Dori', desc: 'Davlat, Xususiy, 103' },
    ru: { name: 'Клиники и Аптеки', desc: 'Гос., Частные, 103' },
    en: { name: 'Hospitals & Pharma', desc: 'Public, Private, 103' },
  },
  police: {
    uz: { name: 'Militsiya 102', desc: 'IIB, Prokuratura, YHXX' },
    ru: { name: 'Милиция 102', desc: 'ГУВД, Прокуратура, УБДД' },
    en: { name: 'Police & Law 102', desc: 'Police Dept, Prosecution' },
  },
  gov: {
    uz: { name: 'Davlat Xizmatlari', desc: 'DXM, FHDYo, E-imzo' },
    ru: { name: 'Госуслуги (ЦГУ)', desc: 'ЦГУ, ЗАГС, ЭЦП' },
    en: { name: 'Public Services (DXM)', desc: 'Civil Services, Registry' },
  },
  food: {
    uz: { name: 'Choyxona & Osh', desc: 'Milliy taomlar, Kafelar' },
    ru: { name: 'Чайхана и Плов', desc: 'Национальная кухня, Кафе' },
    en: { name: 'National Cuisine', desc: 'Plov centers, Cafes' },
  },
  market: {
    uz: { name: 'Savdo & Bozor', desc: 'Chorsu, Gipermarketlar' },
    ru: { name: 'Рынки и Торговля', desc: 'Чорсу, Гипермаркеты' },
    en: { name: 'Markets & Bazaars', desc: 'Chorsu, Supermarkets' },
  },
  edu: {
    uz: { name: "Ta'lim & OTM", desc: 'Universitet, IT kurslar' },
    ru: { name: 'Образование и ВУЗы', desc: 'Университеты, IT академии' },
    en: { name: 'Education & Academies', desc: 'Universities, IT bootcamps' },
  },
  sport: {
    uz: { name: 'Sport & Fitnes', desc: 'Basseyn, Trenajyor' },
    ru: { name: 'Спорт и Фитнес', desc: 'Бассейны, Тренажерные залы' },
    en: { name: 'Sports & Fitness', desc: 'Swimming pools, Gyms' },
  },
  parks: {
    uz: { name: 'Parklar & Hordiq', desc: "Xiyobon, Muzey, Ko'l" },
    ru: { name: 'Парки и Отдых', desc: 'Аллеи, Музеи, Озера' },
    en: { name: 'Parks & Recreation', desc: 'City parks, Museums, Lakes' },
  },
};

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

export const REGIONS_I18N = {
  all_uz: {
    uz: "Butun O'zbekiston (14 ta hudud)",
    ru: 'Весь Узбекистан (14 регионов)',
    en: 'All Uzbekistan (14 regions)',
  },
  tashkent: {
    uz: 'Toshkent shahri',
    ru: 'г. Ташкент',
    en: 'Tashkent city',
  },
  samarkand: {
    uz: 'Samarqand viloyati',
    ru: 'Самаркандская область',
    en: 'Samarkand region',
  },
  fergana: {
    uz: "Farg'ona viloyati",
    ru: 'Ферганская область',
    en: 'Fergana region',
  },
  andijan: {
    uz: 'Andijon viloyati',
    ru: 'Андижанская область',
    en: 'Andijan region',
  },
  namangan: {
    uz: 'Namangan viloyati',
    ru: 'Наманганская область',
    en: 'Namangan region',
  },
  bukhara: {
    uz: 'Buxoro viloyati',
    ru: 'Бухарская область',
    en: 'Bukhara region',
  },
  qashqadaryo: {
    uz: 'Qashqadaryo viloyati',
    ru: 'Кашкадарьинская область',
    en: 'Kashkadarya region',
  },
  surxondaryo: {
    uz: 'Surxondaryo viloyati',
    ru: 'Сурхандарьинская область',
    en: 'Surkhandarya region',
  },
  navoiy: {
    uz: 'Navoiy viloyati',
    ru: 'Навоийская область',
    en: 'Navoi region',
  },
  xorazm: {
    uz: 'Xorazm viloyati',
    ru: 'Хорезмская область',
    en: 'Khorezm region',
  },
  jizzax: {
    uz: 'Jizzax viloyati',
    ru: 'Джизакская область',
    en: 'Jizzakh region',
  },
  sirdaryo: {
    uz: 'Sirdaryo viloyati',
    ru: 'Сырдарьинская область',
    en: 'Sirdaryo region',
  },
  karakalpak: {
    uz: "Qoraqalpog'iston Resp.",
    ru: 'Респ. Каракалпакстан',
    en: 'Rep. of Karakalpakstan',
  },
};

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

export function categoryName(id, lang = 'uz') {
  return CATEGORIES_I18N[id]?.[lang]?.name ?? CATEGORIES.find((c) => c.id === id)?.name ?? 'Boshqa';
}

export function categoryDesc(id, lang = 'uz') {
  return CATEGORIES_I18N[id]?.[lang]?.desc ?? CATEGORIES.find((c) => c.id === id)?.desc ?? '';
}

export function regionName(id, lang = 'uz') {
  return REGIONS_I18N[id]?.[lang] ?? REGIONS.find((r) => r.id === id)?.name ?? id;
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

export function reportReasonName(id, lang = 'uz') {
  const i18n = {
    phone: { uz: "Telefon raqami noto'g'ri", ru: 'Неверный номер телефона', en: 'Incorrect phone number' },
    hours: { uz: "Ish vaqti noto'g'ri", ru: 'Неверный график работы', en: 'Incorrect working hours' },
    location: { uz: "Manzil yoki xaritadagi joy noto'g'ri", ru: 'Неверный адрес или точка на карте', en: 'Incorrect address or map location' },
    closed: { uz: 'Tashkilot yopilgan', ru: 'Организация закрыта', en: 'Organization closed' },
    other: { uz: 'Boshqa', ru: 'Другое', en: 'Other' },
  };
  return i18n[id]?.[lang] ?? REPORT_REASONS.find((r) => r.id === id)?.name ?? id;
}
