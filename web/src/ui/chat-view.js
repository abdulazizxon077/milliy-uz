import { answerLocally } from '../lib/assistant.js';
import { clockTime, directionsUrl, distanceKm, escapeHtml, formatDistance, getLocalizedPlace } from '../lib/format.js';
import { t } from '../lib/i18n.js';
import { api } from '../api.js';
import { state } from '../state.js';
import { refreshIcons } from './icons.js';
import { showToast } from './toast.js';

const messages = () => document.getElementById('ai-chat-messages');
const input = () => document.getElementById('ai-user-input');
let busy = false;

function append(html) {
  const box = messages();
  if (!box) return;
  box.insertAdjacentHTML('beforeend', html);
  box.scrollTop = box.scrollHeight;
  refreshIcons();
}

function userBubble(text) {
  append(`
  <div class="flex justify-end animate-fade-in">
    <div class="max-w-[80%] rounded-3xl rounded-br-md bg-[#b4f73a] text-[#0d221a] px-4 py-3 text-sm font-semibold">
      <p class="whitespace-pre-wrap break-words">${escapeHtml(text)}</p>
      <p class="text-[10px] opacity-70 mt-1 text-right">${clockTime()}</p>
    </div>
  </div>`);
}

function botBubble(innerHtml) {
  const lang = state.lang;
  append(`
  <div class="flex gap-3 animate-fade-in">
    <div class="w-8 h-8 shrink-0 rounded-full bg-[#183a2d] text-[#b4f73a] text-[10px] font-extrabold flex items-center justify-center">MU</div>
    <div class="max-w-[85%] glass-panel rounded-3xl rounded-tl-md px-4 py-3 text-sm text-[#e2e8f0] space-y-3">
      <p class="text-[10px] font-bold text-[#b4f73a] uppercase tracking-wider">${escapeHtml(t('assistantWelcomeName', lang))} · ${clockTime()}</p>
      ${innerHtml}
    </div>
  </div>`);
}

function placeSuggestion(rawPlace) {
  const lang = state.lang;
  const place = getLocalizedPlace(rawPlace, lang);
  const dist = formatDistance(distanceKm(state.userLocation, place), lang);
  return `
  <div class="rounded-2xl bg-[#071510] border border-[#183a2d] p-3 space-y-1.5 text-xs">
    <div class="flex justify-between gap-2"><p class="font-extrabold text-white">${escapeHtml(place.name)}</p><span class="text-[#b4f73a] font-bold shrink-0">${escapeHtml(dist)}</span></div>
    <p class="text-[#94a3b8]">${escapeHtml(place.subCategory)}</p>
    <p class="text-[#94a3b8]">${t('specialistLabel', lang)} <span class="text-white">${escapeHtml(place.experienceText || `${place.experienceYears} ${t('yearsSuffix', lang)}`)}</span></p>
    <p class="text-[#94a3b8]">${t('pricesLabel', lang)}: <span class="text-white">${escapeHtml(place.priceRange)}</span></p>
    <div class="flex gap-2 pt-1">
      <button type="button" class="neon-btn rounded-xl px-3 py-1.5 text-[11px] font-bold" data-action="open-detail" data-id="${escapeHtml(place.id)}">${escapeHtml(t('assistantDetailsBtn', lang))}</button>
      <a href="${escapeHtml(directionsUrl(place))}" target="_blank" rel="noopener noreferrer" class="neon-btn-secondary rounded-xl px-3 py-1.5 text-[11px] font-bold">Google Maps</a>
    </div>
  </div>`;
}

function showTyping() {
  const lang = state.lang;
  append(`
  <div id="ai-typing" class="flex gap-3 items-center text-xs text-[#94a3b8]">
    <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span> ${escapeHtml(t('assistantTyping', lang))}
  </div>`);
}

const hideTyping = () => document.getElementById('ai-typing')?.remove();

function replyLocally(text) {
  const lang = state.lang;
  const answer = answerLocally(text, state.places, 2, lang);
  if (answer.kind === 'text') {
    botBubble(`<p>${escapeHtml(answer.text)}</p>`);
  } else if (!answer.places.length) {
    botBubble(
      `<p>${escapeHtml(answer.intro)}</p><p class="text-[#94a3b8]">${escapeHtml(t('assistantNoMatch', lang))}</p>`,
    );
  } else {
    botBubble(`<p>${escapeHtml(answer.intro)}</p>${answer.places.map(placeSuggestion).join('')}`);
  }
}

async function callGeminiDirect(key, message, lang = 'uz') {
  const systemPrompt = `Siz Milliy.uz milliy platformasining aqlli AI konsultantisiz.
Foydalanuvchi qaysi tilda murojaat qilsa (${lang === 'ru' ? 'русский' : lang === 'en' ? 'English' : "o'zbek"}), xuddi shu tilda muloyim, to'liq, aniq va yordam beruvchi qilib javob bering. O'zbekistonning barcha 14 ta hududi (Toshkent shahri, Toshkent viloyati, Samarqand, Buxoro, Navoiy, Qashqadaryo, Surxondaryo, Jizzax, Sirdaryo, Xorazm, Qoraqalpog'iston, Farg'ona, Namangan, Andijon), ularning ma'muriy markazlari, ustaxonalari, tibbiy yordam, zapravkalar va boshqa barcha sohalar bo'yicha har qanday savolga aniq va to'g'ri javob bering.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: { maxOutputTokens: 800, temperature: 0.3 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini status: ${res.status}`);
  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('');
  if (!reply) throw new Error('Empty Gemini reply');
  return reply;
}

export async function sendMessage(raw) {
  const text = String(raw ?? input()?.value ?? '')
    .trim()
    .slice(0, 500);
  if (!text || busy) return;
  busy = true;
  if (input()) input().value = '';
  userBubble(text);
  showTyping();
  try {
    // 1. Direct browser Gemini AI if API key is saved
    const geminiKey = localStorage.getItem('gemini_api_key');
    if (geminiKey) {
      try {
        const reply = await callGeminiDirect(geminiKey, text, state.lang);
        hideTyping();
        botBubble(`<p class="whitespace-pre-wrap break-words">${escapeHtml(reply)}</p>`);
        return;
      } catch (geminiErr) {
        console.warn('Direct Gemini call failed, falling back:', geminiErr);
      }
    }

    // 2. Server chat (if backend is running with provider)
    if (state.serverChat) {
      try {
        const { reply } = await api.chat(text);
        hideTyping();
        botBubble(`<p class="whitespace-pre-wrap break-words">${escapeHtml(reply)}</p>`);
        return;
      } catch (err) {
        if (err.status === 503 || err.status === 404) state.serverChat = false;
        if (err.status === 429) showToast("Juda ko'p so'rov. Birozdan so'ng urinib ko'ring");
      }
    }

    // 3. Multilingual local intelligent knowledge & conversational assistant
    hideTyping();
    replyLocally(text);
  } catch (err) {
    hideTyping();
    showToast(err.message || 'Xatolik yuz berdi');
  } finally {
    busy = false;
  }
}

export function initVoice() {
  const btn = document.getElementById('ai-mic-btn');
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const statusEl = document.getElementById('ai-voice-status');
  const statusText = document.getElementById('ai-voice-status-text');
  const inputEl = document.getElementById('ai-user-input');
  if (!btn) return;
  if (!SpeechRec) {
    btn.style.display = 'none';
    return;
  }
  const rec = new SpeechRec();
  rec.continuous = true;
  rec.interimResults = true;
  let listening = false;
  let originalPlaceholder = inputEl?.placeholder || '';
  let finalTranscript = '';

  function stopUi() {
    listening = false;
    btn.classList.remove('mic-active');
    if (statusEl) statusEl.classList.add('hidden');
    if (inputEl && originalPlaceholder) inputEl.placeholder = originalPlaceholder;
    if (inputEl && inputEl.value.trim()) {
      inputEl.focus();
      inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
    }
  }

  function startUi() {
    listening = true;
    finalTranscript = inputEl?.value ? inputEl.value + ' ' : '';
    btn.classList.add('mic-active');
    if (statusEl) statusEl.classList.remove('hidden');
    const lang = state.lang || 'uz';
    const msg =
      lang === 'ru'
        ? 'Слушаю вас... Говорите...'
        : lang === 'en'
        ? 'Listening... Speak now...'
        : 'Ovoz yozilmoqda... Gapiring...';
    if (statusText) statusText.textContent = msg;
    if (inputEl) {
      originalPlaceholder = inputEl.placeholder;
      inputEl.placeholder = msg;
    }
  }

  rec.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const part = e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        finalTranscript += part + ' ';
      } else {
        interim += part;
      }
    }
    const fullText = (finalTranscript + interim).trim();
    if (inputEl && fullText) {
      inputEl.value = fullText;
    }
  };

  rec.onend = () => {
    stopUi();
  };

  rec.onerror = (e) => {
    stopUi();
    const lang = state.lang || 'uz';
    if (e.error === 'not-allowed') {
      showToast(lang === 'ru' ? 'Доступ к микрофону заблокирован' : lang === 'en' ? 'Microphone access denied' : 'Brauzerda mikrofonga ruxsat berilmadi');
    } else if (e.error !== 'no-speech') {
      showToast(lang === 'ru' ? 'Голос не распознан' : lang === 'en' ? 'Could not recognize voice' : "Ovozni aniqlab bo'lmadi");
    }
  };

  btn.addEventListener('click', () => {
    if (listening) {
      rec.stop();
      stopUi();
      return;
    }
    try {
      rec.lang = state.lang === 'ru' ? 'ru-RU' : state.lang === 'en' ? 'en-US' : 'uz-UZ';
      rec.start();
      startUi();
    } catch {
      stopUi();
      showToast(state.lang === 'ru' ? 'Не удалось запустить микрофон' : state.lang === 'en' ? 'Failed to start microphone' : "Mikrofonni ishga tushirib bo'lmadi");
    }
  });
}
