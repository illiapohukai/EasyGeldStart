/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Info,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react';
import { BudgetPlannerInteractive } from '@/components/InteractiveWidgets';
import {
  CALCULATOR_PRESETS,
  calculateCompoundInterest,
  type CompoundCalculatorInput,
  formatEuro,
} from '@/lib/calculator';

export function RechnerPage() {
  const [activeTool, setActiveTool] = useState<'compound' | 'budget'>('compound');

  // Compound calculator state: 3 primary inputs + 1 progressive setting (initialAmount)
  const [monthlyContribution, setMonthlyContribution] = useState(50);
  const [years, setYears] = useState(18);
  const [annualRatePercent, setAnnualRatePercent] = useState(6);
  const [initialAmount, setInitialAmount] = useState(0);

  // Progressive disclosure toggles
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  const input: CompoundCalculatorInput = useMemo(
    () => ({
      initialAmount,
      monthlyContribution,
      years,
      annualRatePercent,
    }),
    [initialAmount, monthlyContribution, years, annualRatePercent],
  );

  const result = useMemo(() => calculateCompoundInterest(input), [input]);

  const applyPreset = (presetInput: CompoundCalculatorInput) => {
    setInitialAmount(presetInput.initialAmount);
    setMonthlyContribution(presetInput.monthlyContribution);
    setYears(presetInput.years);
    setAnnualRatePercent(presetInput.annualRatePercent);
  };

  // Sample chart bars so the chart stays crisp on mobile & desktop (max 12 bars)
  const chartPoints = useMemo(() => {
    const snaps = result.yearlyRows;
    if (snaps.length <= 12) return snaps;
    const step = Math.ceil(snaps.length / 12);
    return snaps.filter(
      (_, index) => (index + 1) % step === 0 || index === snaps.length - 1,
    );
  }, [result.yearlyRows]);

  const maxBalance = Math.max(1, result.estimatedFinalValue);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header + Tool Switcher */}
      <header className="surface-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Finanz-Rechner
          </h1>
          <p className="text-base text-muted-foreground">
            Simuliere langfristige Sparpläne oder plane dein monatliches Budget.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Rechner auswählen"
          className="inline-flex rounded-2xl border border-border bg-secondary/70 p-1 shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTool === 'compound'}
            onClick={() => setActiveTool('compound')}
            className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              activeTool === 'compound'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-secondary-foreground hover:text-foreground'
            }`}
          >
            <Calculator className="h-4 w-4" />
            <span>Zinseszins</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTool === 'budget'}
            onClick={() => setActiveTool('budget')}
            className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              activeTool === 'budget'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-secondary-foreground hover:text-foreground'
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span>Budget-Planer</span>
          </button>
        </div>
      </header>

      {activeTool === 'compound' ? (
        <div className="space-y-6">
          {/* Primary Calculator Grid: 3 Essential Sliders + 3 KPI Results & Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: 3 Primary Controls */}
            <section
              aria-label="Haupteinstellungen Zinseszins-Rechner"
              className="surface-card p-6 space-y-6 lg:col-span-5"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Deine 3 Stellschrauben
                </span>
                <h2 className="text-xl font-extrabold text-foreground">
                  Sparrate, Zeit & Rendite-Annahme
                </h2>
              </div>

              {/* 1. Monthly contribution */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <label
                    htmlFor="calc-monthly-range"
                    className="text-base font-bold text-foreground"
                  >
                    Monatliche Sparrate
                  </label>
                  <span className="font-mono text-xl font-extrabold text-primary">
                    {formatEuro(monthlyContribution)}
                  </span>
                </div>
                <input
                  id="calc-monthly-range"
                  data-testid="calc-monthly-range"
                  type="range"
                  min={0}
                  max={500}
                  step={5}
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between font-mono text-xs text-muted-foreground">
                  <span>0 €</span>
                  <span>250 €</span>
                  <span>500 €</span>
                </div>
              </div>

              {/* 2. Duration in years */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <label
                    htmlFor="calc-years-range"
                    className="text-base font-bold text-foreground"
                  >
                    Anlagedauer
                  </label>
                  <span className="font-mono text-xl font-extrabold text-primary">
                    {years} {years === 1 ? 'Jahr' : 'Jahre'}
                  </span>
                </div>
                <input
                  id="calc-years-range"
                  data-testid="calc-years-range"
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between font-mono text-xs text-muted-foreground">
                  <span>1 J.</span>
                  <span>25 J.</span>
                  <span>50 J.</span>
                </div>
              </div>

              {/* 3. Assumed annual return */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <label
                    htmlFor="calc-rate-range"
                    className="text-base font-bold text-foreground"
                  >
                    Angenommene Rendite p. a.
                  </label>
                  <span className="font-mono text-xl font-extrabold text-primary">
                    {annualRatePercent.toLocaleString('de-DE')} %
                  </span>
                </div>
                <input
                  id="calc-rate-range"
                  data-testid="calc-rate-range"
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={annualRatePercent}
                  onChange={(e) => setAnnualRatePercent(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between font-mono text-xs text-muted-foreground">
                  <span>0 % (Konto)</span>
                  <span>6 % (Langfrist-Beispiel)</span>
                  <span>10 %</span>
                </div>
              </div>

              {/* Progressive Disclosure 1: Weitere Einstellungen (Startbetrag & Beispiel-Szenarien) */}
              <div className="rounded-2xl border border-border bg-secondary/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings((prev) => !prev)}
                  aria-expanded={showAdvancedSettings}
                  data-testid="calc-advanced-toggle"
                  className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left text-sm font-bold text-foreground hover:bg-secondary/70"
                >
                  <span className="inline-flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <span>Weitere Einstellungen {initialAmount > 0 ? `(Start: ${formatEuro(initialAmount)})` : ''}</span>
                  </span>
                  {showAdvancedSettings ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {showAdvancedSettings && (
                  <div className="border-t border-border bg-card p-4 space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="calc-initial-range"
                          className="text-sm font-bold text-foreground"
                        >
                          Einmaliger Startbetrag
                        </label>
                        <span className="font-mono text-base font-extrabold text-primary">
                          {formatEuro(initialAmount)}
                        </span>
                      </div>
                      <input
                        id="calc-initial-range"
                        data-testid="calc-initial-range"
                        type="range"
                        min={0}
                        max={10000}
                        step={250}
                        value={initialAmount}
                        onChange={(e) => setInitialAmount(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2 pt-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Typische Lern-Szenarien laden:
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {CALCULATOR_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => applyPreset(preset.input)}
                            className="rounded-xl border border-border bg-secondary/50 px-3 py-2 text-left text-xs transition-colors hover:bg-secondary"
                          >
                            <span className="font-bold text-foreground block">
                              {preset.label}
                            </span>
                            <span className="text-muted-foreground">
                              {preset.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Right Column: 3 KPI Cards, 1 Chart, and Concise Summary Sentence */}
            <section
              aria-label="Ergebnis der Modellrechnung"
              className="surface-card p-6 space-y-6 lg:col-span-7"
            >
              {/* 3 KPI Results */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="rounded-2xl border border-border bg-secondary/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Selbst eingezahlt
                  </p>
                  <p
                    data-testid="calc-total-contributions"
                    className="font-mono text-2xl font-extrabold text-foreground mt-1"
                  >
                    {formatEuro(result.totalContributions)}
                  </p>
                </div>

                <div className="rounded-2xl border border-primary/30 bg-accent/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-accent-foreground">
                    Rechnerischer Ertrag
                  </p>
                  <p
                    data-testid="calc-total-gains"
                    className="font-mono text-2xl font-extrabold text-primary mt-1"
                  >
                    +{formatEuro(result.estimatedGrowth)}
                  </p>
                </div>

                <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/80">
                    Beispiel-Endwert
                  </p>
                  <p
                    data-testid="calc-final-balance"
                    className="font-mono text-2xl font-extrabold mt-1"
                  >
                    {formatEuro(result.estimatedFinalValue)}
                  </p>
                </div>
              </div>

              {/* 1 Clear Stacked Growth Chart */}
              <div className="rounded-2xl border border-border bg-secondary/25 p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                  <span className="text-foreground font-bold">
                    Entwicklung über {years} {years === 1 ? 'Jahr' : 'Jahre'}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-xs bg-primary/40" />
                      Einzahlungen
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-foreground">
                      <span className="h-2.5 w-2.5 rounded-xs bg-primary" />
                      Zinseszins-Ertrag
                    </span>
                  </div>
                </div>

                <div
                  className="grid items-end gap-1.5 sm:gap-2 h-48 pt-4"
                  style={{
                    gridTemplateColumns: `repeat(${chartPoints.length}, minmax(0, 1fr))`,
                  }}
                >
                  {chartPoints.map((snap) => {
                    const totalHeightPct = Math.max(
                      6,
                      Math.round((snap.total / maxBalance) * 100),
                    );
                    const contribShare =
                      snap.total > 0
                        ? Math.round((snap.paid / snap.total) * 100)
                        : 100;
                    const gainsShare = Math.max(0, 100 - contribShare);

                    return (
                      <div
                        key={snap.year}
                        className="flex h-full flex-col items-center justify-end gap-1.5"
                        title={`Jahr ${snap.year}: ${formatEuro(snap.total)}`}
                      >
                        <div
                          className="w-full max-w-[34px] rounded-t-lg overflow-hidden flex flex-col justify-end bg-secondary"
                          style={{ height: `${totalHeightPct}%` }}
                        >
                          <div
                            className="w-full bg-primary transition-all duration-300"
                            style={{ height: `${gainsShare}%` }}
                          />
                          <div
                            className="w-full bg-primary/40 transition-all duration-300"
                            style={{ height: `${contribShare}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                          J.{snap.year}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Concise 2-Sentence Plain-German Summary */}
              <div
                data-testid="calculator-summary-sentence"
                className="rounded-2xl border border-primary/20 bg-accent/15 p-4 text-base font-medium leading-relaxed text-foreground"
              >
                {result.summarySentence}
              </div>

              {/* Progressive Disclosure 2: "Wie wird das berechnet?" */}
              <div className="rounded-2xl border border-border bg-secondary/35 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowMethodology((prev) => !prev)}
                  aria-expanded={showMethodology}
                  data-testid="calc-methodology-toggle"
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-bold text-foreground hover:bg-secondary/60"
                >
                  <span className="inline-flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    <span>Wie wird das berechnet?</span>
                  </span>
                  {showMethodology ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {showMethodology && (
                  <div className="border-t border-border bg-card p-4 text-sm text-muted-foreground space-y-2 leading-relaxed">
                    <p>
                      <strong>Rechenmodell:</strong> Die Simulation rechnet mit monatlichen Einzahlungen und einer konstanten jährlichen Durchschnittsrendite (monatliche Verzinsung mit Jahresrendite ÷ 12).
                    </p>
                    <p>
                      <strong>Wichtiger Realitäts-Check:</strong> Echte Börsenkurse verlaufen niemals als glatte Linie, sondern schwanken von Jahr zu Jahr. Außerdem sind mögliche Produktkosten, Inflation und Steuern oberhalb des Sparer-Pauschbetrags (1.000 € p. a.) hier noch nicht abgezogen.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <BudgetPlannerInteractive />
      )}
    </div>
  );
}
