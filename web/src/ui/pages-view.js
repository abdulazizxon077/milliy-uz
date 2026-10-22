import { SITE_PAGES } from '../../../shared/site.js';
import { refreshIcons } from './icons.js';

const REPO_URL = 'https://github.com/abdulazizxon077/milliy-uz';
const SITE_NAME = 'MILLIY.UZ';

const link = (href, text) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer" class="page-link">${text}</a>`;

const section = (title, body) => `<section class="page-block"><h2>${title}</h2>${body}</section>`;

const PAGES = {
  haqida: () => `
    <p class="page-lead">Milliy.uz — O'zbekiston bo'ylab shifoxonalar, dorixonalar, davlat xizmatlari, bozorlar, zapravkalar, muzeylar va boshqa foydali joylarni bitta xaritada ko'rsatuvchi bepul katalog.</p>
    ${section(
      "Ma'lumotlar qayerdan olinadi",
      `<ul class="page-list">
        <li><b>OpenStreetMap</b> — joy nomlari, manzillar, koordinatalar, telefon va ish vaqti. ${link('https://www.openstreetmap.org/copyright', 'ODbL litsenziyasi')} asosida, © OpenStreetMap hissadorlari.</li>
        <li><b>Wikidata</b> — qo'shimcha identifikatorlar va rasm havolalari (${link('https://creativecommons.org/publicdomain/zero/1.0/', 'CC0')}).</li>
        <li><b>Wikimedia Commons</b> — faqat erkin litsenziyali fotosuratlar. Har bir rasm ostida muallif va litsenziya ko'rsatiladi. Rasm bo'lmasa, toifa belgisi chiqadi.</li>
      </ul>
      <p>Telefon yoki ish vaqti manbada bo'lmasa, biz uni o'ylab topmaymiz — "noma'lum" deb ko'rsatamiz.</p>`,
    )}
    ${section(
      'Favqulodda raqamlar',
      `<ul class="page-list">
        <li><b>101</b> — yong'in xavfsizligi</li>
        <li><b>102</b> — politsiya</li>
        <li><b>103</b> — tez tibbiy yordam</li>
        <li><b>104</b> — gaz avariya xizmati</li>
        <li><b>1050</b> — Favqulodda vaziyatlar vazirligi qutqaruv xizmati</li>
        <li><b>112</b> — yagona favqulodda xizmat</li>
      </ul>`,
    )}
    ${section(
      'Ochiq kod',
      `<p>Loyiha manba kodi ochiq: ${link(REPO_URL, 'GitHub')}. Takliflar va tuzatishlar mamnuniyat bilan qabul qilinadi.</p>`,
    )}`,
  aloqa: () => `
    <p class="page-lead">Ma'lumotda xato topdingizmi yoki ro'yxatda yo'q joyni qo'shmoqchimisiz? Eng tez yo'llar quyida.</p>
    <div class="page-cards">
      <div class="page-card">
        <i data-lucide="flag" class="w-5 h-5"></i>
        <h2>Joy sahifasidan xabar bering</h2>
        <p>Har bir joy oynasida "Xatolik haqida xabar berish" tugmasi bor. Xabar to'g'ridan-to'g'ri moderatorlarga boradi.</p>
      </div>
      <div class="page-card">
        <i data-lucide="file-text" class="w-5 h-5"></i>
        <h2>GitHub orqali</h2>
        <p>Yangi joy, xato yoki taklif uchun ${link(`${REPO_URL}/issues`, 'GitHub Issues')} sahifasida murojaat qoldiring.</p>
      </div>
      <div class="page-card">
        <i data-lucide="map" class="w-5 h-5"></i>
        <h2>OpenStreetMap'ni tuzating</h2>
        <p>Ma'lumotlarimiz ${link('https://www.openstreetmap.org', 'OpenStreetMap')}dan olinadi. U yerda kiritilgan tuzatish keyingi yangilanishda bu yerda ham ko'rinadi.</p>
      </div>
    </div>
    <p class="page-note">Favqulodda holatda bu sayt orqali yozmang — darhol <b>112</b> yoki <b>103</b> raqamiga qo'ng'iroq qiling.</p>`,
  maxfiylik: () => `
    <p class="page-lead">Qisqasi: ro'yxatdan o'tish yo'q, reklama kuzatuvi yo'q, joylashuvingiz serverga yuborilmaydi.</p>
    ${section(
      'Joylashuv',
      `<p>"Mening joyim" tugmasini bossangiz, brauzer koordinatalaringizni so'raydi. Ular faqat qurilmangizda masofani hisoblash va xaritada ko'rsatish uchun ishlatiladi va serverga yuborilmaydi.</p>`,
    )}
    ${section(
      'Qurilmada saqlanadigan narsalar',
      `<ul class="page-list">
        <li>Saqlangan joylar ro'yxati va xarita uslubi (brauzerning localStorage'ida).</li>
        <li>Internet bo'lmaganda ishlashi uchun katalog nusxasi.</li>
      </ul>
      <p>Brauzer sozlamalaridan sayt ma'lumotlarini o'chirib, bularning barchasini tozalashingiz mumkin.</p>`,
    )}
    ${section(
      'Serverga yuboriladigan narsalar',
      `<ul class="page-list">
        <li>Siz yozgan sharh va baholar (ism ixtiyoriy) — ular ochiq ko'rsatiladi.</li>
        <li>Xatolik haqidagi xabarlar — faqat moderatorlar ko'radi.</li>
        <li>Yordamchiga yozilgan savollar — javob tayyorlash uchun ishlatiladi va saqlanmaydi.</li>
      </ul>`,
    )}
    ${section(
      'Xarita',
      `<p>Xarita plitalari ${link('https://www.openstreetmap.org', 'OpenStreetMap')} serverlaridan yuklanadi, shuning uchun ular IP manzilingizni ko'radi. Batafsil: ${link('https://osmfoundation.org/wiki/Privacy_Policy', 'OSMF maxfiylik siyosati')}.</p>`,
    )}`,
};

const NOT_FOUND = {
  title: 'Sahifa topilmadi',
  body: () => `
    <div class="page-404">
      <p class="page-404-code">404</p>
      <p class="page-lead">Bunday sahifa yo'q yoki u ko'chirilgan. Manzilni tekshiring yoki bosh sahifaga qayting.</p>
      <div class="flex flex-wrap gap-3 justify-center">
        <a href="/" data-nav-home class="neon-btn rounded-2xl px-5 py-3 text-sm font-bold inline-flex items-center gap-2"><i data-lucide="home" class="w-4 h-4"></i>Bosh sahifa</a>
        <a href="/#catalog-section" data-scroll-to="catalog-section" class="neon-btn-secondary rounded-2xl px-5 py-3 text-sm font-bold inline-flex items-center gap-2"><i data-lucide="search" class="w-4 h-4"></i>Katalogda qidirish</a>
      </div>
    </div>`,
};

/** Renders an about/contact/privacy page, or the 404 page for any other id. Returns the title. */
export function renderPage(id) {
  const view = document.getElementById('page-view');
  if (!view) return SITE_NAME;
  const meta = PAGES[id] ? SITE_PAGES[`/${id}`] : null;
  const title = meta?.title ?? NOT_FOUND.title;
  const body = PAGES[id] ? PAGES[id]() : NOT_FOUND.body();
  view.dataset.page = PAGES[id] ? id : 'not-found';
  view.innerHTML = `
    <article class="page-shell">
      <nav class="page-crumbs" aria-label="Yo'l"><a href="/" data-nav-home>Bosh sahifa</a><span aria-hidden="true">/</span><span>${title}</span></nav>
      <h1 class="page-title" tabindex="-1">${title}</h1>
      ${body}
    </article>`;
  refreshIcons();
  return `${title} — ${SITE_NAME}`;
}
