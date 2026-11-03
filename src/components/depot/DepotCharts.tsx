import { BarChart3, Clock, PieChart } from 'lucide-react';
import { useState } from 'react';
import { formatEuro, formatPercent } from '@/lib/calculator';
import {
  type DepotSnapshot,
  formatSignedEuro,
  formatSignedPercent,
  type PortfolioValuationSummary,
} from '@/lib/depot-calculations';

export function DepotCharts({
  snapshots,
  valuation,
}: {
  snapshots: DepotSnapshot[];
  valuation: PortfolioValuationSummary;
}) {
  const [allocationView, setAllocationView] = useState<'asset' | 'sector'>('asset');

  const hasEnoughHistory = snapshots.length >= 2;
  const firstSnap = snapshots[0];
  const lastSnap = snapshots[snapshots.length - 1];

  const minVal = hasEnoughHistory
    ? Math.min(...snapshots.map((s) => s.totalValueEur), valuation.startingCashEur) * 0.98
    : 0;
  const maxVal = hasEnoughHistory
    ? Math.max(...snapshots.map((s) => s.totalValueEur), valuation.startingCashEur) * 1.02
    : 1;
  const range = Math.max(1, maxVal - minVal);

  const svgPoints = hasEnoughHistory
    ? snapshots
        .map((s, idx) => {
          const x =
            snapshots.length > 1
              ? (idx / (snapshots.length - 1)) * 100
              : 50;
          const y = 90 - ((s.totalValueEur - minVal) / range) * 80;
          return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ')
    : '';

  const baselineY = hasEnoughHistory
    ? 90 - ((valuation.startingCashEur - minVal) / range) * 80
    : 50;

  const accessibleHistorySummary = hasEnoughHistory
    ? `Depotverlauf seit Erstellung (${snapshots.length} Messpunkte): Startwert ${formatEuro(firstSnap?.totalValueEur ?? valuation.startingCashEur, 2)}, aktueller Gesamtwert ${formatEuro(valuation.totalPortfolioValueEur, 2)} (${formatSignedEuro(valuation.totalGainLossEur, 2)} bzw. ${formatSignedPercent(valuation.totalPerformancePercent, 2)}).`
    : 'Für diesen Zeitraum gibt es noch nicht genügend Daten. Die Historie beginnt ab Erstellung deines Übungsdepots und wächst mit jedem virtuellen Kauf, Verkauf oder Kurs-Update.';

  const activeBuckets =
    allocationView === 'asset'
      ? valuation.assetAllocation
      : valuation.sectorAllocation;

  return (
    <div className="grid gap-5 lg:grid-cols-12 items-stretch">
      {/* A. Portfolio Development Chart */}
      <section
        aria-labelledby="depot-history-chart-heading"
        className="lg:col-span-7 surface-card p-5 sm:p-6 flex flex-col justify-between space-y-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>Wertentwicklung seit Depoterstellung</span>
            </div>
            <h2 id="depot-history-chart-heading" className="mt-0.5 text-lg font-bold">
              Depotverlauf ({snapshots.length}{' '}
              {snapshots.length === 1 ? 'Messpunkt' : 'Messpunkte'})
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Basis: {formatEuro(valuation.startingCashEur, 2)} Startkapital
          </span>
        </div>

        {!hasEnoughHistory ? (
          <div
            data-testid="depot-history-empty-state"
            className="rounded-xl border border-border bg-muted/50 p-5 text-center space-y-2 my-auto"
          >
            <Clock className="h-6 w-6 text-primary mx-auto" aria-hidden="true" />
            <p className="text-sm font-bold text-foreground">
              Für diesen Zeitraum gibt es noch nicht genügend Daten.
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Die Verlaufskurve erfindet keine künstliche Vergangenheit vor deiner Depoterstellung. Sobald du ein Wertpapier virtuell kaufst oder die Kurse aktualisierst, wird hier jeder reale Zeitpunkt protokolliert.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className="rounded-xl border border-border bg-background p-4"
              role="img"
              aria-label={accessibleHistorySummary}
            >
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="h-40 w-full overflow-visible"
              >
                {/* Starting Cash Baseline */}
                <line
                  x1="0"
                  y1={baselineY}
                  x2="100"
                  y2={baselineY}
                  stroke="currentColor"
                  strokeDasharray="2,2"
                  className="text-border"
                  strokeWidth="0.8"
                />
                {/* Portfolio Value Polyline */}
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                  points={svgPoints}
                />
              </svg>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-mono tabular-nums">
                <span>
                  Start ({new Date(firstSnap!.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}):{' '}
                  {formatEuro(firstSnap!.totalValueEur, 2)}
                </span>
                <span>
                  Aktuell ({new Date(lastSnap!.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}):{' '}
                  {formatEuro(lastSnap!.totalValueEur, 2)}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {accessibleHistorySummary}
            </p>
          </div>
        )}
      </section>

      {/* B. Allocation Overview */}
      <section
        aria-labelledby="depot-allocation-heading"
        className="lg:col-span-5 surface-card p-5 sm:p-6 flex flex-col justify-between space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <PieChart className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>Risikostreuung & Gewichtung</span>
            </div>
            <h2 id="depot-allocation-heading" className="mt-0.5 text-lg font-bold">
              Depot-Aufteilung
            </h2>
          </div>

          {/* Toggle: Anlageklassen vs. Branchen */}
          <div
            className="inline-flex rounded-xl border border-border bg-muted p-1"
            role="tablist"
            aria-label="Aufteilungsansicht wählen"
          >
            <button
              type="button"
              role="tab"
              aria-selected={allocationView === 'asset'}
              onClick={() => setAllocationView('asset')}
              className={`min-h-[34px] rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                allocationView === 'asset'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Anlageklassen
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={allocationView === 'sector'}
              onClick={() => setAllocationView('sector')}
              className={`min-h-[34px] rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                allocationView === 'sector'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Branchen
            </button>
          </div>
        </div>

        {allocationView === 'sector' && valuation.valuedPositions.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/50 p-4 text-xs text-muted-foreground my-auto">
            Noch keine Wertpapier-Positionen vorhanden. Nach deinem ersten virtuellen Kauf siehst du hier, wie stark dein Depot auf einzelne Branchen konzentriert ist.
          </div>
        ) : (
          <div className="space-y-3 my-auto">
            {activeBuckets.map((bucket) => {
              const pct =
                allocationView === 'asset'
                  ? bucket.shareOfPortfolioPercent
                  : bucket.shareOfInvestedPercent;

              return (
                <div key={bucket.key} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-foreground truncate">
                      {bucket.label}
                    </span>
                    <span className="font-mono font-semibold tabular-nums text-muted-foreground shrink-0">
                      {formatEuro(bucket.valueEur, 2)} · {formatPercent(pct, 1)}
                    </span>
                  </div>
                  <div
                    className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={Math.round(pct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${bucket.label}: ${formatPercent(pct, 1)}`}
                  >
                    <div
                      className={`h-full transition-all duration-200 ${
                        bucket.key === 'CASH'
                          ? 'bg-accent-foreground/40'
                          : pct >= 50 && allocationView === 'sector' && !bucket.key.includes('Breit')
                            ? 'bg-highlight-foreground'
                            : 'bg-primary'
                      }`}
                      style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground border-t border-border pt-2.5">
          {allocationView === 'asset'
            ? 'Anteil am gesamten Depotwert (inkl. verfügbarem Übungsgeld).'
            : 'Anteil bezogen auf deine investierten Wertpapier-Positionen.'}
        </p>
      </section>
    </div>
  );
}
