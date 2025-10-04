import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { question, templeId, lang, messages } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant for a temple information website.
        Your name is ॐ ChatBot.
        You can answer questions about booking, slots, timings, heatmaps, and how to use the site.
        The current temple context is ${templeId}.
        The user's language is ${lang}.
        Be concise and helpful.`,
    };

    const history = messages.map(m => ({ role: m.role, content: m.text }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...history, { role: 'user', content: question }],
    });

    const answer = completion.choices[0]?.message?.content;

    if (!answer) {
      throw new Error('No answer from OpenAI');
    }

    res.status(200).json({ answer });

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Failed to get a response from the assistant.' });
  }
}
