/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  Compass,
  HelpCircle,
  LineChart,
  Sparkles,
  X,
} from 'lucide-react';
import { LearningPathMotif, type PathNodeState } from '@/components/LearningPathMotif';
import { formatEuro } from '@/lib/calculator';
import { useDepot } from '@/lib/depot-context';
import { CORE_LESSONS } from '@/lib/lessons';
import { useProgress } from '@/lib/progress-context';
import { AppLink } from '@/lib/router';

const DAILY_IMPULSE = {
  question: 'Was passiert mit 1.000 € auf einem unverzinsten Konto, wenn die Inflation 3 % beträgt?',
  options: [
    'Der Betrag auf dem Kontoauszug sinkt auf 970 €.',
    'Die Zahl bleibt 1.000 €, aber du kannst dir davon im Alltag weniger leisten.',
    'Die Bank gleicht die Inflation automatisch am Jahresende aus.',
  ],
  correctIndex: 1,
  explanation:
    'Richtig: Nominal stehen weiter 1.000 € auf dem Konto, aber durch steigende Preise sinkt die reale Kaufkraft.',
};

export function StartPage() {
  const {
    state,
    completedCoreCount,
    totalCoreCount,
    recommendedLesson,
    recommendedResumeInfo,
    dismissOnboarding,
  } = useProgress();
  const { portfolio, valuation } = useDepot();

  const [selectedImpulse, setSelectedImpulse] = useState<number | null>(null);

  const coreNodes: PathNodeState[] = CORE_LESSONS.map((lesson) => {
    if (state.completedLessons.includes(lesson.id)) return 'completed';
    if (lesson.id === recommendedLesson.id) return 'current';
    return 'upcoming';
  });

  const showOnboardingBanner = !state.onboardingDismissed;

  return (
    <div className="space-y-6">
      {/* 1. First-Time User Intro Card (Dismissible, 1 headline + 1 sentence + 1 CTA) */}
      {showOnboardingBanner && (
        <section
          data-testid="start-onboarding-card"
          aria-label="Willkommen bei GeldStart"
          className="surface-card-elevated relative overflow-hidden border-primary/25 bg-card p-6 sm:p-7"
        >
          <button
            type="button"
            onClick={dismissOnboarding}
            aria-label="Willkommenshinweis ausblenden"
            className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary/60 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-accent/30 px-3 py-1 text-xs font-bold text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Finanzbildung für 16–20 Jahre</span>
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Finanzen verstehen. Ohne Fachchinesisch.
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Lerne Schritt für Schritt, wie Kaufkraft, Zinseszins, ETFs und deine ersten eigenen Finanzentscheidungen funktionieren – im eigenen Tempo und ohne echtes Geld.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <AppLink
                to={recommendedLesson.route}
                data-testid="start-onboarding-cta"
                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
              >
                <span>Loslegen mit Modul 1</span>
                <ArrowRight className="h-4 w-4" />
              </AppLink>
              <AppLink
                to="/lernen"
                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-border bg-secondary px-5 py-3 text-base font-bold text-secondary-foreground hover:bg-muted"
              >
                <span>Lernpfad ansehen</span>
              </AppLink>
            </div>
          </div>
        </section>
      )}

      {/* 2. Dominant "Weiterlernen" Card (Current / Next Lesson + Step Resume) */}
      <section
        data-testid="start-continue-card"
        aria-labelledby="continue-learning-heading"
        className="rounded-3xl bg-primary text-primary-foreground p-6 sm:p-8 shadow-md space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-1 text-xs font-extrabold text-accent-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>
              {recommendedResumeInfo.isStarted && !recommendedResumeInfo.isCompleted
                ? 'Weiterlernen'
                : 'Empfohlener nächster Schritt'}
            </span>
          </span>
          <span className="font-mono text-xs font-semibold text-primary-foreground/80">
            {recommendedLesson.categoryLabel} · ca. {recommendedLesson.readingMinutes} Min.
          </span>
        </div>

        <div className="space-y-2 max-w-2xl">
          <h2
            id="continue-learning-heading"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
          >
            {recommendedLesson.title}
          </h2>
          <p className="text-base sm:text-lg text-primary-foreground/85 leading-relaxed">
            {recommendedLesson.subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <AppLink
            to={recommendedLesson.route}
            data-testid="start-continue-cta"
            className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl bg-accent px-6 py-3.5 text-base font-extrabold text-accent-foreground shadow-sm transition-transform active:scale-[0.99] hover:brightness-95"
          >
            <span>{recommendedResumeInfo.resumeLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </AppLink>

          <div className="flex items-center gap-3 text-xs font-mono text-primary-foreground/80">
            <span>
              Schritt {recommendedResumeInfo.displayStepNumber} / {recommendedResumeInfo.totalSteps}
            </span>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-primary-foreground/20">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${Math.max(10, recommendedResumeInfo.percentComplete)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Two-Column Core Cards: Learning Path Progress + Virtual Practice Depot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Compact Learning Path Progress Summary with Signature Motif */}
        <section
          data-testid="start-progress-card"
          className="surface-card p-6 flex flex-col justify-between space-y-5"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Compass className="h-4 w-4 text-primary" />
                <span>Dein Lernpfad</span>
              </span>
              <span className="font-mono text-sm font-extrabold text-primary">
                {completedCoreCount} von {totalCoreCount} Kernmodulen
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-foreground">
              Schritt für Schritt durch die 6 Grundlagen
            </h3>

            <div className="pt-1">
              <LearningPathMotif
                nodes={coreNodes}
                labels={CORE_LESSONS.map((l) => `${l.categoryLabel}: ${l.shortTitle}`)}
                ariaLabel="Fortschritt in den 6 Kernmodulen"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Alle Module frei wählbar
            </span>
            <AppLink
              to="/lernen"
              data-testid="start-open-lernen-link"
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted"
            >
              <span>Zum Lernpfad</span>
              <ArrowRight className="h-4 w-4" />
            </AppLink>
          </div>
        </section>

        {/* Compact Virtual Depot Summary Card */}
        <section
          data-testid="start-depot-card"
          className="surface-card p-6 flex flex-col justify-between space-y-5"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <LineChart className="h-4 w-4 text-primary" />
                <span>Virtuelles Übungsdepot</span>
              </span>
              <span className="rounded-lg bg-accent/25 px-2.5 py-0.5 font-mono text-xs font-bold text-accent-foreground">
                Spielgeld · Kein Echtgeld
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Gesamtwert</p>
                <p className="font-mono text-2xl font-extrabold text-foreground">
                  {formatEuro(valuation.totalPortfolioValueEur)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-muted-foreground">Positionen</p>
                <p className="font-mono text-base font-bold text-foreground">
                  {valuation.valuedPositions.length} Werte · {formatEuro(portfolio.cashEur)} Cash
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Teste ETFs und Aktien risikofrei mit virtuellem Startguthaben.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">
              {portfolio.isInitialized ? 'Depot aktiv' : 'In 30 Sek. startklar'}
            </span>
            <AppLink
              to="/depot"
              data-testid="start-open-depot-link"
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span>Übungsdepot öffnen</span>
              <ArrowRight className="h-4 w-4" />
            </AppLink>
          </div>
        </section>
      </div>

      {/* 4. Compact Daily Question Impulse + Quick Calculator Link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section
          data-testid="start-daily-impulse"
          className="surface-card p-6 lg:col-span-2 space-y-4"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <HelpCircle className="h-4 w-4" />
            <span>Denk-Impuls (30 Sekunden)</span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-foreground leading-snug">
            {DAILY_IMPULSE.question}
          </h3>

          <div className="space-y-2">
            {DAILY_IMPULSE.options.map((opt, idx) => {
              const isSelected = selectedImpulse === idx;
              const isCorrect = idx === DAILY_IMPULSE.correctIndex;
              let btnStyle =
                'border-border bg-secondary/40 text-foreground hover:bg-secondary';
              if (selectedImpulse !== null) {
                if (isCorrect) {
                  btnStyle = 'border-primary bg-accent/25 text-foreground';
                } else if (isSelected) {
                  btnStyle = 'border-warning bg-warning/15 text-foreground';
                }
              }
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImpulse(idx)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-base font-semibold transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {selectedImpulse !== null && isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedImpulse !== null && (
            <p
              role="status"
              className="rounded-xl bg-accent/20 border border-primary/25 px-4 py-3 text-sm font-medium text-foreground"
            >
              {DAILY_IMPULSE.explanation}
            </p>
          )}
        </section>

        <section className="surface-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Calculator className="h-4 w-4 text-primary" />
              <span>Interaktives Werkzeug</span>
            </span>
            <h3 className="text-xl font-extrabold text-foreground">
              Zinseszins & Monatsbudget selbst durchrechnen
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Teste mit 3 Schiebereglern, wie sich Zeit und monatliche Sparrate auswirken.
            </p>
          </div>

          <AppLink
            to="/rechner"
            data-testid="start-open-rechner-link"
            className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            <span>Zum Rechner</span>
            <ArrowRight className="h-4 w-4" />
          </AppLink>
        </section>
      </div>
    </div>
  );
}
