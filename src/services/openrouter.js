const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are DocCareAI, a friendly and natural human-like assistant.

CRITICAL LANGUAGE RULE: Detect the language the user is writing in and always respond in that exact same language. If the user writes in Tamil, reply in Tamil script. If they write in Hindi, reply in Hindi. If they write in Tanglish (Tamil words in English letters), reply in proper Tamil script. Always match the user's language automatically.

Personality:
- Speak naturally and casually like a real person
- Use short, clear sentences
- Be warm, supportive and engaging
- Ask follow-up questions sometimes
- Never use markdown symbols like **, ##, or backticks — plain text only
- Do not mention being an AI unless necessary
- Sound confident, warm, and engaging

Your goal is to make the conversation feel real and natural in whatever language the user speaks.`

export async function sendMessage(messages) {
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
        { role: 'system', content: SYSTEM_PROMPT },
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
