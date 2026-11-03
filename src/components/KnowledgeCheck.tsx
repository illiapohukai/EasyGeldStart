import { CheckCircle2, HelpCircle, RotateCcw, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { LessonId, QuizQuestion } from '@/lib/lessons';
import { useProgress } from '@/lib/progress-context';

export function KnowledgeCheck({
  lessonId,
  questions,
}: {
  lessonId: LessonId;
  questions: QuizQuestion[];
}) {
  const { state, recordQuizResult } = useProgress();
  const savedAttempt = state.quizScores[lessonId];

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [completedBanner, setCompletedBanner] = useState<boolean>(Boolean(savedAttempt));

  const answeredCount = questions.filter((q) => selectedAnswers[q.id] !== undefined).length;
  const allAnswered = answeredCount === questions.length;
  const correctCount = questions.filter(
    (q) => selectedAnswers[q.id] === q.correctIndex,
  ).length;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    const nextAnswers = {
      ...selectedAnswers,
      [questionId]: optionIndex,
    };
    setSelectedAnswers(nextAnswers);

    const nextAnsweredCount = questions.filter(
      (q) => nextAnswers[q.id] !== undefined,
    ).length;

    if (nextAnsweredCount === questions.length) {
      const nextScore = questions.filter(
        (q) => nextAnswers[q.id] === q.correctIndex,
      ).length;
      recordQuizResult(lessonId, nextScore, questions.length);
      setCompletedBanner(true);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCompletedBanner(false);
  };

  return (
    <section
      aria-labelledby={`quiz-heading-${lessonId}`}
      className="surface-card p-5 sm:p-6 space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <p className="text-xs text-muted-foreground">
            Schritt 4 · Wissen prüfen · {questions.length} kurze Fragen
          </p>
          <h2 id={`quiz-heading-${lessonId}`} className="mt-1 text-xl font-bold">
            Wissens-Check zum Thema
          </h2>
        </div>
        {answeredCount > 0 && (
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Neu versuchen
          </button>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const chosenIndex = selectedAnswers[q.id];
          const isAnswered = chosenIndex !== undefined;
          const isCorrect = chosenIndex === q.correctIndex;

          return (
            <div
              key={q.id}
              className="rounded-xl border border-border bg-background/60 p-4 sm:p-5 space-y-3.5"
            >
              <div className="flex items-start gap-2.5">
                <HelpCircle
                  className="h-5 w-5 text-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <h3 className="text-base font-bold leading-snug">
                  Frage {qIdx + 1}: {q.question}
                </h3>
              </div>

              <div className="space-y-2" role="group" aria-label={`Frage ${qIdx + 1}`}>
                {q.options.map((opt, optIdx) => {
                  const isThisSelected = chosenIndex === optIdx;
                  const isThisCorrectOption = optIdx === q.correctIndex;

                  let buttonStyle =
                    'border border-border bg-card text-foreground hover:bg-muted/70';
                  if (isAnswered) {
                    if (isThisSelected && isCorrect) {
                      buttonStyle =
                        'border-2 border-primary bg-accent/55 text-foreground font-semibold';
                    } else if (isThisSelected && !isCorrect) {
                      buttonStyle =
                        'border-2 border-destructive bg-destructive/10 text-foreground font-semibold';
                    } else if (isThisCorrectOption) {
                      buttonStyle =
                        'border border-primary/60 bg-secondary/80 text-foreground font-medium';
                    } else {
                      buttonStyle = 'border border-border/60 bg-card/50 text-muted-foreground';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      aria-pressed={isThisSelected}
                      className={`w-full min-h-[48px] rounded-xl px-4 py-3 text-left text-sm leading-snug transition-colors flex items-start justify-between gap-3 ${buttonStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isThisSelected && (
                        <span className="shrink-0 mt-0.5">
                          {isCorrect ? (
                            <CheckCircle2
                              className="h-4 w-4 text-primary"
                              aria-label="Richtige Antwort"
                            />
                          ) : (
                            <XCircle
                              className="h-4 w-4 text-destructive"
                              aria-label="Andere Option ist passender"
                            />
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`rounded-xl p-3.5 text-sm leading-relaxed border ${
                    isCorrect
                      ? 'border-primary/30 bg-secondary/80 text-foreground'
                      : 'border-highlight bg-highlight/20 text-foreground'
                  }`}
                >
                  <p className="font-bold flex items-center gap-1.5">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                        <span>Richtig gelöst!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-destructive shrink-0" aria-hidden="true" />
                        <span>Noch nicht ganz – hier ist die Erklärung:</span>
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {isCorrect ? q.explanationCorrect : q.explanationWrong}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allAnswered && completedBanner && (
        <div
          role="region"
          aria-label="Quiz-Ergebnis"
          className="rounded-xl border border-primary/30 bg-secondary p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
              <span>
                Thema abgeschlossen · {correctCount} von {questions.length} Fragen richtig
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Dein Fortschritt wurde lokal auf diesem Gerät gespeichert. Du kannst Antworten jederzeit noch einmal ausprobieren.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors whitespace-nowrap shrink-0"
          >
            Quiz zurücksetzen
          </button>
        </div>
      )}
    </section>
  );
}
