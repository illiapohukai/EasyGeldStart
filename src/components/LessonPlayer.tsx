/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { LessonStepInteractiveWidget } from '@/components/InteractiveWidgets';
import { LearningPathMotif, type PathNodeState } from '@/components/LearningPathMotif';
import {
  getNextLesson,
  type ComparisonStep,
  type CompletionStep,
  type ExplanationStep,
  type InteractiveStep,
  type IntroStep,
  type Lesson,
  type LessonStep,
  type QuestionStep,
  type ScenarioStep,
  type VisualChoiceStep,
} from '@/lib/lessons';
import { useProgress } from '@/lib/progress-context';
import { AppLink, useAppRouter } from '@/lib/router';

interface LessonPlayerProps {
  lesson: Lesson;
}

const STEP_TYPE_LABELS: Record<LessonStep['type'], string> = {
  intro: 'Einstieg',
  explanation: 'Kern-Idee',
  comparison: 'Vergleich',
  visual_choice: 'Entscheidung',
  question: 'Verständnis-Check',
  scenario: 'Alltags-Szenario',
  interactive: 'Ausprobieren',
  completion: 'Abschluss',
};

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  const { navigate } = useAppRouter();
  const {
    state,
    markLessonOpened,
    markLessonCompleted,
    saveLessonStep,
    recordStepAnswer,
    getLessonProgress,
  } = useProgress();

  const steps = lesson.steps;
  const totalSteps = Math.max(1, steps.length);
  const progressInfo = getLessonProgress(lesson);

  const computeInitialStep = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('restart') === '1') {
        return 0;
      }
      const stepParam = params.get('step');
      if (stepParam) {
        const parsed = Number(stepParam);
        if (Number.isFinite(parsed) && parsed >= 1 && parsed <= totalSteps) {
          return parsed - 1;
        }
      }
    }
    const savedIndex = state.lessonStepIndex[lesson.id];
    if (typeof savedIndex === 'number' && Number.isFinite(savedIndex)) {
      if (
        state.completedLessons.includes(lesson.id) &&
        savedIndex >= totalSteps - 1
      ) {
        return 0;
      }
      return Math.max(0, Math.min(totalSteps - 1, savedIndex));
    }
    return 0;
  };

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(computeInitialStep);

  // Reset step index if lesson changes
  useEffect(() => {
    const initialIdx = computeInitialStep();
    setCurrentStepIndex(initialIdx);
    markLessonOpened(lesson.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  const currentStep: LessonStep = steps[currentStepIndex] ?? steps[0]!;

  // Step-local UI states
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [hasSubmittedChoice, setHasSubmittedChoice] = useState(false);

  // Sync saved answer if user already answered this step earlier in the session
  useEffect(() => {
    setMoreInfoOpen(false);
    const answerKey = `${lesson.id}:${currentStep.id}`;
    const savedAnswer = state.stepAnswers[answerKey];
    if (
      savedAnswer &&
      (currentStep.type === 'question' ||
        currentStep.type === 'scenario' ||
        currentStep.type === 'visual_choice')
    ) {
      setSelectedChoiceIndex(savedAnswer.selectedIndex);
      setHasSubmittedChoice(true);
    } else {
      setSelectedChoiceIndex(null);
      setHasSubmittedChoice(false);
    }
  }, [lesson.id, currentStep.id, currentStep.type, state.stepAnswers]);

  // Save current step index whenever it changes
  useEffect(() => {
    saveLessonStep(lesson.id, currentStepIndex);
    if (currentStep.type === 'completion') {
      markLessonCompleted(lesson.id);
    }
  }, [currentStepIndex, currentStep.type, lesson.id, markLessonCompleted, saveLessonStep]);

  const isChoiceStep =
    currentStep.type === 'question' ||
    currentStep.type === 'scenario' ||
    currentStep.type === 'visual_choice';

  const isChoiceCorrect =
    isChoiceStep &&
    hasSubmittedChoice &&
    selectedChoiceIndex !== null &&
    selectedChoiceIndex === currentStep.correctIndex;

  const canAdvance = !isChoiceStep || hasSubmittedChoice;

  const handleCheckChoice = () => {
    if (!isChoiceStep || selectedChoiceIndex === null) return;
    const correct = selectedChoiceIndex === currentStep.correctIndex;
    setHasSubmittedChoice(true);
    recordStepAnswer(lesson.id, currentStep.id, selectedChoiceIndex, correct);
  };

  const handleRetryChoice = () => {
    setSelectedChoiceIndex(null);
    setHasSubmittedChoice(false);
  };

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      const nextIdx = currentStepIndex + 1;
      saveLessonStep(lesson.id, nextIdx, currentStep.id);
      setCurrentStepIndex(nextIdx);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      markLessonCompleted(lesson.id);
      navigate('/lernen');
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      saveLessonStep(lesson.id, prevIdx);
      setCurrentStepIndex(prevIdx);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSelectStepNode = (index: number) => {
    if (index >= 0 && index < totalSteps) {
      saveLessonStep(lesson.id, index);
      setCurrentStepIndex(index);
    }
  };

  const handleRestartLesson = () => {
    saveLessonStep(lesson.id, 0);
    setCurrentStepIndex(0);
    setSelectedChoiceIndex(null);
    setHasSubmittedChoice(false);
  };

  const pathNodes: PathNodeState[] = useMemo(() => {
    const completedSet = new Set(state.completedSteps[lesson.id] ?? []);
    return steps.map((step, idx) => {
      if (idx === currentStepIndex) return 'current';
      if (idx < currentStepIndex || completedSet.has(step.id)) return 'completed';
      return 'upcoming';
    });
  }, [currentStepIndex, lesson.id, state.completedSteps, steps]);

  const nextLesson = getNextLesson(lesson.id);
  const stepMoreInfo = 'moreInfo' in currentStep ? currentStep.moreInfo : undefined;

  return (
    <div
      data-testid="lesson-player"
      className="mx-auto max-w-2xl space-y-4 sm:space-y-5 pb-6"
    >
      {/* 1. Compact Lesson Player Header Bar */}
      <header className="surface-card px-3.5 py-3 sm:px-5 sm:py-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <AppLink
            to="/lernen"
            data-testid="lesson-close-btn"
            className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl border border-border bg-secondary/70 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold text-foreground transition-colors hover:bg-secondary"
            aria-label="Zurück zum Lernpfad"
          >
            <X className="h-4 w-4" />
            <span>Lernpfad</span>
          </AppLink>

          <div className="text-center min-w-0 flex-1 px-1">
            <p className="truncate text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {lesson.shortTitle}
            </p>
            <p
              data-testid="lesson-step-counter"
              className="whitespace-nowrap font-mono text-sm font-extrabold text-primary"
            >
              Schritt {currentStepIndex + 1} von {totalSteps}
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center rounded-xl bg-accent/25 px-2.5 py-1 text-xs font-bold text-accent-foreground">
            {STEP_TYPE_LABELS[currentStep.type]}
          </span>
        </div>

        {/* Signature Node-and-Line Progress Bar */}
        <LearningPathMotif
          nodes={pathNodes}
          labels={steps.map((s, idx) => `Schritt ${idx + 1}: ${s.title}`)}
          onSelectNode={handleSelectStepNode}
          compact
          ariaLabel={`Fortschritt in ${lesson.shortTitle}: Schritt ${currentStepIndex + 1} von ${totalSteps}`}
        />
      </header>

      {/* 2. Single-Concept Step Card */}
      <article
        key={currentStep.id}
        data-testid={`lesson-step-${currentStep.type}`}
        className="surface-card p-5 sm:p-8 space-y-5 sm:space-y-6"
      >
        {currentStep.type === 'intro' && (
          <IntroStepView step={currentStep} lesson={lesson} />
        )}

        {currentStep.type === 'explanation' && (
          <ExplanationStepView step={currentStep} />
        )}

        {currentStep.type === 'comparison' && (
          <ComparisonStepView step={currentStep} />
        )}

        {(currentStep.type === 'question' ||
          currentStep.type === 'scenario' ||
          currentStep.type === 'visual_choice') && (
          <ChoiceStepView
            step={currentStep}
            selectedIndex={selectedChoiceIndex}
            hasSubmitted={hasSubmittedChoice}
            onSelectIndex={(idx) => {
              if (!hasSubmittedChoice) {
                setSelectedChoiceIndex(idx);
              } else {
                setSelectedChoiceIndex(idx);
                const correct = idx === currentStep.correctIndex;
                recordStepAnswer(lesson.id, currentStep.id, idx, correct);
              }
            }}
            onRetry={handleRetryChoice}
          />
        )}

        {currentStep.type === 'interactive' && (
          <InteractiveStepView step={currentStep} />
        )}

        {currentStep.type === 'completion' && (
          <CompletionStepView
            step={currentStep}
            lesson={lesson}
            nextLesson={nextLesson}
            onRestart={handleRestartLesson}
            progressPercent={progressInfo.percentComplete}
          />
        )}

        {/* Progressive Disclosure: Optional "Mehr erfahren" */}
        {stepMoreInfo && (
          <div className="rounded-2xl border border-border bg-secondary/40 overflow-hidden">
            <button
              type="button"
              onClick={() => setMoreInfoOpen((prev) => !prev)}
              aria-expanded={moreInfoOpen}
              data-testid="lesson-more-info-toggle"
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-bold text-foreground transition-colors hover:bg-secondary/70"
            >
              <span className="inline-flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                <span>{stepMoreInfo.title || 'Mehr erfahren'}</span>
              </span>
              {moreInfoOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </button>
            {moreInfoOpen && (
              <div
                data-testid="lesson-more-info-content"
                className="border-t border-border bg-card px-4 py-3.5 text-sm leading-relaxed text-muted-foreground space-y-2"
              >
                <ul className="space-y-1.5">
                  {stepMoreInfo.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                {stepMoreInfo.sourceNote && (
                  <p className="text-xs font-semibold text-muted-foreground/80 pt-1">
                    {stepMoreInfo.sourceNote}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </article>

      {/* 3. Non-Overlapping Step Action Bar */}
      {currentStep.type !== 'completion' && (
        <div className="surface-card p-4 sm:px-6 flex items-center justify-between gap-3 shadow-xs">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            data-testid="lesson-prev-btn"
            className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-3 text-base font-bold text-foreground transition-colors hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Zurück</span>
          </button>

          {isChoiceStep && !hasSubmittedChoice ? (
            <button
              type="button"
              onClick={handleCheckChoice}
              disabled={selectedChoiceIndex === null}
              data-testid="lesson-check-btn"
              className="flex-1 sm:flex-initial inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-45 disabled:pointer-events-none"
            >
              <span>Antwort prüfen</span>
              <CheckCircle2 className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex flex-1 sm:flex-initial items-center justify-end gap-2.5">
              {isChoiceStep && hasSubmittedChoice && !isChoiceCorrect && (
                <button
                  type="button"
                  onClick={handleRetryChoice}
                  data-testid="lesson-retry-btn"
                  className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground hover:bg-muted"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Nochmal versuchen</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!canAdvance}
                data-testid="lesson-next-btn"
                className="flex-1 sm:flex-initial inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90"
              >
                <span>
                  {currentStepIndex === totalSteps - 2
                    ? 'Zum Abschluss'
                    : 'Weiter'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IntroStepView({ step, lesson }: { step: IntroStep; lesson: Lesson }) {
  return (
    <div className="space-y-5">
      <div className="inline-flex items-center gap-2 rounded-xl bg-accent/25 px-3 py-1.5 text-xs font-bold text-accent-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>{step.kicker || lesson.categoryLabel}</span>
        <span>·</span>
        <span>ca. {lesson.readingMinutes} Min.</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
        {step.title}
      </h1>

      <p className="text-lg font-semibold leading-snug text-primary">
        {step.hook}
      </p>

      <p className="text-lg leading-relaxed text-foreground/90">
        {step.body}
      </p>
    </div>
  );
}

function ExplanationStepView({ step }: { step: ExplanationStep }) {
  return (
    <div className="space-y-5">
      <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary">
        {step.kicker}
      </span>

      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
        {step.title}
      </h2>

      <p className="text-lg leading-relaxed text-foreground/90">
        {step.body}
      </p>

      {step.highlightPoint && (
        <div className="rounded-2xl border border-primary/25 bg-accent/20 p-4 sm:p-5 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-base font-bold text-foreground leading-snug">
            {step.highlightPoint}
          </p>
        </div>
      )}
    </div>
  );
}

function ComparisonStepView({ step }: { step: ComparisonStep }) {
  return (
    <div className="space-y-5">
      <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary">
        {step.kicker}
      </span>

      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
        {step.title}
      </h2>

      <p className="text-lg leading-relaxed text-foreground/90">
        {step.body}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {[step.leftCard, step.rightCard].map((card, idx) => {
          const isAccent = card.tone === 'accent';
          const isWarning = card.tone === 'warning';
          return (
            <div
              key={idx}
              className={`rounded-2xl border p-4 sm:p-5 space-y-2.5 ${
                isAccent
                  ? 'border-primary/35 bg-accent/20'
                  : isWarning
                    ? 'border-warning/50 bg-warning/10'
                    : 'border-border bg-secondary/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </span>
                <span className="rounded-lg bg-card px-2 py-0.5 text-xs font-bold text-foreground">
                  {card.badge}
                </span>
              </div>
              <p className="text-lg font-extrabold text-foreground">
                {card.title}
              </p>
              <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                {card.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {step.takeaway && (
        <div className="rounded-2xl border border-primary/25 bg-accent/20 p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-base font-bold text-foreground leading-snug">
            {step.takeaway}
          </p>
        </div>
      )}
    </div>
  );
}

function ChoiceStepView({
  step,
  selectedIndex,
  hasSubmitted,
  onSelectIndex,
}: {
  step: QuestionStep | ScenarioStep | VisualChoiceStep;
  selectedIndex: number | null;
  hasSubmitted: boolean;
  onSelectIndex: (idx: number) => void;
  onRetry: () => void;
}) {
  const isCorrect =
    hasSubmitted && selectedIndex !== null && selectedIndex === step.correctIndex;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary">
          {step.kicker}
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          {step.title}
        </h2>

        {step.type === 'scenario' && (
          <div className="rounded-2xl border border-border bg-secondary/45 p-4 space-y-2.5">
            <span className="inline-block rounded-lg bg-card px-2.5 py-1 text-xs font-bold text-primary">
              {step.personTag}
            </span>
            <p className="text-base sm:text-lg leading-relaxed text-foreground">
              {step.situation}
            </p>
            {step.contextFacts && step.contextFacts.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {step.contextFacts.map((fact, idx) => (
                  <span
                    key={idx}
                    className="rounded-xl border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground"
                  >
                    <span className="text-muted-foreground">{fact.label}:</span>{' '}
                    <strong className="font-mono">{fact.value}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-lg font-bold text-foreground pt-1">
          {step.question}
        </p>
      </div>

      {/* Answer Options */}
      <div
        role="radiogroup"
        aria-label={step.title}
        className="space-y-3"
      >
        {step.type === 'visual_choice'
          ? step.options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              const isOptionCorrect = idx === step.correctIndex;
              let cardClass =
                'border-border bg-card hover:border-primary/40 hover:bg-secondary/40';
              if (hasSubmitted) {
                if (isOptionCorrect) {
                  cardClass = 'border-primary bg-accent/25 ring-2 ring-primary/20';
                } else if (isSelected && !isOptionCorrect) {
                  cardClass = 'border-warning bg-warning/15';
                }
              } else if (isSelected) {
                cardClass = 'border-primary bg-primary/8 ring-2 ring-primary/25';
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  data-testid={`lesson-option-${idx}`}
                  onClick={() => onSelectIndex(idx)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all flex items-start gap-3.5 min-h-[56px] ${cardClass}`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border bg-secondary text-foreground'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="space-y-1">
                    <p className="text-base sm:text-[17px] font-bold text-foreground">
                      {opt.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{opt.subtitle}</p>
                    {opt.metrics && opt.metrics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {opt.metrics.map((m, i) => (
                          <span
                            key={i}
                            className="rounded-lg bg-secondary px-2 py-0.5 font-mono text-xs font-semibold text-secondary-foreground"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          : step.options.map((optionText, idx) => {
              const isSelected = selectedIndex === idx;
              const isOptionCorrect = idx === step.correctIndex;
              let cardClass =
                'border-border bg-card hover:border-primary/40 hover:bg-secondary/40';
              if (hasSubmitted) {
                if (isOptionCorrect) {
                  cardClass = 'border-primary bg-accent/25 ring-2 ring-primary/20';
                } else if (isSelected && !isOptionCorrect) {
                  cardClass = 'border-warning bg-warning/15';
                }
              } else if (isSelected) {
                cardClass = 'border-primary bg-primary/8 ring-2 ring-primary/25';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  data-testid={`lesson-option-${idx}`}
                  onClick={() => onSelectIndex(idx)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all flex items-start gap-3.5 min-h-[56px] ${cardClass}`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border bg-secondary text-foreground'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-base sm:text-[17px] font-semibold text-foreground leading-snug">
                    {optionText}
                  </span>
                </button>
              );
            })}
      </div>

      {/* Immediate Explanatory Feedback */}
      {hasSubmitted && (
        <div
          role="status"
          aria-live="polite"
          data-testid="lesson-step-feedback"
          className={`rounded-2xl border p-4 sm:p-5 space-y-1.5 ${
            isCorrect
              ? 'border-primary/40 bg-accent/25 text-foreground'
              : 'border-warning/60 bg-warning/15 text-foreground'
          }`}
        >
          <p className="text-sm font-extrabold uppercase tracking-wider text-primary">
            {isCorrect
              ? 'Genau richtig!'
              : 'Guter Gedanke – schau dir den Unterschied an:'}
          </p>
          <p className="text-base leading-relaxed text-foreground/90">
            {isCorrect ? step.explanationCorrect : step.explanationWrong}
          </p>
        </div>
      )}
    </div>
  );
}

function InteractiveStepView({ step }: { step: InteractiveStep }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary">
          {step.kicker}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          {step.title}
        </h2>
        <p className="text-lg leading-relaxed text-foreground/90">
          {step.body}
        </p>
      </div>

      <LessonStepInteractiveWidget widget={step.widget} />
    </div>
  );
}

function CompletionStepView({
  step,
  lesson,
  nextLesson,
  onRestart,
}: {
  step: CompletionStep;
  lesson: Lesson;
  nextLesson: Lesson | null;
  onRestart: () => void;
  progressPercent: number;
}) {
  return (
    <div data-testid="lesson-completion-view" className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
            {step.kicker || `${lesson.categoryLabel} abgeschlossen`}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {step.title}
          </h2>
        </div>
      </div>

      <p className="text-lg text-muted-foreground leading-relaxed">
        {step.body}
      </p>

      <div className="rounded-2xl border border-border bg-secondary/45 p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Deine wichtigsten Erkenntnisse:
        </p>
        <ul className="space-y-2.5">
          {step.summaryPoints.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-base font-semibold text-foreground">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Optional Practice Action: Bridge into Virtual Depot or Calculator */}
      {step.depotBridge && (
        <div className="rounded-2xl border border-primary/25 bg-accent/20 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Praxis-Impuls (optional)</span>
          </div>
          <p className="text-base leading-relaxed text-foreground">
            {step.depotBridge.description}
          </p>
          <AppLink
            to={step.depotBridge.to}
            data-testid="lesson-depot-bridge-link"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-primary/30 bg-card px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-secondary"
          >
            <span>{step.depotBridge.label}</span>
            <ArrowRight className="h-4 w-4" />
          </AppLink>
        </div>
      )}

      {/* Primary Next Module CTA + Secondary Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {nextLesson ? (
          <AppLink
            to={nextLesson.route}
            data-testid="lesson-next-module-link"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            <span>Nächstes Modul: {nextLesson.shortTitle}</span>
            <ArrowRight className="h-4 w-4" />
          </AppLink>
        ) : (
          <AppLink
            to="/lernen"
            data-testid="lesson-back-to-path-link"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            <span>Zurück zum Lernpfad</span>
            <ArrowRight className="h-4 w-4" />
          </AppLink>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRestart}
            data-testid="lesson-restart-btn"
            className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-2xl border border-border bg-secondary px-4 py-2.5 text-sm font-bold text-secondary-foreground hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Modul wiederholen</span>
          </button>
          <AppLink
            to="/lernen"
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground hover:bg-secondary"
          >
            Übersicht
          </AppLink>
        </div>
      </div>
    </div>
  );
}
