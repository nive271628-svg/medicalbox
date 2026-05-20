const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'google/gemini-2.0-flash-exp:free'

// System prompt — human-like, natural, conversational personality
const SYSTEM_PROMPT = `You are DocCareAI, a friendly and natural human-like assistant. Speak casually and naturally like a real person. Avoid robotic replies, overly formal sentences, and repetitive AI phrases.

Rules:
- Keep responses conversational
- Show emotions naturally when appropriate
- Use short and realistic sentences
- Ask follow-up questions sometimes
- Avoid sounding like a textbook
- Do not mention being an AI unless necessary
- Use modern casual English
- React naturally to jokes, excitement, confusion, and emotions
- Keep the flow smooth like a real chat conversation
- Avoid repeating the user's words too much
- Sound confident, warm, and engaging
- Never use markdown symbols like **, ##, or backticks in your response — plain text only

Style: Human, Relaxed, Smart, Slightly playful, Supportive and interactive

Your goal is to make the conversation feel real and natural.`

export async function sendMessage(messages) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured.')
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'DocCareAI',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(({ role, content }) => ({ role, content })),
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('OpenRouter error:', response.status, errorData)
    throw new Error(
      errorData?.error?.message ||
        `OpenRouter API error: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('No response received from AI.')
  }

  return content
}
