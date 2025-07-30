import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { role = 'FULLSTACK', mode = 'MEDIUM' } = await req.json();

  // Upsert user (create if doesn't exist, or update otherwise)
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName || 'User',
    },
  });

  // Create new session
  const session = await prisma.session.create({
    data: {
      userId,
      score: 0,
    },
  });

  // Generate questions using OpenAI
  const questions = await generateQuestions(role, mode, session.id);

  return NextResponse.json({ id: session.id });
}

async function generateQuestions(role: string, mode: string, sessionId: string) {
  // Predefined questions for different roles and modes
  const questionBank = {
    FRONTEND: {
      EASY: [
        "What is the difference between HTML and XHTML?",
        "Explain the box model in CSS.",
        "What are semantic HTML elements?",
        "How do you center an element horizontally in CSS?",
        "What is the difference between let, const, and var in JavaScript?"
      ],
      MEDIUM: [
        "Explain the concept of closures in JavaScript.",
        "What is the Virtual DOM and how does it work?",
        "How would you implement a debounce function?",
        "Explain the difference between REST and GraphQL APIs.",
        "What are React hooks and when would you use them?"
      ],
      HARD: [
        "Implement a custom React hook for managing form state.",
        "Explain the concept of time complexity and space complexity.",
        "How would you optimize a React application for performance?",
        "Design a component library with TypeScript and Storybook.",
        "Explain the concept of micro-frontends and their benefits."
      ]
    },
    BACKEND: {
      EASY: [
        "What is the difference between GET and POST requests?",
        "Explain what a database index is and why it's important.",
        "What is the difference between SQL and NoSQL databases?",
        "Explain the concept of RESTful APIs.",
        "What is the difference between synchronous and asynchronous programming?"
      ],
      MEDIUM: [
        "Explain the concept of database normalization.",
        "How would you implement authentication and authorization?",
        "What is the difference between horizontal and vertical scaling?",
        "Explain the concept of microservices architecture.",
        "How would you handle database transactions?"
      ],
      HARD: [
        "Design a distributed system for handling high traffic.",
        "Implement a rate limiting algorithm.",
        "Explain the CAP theorem and its implications.",
        "Design a caching strategy for a web application.",
        "How would you implement event sourcing and CQRS?"
      ]
    },
    FULLSTACK: {
      EASY: [
        "What is the difference between client-side and server-side rendering?",
        "Explain the concept of state management in web applications.",
        "What is the difference between cookies and localStorage?",
        "How do you handle CORS in web applications?",
        "What is the difference between HTTP and HTTPS?"
      ],
      MEDIUM: [
        "Explain the concept of JWT tokens and how they work.",
        "How would you implement real-time features using WebSockets?",
        "Explain the concept of progressive web apps (PWAs).",
        "How would you implement file upload functionality?",
        "Explain the concept of serverless architecture."
      ],
      HARD: [
        "Design a real-time collaborative editing system.",
        "Implement a comprehensive testing strategy for a full-stack app.",
        "Design a system for handling millions of concurrent users.",
        "Explain the concept of event-driven architecture.",
        "How would you implement a CI/CD pipeline for a full-stack application?"
      ]
    },
    DEVOPS: {
      EASY: [
        "What is the difference between Docker and virtual machines?",
        "Explain the concept of containerization.",
        "What is the difference between Git and GitHub?",
        "Explain the concept of continuous integration.",
        "What is the difference between HTTP and HTTPS?"
      ],
      MEDIUM: [
        "How would you implement infrastructure as code using Terraform?",
        "Explain the concept of Kubernetes and its benefits.",
        "How would you set up monitoring and logging for applications?",
        "Explain the concept of blue-green deployment.",
        "How would you implement automated testing in a CI/CD pipeline?"
      ],
      HARD: [
        "Design a multi-cloud infrastructure strategy.",
        "Implement a comprehensive disaster recovery plan.",
        "Design a system for handling high availability and fault tolerance.",
        "Explain the concept of service mesh and its benefits.",
        "How would you implement security scanning in a CI/CD pipeline?"
      ]
    }
  };

  // Get questions for the selected role and mode
  const questions = questionBank[role as keyof typeof questionBank]?.[mode as keyof typeof questionBank.FRONTEND] || questionBank.FULLSTACK.MEDIUM;

  // Create questions in database
  const createdQuestions = await Promise.all(
    questions.map(async (question) => {
      return await prisma.question.create({
        data: {
          sessionId,
          question,
          mode: mode as any,
          role: role as any,
        },
      });
    })
  );

  return createdQuestions;
}
