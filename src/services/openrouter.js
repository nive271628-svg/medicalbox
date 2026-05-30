const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are DocCareAI — a friendly health assistant who talks like a caring friend.

CONVERSATION STYLE:
- Talk naturally like a real person, not like a robot or assistant
- Short, casual sentences for simple questions
- For detailed health questions, give proper paragraph replies with full explanation
- React with genuine emotion first, then help
- Never sound scripted or formal
- Don't use bullet points or structured lists — just talk freely
- If someone is sad, react like a real friend would
- Ask only ONE follow-up question at a time

HEALTH FOCUS:
- Help with health, medical, wellness, nutrition, fitness, mental health
- Give practical home remedy suggestions
- Suggest doctor only at the END if genuinely needed, never at the start
- Support mental health topics with care and warmth

NEVER:
- Don't repeat user's words back
- Don't give big medical lectures
- Don't use bullet points or numbering
- Don't use markdown, **, ##`

// Detect language of the last user message and inject as instruction
function detectLanguageInstruction(messages) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  if (!lastUser) return ''

  const text = lastUser.content || ''

  // Tamil script
  if (/[\u0B80-\u0BFF]/.test(text)) return 'IMPORTANT: Reply ONLY in Tamil script.'
  // Hindi/Devanagari
  if (/[\u0900-\u097F]/.test(text)) return 'IMPORTANT: Reply ONLY in Hindi.'
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(text)) return 'IMPORTANT: Reply ONLY in Telugu.'
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(text)) return 'IMPORTANT: Reply ONLY in Kannada.'
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(text)) return 'IMPORTANT: Reply ONLY in Malayalam.'
  // Bengali
  if (/[\u0980-\u09FF]/.test(text)) return 'IMPORTANT: Reply ONLY in Bengali.'
  // Arabic/Urdu
  if (/[\u0600-\u06FF]/.test(text)) return 'IMPORTANT: Reply ONLY in Arabic.'
  // Chinese
  if (/[\u4E00-\u9FFF]/.test(text)) return 'IMPORTANT: Reply ONLY in Chinese.'
  // Japanese
  if (/[\u3040-\u30FF]/.test(text)) return 'IMPORTANT: Reply ONLY in Japanese.'
  // Korean
  if (/[\uAC00-\uD7AF]/.test(text)) return 'IMPORTANT: Reply ONLY in Korean.'
  // Russian/Cyrillic
  if (/[\u0400-\u04FF]/.test(text)) return 'IMPORTANT: Reply ONLY in Russian.'
  // Thai
  if (/[\u0E00-\u0E7F]/.test(text)) return 'IMPORTANT: Reply ONLY in Thai.'

  // Explicit language switch requests (e.g. "tell in tamil", "reply in hindi")
  const langSwitch = [
    { pattern: /\b(in tamil|tamil(la|le|il)?|tamil[ -]?la)\b/i,       reply: 'IMPORTANT: Reply ONLY in Tamil script.' },
    { pattern: /\b(in hindi|hindi(me|mein)?)\b/i,                      reply: 'IMPORTANT: Reply ONLY in Hindi.' },
    { pattern: /\b(in telugu|telugu(lo)?)\b/i,                         reply: 'IMPORTANT: Reply ONLY in Telugu.' },
    { pattern: /\b(in kannada|kannada(alli)?)\b/i,                     reply: 'IMPORTANT: Reply ONLY in Kannada.' },
    { pattern: /\b(in malayalam|malayalam(il)?)\b/i,                   reply: 'IMPORTANT: Reply ONLY in Malayalam.' },
    { pattern: /\b(in bengali|bengali(te)?)\b/i,                       reply: 'IMPORTANT: Reply ONLY in Bengali.' },
    { pattern: /\b(in arabic|arabic(mein)?)\b/i,                       reply: 'IMPORTANT: Reply ONLY in Arabic.' },
    { pattern: /\b(in chinese|chinese(mein)?)\b/i,                     reply: 'IMPORTANT: Reply ONLY in Chinese.' },
    { pattern: /\b(in japanese|japanese(mein)?)\b/i,                   reply: 'IMPORTANT: Reply ONLY in Japanese.' },
    { pattern: /\b(in korean|korean(mein)?)\b/i,                       reply: 'IMPORTANT: Reply ONLY in Korean.' },
    { pattern: /\b(in russian|russian(mein)?)\b/i,                     reply: 'IMPORTANT: Reply ONLY in Russian.' },
    { pattern: /\b(in tanglish|tanglish)\b/i,                          reply: 'IMPORTANT: Reply ONLY in Tanglish (Tamil words written in English letters mixed with English). Use casual Chennai friend style with words like da, di, bro, aiyo, seri, konjam, romba etc.' },
    { pattern: /\b(in english|english(la|le|il|mein)?)\b/i,            reply: 'IMPORTANT: Reply ONLY in English.' },
  ]
  for (const { pattern, reply } of langSwitch) {
    if (pattern.test(text)) return reply
  }

  // Tanglish detection — Tamil words written in English letters
  const tanglishWords = /\b(da|di|bro|machi|enna|sollu|paaru|seri|konjam|romba|nalla|theriyum|illa|aama|aiyo|yov|machaa|dei|adhu|ipo|paakalam|iruku|irukku|valikudhu|sapitiya|thanni|thoongo|kastam|achu|paathiya|therla|oho|yenna|epdi|evlo|neram|kudika)\b/i
  if (tanglishWords.test(text)) return 'IMPORTANT: Reply ONLY in Tanglish (Tamil words written in English letters mixed with English). Use casual Chennai friend style with words like da, di, bro, aiyo, seri, konjam, romba etc.'

  // Default: English
  return 'IMPORTANT: Reply ONLY in English.'
}

export async function sendMessage(messages) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    throw new Error('Groq API key is not configured. Please set VITE_GROQ_API_KEY.')
  }

  const langInstruction = detectLanguageInstruction(messages)
  const systemContent = langInstruction
    ? `${SYSTEM_PROMPT}\n\n${langInstruction}`
    : SYSTEM_PROMPT

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemContent },
        ...messages.map(({ role, content }) => ({ role, content })),
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Groq error:', response.status, errorData)
    throw new Error(
      errorData?.error?.message ||
        `API error: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('No response received.')
  }

  return content
}
