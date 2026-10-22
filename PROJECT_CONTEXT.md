# Milliy.uz — Loyiha Arxitekturasi va Sun'iy Intellekt Konteksti (Multi-AI Context)

Ushbu hujjat har qanday sun'iy intellekt (ChatGPT, Claude, Cursor, Copilot, Windsurf, DeepSeek) ushbu loyihani to'liq tushunishi va bir xil yuqori standartda davom ettirishi uchun maxsus tayyorlangan.

---

## 1. Loyiha Haqida Umumiy Ma'lumot
- **Nomi**: **Milliy.uz** (O'zbekiston Milliy Xizmatlar & Ish O'rinlari Ekotizimi)
- **Maqsadi**: O'zbekiston fuqarolariga barcha zarur xizmatlarni (avto ustaxonalar, 24/7 shifoxonalar, metan/benzin/EV zapravkalar, militsiya 102, davlat xizmatlari DXM, ovqatlanish, savdo, ta'lim, sport, dam olish maskanlari) bitta qulay ekotizimda xaritalar, mutaxassis tajribasi, narxlar va sun'iy intellekt orqali taqdim etish.
- **Domen / Joylashuv**: O'zbekiston Respublikasi hududi bo'yicha to'liq ishlaydi.

---

## 2. Texnologik Stek (Tech Stack)
- **Frontend**: Pure HTML5 (Semantic), Vanilla JavaScript (ES6+ Senior Enterprise Architecture), Tailwind CSS (CDN) + Maxsus Custom CSS dizayn tizimi.
- **Shrift (Typography)**: Faqat **Plus Jakarta Sans** (Google Fonts). Barcha elementlarga global darajada tatbiq qilingan.
- **Ikonkalar**: Faqat **Lucide Icons** (SVG vektor). **Qat'iy qoida: Interfeysda hech qanday emoji ishlatilmaydi!**
- **Xarita Integratsiyasi**: **Leaflet.js** + OpenStreetMap + Google Maps to'g'ridan-to'g'ri marshrut havolalari.
- **Infratuzilma & Scalability**: 1M+ foydalanuvchilar oqimiga mo'ljallangan Enterprise Load Balancer simulyatsiyasi va monitoringi.
- **AI Integratsiyasi**: Google Gemini (birlamchi), OpenAI (GPT-4o), Anthropic Claude, DeepSeek provayderlari bilan ishlovchi ko'p modelli AI arxitekturasi.

---

## 3. Dizayn Qoidalari va Tizimi (Design System)
- **Asosiy fon**: `#071510` (Dark Emerald / Hashamatli qorong'i zumrad)
- **Karta va panellar foni**: `#0D221A` va `#0f271e`
- **Chegara va chiziqlar**: `#183a2d`
- **Urg'u va faol ranglar**: `#B4F73A` (Electric Neon Lime)
- **Oltin / Reyting urg'ulari**: `#E2B170` (Warm Gold)
- **Animatsiyalar**: Faqat professional silliq ko'tarilish (`translate-y`), yorug'lik (`glow`) va silliq fade-in. Yon tomonga qimirlash yoki egilish (`rotate-12` kabi) umuman yo'q.
- **Sahifa Oqimi**: Yagona sahifa (Single Page Flow) — foydalanuvchi biror tugmani bossa, sahifa o'zgarmasdan pastga yoki tepaga silliq skroll bo'ladi (`scroll-smooth`).

---

## 4. Yashirin Administrator Paneli (Secret Admin Portal)
- **Kirish usuli**: Saytning eng tagidagi (footer) maxfiy matn tugmasi (`#secret-admin-trigger`) orqali ochiladi.
- **Xavfsizlik**: Parol ochiq kodda saqlanmaydi, SHA-256 kriptografik xeshlash orqali tekshiriladi va admin panel ichidan o'zgartiriladi.
- **Imkoniyatlari**:
  1. **Umumiy Analitika**: Haqiqiy KPI hisoblagichlari (joylar soni, sharhlar, kunlik so'rovlar).
  2. **Kataloglar & Joylar CRUD**: Yangi obyekt qo'shish, istalgan ma'lumotni tahrirlash (nomi, GPS koordinatalari, mutaxassis tajribasi, telefon, narxlar) va o'chirish.
  3. **1M+ Infratuzilma Monitori**: Jonli Load Balancer, Nginx Cluster, Redis Cache va server quvvati ko'rsatkichlari.
  4. **Sharhlar Moderatsiyasi**: Foydalanuvchilar qoldirgan sharhlarni tekshirish va tasdiqlash.
  5. **Multi-AI Boshqaruvi**: Gemini, OpenAI, Claude, DeepSeek API kalitlarini kiritish va jonli sinash (Live Test Console).

---

## 5. Loyihani Boshqa AI lar Bilan Boshqarish Yo'riqnomasi
1. **Cursor AI**: Loyihada `.cursorrules` mavjud. Cursor loyihani ochgan zahoti ushbu barcha qoidalar bilan ishlaydi.
2. **Claude Code / Desktop**: Loyihada `CLAUDE.md` mavjud. Claude avtomatik ravishda kontekstni to'liq yuklaydi.
3. **ChatGPT / Copilot / Boshqalar**: Ushbu `PROJECT_CONTEXT.md` fayli matnini chatga tashlasangiz, AI loyihangizning arxitekturasini 100% tushunib, senior dasturchi sifatida kod yozadi.

---

## 6. Aloqador Asosiy Fayllar
- `index.html`: Barcha bloklar (Bosh sahifa, 10 ta katalog, Interaktiv Xarita, Sun'iy Intellekt Chati, Yashirin Admin Paneli).
- `styles.css`: Dark Emerald UI tokenlari, shisha effektlar (`glass-panel`), Plus Jakarta Sans shrifti.
- `app.js`: Global AppState, katalog filtrlash, Leaflet xarita, Multi-AI integratsiyasi, Admin CRUD tizimi.
- `.cursorrules`: Cursor AI uchun integratsiya qoidalari.
- `CLAUDE.md`: Claude AI uchun loyiha boshqaruv yo'riqnomasi.
