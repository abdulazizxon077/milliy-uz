# Milliy.uz

O'zbekiston bo'ylab xizmatlar katalogi: ustaxonalar, zapravkalar, shifoxonalar, davlat
xizmatlari, choyxonalar, bozorlar, ta'lim, sport va dam olish maskanlari — xarita, sharhlar
va chat yordamchisi bilan.

A directory of services across Uzbekistan with a map, reviews and a chat assistant.
The interface is in Uzbek; developer documentation below is in both languages.

---

## Imkoniyatlar / Features

- Kategoriya, hudud, reyting, "hozir ochiq" va qidiruv bo'yicha filtrlash.
  Filter by category, region, rating, "open now" and free-text search.
- Leaflet xaritasi, klasterlangan markerlar, Google Maps va Yandex Maps orqali yo'nalish.
  Leaflet map with clustered markers; directions open in Google Maps or Yandex Maps.
- Har bir joy uchun alohida havola (`/joy/<id>`), ijtimoiy tarmoqlar uchun oldindan
  ko'rish teglari, Telegram orqali ulashish. Every place has its own shareable URL with
  link-preview tags; sharing via the system sheet, clipboard or Telegram.
- "Tez orada yopiladi" belgisi va har bir kategoriyadagi joylar soni.
  "Closing soon" badge and per-category place counts for the selected region.
- Eskirgan ma'lumot haqida xabar berish; xabarlar admin panelda ko'rib chiqiladi.
  Visitors can report outdated details; reports are triaged in the admin panel.
- Foydalanuvchi sharhlari (server tomonda saqlanadi, moderatsiya qilinadi).
  Visitor reviews stored server-side with moderation.
- Saqlangan joylar (brauzerda), PWA o'rnatish va offline qobiq.
  Bookmarks (local), installable PWA with an offline shell.
- Chat yordamchisi: Gemini, OpenAI yoki DeepSeek orqali; kalit bo'lmasa ichki katalog
  qidiruvi ishlaydi. Chat assistant via Gemini, OpenAI or DeepSeek, with a built-in
  catalog matcher as fallback.
- Admin panel faqat `/admin` manzilida ochiladi (saytda havola yo'q). The admin panel is reached only at `/admin`.
- Ma'lumotlar manbalari: OpenStreetMap (ODbL), Wikidata (CC0), Wikimedia Commons rasmlari — batafsil `server/seed/README.md`. Data sources are listed in `server/seed/README.md`.
- Admin panel: joylarni qo'shish/tahrirlash/o'chirish, JSON import/eksport, sharhlar
  moderatsiyasi, ma'lumot xatolari, chat sozlamalari. Admin panel for place CRUD (including
  opening hours), JSON import/export, review moderation, visitor reports and chat settings.

## Arxitektura / Architecture

| Qism / Part | Texnologiya / Technology                                          |
| ----------- | ----------------------------------------------------------------- |
| Frontend    | Vite, ES modules, Tailwind CSS, Leaflet, Lucide (`web/`)          |
| Backend     | Node.js 20, Fastify 5 (`server/`)                                 |
| Ma'lumotlar | SQLite (better-sqlite3), migratsiyalar va seed skripti            |
| Xavfsizlik  | bcrypt parol xeshi, httpOnly JWT cookie, CSP, rate limiting, CORS |
| Testlar     | Vitest (unit/API), Playwright (e2e)                               |

API kalitlari va admin ma'lumotlari faqat serverda saqlanadi; brauzerga hech qachon
yuborilmaydi. API keys and admin credentials live only on the server.

## Ishga tushirish / Getting started

Talablar / Requirements: Node.js 20+.

```bash
npm ci
cp .env.example .env
npm run hash-password          # ADMIN_PASSWORD_HASH uchun / for ADMIN_PASSWORD_HASH
npm run db:seed                # boshlang'ich ma'lumotlar / initial catalog
npm run dev                    # API :3000 + Vite :5173
```

Ishlab chiqarish / Production:

```bash
npm run build
NODE_ENV=production npm start  # dist/ ni ham xizmat qiladi / also serves dist/
```

Docker:

```bash
cp .env.example .env           # sozlang / fill in secrets
docker compose up -d --build
```

## Muhit o'zgaruvchilari / Environment variables

To'liq ro'yxat `.env.example` faylida. Full list in `.env.example`.

| O'zgaruvchi                                            | Majburiy (prod) | Tavsif / Description                           |
| ------------------------------------------------------ | --------------- | ---------------------------------------------- |
| `ADMIN_USERNAME`                                       | ha / yes        | Admin login                                    |
| `ADMIN_PASSWORD_HASH`                                  | ha / yes        | bcrypt hash (`npm run hash-password`)          |
| `JWT_SECRET`                                           | ha / yes        | ≥ 32 belgi / characters                        |
| `DATABASE_PATH`                                        |                 | SQLite fayli / file (default `data/milliy.db`) |
| `PORT`, `HOST`                                         |                 | Tinglash manzili / listen address              |
| `CORS_ORIGIN`                                          |                 | Ruxsat etilgan originlar (vergul bilan)        |
| `TRUST_PROXY`                                          |                 | Reverse proxy ortida `true`                    |
| `COOKIE_SECURE`                                        |                 | Prod'da `true` (HTTPS); HTTP uchun `false`     |
| `SESSION_TTL_SECONDS`                                  |                 | Sessiya muddati / session lifetime             |
| `SERVE_STATIC`                                         |                 | `dist/` ni xizmat qilish (prod'da `true`)      |
| `LOG_LEVEL`                                            |                 | Pino log darajasi                              |
| `AI_PROVIDER`                                          |                 | `none`, `gemini`, `openai`, `deepseek`         |
| `AI_MODEL`, `AI_TIMEOUT_MS`                            |                 | Model nomi va timeout                          |
| `GEMINI_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY` |                 | Tanlangan provayder kaliti                     |

## Skriptlar / Scripts

| Buyruq                 | Vazifa / Purpose                       |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | API va frontend dev serverlari         |
| `npm run build`        | Frontendni `dist/` ga yig'ish          |
| `npm start`            | Serverni ishga tushirish               |
| `npm run db:migrate`   | Migratsiyalarni qo'llash               |
| `npm run db:seed`      | Bo'sh bazani to'ldirish (`-- --force`) |
| `npm run lint`         | ESLint                                 |
| `npm run format:check` | Prettier tekshiruvi                    |
| `npm test`             | Unit va API testlari                   |
| `npm run test:e2e`     | Playwright e2e (avval `npm run build`) |

## Loyiha tuzilishi / Project layout

```
server/   Fastify API, SQLite, auth, chat providers, scripts
web/      Vite frontend (index.html, src/, public/)
shared/   Katalog ma'lumotlari va umumiy konstantalar / shared catalog data
e2e/      Playwright testlari
```

## Xavfsizlik / Security

Zaiflik topsangiz, iltimos, ochiq issue o'rniga loyiha egasiga to'g'ridan-to'g'ri yozing.
Please report vulnerabilities privately to the maintainer rather than in a public issue.
