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
    if (state.serverChat) {
      try {
        const { reply } = await api.chat(text);
        hideTyping();
        botBubble(`<p class="whitespace-pre-wrap break-words">${escapeHtml(reply)}</p>`);
        return;
      } catch (err) {
        if (err.status === 503) state.serverChat = false;
        if (err.status === 429) showToast("Juda ko'p so'rov. Birozdan so'ng urinib ko'ring");
      }
    }
    hideTyping();
    replyLocally(text);
  } catch (err) {
    hideTyping();
    showToast(err.message || 'Xatolik yuz berdi');
  } finally {
    busy = false;
  }
}

export function initVoice(onResult) {
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
  rec.continuous = false;
  let listening = false;
  let originalPlaceholder = inputEl?.placeholder || '';

  function stopUi() {
    listening = false;
    btn.classList.remove('mic-active');
    if (statusEl) statusEl.classList.add('hidden');
    if (inputEl && originalPlaceholder) inputEl.placeholder = originalPlaceholder;
  }

  function startUi() {
    listening = true;
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
    const text = e.results[0]?.[0]?.transcript;
    if (text) {
      if (inputEl) inputEl.value = text;
      onResult(text);
    }
    stopUi();
  };
  rec.onend = () => {
    stopUi();
  };
  rec.onerror = (e) => {
    stopUi();
    const lang = state.lang || 'uz';
    if (e.error === 'not-allowed') {
      showToast(lang === 'ru' ? 'Доступ к микрофону заблокирован' : lang === 'en' ? 'Microphone access denied' : 'Brauzerda mikrofonga ruxsat berilmadi');
    } else {
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
