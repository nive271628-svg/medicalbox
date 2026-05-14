const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'google/gemini-3.1-flash-lite'

/**
 * Send messages to OpenRouter API and get AI response.
 * @param {Array<{role: string, content: string}>} messages - Conversation history
 * @returns {Promise<string>} - AI response text
 */
export async function sendMessage(messages) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured. Please set VITE_OPENROUTER_API_KEY in your .env file.')
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AI Chat Assistant',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages.map(({ role, content }) => ({ role, content })),
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData?.error?.message ||
        `OpenRouter API error: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('No response content received from AI.')
  }

  return content
}
