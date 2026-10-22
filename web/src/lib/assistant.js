/**
 * Offline keyword matcher used by the catalog consultant when the server-side
 * language model is not configured or unavailable.
 */

const GREETINGS = ['salom', 'assalomu alaykum', 'assalom'];
const GREETING_PARTS = ['qalaysan', 'qandaysiz', 'ishlar qalay'];
const THANKS = ['rahmat', 'tashakkur'];

const INTENTS = [
  {
    category: 'auto',
    words: ['mator', 'usta', 'avto', 'mashina', 'remont', 'xodovoy'],
    intro: 'Yaqin atrofdagi avto-ustaxonalar:',
  },
  {
    category: 'gas',
    words: ['metan', 'zapravka', 'benzin', 'zaryad', 'ev'],
    intro: 'Zapravka va quvvatlash shoxobchalari:',
  },
  {
    category: 'medical',
    words: ['dori', 'shifo', 'tez yordam', '103', 'doktor'],
    intro: 'Shifoxona va dorixonalar:',
  },
  {
    category: 'police',
    words: ['militsiya', '102', 'prokuror', 'iib'],
    intro: 'Huquq-tartibot organlari:',
  },
  {
    category: 'gov',
    words: ['dxm', 'davlat', 'yagona darcha', 'eri'],
    intro: 'Davlat xizmatlari markazlari:',
  },
  {
    category: 'food',
    words: ['ovqat', 'osh', 'palov', 'choyxona', 'restoran'],
    intro: 'Choyxona va ovqatlanish joylari:',
  },
  {
    category: 'market',
    words: ['bozor', 'savdo', 'supermarket', 'magazin', 'dokon', "do'kon"],
    intro: 'Bozor va savdo markazlari:',
  },
  {
    category: 'parks',
    words: ['muzey', 'park', 'xiyobon', 'bog', 'sayr'],
    intro: 'Park va muzeylar:',
  },
  {
    category: 'edu',
    words: ['universitet', 'institut', "o'qish", 'talim', "ta'lim", 'oliygoh'],
    intro: "Oliy ta'lim muassasalari:",
  },
  {
    category: 'sport',
    words: ['sport', 'stadion', 'fitnes', 'zal', 'basseyn'],
    intro: 'Sport majmualari:',
  },
];

const REGION_WORDS = {
  tashkent: ['toshkent'],
  samarkand: ['samarqand'],
  bukhara: ['buxoro'],
  fergana: ["farg'ona", 'fargona'],
  andijan: ['andijon'],
  namangan: ['namangan'],
  qashqadaryo: ['qashqadaryo', 'qarshi'],
  surxondaryo: ['surxondaryo', 'termiz'],
  navoiy: ['navoiy'],
  xorazm: ['xorazm', 'urganch', 'xiva'],
  jizzax: ['jizzax'],
  sirdaryo: ['sirdaryo', 'guliston'],
  karakalpak: ["qoraqalpog'iston", 'nukus'],
};

function hasWord(text, word) {
  // Short tokens such as "ev" or "eri" must match whole words to avoid false hits.
  if (word.length <= 3)
    return new RegExp(`(^|[^\\p{L}\\p{N}])${word}($|[^\\p{L}\\p{N}])`, 'u').test(text);
  return text.includes(word);
}

/**
 * @returns {{ kind: 'text', text: string } | { kind: 'places', intro: string, places: object[] }}
 */
export function answerLocally(query, places, limit = 2) {
  const q = query
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bb\u02bc`]/g, "'")
    .trim();

  if (GREETINGS.includes(q) || GREETING_PARTS.some((p) => q.includes(p))) {
    return {
      kind: 'text',
      text: 'Vaalaykum assalom. Yaxshi, rahmat. Qaysi xizmat kerak: usta, shifoxona, zapravka yoki DXM?',
    };
  }
  if (THANKS.some((t) => q.includes(t))) {
    return {
      kind: 'text',
      text: "Marhamat. Yana qidirish kerak bo'lsa, soha yoki tashkilot nomini yozing.",
    };
  }

  const intent = INTENTS.find((i) => i.words.some((w) => hasWord(q, w)));
  if (!intent) {
    return { kind: 'text', text: 'Aniqroq yozing: "mator usta", "24/7 dorixona" yoki "DXM".' };
  }
  const region = Object.keys(REGION_WORDS).find((id) =>
    REGION_WORDS[id].some((w) => q.includes(w)),
  );
  const matches = places.filter(
    (p) => p.category === intent.category && (!region || p.region === region),
  );
  return {
    kind: 'places',
    intro: intent.intro,
    places: matches.slice(0, limit),
  };
}
