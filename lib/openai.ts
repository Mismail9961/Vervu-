import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateQuestion(role: string, mode: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'user',
        content: `Give 1 ${mode.toLowerCase()} level interview question for a ${role.toLowerCase()} developer. Only return the question.`
      }
    ],
  });

  return res.choices[0].message.content ?? 'No question generated';
}
