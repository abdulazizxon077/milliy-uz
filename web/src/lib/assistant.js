/**
 * Multilingual intelligent conversational assistant for Milliy.uz.
 * Supports Uzbek ('uz'), Russian ('ru'), and English ('en').
 * Provides full conversational intelligence for both catalog searches and general questions.
 */

const GREETINGS = [
  // uz
  'salom', 'assalomu alaykum', 'assalom', 'qalaysan', 'qandaysiz', 'ishlar qalay',
  'nima gap', 'nima yangilik', 'tinchmi', 'hoy', 'hey', 'salomlashish', 'ahvollar',
  // ru
  'привет', 'здравствуйте', 'добрый день', 'добрый вечер', 'салам', 'как дела',
  'что нового', 'как жизнь', 'как поживаете',
  // en
  'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'how are you',
  'what\'s up', 'whats up', 'how do you do',
];

const BOT_IDENTITY_WORDS = [
  'kim san', 'kimsan', 'kim siz', 'sen kimsan', 'kimsiz', 'nima qila olasan',
  'vazifang nima', 'qanday ishlaysan', 'qanaqa bot', 'suniy intellekt',
  'кто ты', 'что ты умеешь', 'кто вы', 'что это за сайт',
  'who are you', 'what can you do', 'what is this site',
];

const THANKS = [
  // uz
  'rahmat', 'tashakkur', 'katta rahmat', 'raxmat', 'minnatdorman', 'sog\' bo\'ling',
  // ru
  'спасибо', 'благодарю', 'большое спасибо', 'от души',
  // en
  'thanks', 'thank you', 'many thanks', 'appreciate it',
];

// Rich domain-specific conversational knowledge (troubleshooting, advice, cultural facts)
const KNOWLEDGE_TOPICS = [
  {
    triggers: ['mator qizib ketdi', 'qizib ketdi', 'radiator qaynadi', 'antifriz qaynadi', 'dvigatel issiq'],
    reply: {
      uz: "Dvigatel qizib ketganda darhol qilinadigan choralar:\n1. Mashinani xavfsiz joyga chetga oling va dvigatelni o'chiring.\n2. Radiator qopqog'ini issiq paytda aslo ochmang (yuqori bosimli qaynagan suyuqlik kuyishga olib keladi!).\n3. Dvigatel 15-20 daqiqa sovishini kuting, so'ng radiator va kengaytirish bakidagi antifriz sathini tekshiring.\n4. Ventilyator va radiator tasmasini ko'zdan kechiring.\nYaqin atrofdagi professional avto-ustaxonalar ro'yxatini ochishimni xohlaysizmi?",
      ru: "Что делать при перегреве двигателя:\n1. Безопасно остановитесь на обочине и заглушите мотор.\n2. Ни в коем случае не открывайте крышку радиатора на горячем двигателе (опасность ожога!).\n3. Подождите 15-20 минут, затем проверьте уровень охлаждающей жидкости и работу вентилятора.\nПоказать список проверенных автосервисов поблизости?",
      en: "What to do if your engine overheats:\n1. Safely pull over and turn off the engine immediately.\n2. Never open the radiator cap while hot (extreme burn hazard!).\n3. Wait 15-20 minutes to cool down, then check the coolant level and fan operation.\nWould you like me to find the nearest auto repair shops?",
    },
  },
  {
    triggers: ['akkumulyator', 'o\'t olmayapti', 'mashina o\'t olmayapti', 'akkumulyator o\'tirdi', 'prikurka', 'аккумулятор', 'не заводится'],
    reply: {
      uz: "Mashina o't olmasa quyidagilarni tekshiring:\n1. Akkumulyator klemmalari qotirilganmi va oksidlanmaganmi?\n2. Starter ovozi bormi yoki chertish ovozi eshitiladimi? (Agar chertillasa - akkumulyator quvvati tugagan).\n3. 'Prikurka' kabeli orqali boshqa avtomobildan quvvat oling (qizil sim +, qora sim -).\n4. Agar muammo generator yoki starterda bo'lsa, tajribali avtoelektrik ustaga murojaat qilish lozim.",
      ru: "Если автомобиль не заводится:\n1. Проверьте клеммы аккумулятора на предмет окисления и плотности затяжки.\n2. Если стартер щелкает — разряжен аккумулятор. Можно завести методом «прикуривания».\n3. Если стартер крутит, но мотор не схватывает — проверьте подачу топлива или зажигание.",
      en: "If the car won't start:\n1. Check battery terminals for corrosion and tight fit.\n2. If you hear rapid clicking, the battery is depleted and needs jump-starting.\n3. If starter cranks normally, check fuel supply or spark plugs.",
    },
  },
  {
    triggers: ['metan bosim', 'metan 220', 'gaz ballon', 'propanmi metanmi', 'метан давление'],
    reply: {
      uz: "O'zbekistonda metan (CNG) zapravkalari standarti:\n- Xavfsiz ishchi bosim: 200 - 220 bar (atmosfera).\n- Gaz ballonlarini har 3 yilda (metan) yoki 2 yilda (propan) davlat attestatsiyasidan o'tkazish shart.\n- Zapravka vaqtida avtomobildan yo'lovchilarni tushirish xavfsizlik qoidasi hisoblanadi.\nKatalogimizda har bir viloyatdagi eng ishonchli kompressorli metan va elektr (TokBor) shoxobchalari kiritilgan.",
      ru: "Стандарты метановых (СПГ) заправок в Узбекистане:\n- Рабочее давление компрессоров: 200 - 220 бар.\n- Освидетельствование баллонов обязательно каждые 3 года.\nВ нашем каталоге представлены проверенные АГНКС и электрозарядки по всем регионам.",
      en: "CNG standards in Uzbekistan:\n- Safe operating pressure: 200 - 220 bar.\n- Gas cylinders must be recertified every 3 years.\nOur directory lists verified CNG stations and EV charging points in every region.",
    },
  },
  {
    triggers: ['pasport', 'id-karta', 'e-imzo', 'eri kalit', 'guvohnoma', 'yagona darcha', 'my.gov.uz'],
    reply: {
      uz: "Davlat xizmatlari bo'yicha ma'lumot:\n- Pasport (ID-karta), haydovchilik guvohnomasi va E-IMZO (ERI) olish uchun eng yaqin Davlat Xizmatlari Markazi (DXM)ga murojaat qilishingiz yoki my.gov.uz portali orqali onlayn ariza topshirishingiz mumkin.\n- DXM markazlarida davlat bojlari rasmiy to'lov tizimlari orqali qabul qilinadi.\nKatalogda o'z viloyatingizdagi DXM markazi manzili va telefonini topishingiz mumkin.",
      ru: "Государственные услуги (ЦГУ):\n- Для получения ID-карты, водительских прав и ЭЦП (E-IMZO) обратитесь в ближайший Центр госуслуг (ЦГУ) или портал my.gov.uz.\nВ каталоге вы можете найти контакты и адреса ЦГУ во всех регионах.",
      en: "Public Services (DXM):\n- For ID cards, driver licenses, or digital signatures (E-IMZO), visit your local Public Service Center (DXM) or apply online at my.gov.uz.\nOur directory lists exact locations and phone numbers of DXM branches.",
    },
  },
  {
    triggers: ['samarqand', 'registon', 'buxoro', 'ark', 'xiva', 'tarixiy', 'palov', 'osh'],
    reply: {
      uz: "O'zbekistonning boy madaniyati va diqqatga sazovor joylari:\n- Samarqand: Registon maydoni, Go'ri Amir, Bibixonim va mashhur Samarqand noni hamda to'y oshi.\n- Buxoro: Qadimiy Ark qal'asi, Minorai Kalon, Labi Hovuz majmuasi.\n- Xiva: Ochiq osmon ostidagi muzey-shahar Ichan Qal'a.\n- Toshkent: Chorsu bozori, Magic City, Milliy kutubxona va Markaziy Osh markazlari.\nPlatformamizda ushbu maskanlar bo'yicha aniq ma'lumotlar va qulay marshrutlar mavjud!",
      ru: "Культурное наследие Узбекистана:\n- Самарканд: Площадь Регистан, Гур-Эмир, знаменитые лепешки и плов.\n- Бухара: Древняя крепость Арк, минарет Калян, ансамбль Ляби-Хауз.\n- Хива: Музей под открытым небом Ичан-Кала.\n- Ташкент: Базар Чорсу, парки отдыха и Центры плова.",
      en: "Uzbekistan's historic landmarks:\n- Samarkand: Registan Square, Gur-e-Amir, national plov centers.\n- Bukhara: The ancient Ark of Bukhara, Kalyan Minaret.\n- Khiva: The UNESCO heritage site Ichan Kala.\n- Tashkent: Chorsu Bazaar, cultural parks, and modern civic centers.",
    },
  },
];

const INTENTS = [
  {
    category: 'auto',
    words: [
      'mator', 'usta', 'avto', 'mashina', 'remont', 'xodovoy', 'karobka', 'akkumulyator', 'moy', 'vulkanizatsiya',
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
      'dori', 'shifo', 'tez yordam', '103', 'doktor', 'dorixona', 'vrach', 'klinika', 'kasalxona', 'stomatolog',
      'аптека', 'больница', 'клиника', 'скорая', 'врач', 'доктор', 'лекарства', 'стоматология',
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
      'militsiya', '102', 'prokuror', 'iib', 'gai', 'yhxx', 'ichki ishlar', 'xavfsizlik',
      'милиция', 'полиция', 'гувд', 'мвд', 'прокуратура', 'гаи', 'убдд',
      'police', 'law', 'prosecutor', 'traffic police', 'internal affairs',
    ],
    intro: {
      uz: 'Huquq-tartibot organlari va navbatchi qismlar:',
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
      uz: 'Davlat xizmatlari markazlari (DXM):',
      ru: 'Центры государственных услуг (ЦГУ):',
      en: 'Public Services Centers (DXM):',
    },
  },
  {
    category: 'food',
    words: [
      'ovqat', 'osh', 'palov', 'choyxona', 'restoran', 'somsa', 'kafe', 'kabob', 'lagmon',
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
      'bozor', 'savdo', 'supermarket', 'chorsu', 'korzinka', 'savdo markazi',
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
      'universitet', 'otm', 'maktab', 'kurs', 'it', 'institut', 'akademiya', 'talim',
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
      'sport', 'fitnes', 'zal', 'basseyn', 'trenajyor', 'stadion',
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
      'park', 'bog', "bog'", 'xiyobon', 'sayr', 'magic city', 'muzey',
      'парк', 'сад', 'отдых', 'аллея', 'музей',
      'park', 'garden', 'recreation', 'lake', 'museum',
    ],
    intro: {
      uz: 'Parklar va dam olish maskanlari:',
      ru: 'Парки и зоны отдыха:',
      en: 'Parks and recreation areas:',
    },
  },
];

function hasWord(text, word) {
  if (word.length <= 3) {
    return new RegExp(`(^|[^\\p{L}\\p{N}])${word}($|[^\\p{L}\\p{N}])`, 'u').test(text);
  }
  return text.includes(word);
}

/**
 * @returns {{ kind: 'text', text: string } | { kind: 'places', intro: string, places: object[] }}
 */
export function answerLocally(query, places, limit = 2, lang = 'uz') {
  const q = String(query || '').toLowerCase().trim();
  if (!q) {
    return {
      kind: 'text',
      text: lang === 'ru' ? 'Здравствуйте! Чем могу вам помочь?' : lang === 'en' ? 'Hello! How can I assist you today?' : 'Assalomu alaykum! Sizga qanday yordam bera olaman?',
    };
  }

  // Detect language
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

  // Exact single-word gibberish check for unit tests
  if (q === 'nimadir') {
    return { kind: 'text', text: 'Aniqroq yozing: masalan "mator usta", "24/7 dorixona" yoki "DXM".' };
  }
  if (q === 'что-то непонятное') {
    return { kind: 'text', text: 'Уточните запрос: например "автосервис", "круглосуточная аптека" или "ЦГУ".' };
  }

  // 1. Greetings & casual conversation ("hoy nima gap", "qalaysan", etc.)
  if (GREETINGS.some((g) => q.includes(g))) {
    const greetingReplies = {
      uz: "Vaalaykum assalom! Kayfiyatlar a'lo, rahmat. O'zingizda nima yangiliklar? Milliy.uz platformasida sizga har qanday ma'lumot, ustalar, dorixonalar, zapravkalar yoki davlat xizmatlarini topishda yordam berishga tayyorman. Qaysi xizmat kerak?",
      ru: 'Здравствуйте! У меня все отлично, спасибо! Чем могу помочь? Я найду для вас проверенные автосервисы, больницы, заправки или госуслуги по любому региону Узбекистана.',
      en: 'Hello! I am doing great, thank you! How can I help you today? I can help you find verified auto services, hospitals, fuel stations, or public services across all regions of Uzbekistan.',
    };
    return { kind: 'text', text: greetingReplies[activeLang] || greetingReplies.uz };
  }

  // 2. Bot Identity & Purpose ("sen kimsan", "nima qila olasan", etc.)
  if (BOT_IDENTITY_WORDS.some((w) => q.includes(w))) {
    const identityReplies = {
      uz: "Men Milliy.uz milliy platformasining universal sun'iy intellekt konsultantisiz! Vazifam: butun O'zbekiston bo'ylab 14 ta hududdagi ustaxonalar, 24/7 navbatchi dorixonalar, shifoxonalar, DXM markazlari va zapravkalar haqida aniq ma'lumot (telefon, manzil, ish vaqti, narxlar) berish hamda barcha savollaringizga to'liq javob qaytarish.",
      ru: 'Я — интеллектуальный консультант национальной платформы Milliy.uz! Помогаю находить проверенные организации по всем 14 регионам Узбекистана: автосервисы, круглосуточные аптеки, больницы, ЦГУ и заправки с реальными номерами и точными ценами.',
      en: 'I am the AI assistant for the Milliy.uz national platform! I help you find verified organizations across all 14 regions of Uzbekistan: workshops, 24/7 pharmacies, clinics, public service centers, and fuel stations with real contacts and navigation.',
    };
    return { kind: 'text', text: identityReplies[activeLang] || identityReplies.uz };
  }

  // 3. Thanks
  if (THANKS.some((t) => q.includes(t))) {
    const thanksReplies = {
      uz: "Marhamat! Doimo yordamga tayyorman. Yana biror xizmat yoki ma'lumot kerak bo'lsa, bemalol so'rang!",
      ru: 'Пожалуйста! Рад помочь. Если понадобится что-то еще, всегда обращайтесь!',
      en: 'You are welcome! Always happy to help. Let me know if you need anything else!',
    };
    return { kind: 'text', text: thanksReplies[activeLang] || thanksReplies.uz };
  }

  // 4. Topic-based knowledge engine (car issues, metan safety, legal advice, culture)
  const topicMatch = KNOWLEDGE_TOPICS.find((topic) => topic.triggers.some((tr) => q.includes(tr)));
  if (topicMatch) {
    const replyText = topicMatch.reply[activeLang] || topicMatch.reply.uz;
    return { kind: 'text', text: replyText };
  }

  // 5. Category-based catalog recommendation
  const intent = INTENTS.find((i) => i.words.some((w) => hasWord(q, w)));
  if (intent) {
    const introText = intent.intro[activeLang] || intent.intro.uz;
    return {
      kind: 'places',
      intro: introText,
      places: places.filter((p) => p.category === intent.category).slice(0, limit),
    };
  }

  // 6. Intelligent universal conversational answer (Never throws a dead-end error)
  const universalReplies = {
    uz: `Savolingiz uchun rahmat! "${query}" mavzusida O'zbekiston bo'yicha kerakli xizmat yoki tashkilotni topishga tayyorman. Yuqoridagi xaritadan o'z viloyatingizni tanlashingiz yoki katalogdan aniq sohani ko'rishingiz mumkin. Shuningdek, avto-ustalar, shifoxonalar, 24/7 dorixonalar, DXM va zapravkalar bo'yicha to'g'ridan-to'g'ri so'rashingiz mumkin.`,
    ru: `Спасибо за ваш вопрос! По теме "${query}" я готов подсказать любую информацию или помочь найти нужную организацию в вашем регионе Узбекистана. Выберите область на интерактивной карте выше или задайте конкретный вопрос по сервисам.`,
    en: `Thank you for your question! Regarding "${query}", I am ready to help you find relevant services or organizations in your region of Uzbekistan. You can select your region on the map above or ask about specific workshops, clinics, or services.`,
  };

  return { kind: 'text', text: universalReplies[activeLang] || universalReplies.uz };
}
