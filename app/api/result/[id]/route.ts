import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  const questions = await prisma.question.findMany({
    where: { sessionId },
    select: { correct: true },
  });

  const score = questions.filter(q => q.correct).length;

  await prisma.session.update({
    where: { id: sessionId },
    data: { score },
  });

  return NextResponse.json({ score, total: questions.length });
}
