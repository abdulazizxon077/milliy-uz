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
];

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
  const q = query.toLowerCase().trim();

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
  return {
    kind: 'places',
    intro: intent.intro,
    places: places.filter((p) => p.category === intent.category).slice(0, limit),
  };
}
