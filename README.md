# Milliy.uz — O'zbekiston Milliy Xizmatlar & Ish O'rinlari Ekotizimi

<div align="center">

![Milliy.uz Platform](https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80)

**O'zbekiston bo'ylab 10+ asosiy sohadagi korxonalar, ustaxonalar, tibbiyot, davlat muassasalari va mutaxassislarni birlashtiruvchi zamonaviy ekotizim.**

[Xususiyatlar](#-asosiy-imkoniyatlar) • [Texnologiyalar](#-texnologik-stek) • [Ko'p Modelli AI](#-kop-modelli-ai-arxitekturasi) • [Tezkor Ishga Tushirish](#-tezkor-ishga-tushirish) • [Admin Portal](#-yashirin-administrator-portali)

</div>

---

## 🌟 Loyiha Maqsadi

**Milliy.uz** platformasi O'zbekiston aholisiga har qanday vaziyatda eng yaqin, tasdiqlangan va professional xizmatlarni topish imkonini beradi. Platforma barcha ma'lumotlarni yagona xarita, real narxlar, mutaxassis tajribasi va sun'iy intellekt orqali tezkor tahlil qilib taqdim etadi.

---

## 🚀 Asosiy Imkoniyatlar

1. **10+ Asosiy Soha Kataloglari (Barchasi ekranda ochiq)**:
   - 🔧 **Avtomobil & Ustaxona**: Mator, xodovoy, gaz uskunalari, avtoelektriklar.
   - ⛽ **Zapravka & EV Stansiyalar**: Metan (220 bar), benzin (Ai-95/98), TokBor/Megawatt 120kW EV zaryadlash.
   - 🏥 **Tibbiyot & Shoshilinch Yordam**: 24/7 shifoxonalar, markaziy dorixonalar, tez tibbiy yordam (103).
   - 👮 **Militsiya & Huquq Tartibot**: IIO FMB (102), tuman prokuraturasi, favqulodda xizmatlar (101, 1050).
   - 🏛️ **Davlat Xizmatlari**: Yagona darcha (DXM), Soliq inspeksiyasi, FHDYO, Pensiya jamg'armasi.
   - 🍲 **Ovqatlanish & Choyxonalar**: Toshkent to'y oshi, milliy choyxonalar, oilaviy restoranlar.
   - 🛒 **Bozorlar & Savdo**: Chorsu, Oloy bozori, supermarketlar tarmog'i.
   - 📚 **Ta'lim & OTM**: Milliy va xalqaro universitetlar, zamonaviy IT akademiyalar.
   - 🏋️ **Sport & Fitnes**: Olimpiya standartidagi basseynlar, professional trenajyor zallari.
   - 🌳 **Parklar & Dam Olish**: Milliy bog'lar, xiyobonlar, oilaviy hordiq maskanlari.

2. **Interaktiv Geopozitsiya & Xaritalar**:
   - Leaflet.js va OpenStreetMap orqali eng yaqin nuqtalarni avtomatik hisoblash.
   - Bitta bosish orqali to'g'ridan-to'g'ri **Google Maps** navigatsiyasini ochish.

3. **Multi-AI Yordamchi Chati**:
   - Google Gemini, OpenAI (ChatGPT), Anthropic Claude va DeepSeek bilan integratsiya qilingan.
   - O'zbek tilida tabiiy, faktik va professional muloqot qiladi.
   - Internet uzilganda ham platformaning ichki aqlli katalog filtri uzluksiz ishlaydi.

4. **1 Million+ Foydalanuvchi Infratuzilmasi**:
   - Enterprise darajasidagi Load Balancer, Nginx Klaster, Redis kesh va server salomatligi monitoringi.

---

## 🎨 Dizayn Tizimi (Design System)

- **Asosiy tema**: Hashamatli Dark Emerald (`#071510`, `#0D221A`, `#102d20`).
- **Urg'u ranglar**: Electric Neon Lime (`#B4F73A`) va Warm Gold (`#E2B170`).
- **Shrift (Typography)**: Faqat **Plus Jakarta Sans** (Google Fonts).
- **Vektor grafika**: **Lucide Icons** (SVG). *Interfeysda bolalarcha emojilar yo'q, faqat senior darajadagi vektor piktogrammalar.*
- **Yagona Oqim (Single Page Flow)**: Har qanday menyu bosilganda sahifa o'zgarmasdan pastga yoki tepaga silliq skroll bo'ladi.

---

## 🤖 Ko'p Modelli AI va Jamoaviy Dasturlash

Ushbu loyiha turli xil sun'iy intellekt agentlari (Antigravity, Cursor, Claude Code, Windsurf, Copilot, ChatGPT) bilan hamkorlikda ishlab chiqilgan.

Loyihada quyidagi boshqaruv fayllari sozlangan:
- `.cursorrules` — Cursor AI uchun qat'iy kodlash va dizayn qoidalari.
- `CLAUDE.md` — Anthropic Claude Code terminali uchun to'liq arxitektura hujjati.
- `PROJECT_CONTEXT.md` — ChatGPT va boshqa LLM larni loyihaga jalb qilish uchun qisqa kontekst.

---

## 🔐 Yashirin Administrator Portali

Sayt footer qismidagi maxfiy havoladan ochiladi:
- **Kirish**: `admin` yoki shaxsiy administrator logini
- **Xavfsizlik**: SHA-256 kriptografik xeshlash bilan himoyalangan. Parol ochiq kodda saqlanmaydi va admin panel ichidan istalgan vaqtda yangilanishi mumkin.
- **Imkoniyatlar**: Barcha obyektlarni tahrirlash (CRUD), GPS koordinatalarni o'zgartirish, narxlarni yangilash, yangi xizmat qo'shish, Load Balancer ko'rsatkichlarini kuzatish va Multi-AI API kalitlarini boshqarish.

---

## 💻 Tezkor Ishga Tushirish

Loyihani kompyuterda ishga tushirish uchun qo'shimcha og'ir kutubxonalar (Node.js/npm) talab qilinmaydi. Yengil va tezkor:

```bash
# Repozitoriyni klonlash
git clone https://github.com/<username>/<repo-name>.git
cd "Biznes Startup"

# Mahalliy serverni ishga tushirish (Python orqali)
python -m http.server 5173

# Brauzerda ochish:
# http://localhost:5173/
```

---

## 📄 Litsenziya

MIT License. O'zbekiston Respublikasida biznes va xizmat ko'rsatish sohalarini raqamlashtirish uchun ochiq ekotizim.
