'use server';

export async function translateWord(word: string, fromLang: string) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set');
    return null;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307", 
        max_tokens: 50,
        messages: [{
          role: "user",
          content: `Translate the ${fromLang === 'es' ? 'Spanish' : fromLang} word "${word}" to English. Reply with ONLY the translation (1-3 words max), nothing else. No punctuation.`
        }]
      })
    });

    const data = await response.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
}
