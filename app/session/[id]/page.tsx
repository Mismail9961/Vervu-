"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  question: string;
};

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    fetch(`/api/session/${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch questions:", err);
        setLoading(false);
      });
  }, [sessionId]);

  async function submitAnswer() {
    const currentQuestion = questions[current];
    if (!currentQuestion) return;

    await fetch("/api/question/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: currentQuestion.id,
        answer,
      }),
    });

    setAnswer("");
    setCurrent((prev) => prev + 1);
  }

  const skipQuestion = () => {
    setAnswer("");
    setCurrent((prev) => prev + 1);
  };

  if (loading) return <div className="p-4">Loading questions...</div>;
  if (!questions.length) return <div className="p-4">No questions found.</div>;
  if (current >= questions.length)
    return (
      <div className="p-4 text-center">
        ✅ Session complete.{" "}
        <button
          onClick={() => router.push(`/result/${sessionId}`)}
          className="text-blue-600 underline ml-2"
        >
          See Result
        </button>
      </div>
    );

  const q = questions[current];

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-2">
        Question {current + 1} of {questions.length}
      </h2>
      <p className="mb-4">{q.question}</p>

      <textarea
        className="w-full p-2 border mb-2 rounded"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={4}
        placeholder="Type your answer or leave blank to skip"
      />

      <div className="flex gap-2">
        <button
          onClick={submitAnswer}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Submit
        </button>
        <button
          onClick={skipQuestion}
          className="bg-gray-300 px-4 py-1 rounded"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
