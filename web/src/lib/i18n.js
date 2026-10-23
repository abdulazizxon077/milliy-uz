/**
 * Internationalization (i18n) module for MILLIY.UZ
 * Supports 3 languages: Uzbek ('uz'), Russian ('ru'), English ('en')
 */

export const LANGUAGES = [
  { code: 'uz', name: "O'zbekcha", short: "O'Z" },
  { code: 'ru', name: 'Русский', short: 'РУ' },
  { code: 'en', name: 'English', short: 'EN' },
];

export const DEFAULT_LANGUAGE = 'uz';
const STORAGE_KEY = 'milliy_lang';

export function getInitialLanguage() {
  try {
    const saved = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (saved && ['uz', 'ru', 'en'].includes(saved)) return saved;
  } catch {
    // localStorage might be unavailable
  }
  const browser = (globalThis.navigator?.language || '').slice(0, 2).toLowerCase();
  if (browser === 'ru') return 'ru';
  if (browser === 'en') return 'en';
  return DEFAULT_LANGUAGE;
}

export function saveLanguage(lang) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  } catch {
    // ignore storage quota/security errors
  }
}

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

export const REPORT_REASONS_I18N = {
  phone: {
    uz: "Telefon raqami noto'g'ri",
    ru: 'Неверный номер телефона',
    en: 'Incorrect phone number',
  },
  hours: {
    uz: "Ish vaqti noto'g'ri",
    ru: 'Неверный график работы',
    en: 'Incorrect working hours',
  },
  location: {
    uz: "Manzil yoki xaritadagi joy noto'g'ri",
    ru: 'Неверный адрес или точка на карте',
    en: 'Incorrect address or map location',
  },
  closed: {
    uz: 'Tashkilot yopilgan',
    ru: 'Организация закрыта / не работает',
    en: 'Permanently closed',
  },
  other: {
    uz: 'Boshqa',
    ru: 'Другое',
    en: 'Other',
  },
};

export const TRANSLATIONS = {
  uz: {
    // Header & Brand
    brandSubtitle: 'Milliy katalog',
    navHome: 'Asosiy',
    navCategories: 'Sohalar',
    navCatalog: 'Katalog',
    navMap: 'Xarita',
    navConsultant: 'Konsultant',
    bookmarksTitle: 'Saqlangan joylar',
    offlineAlert: "Internet aloqasi yo'q. Shoshilinch raqamlar quyida doim ishlaydi.",

    // Emergency Bar
    sosTitle: 'Tezkor Yordam & Ishonch Raqamlari:',
    sosFire: "Yong'in",
    sosPolice: 'Militsiya',
    sosAmbulance: 'Tez Yordam',
    sosGas: 'Gaz Avariya',
    sosRescue: 'FVV Qutqaruv',
    sosUnified: 'Yagona 112',

    // Hero Section
    heroBadge: "O'ZBEKISTON MILLIY PLATFORMASI",
    heroTitlePrefix: "O'zingizga kerak bo'lgan",
    heroTitleAccent: 'soha va xodimlarni',
    heroTitleSuffix: 'tanlang',
    heroDesc: "Shifokor, usta, DXM, zapravka va o'quv markazlari bitta katalogda: telefon, manzil, ish vaqti va xarita.",
    heroOpenCatalog: 'Katalogni ochish',
    heroAskAssistant: "Konsultantdan so'rash",
    statRegions: '14 ta hudud',
    statCategories: '10 ta soha',
    statRoute: 'Marshrut',
    statDirectCall: "To'g'ridan-to'g'ri aloqa",
    heroCardTitle: 'Mutaxassis va tashkilotlar',
    heroCardDesc: 'Tajriba, telefon, ish vaqti va marshrut bir kartochkada.',
    heroTileAuto: 'Ustalar',
    heroTileMedical: 'Tibbiyot',
    heroTileGov: 'DXM',
    heroTileGas: 'Zapravka',
    heroCardBtnCategories: 'Sohalar',
    heroCardBtnList: "Ro'yxat",

    // Categories Section
    categoriesTitle: "Katalog Bo'yicha Qidiruv",
    categoriesSubtitle: "O'zbekistonda mavjud barcha 10 ta asosiy soha va xizmatlar to'plami",
    categoryViewLink: "Ko'rish →",
    categoryCountSuffix: 'ta joy',

    // Catalog & Filters
    catalogTitle: "Xizmatlar va Obyektlar Ro'yxati",
    searchPlaceholder: 'Ustaxona, shifoxona, mutaxassis ismi yoki manzil...',
    sortByDistance: "Eng yaqin masofa bo'yicha",
    sortByRating: "Eng yuqori reyting bo'yicha",
    sortByExperience: "Eng ko'p ish tajribasi bo'yicha",
    filterOpenNow: "Faqat hozir ochiq bo'lganlar (24/7)",
    filterGuaranteed: 'Kafolat beriladigan xizmatlar',
    showAllCategories: "Barcha toifalarni ko'rsatish",
    resultsFound: '{count} ta natija topildi',
    noResults: "Ushbu parametrlar bo'yicha ma'lumot topilmadi",

    // Place Cards
    experienceLabel: 'Tajriba:',
    specialistLabel: 'Mutaxassis:',
    ratingLabel: 'Reyting:',
    pricesLabel: 'Narxlar',
    yearsSuffix: 'yil',
    callBtn: "Qo'ng'iroq",
    routeBtn: 'Marshrut',
    fromYou: 'sizdan',

    // Map Section
    yourLocation: 'Sizning joylashuvingiz:',
    defaultLocationText: 'Toshkent, Chilonzor (GPS orqali eng yaqin joylar)',
    locateMeBtn: 'Mening joyimga qaytish',
    locatingToast: 'Joylashuv aniqlanmoqda...',
    locatedSuccess: 'Joylashuv aniqlandi',
    locatedFailed: "Joylashuvni aniqlab bo'lmadi",

    // AI Assistant Section
    assistantTitle: 'Katalog konsultanti',
    assistantSubtitle: 'Usta, shifoxona, zapravka va DXM qidiruvi',
    assistantStatus: 'Qabul ochiq',
    assistantWelcomeName: 'Konsultant',
    assistantWelcomeMessage: 'Assalomu alaykum. Milliy.uz katalogidan obyekt topishga yordam beraman.',
    assistantWelcomeHint: 'Masalan: eng yaqin usta, 24/7 dorixona yoki Chilonzordagi DXM.',
    promptGreeting: 'Salomlashish',
    promptGreetingVal: 'Assalomu alaykum! Qandaysiz?',
    promptAuto: 'Mator usta kerak',
    promptAutoVal: 'Matorim buzildi, hozir ochiq eng yaqin usta bormi?',
    promptGas: 'Metan zapravka (220 bar)',
    promptGasVal: 'Hozir ochiq eng yaqin Metan zapravkani topib ber',
    promptMedical: '24/7 Dorixona',
    promptMedicalVal: '24/7 navbatchi dorixona qayerda?',
    assistantInputPlaceholder: 'Nima kerakligini yozing yoki mikrofondan ayting: usta, dorixona, DXM...',
    assistantSendBtn: 'Yuborish',
    assistantDetailsBtn: 'Batafsil',
    assistantTyping: 'Qidirilmoqda...',
    assistantNoMatch: 'Hozircha mos joy topilmadi.',
    assistantNearbyHeader: 'Yaqin atrofdagi mos obyektlar:',

    // Place Details Modal
    tabSpecialist: 'Mutaxassis',
    tabSchedule: 'Ish tartibi',
    tabRating: 'Reyting',
    priceListTitle: 'Xizmatlar narxi',
    pricesNegotiable: 'Narxlar kelishiladi.',
    reviewsTitle: 'Mijozlar sharhlari',
    noReviewsYet: "Hozircha sharhlar mavjud emas. Birinchi bo'lib fikr qoldiring!",
    leaveReviewTitle: 'Fikr qoldirish',
    yourName: 'Ismingiz',
    yourRating: 'Baho',
    yourComment: 'Sharh',
    submitReviewBtn: 'Sharhni Chop Etish',
    landmarkPrefix: "Mo'ljal:",
    ratingsCountSuffix: 'ta baho',
    bookmarkSave: 'Saqlash',
    bookmarkSaved: 'Saqlangan',
    shareBtn: 'Ulashish',
    reportIssueBtn: 'Xatolik haqida xabar berish',
    shareLinkCopied: 'Havola nusxalandi',
    reviewSubmitted: 'Sharhingiz qabul qilindi va chop etildi!',

    // Report Issue Form
    reportTitle: "Ma'lumotdagi xatolik haqida xabar berish",
    reportSubtitle: "Moderator tekshirib, ma'lumotni yangilaydi.",
    whatIsWrong: "Nima noto'g'ri?",
    commentLabel: 'Izoh',
    optionalHint: '(ixtiyoriy)',
    requiredHint: '(majburiy)',
    commentPlaceholder: "Masalan: to'g'ri raqam +998 90 123 45 67",
    contactLabel: 'Aloqa uchun (ixtiyoriy)',
    contactPlaceholder: 'Telefon yoki Telegram',
    sendReportBtn: 'Yuborish',
    cancelBtn: 'Bekor qilish',
    reportSuccess: 'Rahmat! Xabaringiz moderatorga yuborildi',

    // Bookmarks Drawer
    bookmarksHeading: 'Saqlangan Joylar',
    noBookmarks: "Hozircha saqlangan joylar yo'q",
    closeBtn: 'Yopish',

    // Footer & Admin
    footerSubtitle: "O'zbekiston xizmatlar katalogi",
    copyright: '© 2026 Barcha huquqlar himoyalangan.',
    adminPortal: 'Admin Portal',
    langSwitched: "Til o'zgartirildi: O'zbekcha",
  },

  ru: {
    // Header & Brand
    brandSubtitle: 'Национальный каталог',
    navHome: 'Главная',
    navCategories: 'Сферы',
    navCatalog: 'Каталог',
    navMap: 'Карта',
    navConsultant: 'Консультант',
    bookmarksTitle: 'Сохраненные места',
    offlineAlert: 'Нет подключения к интернету. Экстренные номера работают всегда.',

    // Emergency Bar
    sosTitle: 'Службы экстренной помощи и доверия:',
    sosFire: 'Пожарная',
    sosPolice: 'Милиция',
    sosAmbulance: 'Скорая помощь',
    sosGas: 'Аварийная газа',
    sosRescue: 'МЧС Спасение',
    sosUnified: 'Единая 112',

    // Hero Section
    heroBadge: 'НАЦИОНАЛЬНАЯ ПЛАТФОРМА УЗБЕКИСТАНА',
    heroTitlePrefix: 'Выберите нужную',
    heroTitleAccent: 'сферу и специалистов',
    heroTitleSuffix: 'для ваших задач',
    heroDesc: 'Мастера, клиники, заправки, ЦГУ и учебные центры в едином каталоге: контакты, график работы и карта.',
    heroOpenCatalog: 'Открыть каталог',
    heroAskAssistant: 'Спросить консультанта',
    statRegions: '14 регионов',
    statCategories: '10 сфер',
    statRoute: 'Маршрут',
    statDirectCall: 'Прямая связь',
    heroCardTitle: 'Специалисты и организации',
    heroCardDesc: 'Опыт, телефон, график работы и маршрут в одной карточке.',
    heroTileAuto: 'Мастера',
    heroTileMedical: 'Медицина',
    heroTileGov: 'ЦГУ',
    heroTileGas: 'Заправка',
    heroCardBtnCategories: 'Сферы',
    heroCardBtnList: 'Список',

    // Categories Section
    categoriesTitle: 'Поиск по каталогу',
    categoriesSubtitle: 'Все 10 ключевых сфер и сервисов Узбекистана',
    categoryViewLink: 'Смотреть →',
    categoryCountSuffix: 'мест',

    // Catalog & Filters
    catalogTitle: 'Список услуг и объектов',
    searchPlaceholder: 'Мастерская, клиника, имя специалиста или адрес...',
    sortByDistance: 'По расстоянию (ближайшие)',
    sortByRating: 'По рейтингу (высокие)',
    sortByExperience: 'По опыту работы',
    filterOpenNow: 'Только открытые сейчас (24/7)',
    filterGuaranteed: 'С гарантией качества',
    showAllCategories: 'Показать все категории',
    resultsFound: 'Найдено объектов: {count}',
    noResults: 'По вашему запросу ничего не найдено',

    // Place Cards
    experienceLabel: 'Опыт:',
    specialistLabel: 'Специалист:',
    ratingLabel: 'Рейтинг:',
    pricesLabel: 'Цены',
    yearsSuffix: 'лет',
    callBtn: 'Позвонить',
    routeBtn: 'Маршрут',
    fromYou: 'от вас',

    // Map Section
    yourLocation: 'Ваше местоположение:',
    defaultLocationText: 'Ташкент, Чиланзар (ближайшие точки по GPS)',
    locateMeBtn: 'Моё местоположение',
    locatingToast: 'Определение местоположения...',
    locatedSuccess: 'Местоположение определено',
    locatedFailed: 'Не удалось определить местоположение',

    // AI Assistant Section
    assistantTitle: 'Консультант каталога',
    assistantSubtitle: 'Поиск мастеров, клиник, заправок и госуслуг',
    assistantStatus: 'В сети',
    assistantWelcomeName: 'Консультант',
    assistantWelcomeMessage: 'Здравствуйте! Я помогу найти нужные организации и специалистов в каталоге Milliy.uz.',
    assistantWelcomeHint: 'Например: ближайший автосервис, круглосуточная аптека или ЦГУ в Чиланзаре.',
    promptGreeting: 'Приветствие',
    promptGreetingVal: 'Здравствуйте! Как дела?',
    promptAuto: 'Нужен автосервис',
    promptAutoVal: 'Сломалась машина, есть ли рядом открытый автосервис?',
    promptGas: 'Метан заправка (220 бар)',
    promptGasVal: 'Найди ближайшую открытую метановую заправку',
    promptMedical: '24/7 Аптека',
    promptMedicalVal: 'Где находится дежурная круглосуточная аптека?',
    assistantInputPlaceholder: 'Напишите, что ищете: мастер, аптека, ЦГУ...',
    assistantSendBtn: 'Отправить',
    assistantDetailsBtn: 'Подробнее',
    assistantTyping: 'Поиск...',
    assistantNoMatch: 'К сожалению, подходящих мест не найдено.',
    assistantNearbyHeader: 'Ближайшие подходящие объекты:',

    // Place Details Modal
    tabSpecialist: 'Специалист',
    tabSchedule: 'График работы',
    tabRating: 'Рейтинг',
    priceListTitle: 'Стоимость услуг',
    pricesNegotiable: 'Цены по договоренности.',
    reviewsTitle: 'Отзывы клиентов',
    noReviewsYet: 'Пока нет отзывов. Будьте первым, кто оставит отзыв!',
    leaveReviewTitle: 'Оставить отзыв',
    yourName: 'Ваше имя',
    yourRating: 'Оценка',
    yourComment: 'Отзыв',
    submitReviewBtn: 'Опубликовать отзыв',
    landmarkPrefix: 'Ориентир:',
    ratingsCountSuffix: 'оценок',
    bookmarkSave: 'В закладки',
    bookmarkSaved: 'Сохранено',
    shareBtn: 'Поделиться',
    reportIssueBtn: 'Сообщить об ошибке',
    shareLinkCopied: 'Ссылка скопирована',
    reviewSubmitted: 'Ваш отзыв успешно опубликован!',

    // Report Issue Form
    reportTitle: 'Сообщить о неточности данных',
    reportSubtitle: 'Модератор проверит и обновит данные.',
    whatIsWrong: 'Что не так?',
    commentLabel: 'Комментарий',
    optionalHint: '(необязательно)',
    requiredHint: '(обязательно)',
    commentPlaceholder: 'Например: правильный телефон +998 90 123 45 67',
    contactLabel: 'Для связи (необязательно)',
    contactPlaceholder: 'Телефон или Телеграм',
    sendReportBtn: 'Отправить',
    cancelBtn: 'Отмена',
    reportSuccess: 'Спасибо! Ваше сообщение передано модератору',

    // Bookmarks Drawer
    bookmarksHeading: 'Сохраненные места',
    noBookmarks: 'У вас пока нет сохраненных мест',
    closeBtn: 'Закрыть',

    // Footer & Admin
    footerSubtitle: 'Каталог услуг Узбекистана',
    copyright: '© 2026 Все права защищены.',
    adminPortal: 'Панель управления',
    langSwitched: 'Язык переключен: Русский',
  },

  en: {
    // Header & Brand
    brandSubtitle: 'National Directory',
    navHome: 'Home',
    navCategories: 'Categories',
    navCatalog: 'Catalog',
    navMap: 'Map',
    navConsultant: 'Assistant',
    bookmarksTitle: 'Saved Places',
    offlineAlert: 'No internet connection. Emergency hotlines are always accessible below.',

    // Emergency Bar
    sosTitle: 'Emergency & Helpline Numbers:',
    sosFire: 'Fire Dept',
    sosPolice: 'Police',
    sosAmbulance: 'Ambulance',
    sosGas: 'Gas Emergency',
    sosRescue: 'Rescue (MES)',
    sosUnified: 'Unified 112',

    // Hero Section
    heroBadge: 'UZBEKISTAN NATIONAL PLATFORM',
    heroTitlePrefix: 'Find verified',
    heroTitleAccent: 'services and specialists',
    heroTitleSuffix: 'for your needs',
    heroDesc: 'Craftsmen, clinics, fuel & EV stations, public service centers, and academies: contacts, hours, and map.',
    heroOpenCatalog: 'Browse Catalog',
    heroAskAssistant: 'Ask Assistant',
    statRegions: '14 regions',
    statCategories: '10 categories',
    statRoute: 'Navigation',
    statDirectCall: 'Direct contact',
    heroCardTitle: 'Specialists & Organizations',
    heroCardDesc: 'Experience, direct phone, operating hours, and route in one card.',
    heroTileAuto: 'Auto Service',
    heroTileMedical: 'Healthcare',
    heroTileGov: 'Gov Services',
    heroTileGas: 'Fuel & EV',
    heroCardBtnCategories: 'Categories',
    heroCardBtnList: 'List',

    // Categories Section
    categoriesTitle: 'Search by Category',
    categoriesSubtitle: 'All 10 verified service sectors across Uzbekistan',
    categoryViewLink: 'View →',
    categoryCountSuffix: 'places',

    // Catalog & Filters
    catalogTitle: 'Directory of Services & Places',
    searchPlaceholder: 'Workshop, clinic, specialist name or address...',
    sortByDistance: 'Sort by closest distance',
    sortByRating: 'Sort by highest rating',
    sortByExperience: 'Sort by most experience',
    filterOpenNow: 'Open now (24/7)',
    filterGuaranteed: 'Guaranteed services',
    showAllCategories: 'Show all categories',
    resultsFound: '{count} places found',
    noResults: 'No places found matching your criteria',

    // Place Cards
    experienceLabel: 'Experience:',
    specialistLabel: 'Specialist:',
    ratingLabel: 'Rating:',
    pricesLabel: 'Prices',
    yearsSuffix: 'years',
    callBtn: 'Call',
    routeBtn: 'Route',
    fromYou: 'from you',

    // Map Section
    yourLocation: 'Your location:',
    defaultLocationText: 'Tashkent, Chilonzor (closest places via GPS)',
    locateMeBtn: 'Locate Me',
    locatingToast: 'Determining location...',
    locatedSuccess: 'Location identified',
    locatedFailed: 'Could not determine location',

    // AI Assistant Section
    assistantTitle: 'Catalog Assistant',
    assistantSubtitle: 'Search for craftsmen, clinics, fuel & public services',
    assistantStatus: 'Online',
    assistantWelcomeName: 'Assistant',
    assistantWelcomeMessage: 'Hello! I will help you find verified places and services across Uzbekistan in Milliy.uz.',
    assistantWelcomeHint: 'For example: closest auto repair, 24/7 pharmacy, or Chilonzor public service center.',
    promptGreeting: 'Greetings',
    promptGreetingVal: 'Hello! How can you help me?',
    promptAuto: 'Need auto repair',
    promptAutoVal: 'My car broke down, is there an open repair shop nearby?',
    promptGas: 'CNG Station (220 bar)',
    promptGasVal: 'Find the closest open CNG gas station',
    promptMedical: '24/7 Pharmacy',
    promptMedicalVal: 'Where is a 24/7 on-duty pharmacy?',
    assistantInputPlaceholder: 'Type what you need: auto service, pharmacy, public service...',
    assistantSendBtn: 'Send',
    assistantDetailsBtn: 'Details',
    assistantTyping: 'Searching...',
    assistantNoMatch: 'No matching places found.',
    assistantNearbyHeader: 'Nearby matching places:',

    // Place Details Modal
    tabSpecialist: 'Specialist',
    tabSchedule: 'Working Hours',
    tabRating: 'Rating',
    priceListTitle: 'Service Pricing',
    pricesNegotiable: 'Prices negotiable.',
    reviewsTitle: 'Client Reviews',
    noReviewsYet: 'No reviews yet. Be the first to leave a review!',
    leaveReviewTitle: 'Leave a Review',
    yourName: 'Your Name',
    yourRating: 'Rating',
    yourComment: 'Review Comment',
    submitReviewBtn: 'Post Review',
    landmarkPrefix: 'Landmark:',
    ratingsCountSuffix: 'ratings',
    bookmarkSave: 'Save',
    bookmarkSaved: 'Saved',
    shareBtn: 'Share',
    reportIssueBtn: 'Report Issue',
    shareLinkCopied: 'Link copied',
    reviewSubmitted: 'Your review has been successfully published!',

    // Report Issue Form
    reportTitle: 'Report Outdated or Incorrect Information',
    reportSubtitle: 'A moderator will verify and update the details.',
    whatIsWrong: 'What is incorrect?',
    commentLabel: 'Comment',
    optionalHint: '(optional)',
    requiredHint: '(required)',
    commentPlaceholder: 'E.g. correct phone number is +998 90 123 45 67',
    contactLabel: 'Contact (optional)',
    contactPlaceholder: 'Phone or Telegram',
    sendReportBtn: 'Submit',
    cancelBtn: 'Cancel',
    reportSuccess: 'Thank you! Your report has been submitted to moderators',

    // Bookmarks Drawer
    bookmarksHeading: 'Saved Places',
    noBookmarks: 'No saved places yet',
    closeBtn: 'Close',

    // Footer & Admin
    footerSubtitle: 'Uzbekistan Services Directory',
    copyright: '© 2026 All rights reserved.',
    adminPortal: 'Admin Portal',
    langSwitched: 'Language switched: English',
  },
};

export function t(key, lang = 'uz', params = {}) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.uz;
  let text = dict[key] || TRANSLATIONS.uz[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}
