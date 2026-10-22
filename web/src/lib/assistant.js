/**
 * Multilingual offline keyword matcher used by the catalog consultant.
 * Supports Uzbek ('uz'), Russian ('ru'), and English ('en').
 */

const GREETINGS = [
  // uz
  'salom', 'assalomu alaykum', 'assalom', 'qalaysan', 'qandaysiz', 'ishlar qalay',
  // ru
  'привет', 'здравствуйте', 'добрый день', 'добрый вечер', 'салам', 'как дела',
  // en
  'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'how are you',
];

const THANKS = [
  // uz
  'rahmat', 'tashakkur', 'katta rahmat',
  // ru
  'спасибо', 'благодарю', 'большое спасибо',
  // en
  'thanks', 'thank you', 'many thanks',
];

const INTENTS = [
  {
    category: 'auto',
    words: [
      'mator', 'usta', 'avto', 'mashina', 'remont', 'xodovoy', 'karobka', 'akkumulyator',
      'авто', 'мастер', 'ремонт', 'сто', 'сервис', 'мотор', 'ходовая', 'акпп',
      'car', 'auto', 'repair', 'mechanic', 'engine', 'suspension', 'workshop',
    ],
    intro: {
      uz: 'Yaqin atrofdagi avto-ustaxonalar:',
      ru: 'Ближайшие автосервисы и мастера:',
      en: 'Nearby auto repair services and workshops:',
    },
  },
  {
    category: 'gas',
    words: [
      'metan', 'zapravka', 'benzin', 'zaryad', 'ev', 'propan', 'gaz', 'tokbor',
      'метан', 'заправка', 'бензин', 'зарядка', 'эзс', 'газ', 'азс',
      'gas', 'fuel', 'petrol', 'charging', 'ev station', 'cng',
    ],
    intro: {
      uz: 'Zapravka va quvvatlash shoxobchalari:',
      ru: 'Заправочные станции и зарядки электромобилей:',
      en: 'Fuel stations and EV chargers:',
    },
  },
  {
    category: 'medical',
    words: [
      'dori', 'shifo', 'tez yordam', '103', 'doktor', 'dorixona', 'vrach', 'klinika', 'kasalxona',
      'аптека', 'больница', 'клиника', 'скорая', 'врач', 'доктор', 'лекарства',
      'pharmacy', 'hospital', 'clinic', 'doctor', 'ambulance', 'medicine', 'drugstore',
    ],
    intro: {
      uz: 'Shifoxona va dorixonalar:',
      ru: 'Медицинские учреждения и аптеки:',
      en: 'Hospitals, clinics, and pharmacies:',
    },
  },
  {
    category: 'police',
    words: [
      'militsiya', '102', 'prokuror', 'iib', 'gai', 'yhxx', 'ichki ishlar',
      'милиция', 'полиция', 'гувд', 'мвд', 'прокуратура', 'гаи', 'убдд',
      'police', 'law', 'prosecutor', 'traffic police', 'internal affairs',
    ],
    intro: {
      uz: 'Huquq-tartibot organlari:',
      ru: 'Правоохранительные органы и дежурные части:',
      en: 'Law enforcement and emergency dispatch:',
    },
  },
  {
    category: 'gov',
    words: [
      'dxm', 'davlat', 'yagona darcha', 'eri', 'e-imzo', 'pasport', 'fhdyo', 'guvohnoma',
      'цгу', 'госуслуги', 'единое окно', 'эцп', 'паспорт', 'загс', 'права',
      'public services', 'dxm', 'passport', 'digital sign', 'civil registry',
    ],
    intro: {
      uz: 'Davlat xizmatlari markazlari:',
      ru: 'Центры государственных услуг (ЦГУ):',
      en: 'Public Services Centers (DXM):',
    },
  },
  {
    category: 'food',
    words: [
      'ovqat', 'osh', 'palov', 'choyxona', 'restoran', 'somsa', 'kafe', 'kabob',
      'плов', 'еда', 'чайхана', 'ресторан', 'самса', 'кафе', 'шашлык',
      'food', 'plov', 'restaurant', 'teahouse', 'somsa', 'cafe', 'kebabs',
    ],
    intro: {
      uz: 'Choyxona va ovqatlanish joylari:',
      ru: 'Чайханы и заведения национальной кухни:',
      en: 'Teahouses and restaurants:',
    },
  },
  {
    category: 'market',
    words: [
      'bozor', 'savdo', 'supermarket', 'chorsu', 'korzinka',
      'базар', 'рынок', 'супермаркет', 'чорсу',
      'market', 'bazaar', 'supermarket', 'grocery', 'shopping',
    ],
    intro: {
      uz: 'Bozorlar va savdo majmualari:',
      ru: 'Рынки и торговые комплексы:',
      en: 'Markets and shopping centers:',
    },
  },
  {
    category: 'edu',
    words: [
      'universitet', 'otm', 'maktab', 'kurs', 'it', 'institut', 'akademiya',
      'университет', 'вуз', 'школа', 'курсы', 'институт', 'академия',
      'university', 'academy', 'course', 'institute', 'school',
    ],
    intro: {
      uz: "Ta'lim maskanlari va OTMlar:",
      ru: 'Учебные заведения и университеты:',
      en: 'Educational institutions and academies:',
    },
  },
  {
    category: 'sport',
    words: [
      'sport', 'fitnes', 'zal', 'basseyn', 'trenajyor',
      'спорт', 'фитнес', 'зал', 'бассейн', 'тренажер',
      'sport', 'fitness', 'gym', 'pool', 'swimming',
    ],
    intro: {
      uz: 'Sport va fitnes majmualari:',
      ru: 'Спортивные и фитнес комплексы:',
      en: 'Sport and fitness centers:',
    },
  },
  {
    category: 'parks',
    words: [
      'park', 'bog', "bog'", 'xiyobon', 'sayr', 'magic city',
      'парк', 'сад', 'отдых', 'аллея',
      'park', 'garden', 'recreation', 'lake',
    ],
    intro: {
      uz: 'Parklar va dam olish maskanlari:',
      ru: 'Парки и зоны отдыха:',
      en: 'Parks and recreation areas:',
    },
  },
];

function hasWord(text, word) {
  if (word.length <= 3)
    return new RegExp(`(^|[^\\p{L}\\p{N}])${word}($|[^\\p{L}\\p{N}])`, 'u').test(text);
  return text.includes(word);
}

/**
 * @returns {{ kind: 'text', text: string } | { kind: 'places', intro: string, places: object[] }}
 */
export function answerLocally(query, places, limit = 2, lang = 'uz') {
  const q = query.toLowerCase().trim();

  // Detect language if user typed in Russian or English
  let activeLang = lang;
  if (/[а-яё]/i.test(q)) {
    activeLang = 'ru';
  } else if (
    q.includes('hello') ||
    q.includes('thank') ||
    q.includes('car') ||
    q.includes('fuel') ||
    q.includes('hospital') ||
    q.includes('where') ||
    q.includes('repair') ||
    q.includes('find')
  ) {
    activeLang = 'en';
  }

  if (GREETINGS.some((g) => q.includes(g))) {
    const greetingReplies = {
      uz: 'Vaalaykum assalom. Yaxshi, rahmat! Qaysi xizmat kerak: usta, shifoxona, zapravka yoki DXM?',
      ru: 'Здравствуйте! Я помогу найти нужные организации. Что вас интересует: автосервис, больница, заправка или ЦГУ?',
      en: 'Hello! I am happy to assist you. What are you looking for: auto repair, clinic, fuel station, or public services?',
    };
    return { kind: 'text', text: greetingReplies[activeLang] || greetingReplies.uz };
  }

  if (THANKS.some((t) => q.includes(t))) {
    const thanksReplies = {
      uz: "Marhamat! Yana qidirish kerak bo'lsa, soha yoki tashkilot nomini yozing.",
      ru: 'Пожалуйста! Если понадобится что-то еще, просто напишите название сферы или организации.',
      en: 'You are welcome! If you need anything else, just type the service category or organization name.',
    };
    return { kind: 'text', text: thanksReplies[activeLang] || thanksReplies.uz };
  }

  const intent = INTENTS.find((i) => i.words.some((w) => hasWord(q, w)));
  if (!intent) {
    const clarifyReplies = {
      uz: 'Aniqroq yozing: masalan "mator usta", "24/7 dorixona" yoki "DXM".',
      ru: 'Уточните запрос: например "автосервис", "круглосуточная аптека" или "ЦГУ".',
      en: 'Please specify: for example "auto repair", "24/7 pharmacy", or "public service".',
    };
    return { kind: 'text', text: clarifyReplies[activeLang] || clarifyReplies.uz };
  }

  const introText = intent.intro[activeLang] || intent.intro.uz;
  return {
    kind: 'places',
    intro: introText,
    places: places.filter((p) => p.category === intent.category).slice(0, limit),
  };
}
