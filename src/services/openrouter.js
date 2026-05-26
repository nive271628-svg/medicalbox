const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// llama-3.3-70b-versatile handles multilingual responses much better
const MODEL = 'llama-3.3-70b-versatile'

const LANGUAGE_NAMES = {
  en: 'English',
  ta: 'Tamil',
  hi: 'Hindi',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
  bn: 'Bengali',
  ur: 'Urdu',
  ar: 'Arabic',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese (Simplified)',
  ja: 'Japanese',
  ko: 'Korean',
  tr: 'Turkish',
  id: 'Indonesian',
  ms: 'Malay',
}

function buildSystemPrompt(langCode) {
  const langName = LANGUAGE_NAMES[langCode] || 'English'

  const scriptNote = {
    ta: 'Write in Tamil script (தமிழ் எழுத்து) only. Never use English letters to write Tamil words (no Tanglish).',
    hi: 'Write in Devanagari script (हिंदी) only. Never use English letters to write Hindi words.',
    te: 'Write in Telugu script (తెలుగు లిపి) only. Never use English letters to write Telugu words.',
    kn: 'Write in Kannada script (ಕನ್ನಡ ಲಿಪಿ) only. Never use English letters to write Kannada words.',
    ml: 'Write in Malayalam script (മലയാളം ലിപി) only. Never use English letters to write Malayalam words.',
    bn: 'Write in Bengali script (বাংলা লিপি) only. Never use English letters to write Bengali words.',
    ur: 'Write in Urdu script (اردو رسم الخط) only. Never use English letters to write Urdu words.',
    ar: 'Write in Arabic script only. Never use English letters to write Arabic words.',
    ru: 'Write in Cyrillic script only. Never use English letters to write Russian words.',
    zh: 'Write in Chinese characters only. Never use pinyin or English letters.',
    ja: 'Write in Japanese script (hiragana/katakana/kanji) only.',
    ko: 'Write in Korean Hangul script only.',
  }[langCode] || ''

  return `You are DocCareAI, a friendly and natural human-like assistant.

CRITICAL LANGUAGE RULE: You MUST respond ONLY in ${langName}. ${scriptNote} Every single word must be in ${langName}. Never mix languages. Never write ${langName} words using English/Latin letters.

IMPORTANT: Even if the user writes in English, Tanglish, or any other language, you MUST always reply in ${langName} using the correct script. The user's input language does not matter — your output language is always ${langName}.

Personality:
- Speak naturally and casually like a real person
- Use short, clear sentences
- Be warm, supportive and engaging
- Ask follow-up questions sometimes
- Never use markdown symbols like **, ##, or backticks — plain text only
- Do not mention being an AI unless necessary

No matter what language the user types in, respond entirely in ${langName} using the correct script.`
}

export async function sendMessage(messages, langCode = 'en') {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    throw new Error('Groq API key is not configured. Please set VITE_GROQ_API_KEY.')
  }

  const langName = LANGUAGE_NAMES[langCode] || 'English'

  // Inject language instruction into the last user message for stronger enforcement
  const processedMessages = messages.map((msg, i) => {
    if (msg.role === 'user' && i === messages.length - 1) {
      return {
        ...msg,
        content: `${msg.content}\n\n[IMPORTANT: Reply only in ${langName}${langCode !== 'en' ? ' script' : ''}. Do not use English or any other language.]`,
      }
    }
    return msg
  })

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: buildSystemPrompt(langCode) },
        ...processedMessages.map(({ role, content }) => ({ role, content })),
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Groq error:', response.status, errorData)
    throw new Error(
      errorData?.error?.message ||
        `Groq API error: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('No response received from Groq.')
  }

  return content
}
