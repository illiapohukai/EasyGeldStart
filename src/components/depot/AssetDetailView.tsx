import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Clock,
  Info,
  ShieldAlert,
  ShoppingCart,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatEuro } from '@/lib/calculator';
import {
  formatOriginalCurrency,
  formatSignedEuro,
  formatSignedPercent,
  type ValuedPosition,
} from '@/lib/depot-calculations';
import {
  formatMarketDataStatusBadge,
  marketDataService,
} from '@/lib/market-service';
import type {
  HistoricalRange,
  HistoricalSeries,
  InstrumentMetadata,
  MarketQuote,
} from '@/lib/market-types';
import { AppLink } from '@/lib/router';

export function AssetDetailView({
  instrument,
  quote,
  holding,
  onBack,
  onStartBuy,
  onStartSell,
}: {
  instrument: InstrumentMetadata;
  quote: MarketQuote | null;
  holding: ValuedPosition | null;
  onBack: () => void;
  onStartBuy: (instrument: InstrumentMetadata) => void;
  onStartSell: (symbol: string) => void;
}) {
  const [range, setRange] = useState<HistoricalRange>('1Y');
  const [history, setHistory] = useState<HistoricalSeries | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadingHistory(true);
    marketDataService
      .getHistoricalPrices(instrument.symbol, range)
      .then((res) => {
        if (active) setHistory(res);
      })
      .catch(() => {
        if (active) setHistory(null);
      })
      .finally(() => {
        if (active) setLoadingHistory(false);
      });
    return () => {
      active = false;
    };
  }, [instrument.symbol, range]);

  const statusBadge = formatMarketDataStatusBadge(
    quote?.status ?? 'unavailable',
    quote?.isDemo,
  );

  const histPoints = history?.points ?? [];
  const minClose =
    histPoints.length > 0
      ? Math.min(...histPoints.map((p) => p.close)) * 0.98
      : 0;
  const maxClose =
    histPoints.length > 0
      ? Math.max(...histPoints.map((p) => p.close)) * 1.02
      : 1;
  const closeSpan = Math.max(0.01, maxClose - minClose);

  const svgPolyline =
    histPoints.length > 1
      ? histPoints
          .map((pt, idx) => {
            const x = (idx / (histPoints.length - 1)) * 100;
            const y = 90 - ((pt.close - minClose) / closeSpan) * 80;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
          })
          .join(' ')
      : '';

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Zurück zur Depotübersicht</span>
        </button>

        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span>{statusBadge.shortText}</span>
        </div>
      </div>

      {/* Main Header & Price Card */}
      <section
        aria-labelledby="asset-detail-title"
        className="surface-card p-5 sm:p-6 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono font-bold text-foreground">
                {instrument.symbol}
              </span>
              {instrument.isin && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{instrument.isin}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{instrument.assetType}</span>
              <span aria-hidden="true">·</span>
              <span>Handelsplatz: {instrument.exchange}</span>
              <span aria-hidden="true">·</span>
              <span>Währung: {instrument.currency}</span>
            </div>

            <h1
              id="asset-detail-title"
              className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground"
            >
              {instrument.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              Branche / Fokus: <strong className="text-foreground">{instrument.sector}</strong> · Region:{' '}
              <strong className="text-foreground">{instrument.region}</strong> · Risikoeinstufung:{' '}
              <strong className="text-foreground">{instrument.riskCategory}</strong>
            </p>
          </div>

          {quote ? (
            <div className="sm:text-right space-y-1 shrink-0">
              <div className="text-xs text-muted-foreground">
                Referenzkurs ({quote.isDemo ? 'Beispieldaten' : quote.exchange})
              </div>
              <div
                data-testid="asset-detail-price"
                className="font-mono text-2xl sm:text-3xl font-extrabold tabular-nums text-foreground"
              >
                {formatOriginalCurrency(quote.price, quote.currency, 2)}
              </div>
              <div className="flex sm:justify-end items-center gap-1.5 text-xs font-mono font-semibold tabular-nums">
                {quote.changeAbsolute >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
                )}
                <span
                  className={
                    quote.changeAbsolute >= 0 ? 'text-primary' : 'text-destructive'
                  }
                >
                  {quote.changeAbsolute >= 0 ? '+' : ''}
                  {formatOriginalCurrency(quote.changeAbsolute, quote.currency, 2)} (
                  {formatSignedPercent(quote.changePercent, 2)}) ggü. Vortag ({formatOriginalCurrency(quote.previousClose, quote.currency, 2)})
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Kurszeitpunkt:{' '}
                {new Date(quote.timestamp).toLocaleString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-muted p-3 text-xs text-muted-foreground">
              Aktuell kein Marktpreis verfügbar
            </div>
          )}
        </div>

        {/* Educational Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              data-testid="asset-detail-buy-btn"
              onClick={() => onStartBuy(instrument)}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              <span>
                {holding ? 'Virtuell nachkaufen' : 'Im Übungsdepot testen (Virtuell kaufen)'}
              </span>
            </button>

            {holding && holding.quantity > 0 && (
              <button
                type="button"
                data-testid="asset-detail-sell-btn"
                onClick={() => onStartSell(instrument.symbol)}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-xs sm:text-sm font-bold text-secondary-foreground hover:bg-accent/50 transition-colors whitespace-nowrap"
              >
                <span>Virtuell verkaufen</span>
              </button>
            )}
          </div>

          <AppLink
            to="/anlageklassen"
            className="inline-flex min-h-[42px] items-center gap-1.5 text-xs font-semibold text-primary hover:underline whitespace-nowrap"
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Risiko verstehen (Lektion Anlageklassen) →</span>
          </AppLink>
        </div>
      </section>

      {/* Current Holding Section (if owned) */}
      <div className="grid gap-5 lg:grid-cols-12 items-stretch">
        <section
          aria-labelledby="asset-holding-heading"
          className="lg:col-span-5 surface-card p-5 sm:p-6 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-1">
            <h2 id="asset-holding-heading" className="text-base font-bold text-foreground">
              Deine Position im Übungsdepot
            </h2>
            <p className="text-xs text-muted-foreground">
              {holding
                ? 'Berechnet auf Basis deiner bisherigen virtuellen Transaktionen.'
                : 'Du hältst dieses Wertpapier aktuell noch nicht in deinem Übungsdepot.'}
            </p>
          </div>

          {holding ? (
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Gehaltene Stückzahl</span>
                <span className="font-mono font-bold tabular-nums">
                  {holding.quantity.toLocaleString('de-DE', {
                    maximumFractionDigits: 4,
                  })}{' '}
                  Stück
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Ø Kaufpreis (Einstand)</span>
                <span className="font-mono font-semibold tabular-nums">
                  {formatEuro(holding.averagePurchasePriceEur, 2)}
                  {holding.currency !== 'EUR' && (
                    <span className="text-muted-foreground">
                      {' '}
                      ({formatOriginalCurrency(holding.averagePurchasePriceOriginal, holding.currency, 2)})
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Investierter Kaufwert</span>
                <span className="font-mono font-semibold tabular-nums">
                  {formatEuro(holding.investedCostBasisEur, 2)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Aktueller Positionswert</span>
                <span className="font-mono font-bold tabular-nums text-foreground">
                  {formatEuro(holding.currentValueEur, 2)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Gewinn / Verlust (unrealisiert)</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    holding.unrealizedGainLossEur >= 0
                      ? 'text-primary'
                      : 'text-destructive'
                  }`}
                >
                  {formatSignedEuro(holding.unrealizedGainLossEur, 2)} (
                  {formatSignedPercent(holding.unrealizedGainLossPercent, 2)})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gewicht am Gesamtdepot</span>
                <span className="font-mono font-semibold tabular-nums">
                  {holding.weightOfPortfolioPercent.toLocaleString('de-DE')} %
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-muted/50 p-4 text-xs text-muted-foreground my-auto">
              Klicke oben auf „Im Übungsdepot testen“, um eine erste virtuelle Position mit Spielgeld zu simulieren.
            </div>
          )}
        </section>

        {/* Neutral Explanation & Risk Profile */}
        <section
          aria-labelledby="asset-explanation-heading"
          className="lg:col-span-7 surface-card p-5 sm:p-6 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Info className="h-4 w-4" aria-hidden="true" />
              <span>Sachliche Einordnung (Keine Kaufempfehlung)</span>
            </div>
            <h2 id="asset-explanation-heading" className="text-base font-bold text-foreground">
              Was ist {instrument.name}?
            </h2>
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
              {instrument.shortExplanation}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-foreground">
              Worauf du aus Bildungssicht achten solltest:
            </h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-5 leading-relaxed">
              {instrument.educationalNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-muted/50 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Geldstart zeigt bewusst keine Kursziele, keine „Strong Buy“-Urteile und keine Renditeprognosen. Vergangene Kursverläufe sind kein Indikator für die zukünftige Entwicklung.
            </span>
          </div>
        </section>
      </div>

      {/* Historical Price Chart */}
      <section
        aria-labelledby="asset-history-heading"
        className="surface-card p-5 sm:p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="asset-history-heading" className="text-base font-bold">
              Historischer Kursverlauf ({instrument.currency})
            </h2>
            <p className="text-xs text-muted-foreground">
              Datenquelle: {history?.providerName ?? statusBadge.shortText}
            </p>
          </div>

          <div
            className="inline-flex rounded-xl border border-border bg-muted p-1"
            role="tablist"
            aria-label="Zeitraum für Kurshistorie"
          >
            {(['1M', '6M', '1Y'] as HistoricalRange[]).map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={range === r}
                onClick={() => setRange(r)}
                className={`min-h-[34px] rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  range === r
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r === '1M' ? '1 Monat' : r === '6M' ? '6 Monate' : '1 Jahr'}
              </button>
            ))}
          </div>
        </div>

        {loadingHistory ? (
          <div className="rounded-xl border border-border bg-background p-8 text-center text-xs text-muted-foreground">
            Kurshistorie wird geladen …
          </div>
        ) : histPoints.length < 2 ? (
          <div className="rounded-xl border border-border bg-muted/50 p-6 text-center text-xs text-muted-foreground">
            Für diesen Zeitraum liegen keine historischen Kursdaten vor.
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-background p-4 space-y-2">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="h-36 w-full overflow-visible"
              role="img"
              aria-label={`Historischer Kursverlauf für ${instrument.name} (${range}): von ${formatOriginalCurrency(histPoints[0]!.close, instrument.currency)} auf ${formatOriginalCurrency(histPoints[histPoints.length - 1]!.close, instrument.currency)}.`}
            >
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
                points={svgPolyline}
              />
            </svg>
            <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-muted-foreground">
              <span>
                {histPoints[0]!.date}:{' '}
                {formatOriginalCurrency(histPoints[0]!.close, instrument.currency, 2)}
              </span>
              <span>
                {histPoints[histPoints.length - 1]!.date}:{' '}
                {formatOriginalCurrency(
                  histPoints[histPoints.length - 1]!.close,
                  instrument.currency,
                  2,
                )}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
