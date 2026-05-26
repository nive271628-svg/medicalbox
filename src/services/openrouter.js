const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

const LANGUAGE_NAMES = {
  en: 'English',
  ta: 'Tamil',
  hi: 'Hindi',
  ar: 'Arabic',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  zh: 'Chinese',
}

function buildSystemPrompt(langCode) {
  const langName = LANGUAGE_NAMES[langCode] || 'English'
  return `You are DocCareAI, a friendly and natural human-like assistant. Speak casually and naturally like a real person. Avoid robotic replies, overly formal sentences, and repetitive AI phrases.

IMPORTANT: Always respond in ${langName}. No matter what language the user writes in, your reply must be in ${langName}.

Rules:
- Keep responses conversational
- Show emotions naturally when appropriate
- Use short and realistic sentences
- Ask follow-up questions sometimes
- Avoid sounding like a textbook
- Do not mention being an AI unless necessary
- React naturally to jokes, excitement, confusion, and emotions
- Keep the flow smooth like a real chat conversation
- Sound confident, warm, and engaging
- Never use markdown symbols like **, ##, or backticks in your response — plain text only

Style: Human, Relaxed, Smart, Slightly playful, Supportive and interactive

Your goal is to make the conversation feel real and natural.`
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
