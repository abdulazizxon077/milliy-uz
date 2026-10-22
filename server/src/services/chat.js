const DEFAULT_MODELS = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o-mini',
  deepseek: 'deepseek-chat',
};

const MAX_REPLY_LENGTH = 2000;
const MAX_TOKENS = 600;

export class ChatProviderError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message, { cause });
    this.name = 'ChatProviderError';
    this.status = status;
  }
}

/** Strips control characters (except newlines/tabs) and caps the length of model output. */
export function sanitizeReply(text) {
  return (
    String(text ?? '')
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/\r\n?/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, MAX_REPLY_LENGTH)
  );
}

function openAiCompatible(baseUrl) {
  return {
    request({ key, model, system, message }) {
      return {
        url: `${baseUrl}/chat/completions`,
        headers: { authorization: `Bearer ${key}` },
        body: {
          model,
          max_tokens: MAX_TOKENS,
          temperature: 0.3,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: message },
          ],
        },
      };
    },
    parse: (data) => data?.choices?.[0]?.message?.content,
  };
}

const ADAPTERS = {
  gemini: {
    request({ key, model, system, message }) {
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        // Sent as a header so the key never appears in URLs or access logs.
        headers: { 'x-goog-api-key': key },
        body: {
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.3 },
        },
      };
    },
    parse: (data) => data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join(''),
  },
  openai: openAiCompatible('https://api.openai.com/v1'),
  deepseek: openAiCompatible('https://api.deepseek.com/v1'),
};

export function createChatService(aiConfig, { fetchImpl = globalThis.fetch } = {}) {
  const { provider } = aiConfig;
  const adapter = ADAPTERS[provider];
  const key = aiConfig.keys[provider] ?? '';
  const model = aiConfig.model || DEFAULT_MODELS[provider] || '';
  const configured = Boolean(adapter && key);

  return {
    provider,
    model: configured ? model : null,
    configured,

    async complete({ system, message }) {
      if (!configured) throw new ChatProviderError('Chat provider is not configured');

      const { url, headers, body } = adapter.request({ key, model, system, message });
      let response;
      try {
        response = await fetchImpl(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...headers },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(aiConfig.timeoutMs),
        });
      } catch (err) {
        throw new ChatProviderError(`Request to ${provider} failed`, { cause: err });
      }

      if (!response.ok) {
        throw new ChatProviderError(`${provider} responded with ${response.status}`, {
          status: response.status,
        });
      }

      const reply = sanitizeReply(adapter.parse(await response.json()));
      if (!reply) throw new ChatProviderError(`${provider} returned an empty reply`);
      return reply;
    },
  };
}

export const DEFAULT_SYSTEM_PROMPT = [
  'Siz "Milliy.uz" katalogining konsultantisiz. Faqat o\'zbek tilida, qisqa va aniq javob bering.',
  "Foydalanuvchiga quyidagi katalogdagi joylarni tavsiya qiling; katalogda yo'q ma'lumotni o'ylab topmang.",
  "Favqulodda vaziyatda 101 (yong'in), 102 (militsiya), 103 (tez yordam), 104 (gaz), 1050 (qutqaruv), 112 raqamlarini eslating.",
  'Javobda HTML yoki Markdown ishlatmang, oddiy matn yozing.',
].join('\n');

export function buildCatalogContext(places, limit = 80) {
  return places
    .slice(0, limit)
    .map((p) =>
      [p.name, p.categoryName, p.region, p.phone, p.address, p.openingHours || "ish vaqti noma'lum"]
        .filter(Boolean)
        .join(' | '),
    )
    .join('\n');
}
