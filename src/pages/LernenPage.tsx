/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LearningPathMotif, type PathNodeState } from '@/components/LearningPathMotif';
import { BONUS_LESSONS, CORE_LESSONS, type Lesson } from '@/lib/lessons';
import { useProgress } from '@/lib/progress-context';
import { AppLink } from '@/lib/router';

export function LernenPage() {
  const {
    completedCoreCount,
    totalCoreCount,
    recommendedLesson,
    getLessonProgress,
  } = useProgress();

  const [previewLessonId, setPreviewLessonId] = useState<string | null>(null);

  const coreNodes: PathNodeState[] = CORE_LESSONS.map((lesson) => {
    const info = getLessonProgress(lesson);
    if (info.isCompleted) return 'completed';
    if (lesson.id === recommendedLesson.id || info.isStarted) return 'current';
    return 'upcoming';
  });

  const togglePreview = (id: string) => {
    setPreviewLessonId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      {/* 1. Compact Learning Path Header */}
      <header className="surface-card p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-accent/30 px-3 py-1 text-xs font-bold text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Interaktiver Lernpfad · 6 Kernmodule + 1 Bonus</span>
          </span>
          <span className="font-mono text-sm font-extrabold text-primary">
            {completedCoreCount} / {totalCoreCount} abgeschlossen
          </span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Dein Lernpfad
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Jedes Modul besteht aus kurzen interaktiven Schritten. Du kannst der Reihe nach vorgehen oder jedes Thema direkt starten.
          </p>
        </div>

        <div className="pt-1">
          <LearningPathMotif
            nodes={coreNodes}
            labels={CORE_LESSONS.map((l) => `${l.categoryLabel}: ${l.shortTitle}`)}
            ariaLabel="Fortschritt über die 6 Kernmodule"
          />
        </div>
      </header>

      {/* 2. Connected Vertical Learning Path (Modules 01 -> 06) */}
      <section aria-label="Die 6 Kernmodule" className="relative space-y-4">
        {CORE_LESSONS.map((lesson, idx) => {
          const progress = getLessonProgress(lesson);
          const isRecommended = lesson.id === recommendedLesson.id;
          const isPreviewOpen = previewLessonId === lesson.id;
          const isLast = idx === CORE_LESSONS.length - 1;
          const numberBadge = String(lesson.order).padStart(2, '0');

          return (
            <div key={lesson.id} className="relative flex items-stretch gap-3 sm:gap-4">
              {/* Left Vertical Node & Connector Line */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-sm font-extrabold transition-all ${
                    progress.isCompleted
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : isRecommended || progress.isStarted
                        ? 'border-2 border-primary bg-accent text-accent-foreground ring-4 ring-accent/30'
                        : 'border-2 border-border bg-card text-muted-foreground'
                  }`}
                >
                  {progress.isCompleted ? (
                    <Check className="h-5 w-5 stroke-[3]" />
                  ) : (
                    <span>{numberBadge}</span>
                  )}
                </div>
                {!isLast && (
                  <div
                    aria-hidden="true"
                    className={`my-1 w-[3px] flex-1 rounded-full ${
                      progress.isCompleted ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>

              {/* Compact Module Card: Number, Title, 1-line description, Duration, Status */}
              <article
                data-testid={`lernen-module-card-${lesson.id}`}
                className={`surface-card min-w-0 flex-1 p-4 sm:p-6 transition-all ${
                  isRecommended
                    ? 'border-primary/45 ring-2 ring-primary/15'
                    : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="font-mono uppercase tracking-wider text-primary">
                        {numberBadge} — {lesson.shortTitle}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        ca. {lesson.readingMinutes} Min.
                      </span>
                      <span
                        className={`rounded-lg px-2 py-0.5 text-xs font-bold ${
                          progress.isCompleted
                            ? 'bg-accent/35 text-accent-foreground'
                            : progress.isStarted
                              ? 'bg-primary/10 text-primary'
                              : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        {progress.shortStatusLabel}
                      </span>
                    </div>

                    <h2 className="text-xl font-extrabold text-foreground leading-snug">
                      {lesson.title}
                    </h2>

                    <p className="text-base text-muted-foreground line-clamp-2">
                      {lesson.oneLineDescription}
                    </p>
                  </div>

                  {/* Primary Action + Preview Toggle */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <AppLink
                      to={lesson.route}
                      data-testid={`lernen-start-${lesson.id}`}
                      className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                        isRecommended || progress.isStarted
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'border border-border bg-secondary text-foreground hover:bg-muted'
                      }`}
                    >
                      <span>
                        {progress.isCompleted
                          ? 'Wiederholen'
                          : progress.isStarted
                            ? `Fortsetzen (${progress.displayStepNumber}/${progress.totalSteps})`
                            : 'Starten'}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </AppLink>

                    <button
                      type="button"
                      onClick={() => togglePreview(lesson.id)}
                      aria-expanded={isPreviewOpen}
                      className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground py-1"
                    >
                      <span>Vorschau</span>
                      {isPreviewOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Compact Lesson Preview Sheet (on demand only) */}
                {isPreviewOpen && (
                  <LessonPreviewPanel lesson={lesson} />
                )}
              </article>
            </div>
          );
        })}
      </section>

      {/* 3. Practical Bonus Module: Budget & Taschengeld */}
      {BONUS_LESSONS.length > 0 && (
        <section aria-label="Praxis-Bonusmodul" className="space-y-3 pt-2">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Praxis-Ergänzung für jeden Monat
          </p>
          {BONUS_LESSONS.map((bonus) => {
            const progress = getLessonProgress(bonus);
            const isPreviewOpen = previewLessonId === bonus.id;
            return (
              <article
                key={bonus.id}
                data-testid={`lernen-module-card-${bonus.id}`}
                className="surface-card border-primary/25 bg-card p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="rounded-lg bg-accent/30 px-2.5 py-0.5 text-accent-foreground">
                        Praxis-Bonus
                      </span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        ca. {bonus.readingMinutes} Min.
                      </span>
                      <span className="rounded-lg bg-secondary px-2 py-0.5 text-secondary-foreground">
                        {progress.shortStatusLabel}
                      </span>
                    </div>

                    <h2 className="text-xl font-extrabold text-foreground">
                      {bonus.title}
                    </h2>
                    <p className="text-base text-muted-foreground">
                      {bonus.oneLineDescription}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <AppLink
                      to={bonus.route}
                      data-testid={`lernen-start-${bonus.id}`}
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                    >
                      <span>
                        {progress.isCompleted
                          ? 'Wiederholen'
                          : progress.isStarted
                            ? `Fortsetzen (${progress.displayStepNumber}/${progress.totalSteps})`
                            : 'Bonus starten'}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </AppLink>

                    <button
                      type="button"
                      onClick={() => togglePreview(bonus.id)}
                      aria-expanded={isPreviewOpen}
                      className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground py-1"
                    >
                      <span>Vorschau</span>
                      {isPreviewOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {isPreviewOpen && <LessonPreviewPanel lesson={bonus} />}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function LessonPreviewPanel({ lesson }: { lesson: Lesson }) {
  const completionStep = lesson.steps.find((s) => s.type === 'completion');
  const bullets =
    completionStep && completionStep.type === 'completion'
      ? completionStep.summaryPoints
      : lesson.merkeSummary;

  return (
    <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span>Das erwartet dich in {lesson.steps.length} kurzen Schritten:</span>
        <span>ca. {lesson.readingMinutes} Min.</span>
      </div>
      <ul className="space-y-1.5">
        {bullets.slice(0, 3).map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
