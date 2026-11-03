import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  BookOpen,
  Clock,
  FileText,
  Info,
  Layers,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AssetDetailView } from '@/components/depot/AssetDetailView';
import { DepotCharts } from '@/components/depot/DepotCharts';
import { DepotOnboarding } from '@/components/depot/DepotOnboarding';
import {
  VirtualBuyFlowView,
  VirtualSellFlowView,
} from '@/components/depot/VirtualTradeSheet';
import { formatEuro, formatPercent } from '@/lib/calculator';
import {
  formatOriginalCurrency,
  formatSignedEuro,
  formatSignedPercent,
} from '@/lib/depot-calculations';
import { useDepot } from '@/lib/depot-context';
import {
  DEMO_SCENARIOS,
  getDemoInstrumentMetadata,
  getDemoQuote,
} from '@/lib/market-demo-adapter';
import {
  formatMarketDataStatusBadge,
  marketDataService,
} from '@/lib/market-service';
import type {
  DemoMarketScenarioId,
  InstrumentMetadata,
  MarketQuote,
} from '@/lib/market-types';
import { AppLink } from '@/lib/router';

type ActiveDepotSubView =
  | { type: 'overview' }
  | { type: 'buy'; instrument?: InstrumentMetadata | null }
  | { type: 'sell'; symbol?: string | null }
  | {
      type: 'asset_detail';
      instrument: InstrumentMetadata;
      quote: MarketQuote | null;
    };

export function DepotPage() {
  const {
    portfolio,
    valuation,
    weeklyReport,
    providerStatus,
    activeScenario,
    isRefreshing,
    marketError,
    lastRefreshedAt,
    refreshPortfolioQuotes,
    clearMarketError,
  } = useDepot();

  const [subView, setSubView] = useState<ActiveDepotSubView>({
    type: 'overview',
  });
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);

  // Support URL query parameter ?compare=etf-stock or ?symbol=EUNL.DE from Learning modules
  useEffect(() => {
    if (!portfolio.isInitialized || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const symbolParam = params.get('symbol');
    if (symbolParam) {
      const meta = getDemoInstrumentMetadata(symbolParam);
      const q = getDemoQuote(symbolParam);
      if (meta) {
        setSubView({ type: 'asset_detail', instrument: meta, quote: q });
      }
    }
  }, [portfolio.isInitialized]);

  if (!portfolio.isInitialized) {
    return <DepotOnboarding />;
  }

  const handleOpenPositionDetail = async (symbol: string) => {
    const meta = await marketDataService.getInstrumentDetails(symbol);
    if (!meta) return;
    const q =
      portfolio.lastKnownQuotes[symbol.toUpperCase()] ??
      getDemoQuote(symbol);
    setSubView({ type: 'asset_detail', instrument: meta, quote: q });
  };

  const handleOpenBuyForSymbol = async (symbol: string) => {
    const meta = await marketDataService.getInstrumentDetails(symbol);
    setSubView({ type: 'buy', instrument: meta });
  };

  if (subView.type === 'asset_detail') {
    const holding =
      valuation.valuedPositions.find(
        (p) =>
          p.symbol.toUpperCase() === subView.instrument.symbol.toUpperCase(),
      ) ?? null;

    return (
      <AssetDetailView
        instrument={subView.instrument}
        quote={
          portfolio.lastKnownQuotes[subView.instrument.symbol.toUpperCase()] ??
          subView.quote ??
          getDemoQuote(subView.instrument.symbol)
        }
        holding={holding}
        onBack={() => setSubView({ type: 'overview' })}
        onStartBuy={(inst) => setSubView({ type: 'buy', instrument: inst })}
        onStartSell={(sym) => setSubView({ type: 'sell', symbol: sym })}
      />
    );
  }

  if (subView.type === 'buy') {
    return (
      <VirtualBuyFlowView
        initialInstrument={subView.instrument}
        onClose={() => setSubView({ type: 'overview' })}
        onOpenAssetDetail={(inst, q) =>
          setSubView({ type: 'asset_detail', instrument: inst, quote: q })
        }
      />
    );
  }

  if (subView.type === 'sell') {
    return (
      <VirtualSellFlowView
        initialSymbol={subView.symbol}
        onClose={() => setSubView({ type: 'overview' })}
      />
    );
  }

  const isPositive = valuation.totalGainLossEur > 0;
  const isNegative = valuation.totalGainLossEur < 0;

  return (
    <div className="space-y-6">
      {/* 1. Prominent Educational & Data Status Strip */}
      <div className="rounded-xl border border-border bg-card p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-foreground">
              Übungsdepot (Simulation mit Spielgeld)
            </strong>{' '}
            · Keine echten Orders · Keine Anlageberatung
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="font-semibold text-foreground" data-testid="depot-data-status-label">
            {providerStatus.statusLabel}
          </span>
          {lastRefreshedAt && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Stand:{' '}
                {new Date(lastRefreshedAt).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                Uhr
              </span>
            </>
          )}
        </div>
      </div>

      {/* Market Error / Rate-Limit Alert */}
      {marketError && (
        <div
          role="alert"
          className="rounded-xl border border-highlight bg-highlight/20 p-4 flex items-start justify-between gap-3 text-xs"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle
              className="h-4 w-4 text-highlight-foreground shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <strong className="font-bold text-foreground block">
                Hinweis zum Kursdaten-Abruf ({marketError.code})
              </strong>
              <p className="text-muted-foreground leading-relaxed">
                {marketError.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearMarketError}
            className="min-h-[36px] px-2.5 py-1 font-semibold text-foreground underline shrink-0"
          >
            Ausblenden
          </button>
        </div>
      )}

      {/* 2. Top Summary Header Card */}
      <section
        aria-labelledby="depot-overview-heading"
        className="surface-card p-5 sm:p-6 space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Virtuelles Gesamtdepot · Basiswährung EUR · Startkapital:{' '}
              {formatEuro(valuation.startingCashEur, 2)}
            </p>
            <h1
              id="depot-overview-heading"
              className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground"
            >
              {valuation.portfolioName}
            </h1>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              data-testid="depot-action-invest"
              onClick={() => setSubView({ type: 'buy', instrument: null })}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Investieren</span>
            </button>

            {valuation.valuedPositions.length > 0 && (
              <button
                type="button"
                data-testid="depot-action-sell"
                onClick={() => setSubView({ type: 'sell', symbol: null })}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-xs sm:text-sm font-bold text-secondary-foreground hover:bg-accent/50 transition-colors whitespace-nowrap"
              >
                <span>Verkaufen</span>
              </button>
            )}

            <button
              type="button"
              data-testid="depot-action-refresh"
              disabled={isRefreshing}
              onClick={() => void refreshPortfolioQuotes()}
              className="inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>
                {isRefreshing ? 'Aktualisiere …' : 'Kurse aktualisieren'}
              </span>
            </button>

            <button
              type="button"
              data-testid="depot-action-analyze"
              onClick={() => setShowAnalysisPanel((v) => !v)}
              aria-expanded={showAnalysisPanel}
              className="inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors whitespace-nowrap"
            >
              <BarChart2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>Depot analysieren</span>
            </button>
          </div>
        </div>

        {/* 4 Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="rounded-xl bg-muted/70 p-4">
            <div className="text-xs text-muted-foreground">
              Aktueller Depotwert (gesamt)
            </div>
            <div
              data-testid="depot-total-value"
              className="mt-1 font-mono text-2xl font-extrabold tabular-nums text-foreground"
            >
              {formatEuro(valuation.totalPortfolioValueEur, 2)}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Wertpapiere + verfügbares Übungsgeld
            </div>
          </div>

          <div className="rounded-xl bg-muted/70 p-4">
            <div className="text-xs text-muted-foreground">
              Gewinn / Verlust (gesamt)
            </div>
            <div
              data-testid="depot-total-gain-loss"
              className={`mt-1 font-mono text-2xl font-extrabold tabular-nums flex items-center gap-1 ${
                isPositive
                  ? 'text-primary'
                  : isNegative
                    ? 'text-destructive'
                    : 'text-foreground'
              }`}
            >
              {isPositive && (
                <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              )}
              {isNegative && (
                <ArrowDownRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              )}
              <span>{formatSignedEuro(valuation.totalGainLossEur, 2)}</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground font-mono tabular-nums">
              Performance: {formatSignedPercent(valuation.totalPerformancePercent, 2)} ggü. Start
            </div>
          </div>

          <div className="rounded-xl bg-muted/70 p-4">
            <div className="text-xs text-muted-foreground">
              Angelegt in Wertpapieren
            </div>
            <div
              data-testid="depot-positions-value"
              className="mt-1 font-mono text-2xl font-bold tabular-nums text-foreground"
            >
              {formatEuro(valuation.positionsMarketValueEur, 2)}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground font-mono tabular-nums">
              Kaufwert (Einstand): {formatEuro(valuation.investedCostBasisEur, 2)}
            </div>
          </div>

          <div className="rounded-xl bg-secondary/80 p-4">
            <div className="text-xs text-muted-foreground">
              Verfügbares Übungsgeld (Cash)
            </div>
            <div
              data-testid="depot-cash-value"
              className="mt-1 font-mono text-2xl font-bold tabular-nums text-primary"
            >
              {formatEuro(valuation.cashEur, 2)}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground font-mono tabular-nums">
              {formatPercent(valuation.cashSharePercent, 1)} des Gesamtdepots
            </div>
          </div>
        </div>

        {/* Educational Demo Scenario Selector (when in explicit Demo Mode) */}
        {providerStatus.mode === 'demo' && valuation.valuedPositions.length > 0 && (
          <div className="rounded-xl border border-border bg-background p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-foreground">
                Marktszenario im Bildungs-Demomodus testen ({DEMO_SCENARIOS.length} Szenarien):
              </span>
              <span className="text-muted-foreground">
                Aktuell aktiv: <strong className="text-primary">{activeScenario.label}</strong>
              </span>
            </div>
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Beispiel-Marktszenario wählen"
            >
              {DEMO_SCENARIOS.map((scen) => {
                const isSelected = scen.id === activeScenario.id;
                return (
                  <button
                    key={scen.id}
                    type="button"
                    onClick={() =>
                      void refreshPortfolioQuotes(scen.id as DemoMarketScenarioId)
                    }
                    className={`min-h-[36px] rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:bg-muted'
                    }`}
                  >
                    {scen.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeScenario.educationalTakeaway}
            </p>
          </div>
        )}
      </section>

      {/* 3. Dynamic Educational Insight (Section 5D) */}
      <section
        aria-label="Pädagogische Depot-Einschätzung"
        data-testid="depot-educational-insight"
        className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          valuation.primaryInsight.tone === 'warning'
            ? 'border-highlight bg-highlight/20'
            : 'border-primary/30 bg-secondary/80'
        }`}
      >
        <div className="flex items-start gap-3">
          <Info
            className="h-5 w-5 text-primary shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-primary">
              Erkenntnis aus deinen aktuellen Depotdaten
            </p>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              {valuation.primaryInsight.title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {valuation.primaryInsight.explanation}
            </p>
          </div>
        </div>

        <AppLink
          to={valuation.primaryInsight.relatedLessonRoute}
          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
        >
          <BookOpen className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span>{valuation.primaryInsight.relatedLessonLabel}</span>
        </AppLink>
      </section>

      {/* Optional Deterministic Analysis & Weekly Report Panel */}
      {showAnalysisPanel && (
        <section
          aria-labelledby="depot-analysis-heading"
          className="surface-card p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="text-xs font-semibold text-primary">
                Deterministische Depot-Analyse & Wochenbericht
              </p>
              <h2 id="depot-analysis-heading" className="text-lg font-bold">
                Streuung, Klumpenrisiko & Verlauf prüfen
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowAnalysisPanel(false)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground underline"
            >
              Schließen
            </button>
          </div>

          {!weeklyReport.hasEnoughData ? (
            <div
              data-testid="weekly-report-empty"
              className="rounded-xl border border-border bg-muted/50 p-4 text-xs sm:text-sm text-muted-foreground"
            >
              <strong className="text-foreground block mb-1">
                {weeklyReport.emptyMessage}
              </strong>
              Sobald du mindestens eine Position virtuell gekauft und die Kurse aktualisiert hast, wird hier eine sachliche Auswertung zu stärkster/schwächster Position, größtem Depotgewicht und Branchenüberschneidungen erstellt.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 text-xs sm:text-sm">
              <div className="rounded-xl border border-border bg-background p-4 space-y-2">
                <div className="font-bold text-foreground">
                  Wertänderung & Positionen im Vergleich
                </div>
                <p className="text-muted-foreground">
                  Veränderung seit Depoterstellung:{' '}
                  <strong className="font-mono text-foreground">
                    {formatSignedEuro(weeklyReport.valueChangeEur, 2)} (
                    {formatSignedPercent(weeklyReport.valueChangePercent, 2)})
                  </strong>{' '}
                  bei {weeklyReport.transactionCount} simulierten Transaktionen.
                </p>
                {weeklyReport.strongestPosition && (
                  <p className="text-muted-foreground">
                    Stärkste Position:{' '}
                    <strong className="text-foreground">
                      {weeklyReport.strongestPosition.name}
                    </strong>{' '}
                    ({formatSignedPercent(weeklyReport.strongestPosition.gainLossPercent, 2)})
                  </p>
                )}
                {weeklyReport.weakestPosition && (
                  <p className="text-muted-foreground">
                    Schwächste Position:{' '}
                    <strong className="text-foreground">
                      {weeklyReport.weakestPosition.name}
                    </strong>{' '}
                    ({formatSignedPercent(weeklyReport.weakestPosition.gainLossPercent, 2)})
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-background p-4 space-y-2">
                <div className="font-bold text-foreground">
                  Diversifikation & Datenstatus
                </div>
                {weeklyReport.largestWeightPosition && (
                  <p className="text-muted-foreground">
                    Größtes Einzelgewicht:{' '}
                    <strong className="text-foreground">
                      {weeklyReport.largestWeightPosition.name} (
                      {formatPercent(weeklyReport.largestWeightPosition.weightPercent, 1)})
                    </strong>
                  </p>
                )}
                <p className="text-muted-foreground leading-relaxed">
                  {weeklyReport.diversificationNotice}
                </p>
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border">
                  {weeklyReport.dataCompletenessNotice}
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 4. Charts: Portfolio Development (A) & Allocation Overview (B) */}
      <DepotCharts snapshots={portfolio.snapshots} valuation={valuation} />

      {/* 5. Positions Mobile Cards (Section 5C) */}
      <section aria-labelledby="depot-positions-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="depot-positions-heading" className="text-xl font-bold">
              Deine Positionen ({valuation.valuedPositions.length})
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tippe auf eine Position für die Detailansicht, Risiko-Einordnung und Kurshistorie.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSubView({ type: 'buy', instrument: null })}
            className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Position hinzufügen</span>
          </button>
        </div>

        {valuation.valuedPositions.length === 0 ? (
          <div className="surface-card p-6 sm:p-8 space-y-5">
            <div className="space-y-2 text-center max-w-lg mx-auto">
              <Layers className="h-8 w-8 text-primary mx-auto" aria-hidden="true" />
              <h3 className="text-lg font-bold text-foreground">
                Noch keine Wertpapiere im Übungsdepot
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Du hast <strong className="font-mono text-foreground">{formatEuro(valuation.cashEur, 2)}</strong> virtuelles Startguthaben bereitliegen. Kaufe jetzt dein erstes Wertpapier virtuell oder vergleiche direkt einen breit gestreuten Welt-ETF mit einer einzelnen Aktie.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 max-w-2xl mx-auto">
              <button
                type="button"
                data-testid="quick-start-etf-btn"
                onClick={() => void handleOpenBuyForSymbol('EUNL.DE')}
                className="rounded-xl border border-border bg-background p-4 text-left hover:border-primary/60 transition-colors flex flex-col justify-between gap-2"
              >
                <div>
                  <span className="text-xs font-semibold text-primary">
                    Praxis-Idee 1 · Breit gestreuter ETF
                  </span>
                  <div className="mt-0.5 text-sm font-bold text-foreground">
                    iShares Core MSCI World ETF (EUNL.DE)
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Über 1.400 Unternehmen weltweit in einem Baustein testen.
                  </p>
                </div>
                <span className="text-xs font-bold text-primary inline-flex items-center gap-1 pt-1">
                  <span>Im Übungsdepot testen</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </button>

              <button
                type="button"
                data-testid="quick-start-stock-btn"
                onClick={() => void handleOpenBuyForSymbol('SAP.DE')}
                className="rounded-xl border border-border bg-background p-4 text-left hover:border-primary/60 transition-colors flex flex-col justify-between gap-2"
              >
                <div>
                  <span className="text-xs font-semibold text-foreground">
                    Praxis-Idee 2 · Einzelaktie zum Vergleich
                  </span>
                  <div className="mt-0.5 text-sm font-bold text-foreground">
                    SAP SE (SAP.DE) oder NVIDIA (NVDA)
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Beobachte, wie stark eine einzelne Aktie im Vergleich zum ETF schwankt.
                  </p>
                </div>
                <span className="text-xs font-bold text-primary inline-flex items-center gap-1 pt-1">
                  <span>Einzelaktie auswählen</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {valuation.valuedPositions.map((pos) => {
              const posPositive = pos.unrealizedGainLossEur > 0;
              const posNegative = pos.unrealizedGainLossEur < 0;
              const statusInfo = formatMarketDataStatusBadge(
                pos.dataStatus,
                pos.isDemo,
              );

              return (
                <article
                  key={pos.symbol}
                  data-testid={`position-card-${pos.symbol}`}
                  className="surface-card p-4 sm:p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Name, Symbol, Asset Type & Data Status */}
                    <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="font-mono font-bold text-foreground">
                            {pos.symbol}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{pos.assetType}</span>
                          <span aria-hidden="true">·</span>
                          <span>{pos.weightOfPortfolioPercent.toLocaleString('de-DE')} % Depotanteil</span>
                        </div>
                        <h3 className="mt-0.5 text-base font-bold text-foreground leading-snug truncate">
                          {pos.name}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          data-testid={`position-value-${pos.symbol}`}
                          className="font-mono text-base sm:text-lg font-extrabold tabular-nums text-foreground"
                        >
                          {formatEuro(pos.currentValueEur, 2)}
                        </div>
                        <div
                          className={`inline-flex items-center gap-0.5 font-mono text-xs font-bold tabular-nums ${
                            posPositive
                              ? 'text-primary'
                              : posNegative
                                ? 'text-destructive'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {posPositive && (
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          {posNegative && (
                            <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          <span>
                            {formatSignedEuro(pos.unrealizedGainLossEur, 2)} (
                            {formatSignedPercent(pos.unrealizedGainLossPercent, 2)})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Position Metrics Grid (Readable down to 320px width) */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="rounded-lg bg-muted/60 p-2.5">
                        <div className="text-muted-foreground">Stückzahl</div>
                        <div
                          data-testid={`position-qty-${pos.symbol}`}
                          className="mt-0.5 font-mono font-bold tabular-nums text-foreground"
                        >
                          {pos.quantity.toLocaleString('de-DE', {
                            maximumFractionDigits: 4,
                          })}{' '}
                          Stk.
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/60 p-2.5">
                        <div className="text-muted-foreground">Ø Kaufpreis</div>
                        <div
                          data-testid={`position-avg-price-${pos.symbol}`}
                          className="mt-0.5 font-mono font-bold tabular-nums text-foreground"
                        >
                          {formatEuro(pos.averagePurchasePriceEur, 2)}
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/60 p-2.5">
                        <div className="text-muted-foreground">Aktueller Kurs</div>
                        <div className="mt-0.5 font-mono font-bold tabular-nums text-foreground">
                          {formatEuro(pos.currentPriceEur, 2)}
                          {pos.currency !== 'EUR' && (
                            <span className="block text-[10px] font-normal text-muted-foreground">
                              ({formatOriginalCurrency(pos.currentPriceOriginal, pos.currency, 2)})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/60 p-2.5">
                        <div className="text-muted-foreground">Datenstatus</div>
                        <div className="mt-0.5 font-medium text-foreground truncate" title={statusInfo.shortText}>
                          {pos.isDemo ? 'Beispieldaten' : statusInfo.shortText}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/70">
                    <button
                      type="button"
                      onClick={() => void handleOpenPositionDetail(pos.symbol)}
                      className="min-h-[40px] px-2.5 py-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      Position ansehen →
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleOpenBuyForSymbol(pos.symbol)}
                        className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        <ShoppingCart className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        <span>Nachkaufen</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubView({ type: 'sell', symbol: pos.symbol })}
                        className="inline-flex min-h-[40px] items-center rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        Verkaufen
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Recent Simulated Transactions */}
      {portfolio.transactions.length > 0 && (
        <section
          aria-labelledby="depot-transactions-heading"
          className="surface-card p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 id="depot-transactions-heading" className="text-base font-bold">
                Protokoll deiner simulierten Transaktionen ({portfolio.transactions.length})
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              Alle Buchungen 100 % virtuell
            </span>
          </div>

          <div className="divide-y divide-border text-xs">
            {portfolio.transactions.slice(0, 8).map((tx) => (
              <div
                key={tx.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5"
              >
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-bold ${
                        tx.type === 'BUY' ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {tx.type === 'BUY' ? 'Virtueller Kauf' : 'Virtueller Verkauf'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-foreground">
                      {tx.instrumentName} ({tx.symbol})
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    {tx.quantity.toLocaleString('de-DE')} Stück zu je{' '}
                    {formatEuro(tx.priceEur, 2)} ·{' '}
                    {new Date(tx.executedAt).toLocaleString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="sm:text-right font-mono font-bold tabular-nums">
                  <div>{formatEuro(tx.totalAmountEur, 2)}</div>
                  {tx.type === 'SELL' && tx.realizedGainLossEur !== undefined && (
                    <div
                      className={`text-[11px] ${
                        tx.realizedGainLossEur >= 0
                          ? 'text-primary'
                          : 'text-destructive'
                      }`}
                    >
                      Realisiert: {formatSignedEuro(tx.realizedGainLossEur, 2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Mandatory Legal, Educational & Market-Data Disclaimer */}
      <section
        aria-label="Rechtliche Hinweise und Datenquellen"
        className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-2 text-xs text-muted-foreground"
      >
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-foreground">
              Nur zu Bildungszwecken – keine Anlageberatung. Alle Käufe und Verkäufe sind Simulationen. Geldanlagen können an Wert verlieren.
            </strong>
          </p>
        </div>
        <div className="pl-6 space-y-1 text-[11px] leading-relaxed">
          <p>
            <strong className="text-foreground">Kursdaten & Status:</strong> Quelle:{' '}
            {providerStatus.providerName} · Status: {providerStatus.statusLabel} · Letztes Update:{' '}
            {lastRefreshedAt
              ? new Date(lastRefreshedAt).toLocaleString('de-DE')
              : 'Bei Erstellung'}
            . Angezeigte Kurse dienen ausschließlich der pädagogischen Simulation und können von ausführbaren Marktpreisen abweichen.
          </p>
          <p>
            Du möchtest dein Übungsdepot neu starten? Unter{' '}
            <AppLink to="/mehr" className="font-semibold text-primary underline">
              Mehr & Einstellungen
            </AppLink>{' '}
            kannst du das Übungsdepot unabhängig von deinem Lernfortschritt zurücksetzen.
          </p>
        </div>
      </section>
    </div>
  );
}
