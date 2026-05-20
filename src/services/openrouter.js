const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

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

/**
 * Send messages to Gemini API and get AI response.
 * @param {Array<{role: string, content: string}>} messages - Conversation history
 * @returns {Promise<string>} - AI response text
 */
export async function sendMessage(messages) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.')
  }

  // Convert messages to Gemini format
  const contents = messages.map(({ role, content }) => ({
    role: role === 'assistant' ? 'model' : 'user',
    parts: [{ text: content }],
  }))

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Gemini error:', response.status, errorData)
    throw new Error(
      errorData?.error?.message ||
        `Gemini API error: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!content) {
    throw new Error('No response received from Gemini.')
  }

  return content
}
