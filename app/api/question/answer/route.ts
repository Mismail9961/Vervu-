import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { questionId, answer } = await req.json();

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  let correctness = false;

  try {
    // Try to use OpenAI for evaluation
    const gptRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You're an expert technical interviewer." },
        {
          role: "user",
          content: `Question: ${question.question}\n\nCandidate's Answer: ${answer || "Skipped"}\n\nIs this a correct or mostly correct answer? Reply only with 'true' or 'false'.`,
        },
      ],
    });

    correctness = gptRes.choices[0].message.content?.toLowerCase().includes("true") ?? false;
  } catch (error) {
    // Fallback: simple keyword-based evaluation
    const positiveKeywords = ['correct', 'yes', 'true', 'right', 'good', 'proper', 'valid'];
    const negativeKeywords = ['incorrect', 'no', 'false', 'wrong', 'bad', 'invalid', 'error'];
    
    const answerLower = answer.toLowerCase();
    const positiveMatches = positiveKeywords.filter(keyword => answerLower.includes(keyword)).length;
    const negativeMatches = negativeKeywords.filter(keyword => answerLower.includes(keyword)).length;
    
    // Simple heuristic: if answer is longer than 10 characters and has more positive keywords than negative
    correctness = answer.length > 10 && positiveMatches >= negativeMatches;
  }

  await prisma.question.update({
    where: { id: questionId },
    data: {
      userAnswer: answer,
      correct: correctness,
    },
  });

  return NextResponse.json({ correct: correctness });
}
