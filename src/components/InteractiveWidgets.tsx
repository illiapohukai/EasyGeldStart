/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  calculateBudgetSplit,
  calculateCompoundInterest,
  calculateInflationPurchasingPower,
  formatEuro,
  formatEuroExact,
} from '@/lib/calculator';
import type { InteractiveStepWidget } from '@/lib/lessons';

/**
 * Step-level compact interactive widgets for the LessonPlayer.
 * Each widget focuses on one single interactive lever so the user sees immediate cause-and-effect.
 */
export function LessonStepInteractiveWidget({
  widget,
}: {
  widget: InteractiveStepWidget;
}) {
  switch (widget) {
    case 'inflation-slider':
      return <InflationStepWidget />;
    case 'compound-slider':
      return <CompoundStepWidget />;
    case 'asset-inspector':
      return <AssetInspectorStepWidget />;
    case 'small-amounts-slider':
      return <SmallAmountsStepWidget />;
    case 'retirement-slider':
      return <RetirementHorizonStepWidget />;
    case 'state-status-checker':
      return <StateSupportStepWidget />;
    case 'budget-mini':
      return <BudgetMiniStepWidget />;
    default:
      return null;
  }
}

function InflationStepWidget() {
  const [inflationRate, setInflationRate] = useState(3);
  const [years, setYears] = useState(10);
  const purchasingPower = calculateInflationPurchasingPower(1000, inflationRate, years);
  const loss = Math.max(0, 1000 - purchasingPower);

  return (
    <div className="rounded-2xl border border-border bg-secondary/45 p-4 sm:p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="step-inflation-rate" className="font-semibold text-foreground">
              Inflation pro Jahr
            </label>
            <span className="font-mono font-bold text-primary">{inflationRate} %</span>
          </div>
          <input
            id="step-inflation-rate"
            type="range"
            min={1}
            max={6}
            step={0.5}
            value={inflationRate}
            onChange={(e) => setInflationRate(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="step-inflation-years" className="font-semibold text-foreground">
              Zeitraum
            </label>
            <span className="font-mono font-bold text-primary">{years} Jahre</span>
          </div>
          <input
            id="step-inflation-years"
            type="range"
            min={5}
            max={25}
            step={5}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-muted-foreground">
            Kaufkraft von 1.000 € (unverzinst):
          </span>
          <span className="font-mono text-xl font-extrabold text-primary">
            {formatEuro(purchasingPower)}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-secondary flex">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${Math.round((purchasingPower / 1000) * 100)}%` }}
          />
          <div
            className="h-full bg-warning/70 transition-all duration-300"
            style={{ width: `${Math.max(0, 100 - Math.round((purchasingPower / 1000) * 100))}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Rechnerischer Kaufkraftverlust ohne Zinsen:{' '}
          <strong className="font-mono text-foreground">−{formatEuro(loss)}</strong>
        </p>
      </div>
    </div>
  );
}

function CompoundStepWidget() {
  const [years, setYears] = useState(15);
  const monthly = 50;
  const rate = 6;
  const result = calculateCompoundInterest({
    initialAmount: 0,
    monthlyContribution: monthly,
    years,
    annualRatePercent: rate,
  });

  return (
    <div className="rounded-2xl border border-border bg-secondary/45 p-4 sm:p-5 space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <label htmlFor="step-compound-years" className="font-semibold text-foreground">
            Laufzeit bei 50 € / Monat (Annahme: 6 % p. a.)
          </label>
          <span className="font-mono font-bold text-primary">{years} Jahre</span>
        </div>
        <input
          id="step-compound-years"
          type="range"
          min={5}
          max={35}
          step={5}
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-semibold text-muted-foreground">Eingezahlt</p>
          <p className="font-mono text-base font-bold text-foreground mt-0.5">
            {formatEuro(result.totalContributions)}
          </p>
        </div>
        <div className="rounded-xl border border-primary/25 bg-accent/20 p-3">
          <p className="text-xs font-semibold text-accent-foreground">Ertrag</p>
          <p className="font-mono text-base font-bold text-primary mt-0.5">
            +{formatEuro(result.estimatedGrowth)}
          </p>
        </div>
        <div className="rounded-xl bg-primary p-3 text-primary-foreground">
          <p className="text-xs font-semibold text-primary-foreground/80">Endwert</p>
          <p className="font-mono text-base font-extrabold mt-0.5">
            {formatEuro(result.estimatedFinalValue)}
          </p>
        </div>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-secondary flex">
        <div
          className="h-full bg-primary/45 transition-all duration-300"
          style={{ width: `${result.contributionSharePercent}%` }}
        />
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${result.growthSharePercent}%` }}
        />
      </div>
    </div>
  );
}

const ASSET_PROFILES = [
  {
    id: 'tagesgeld',
    title: 'Tagesgeld / Festgeld',
    fluctuation: 'Keine Kursschwankung',
    horizon: 'Kurzfristig (Notgroschen, 0–2 Jahre)',
    summary: 'Guthaben ist bis 100.000 € pro Bank gesetzlich geschützt. Dafür meist nur begrenzter Zins.',
  },
  {
    id: 'etf',
    title: 'Breit gestreuter Aktien-ETF',
    fluctuation: 'Mittlere bis höhere Schwankung',
    horizon: 'Langfristig (ab 10–15 Jahren)',
    summary: 'Bündelt hunderte Unternehmen weltweit in einem Baustein. Einzelrisiken sinken deutlich.',
  },
  {
    id: 'einzelaktie',
    title: 'Einzelne Aktie',
    fluctuation: 'Hohe Kursschwankung möglich',
    horizon: 'Langfristig & nur als Beimischung',
    summary: 'Du hängst direkt vom Erfolg einer einzigen Firma ab. Hohe Chancen, aber auch hohes Rückschlagsrisiko.',
  },
];

function AssetInspectorStepWidget() {
  const [selectedId, setSelectedId] = useState('etf');
  const active = ASSET_PROFILES.find((a) => a.id === selectedId) ?? ASSET_PROFILES[1]!;

  return (
    <div className="rounded-2xl border border-border bg-secondary/45 p-4 sm:p-5 space-y-4">
      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Anlageklassen vergleichen">
        {ASSET_PROFILES.map((item) => {
          const isSelected = item.id === active.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedId(item.id)}
              className={`min-h-[44px] rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'border border-border bg-card text-foreground hover:bg-secondary'
              }`}
            >
              {item.id === 'tagesgeld'
                ? 'Tagesgeld'
                : item.id === 'etf'
                  ? 'Welt-ETF'
                  : 'Einzelaktie'}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <p className="text-base font-extrabold text-foreground">{active.title}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-secondary/60 px-3 py-2">
            <span className="text-xs font-semibold text-muted-foreground block">Schwankung</span>
            <span className="font-bold text-foreground">{active.fluctuation}</span>
          </div>
          <div className="rounded-lg bg-secondary/60 px-3 py-2">
            <span className="text-xs font-semibold text-muted-foreground block">Zeithorizont</span>
            <span className="font-bold text-foreground">{active.horizon}</span>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground pt-1">{active.summary}</p>
      </div>
    </div>
  );
}

function SmallAmountsStepWidget() {
  const [monthly, setMonthly] = useState(25);
  const res18 = calculateCompoundInterest({
    initialAmount: 0,
    monthlyContribution: monthly,
    years: 18,
    annualRatePercent: 6,
  });

  return (
    <div className="rounded-2xl border border-border bg-secondary/45 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">Monatliche Sparrate wählen:</span>
        <div className="flex gap-1.5">
          {[15, 25, 50].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setMonthly(val)}
              className={`min-h-[40px] rounded-xl px-3.5 py-1.5 font-mono text-sm font-bold transition-all ${
                monthly === val
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-foreground hover:bg-secondary'
              }`}
            >
              {val} €
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">
            Nach 18 Jahren (unverbindliche Annahme: 6 % p. a.)
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Eingezahlt: <strong className="font-mono text-foreground">{formatEuro(res18.totalContributions)}</strong> · Ertrag:{' '}
            <strong className="font-mono text-primary">+{formatEuro(res18.estimatedGrowth)}</strong>
          </p>
        </div>
        <p className="font-mono text-xl font-extrabold text-primary shrink-0">
          {formatEuro(res18.estimatedFinalValue)}
        </p>
      </div>
    </div>
  );
}

function RetirementHorizonStepWidget() {
  const [startAge, setStartAge] = useState<18 | 28>(18);
  const years = 67 - startAge;
  const result = calculateCompoundInterest({
    initialAmount: 0,
    monthlyContribution: 50,
    years,
    annualRatePercent: 6,
  });

  return (
    <div className="rounded-2xl border border-border bg-secondary/45 p-4 sm:p-5 space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        {([18, 28] as const).map((age) => (
          <button
            key={age}
            type="button"
            onClick={() => setStartAge(age)}
            className={`min-h-[48px] rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              startAge === age
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'border border-border bg-card text-foreground hover:bg-secondary'
            }`}
          >
            Start mit {age} Jahren ({67 - age} J.)
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Eigene Einzahlung (50 €/Monat)</p>
          <p className="font-mono text-lg font-bold text-foreground mt-0.5">
            {formatEuro(result.totalContributions)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Beispiel-Endwert mit 67 (6 % p. a.)</p>
          <p className="font-mono text-lg font-extrabold text-primary mt-0.5">
            {formatEuro(result.estimatedFinalValue)}
          </p>
        </div>
      </div>
    </div>
  );
}

function StateSupportStepWidget() {
  const [situation, setSituation] = useState<'azubi' | 'schueler'>('azubi');

  return (
    <div className="rounded-2xl border border-border bg-secondary/45 p-4 sm:p-5 space-y-3.5">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSituation('azubi')}
          className={`min-h-[44px] rounded-xl px-3 py-2 text-sm font-bold transition-all ${
            situation === 'azubi'
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-card text-foreground hover:bg-secondary'
          }`}
        >
          Aktiv heute (Azubi / Job)
        </button>
        <button
          type="button"
          onClick={() => setSituation('schueler')}
          className={`min-h-[44px] rounded-xl px-3 py-2 text-sm font-bold transition-all ${
            situation === 'schueler'
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-card text-foreground hover:bg-secondary'
          }`}
        >
          Politisch geplant (noch nicht aktiv)
        </button>
      </div>

      {situation === 'azubi' ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
          <p className="text-sm font-extrabold text-foreground">
            Heute aktiv nutzbar (Stand: 2025/2026):
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            1. <strong>Vermögenswirksame Leistungen (VL)</strong> vom Arbeitgeber (oft 10–40 € / Monat). 2. Staatliche <strong>Arbeitnehmersparzulage</strong> & <strong>Wohnungsbauprämie</strong>. 3. <strong>Sparer-Pauschbetrag</strong> (1.000 € steuerfrei per Freistellungsauftrag).
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
          <p className="text-sm font-extrabold text-foreground">
            Bisher nur geplant / in Diskussion (Stand: 2025/2026):
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Konzepte wie das <strong>Altersvorsorgedepot</strong> oder die <strong>Frühstart-Rente</strong> sind politische Vorhaben und noch NICHT als Gesetz beschlossen.
          </p>
        </div>
      )}
    </div>
  );
}

function BudgetMiniStepWidget() {
  const [income, setIncome] = useState(250);
  const split = calculateBudgetSplit(income, 50, 30, 20);

  return (
    <div className="rounded-2xl border border-border bg-secondary/45 p-4 sm:p-5 space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <label htmlFor="step-budget-income" className="font-semibold text-foreground">
            Monatliches Budget (Taschengeld / Nebenjob)
          </label>
          <span className="font-mono font-bold text-primary">{formatEuro(income)}</span>
        </div>
        <input
          id="step-budget-income"
          type="range"
          min={50}
          max={800}
          step={25}
          value={income}
          onChange={(e) => setIncome(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Eine mögliche Lernaufteilung (50 / 30 / 20 Orientierung)
      </p>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-semibold text-muted-foreground">Alltag (50 %)</p>
          <p className="font-mono text-base font-bold text-foreground mt-0.5">
            {formatEuro(split.needsAmount)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-semibold text-muted-foreground">Freizeit (30 %)</p>
          <p className="font-mono text-base font-bold text-foreground mt-0.5">
            {formatEuro(split.wantsAmount)}
          </p>
        </div>
        <div className="rounded-xl border border-primary/25 bg-accent/20 p-3">
          <p className="text-xs font-semibold text-accent-foreground">Zukunft (20 %)</p>
          <p className="font-mono text-base font-bold text-primary mt-0.5">
            {formatEuro(split.savingsAmount)}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Full progressive Budget Calculator used on the Rechner page (/rechner).
 * Emphasizes income, fixed expenses, remaining amount, and "Eine mögliche Lernaufteilung".
 */
export function BudgetPlannerInteractive() {
  const [monthlyIncome, setMonthlyIncome] = useState(450);
  const [fixedExpenses, setFixedExpenses] = useState(180);
  const [futurePercent, setFuturePercent] = useState(20);
  const [showDetailedCategories, setShowDetailedCategories] = useState(false);

  const [catAbo, setCatAbo] = useState(35);
  const [catMobility, setCatMobility] = useState(49);
  const [catFood, setCatFood] = useState(96);

  const effectiveFixed = showDetailedCategories
    ? catAbo + catMobility + catFood
    : fixedExpenses;

  const remainingTotal = Math.max(0, monthlyIncome - effectiveFixed);
  const suggestedFutureAmount = Math.round(((monthlyIncome * futurePercent) / 100) * 100) / 100;
  const actualFutureAmount = Math.min(remainingTotal, suggestedFutureAmount);
  const freeForWantsAmount = Math.max(0, remainingTotal - actualFutureAmount);

  return (
    <div className="surface-card p-6 sm:p-7 space-y-6">
      <div className="space-y-1.5">
        <span className="inline-flex items-center rounded-lg bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
          Monats-Überblick
        </span>
        <h2 className="text-2xl font-extrabold text-foreground">
          Budget- & Taschengeld-Planer
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          Trage deine monatlichen Einnahmen und festen Ausgaben ein, um zu sehen, wie viel frei verfügbar bleibt.
        </p>
      </div>

      {/* Primary Inputs: Einnahmen & Feste Ausgaben */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-secondary/35 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="budget-income-range" className="text-base font-bold text-foreground">
              Monatliche Einnahmen
            </label>
            <span className="font-mono text-lg font-extrabold text-primary">
              {formatEuro(monthlyIncome)}
            </span>
          </div>
          <input
            id="budget-income-range"
            type="range"
            min={50}
            max={2000}
            step={25}
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Taschengeld, Nebenjob oder Ausbildungsvergütung (netto)
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/35 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="budget-fixed-range" className="text-base font-bold text-foreground">
              Feste monatliche Ausgaben
            </label>
            <span className="font-mono text-lg font-extrabold text-foreground">
              {formatEuro(effectiveFixed)}
            </span>
          </div>
          {!showDetailedCategories ? (
            <>
              <input
                id="budget-fixed-range"
                type="range"
                min={0}
                max={Math.max(100, monthlyIncome)}
                step={10}
                value={Math.min(fixedExpenses, monthlyIncome)}
                onChange={(e) => setFixedExpenses(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Handy, Ticket, Abos, feste Verpflichtungen
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Summe aus deinen unten aufgeschlüsselten Fixkosten-Kategorien.
            </p>
          )}
        </div>
      </div>

      {/* Progressive Disclosure for detailed expense categories */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <button
          type="button"
          onClick={() => setShowDetailedCategories((prev) => !prev)}
          aria-expanded={showDetailedCategories}
          className="flex w-full items-center justify-between text-left text-base font-bold text-foreground"
        >
          <span>Ausgaben nach Kategorien aufschlüsseln (optional)</span>
          <span className="text-sm font-semibold text-primary">
            {showDetailedCategories ? 'Ausblenden' : 'Aufklappen'}
          </span>
        </button>

        {showDetailedCategories && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-border">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <label htmlFor="cat-abo" className="font-semibold">Handy & Abos</label>
                <span className="font-mono font-bold">{formatEuro(catAbo)}</span>
              </div>
              <input
                id="cat-abo"
                type="range"
                min={0}
                max={200}
                step={5}
                value={catAbo}
                onChange={(e) => setCatAbo(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <label htmlFor="cat-mob" className="font-semibold">Mobilität / Ticket</label>
                <span className="font-mono font-bold">{formatEuro(catMobility)}</span>
              </div>
              <input
                id="cat-mob"
                type="range"
                min={0}
                max={300}
                step={5}
                value={catMobility}
                onChange={(e) => setCatMobility(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <label htmlFor="cat-food" className="font-semibold">Alltag & Verpflegung</label>
                <span className="font-mono font-bold">{formatEuro(catFood)}</span>
              </div>
              <input
                id="cat-food"
                type="range"
                min={0}
                max={600}
                step={10}
                value={catFood}
                onChange={(e) => setCatFood(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Possible Learning Allocation ("Eine mögliche Lernaufteilung") */}
      <div className="rounded-2xl border border-primary/20 bg-secondary/45 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Eine mögliche Lernaufteilung
            </p>
            <h3 className="text-lg font-extrabold text-foreground">
              Frei verfügbar nach Fixkosten: {formatEuroExact(remainingTotal)}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="future-pct" className="text-sm font-semibold text-muted-foreground">
              Sparquote-Idee:
            </label>
            <select
              id="future-pct"
              value={futurePercent}
              onChange={(e) => setFuturePercent(Number(e.target.value))}
              className="rounded-xl border border-border bg-card px-3 py-1.5 font-mono text-sm font-bold text-foreground"
            >
              <option value={10}>10 %</option>
              <option value={15}>15 %</option>
              <option value={20}>20 % (50/30/20)</option>
              <option value={25}>25 %</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground">1. Feste Ausgaben</p>
            <p className="font-mono text-xl font-extrabold text-foreground mt-1">
              {formatEuroExact(effectiveFixed)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Laufende Fixkosten im Monat</p>
          </div>

          <div className="rounded-xl border border-primary/30 bg-accent/20 p-4">
            <p className="text-xs font-semibold text-accent-foreground">
              2. Notgroschen & Zukunft ({futurePercent} %)
            </p>
            <p className="font-mono text-xl font-extrabold text-primary mt-1">
              {formatEuroExact(actualFutureAmount)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Am Monatsanfang zuerst beiseitelegen</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground">3. Frei für Freizeit & Wünsche</p>
            <p className="font-mono text-xl font-extrabold text-foreground mt-1">
              {formatEuroExact(freeForWantsAmount)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Ohne schlechtes Gewissen nutzbar</p>
          </div>
        </div>
      </div>
    </div>
  );
}
