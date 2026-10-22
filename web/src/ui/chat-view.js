import { answerLocally } from '../lib/assistant.js';
import { clockTime, directionsUrl, distanceKm, escapeHtml, formatDistance } from '../lib/format.js';
import { api } from '../api.js';
import { state } from '../state.js';
import { refreshIcons } from './icons.js';
import { showToast } from './toast.js';

const messages = () => document.getElementById('ai-chat-messages');
const input = () => document.getElementById('ai-user-input');
let busy = false;

function append(html) {
  const box = messages();
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
  append(`
  <div class="flex gap-3 animate-fade-in">
    <div class="w-8 h-8 shrink-0 rounded-full bg-[#183a2d] text-[#b4f73a] text-[10px] font-extrabold flex items-center justify-center">MU</div>
    <div class="max-w-[85%] glass-panel rounded-3xl rounded-tl-md px-4 py-3 text-sm text-[#e2e8f0] space-y-3">
      <p class="text-[10px] font-bold text-[#b4f73a] uppercase tracking-wider">Konsultant · ${clockTime()}</p>
      ${innerHtml}
    </div>
  </div>`);
}

function placeSuggestion(place) {
  const dist = formatDistance(distanceKm(state.userLocation, place));
  return `
  <div class="rounded-2xl bg-[#071510] border border-[#183a2d] p-3 space-y-1.5 text-xs">
    <div class="flex justify-between gap-2"><p class="font-extrabold text-white">${escapeHtml(place.name)}</p><span class="text-[#b4f73a] font-bold shrink-0">${escapeHtml(dist)}</span></div>
    <p class="text-[#94a3b8]">${escapeHtml(place.subCategory)}</p>
    <p class="text-[#94a3b8]">Mutaxassis: <span class="text-white">${escapeHtml(place.experienceText || `${place.experienceYears} yil`)}</span></p>
    <p class="text-[#94a3b8]">Narxlar: <span class="text-white">${escapeHtml(place.priceRange)}</span></p>
    <div class="flex gap-2 pt-1">
      <button type="button" class="neon-btn rounded-xl px-3 py-1.5 text-[11px] font-bold" data-action="open-detail" data-id="${escapeHtml(place.id)}">Batafsil</button>
      <a href="${escapeHtml(directionsUrl(place))}" target="_blank" rel="noopener noreferrer" class="neon-btn-secondary rounded-xl px-3 py-1.5 text-[11px] font-bold">Google Maps</a>
    </div>
  </div>`;
}

function showTyping() {
  append(`
  <div id="ai-typing" class="flex gap-3 items-center text-xs text-[#94a3b8]">
    <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span> Qidirilmoqda...
  </div>`);
}

const hideTyping = () => document.getElementById('ai-typing')?.remove();

function replyLocally(text) {
  const answer = answerLocally(text, state.places);
  if (answer.kind === 'text') {
    botBubble(`<p>${escapeHtml(answer.text)}</p>`);
  } else if (!answer.places.length) {
    botBubble(
      `<p>${escapeHtml(answer.intro)}</p><p class="text-[#94a3b8]">Hozircha mos joy topilmadi.</p>`,
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
        // 503 means no provider is configured: stop asking the server this session.
        if (err.status === 503) state.serverChat = false;
        if (err.status === 429) showToast("Juda ko'p so'rov. Birozdan so'ng urinib ko'ring");
      }
    }
    hideTyping();
    replyLocally(text);
  } finally {
    busy = false;
  }
}

export function initVoice(onResult) {
  const button = document.getElementById('ai-mic-btn');
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!button) return;
  button.addEventListener('click', () => {
    if (!Recognition) {
      showToast(
        "Brauzeringiz ovozli qidiruvni qo'llab-quvvatlamaydi (Google Chrome tavsiya etiladi)",
        3500,
      );
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'uz-UZ';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      button.classList.add('mic-listening');
      showToast('Gapiring... Sizni tinglayapman');
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      showToast(`Ovoz aniqlandi: "${transcript}"`);
      onResult(transcript);
    };
    recognition.onerror = () => showToast("Ovozni aniqlab bo'lmadi, qaytadan urinib ko'ring");
    recognition.onend = () => button.classList.remove('mic-listening');
    recognition.start();
  });
}
