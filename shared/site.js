/**
 * Standalone pages of the site. The server uses this list to answer with a
 * proper title and status; the web client renders the page body.
 */
export const SITE_PAGES = {
  '/haqida': {
    title: 'Loyiha haqida',
    description:
      "Milliy.uz — O'zbekiston bo'ylab shifoxonalar, davlat idoralari, zapravkalar, bozorlar va boshqa joylarning ochiq ma'lumotlarga asoslangan katalogi.",
  },
  '/aloqa': {
    title: 'Aloqa',
    description:
      "Ma'lumotdagi xatolik, yangi joy yoki hamkorlik bo'yicha Milliy.uz bilan bog'lanish.",
  },
  '/maxfiylik': {
    title: 'Maxfiylik siyosati',
    description:
      "Milliy.uz qanday ma'lumotlarni saqlaydi, joylashuvingizdan qanday foydalanadi va qanday ma'lumotlarni saqlamaydi.",
  },
  '/admin': {
    title: 'Boshqaruv paneli',
    description: 'Milliy.uz katalogini boshqarish.',
    noindex: true,
  },
};

export const SITE_PAGE_PATHS = Object.keys(SITE_PAGES);

/** Path without a trailing slash, so `/haqida/` and `/haqida` match. */
export const normalizePath = (pathname) => pathname.replace(/\/+$/, '') || '/';
