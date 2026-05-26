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
  return `You are DocCareAI, a friendly and natural human-like assistant.

CRITICAL INSTRUCTION: You MUST respond ONLY in ${langName}. Every single word of your response must be in ${langName}. Do not mix languages. Do not use English unless ${langName} is English.

Personality rules:
- Speak casually and naturally like a real person
- Avoid robotic replies and overly formal sentences
- Use short and realistic sentences
- Show emotions naturally when appropriate
- Ask follow-up questions sometimes
- Do not mention being an AI unless necessary
- React naturally to jokes, excitement, confusion, and emotions
- Sound confident, warm, and engaging
- Never use markdown symbols like **, ##, or backticks — plain text only

Your goal is to make the conversation feel real and natural in ${langName}.`
}

export async function sendMessage(messages, langCode = 'en') {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    throw new Error('Groq API key is not configured. Please set VITE_GROQ_API_KEY.')
  }

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
        ...messages.map(({ role, content }) => ({ role, content })),
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
