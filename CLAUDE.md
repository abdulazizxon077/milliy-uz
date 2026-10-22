# MILLIY.UZ — INSTRUCTIONS FOR CLAUDE CODE & AI CODING ASSISTANTS

## Project Overview
MILLIY.UZ is an enterprise Super-App and comprehensive national directory for the Republic of Uzbekistan. It unifies all employment sectors, auto workshops, gas/EV charging stations, hospitals, police/emergency (102), government public service centers (DXM), restaurants, universities, schools, sports facilities, and recreational parks into an AI-powered geospatial ecosystem.

## Core Rules for All AI Collaborators
1. **Font**: Always enforce `Plus Jakarta Sans`.
2. **Colors**: Dark Emerald (`#071510`, `#0D221A`) + Electric Neon Lime (`#B4F73A`).
3. **No Emojis**: Never place raw emojis in code or UI. Use Lucide SVG vector icons (`<i data-lucide="..."></i>`) and invoke `lucide.createIcons()`.
4. **Layout**: Continuous smooth downward scroll. Never toggle sections to `hidden` when navigating.
5. **Admin Access**:
   - Secret link in footer.
   - Protected with SHA-256 cryptographic verification (zero plain text password exposure in git/source).
   - Must open fullscreen `.admin-fullscreen` console with Analytics, Places CRUD, 1M+ Server monitor, Reviews, and Multi-AI settings.
6. **AI Chatbot**:
   - Chat input must be pinned/docked and visible at all times.
   - Must support natural Uzbek dialogue (greetings, general answers, and place search).

## Tech Stack
- Frontend: HTML5, Tailwind CSS (via CDN), Leaflet.js, Lucide Icons
- State & Logic: Pure JavaScript ES6+ in `app.js` with structured in-memory store + LocalStorage
- Design: `styles.css` with custom CSS variables and glassmorphism
- Local Development Server: Port 5173 (`python -m http.server 5173`)
