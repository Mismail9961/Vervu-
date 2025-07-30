import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const params = await context.params;
  const sessionId = params.id;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { questions: true },
  });

  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({ questions: session.questions });
}
