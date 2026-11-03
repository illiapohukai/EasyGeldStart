import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Info,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatEuro, formatPercent } from '@/lib/calculator';
import {
  type DepotTransaction,
  formatOriginalCurrency,
  formatSignedEuro,
  formatSignedPercent,
  previewVirtualBuy,
  previewVirtualSell,
  roundQuantity,
} from '@/lib/depot-calculations';
import { useDepot } from '@/lib/depot-context';
import {
  formatMarketDataStatusBadge,
  marketDataService,
} from '@/lib/market-service';
import type {
  ExchangeRateQuote,
  InstrumentAssetType,
  InstrumentMetadata,
  MarketQuote,
} from '@/lib/market-types';

export function VirtualBuyFlowView({
  initialInstrument,
  onClose,
  onOpenAssetDetail,
}: {
  initialInstrument?: InstrumentMetadata | null;
  onClose: () => void;
  onOpenAssetDetail: (instrument: InstrumentMetadata, quote: MarketQuote | null) => void;
}) {
  const { portfolio, buyInstrumentVirtually } = useDepot();
  const [step, setStep] = useState<'select' | 'configure' | 'preview' | 'success'>(
    initialInstrument ? 'configure' : 'select',
  );

  // Step 1 state: Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<InstrumentAssetType | 'ALL'>('ALL');
  const [instruments, setInstruments] = useState<InstrumentMetadata[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Selected instrument & quote state
  const [selectedInstrument, setSelectedInstrument] =
    useState<InstrumentMetadata | null>(initialInstrument ?? null);
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [fxQuote, setFxQuote] = useState<ExchangeRateQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  // Step 2 state: Order input
  const [inputMode, setInputMode] = useState<'amount_eur' | 'quantity'>('amount_eur');
  const [rawInputValue, setRawInputValue] = useState<string>('500');

  // Step 4 state: Completed transaction & reflection
  const [completedTx, setCompletedTx] = useState<DepotTransaction | null>(null);
  const [completedWeightPct, setCompletedWeightPct] = useState<number>(0);
  const [reflectionChoice, setReflectionChoice] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoadingSearch(true);
    setSearchError(null);
    marketDataService
      .searchInstruments(searchQuery, filterType)
      .then((list) => {
        if (active) setInstruments(list);
      })
      .catch((err: unknown) => {
        if (active) {
          setSearchError(
            err instanceof Error
              ? err.message
              : 'Wertpapiersuche fehlgeschlagen.',
          );
        }
      })
      .finally(() => {
        if (active) setLoadingSearch(false);
      });
    return () => {
      active = false;
    };
  }, [searchQuery, filterType]);

  useEffect(() => {
    if (!selectedInstrument) return;
    let active = true;
    setLoadingQuote(true);
    Promise.all([
      marketDataService.getQuote(selectedInstrument.symbol),
      selectedInstrument.currency !== 'EUR'
        ? marketDataService.getExchangeRate(selectedInstrument.currency, 'EUR')
        : Promise.resolve(null),
    ])
      .then(([q, fx]) => {
        if (active) {
          setQuote(q);
          setFxQuote(fx);
        }
      })
      .catch(() => {
        if (active) {
          setQuote(null);
        }
      })
      .finally(() => {
        if (active) setLoadingQuote(false);
      });
    return () => {
      active = false;
    };
  }, [selectedInstrument]);

  const numericValue = Number(rawInputValue.replace(',', '.'));
  const buyPreview = selectedInstrument
    ? previewVirtualBuy({
        portfolio,
        instrument: selectedInstrument,
        quote,
        input: {
          mode: inputMode,
          value: Number.isFinite(numericValue) ? numericValue : 0,
        },
        fxRateToEur:
          selectedInstrument.currency === 'EUR' ? 1 : (fxQuote?.rate ?? 0.9215),
        fxTimestamp: fxQuote?.timestamp ?? quote?.timestamp,
      })
    : null;

  const handleConfirmBuy = () => {
    if (!selectedInstrument || !quote || !buyPreview || !buyPreview.valid) return;
    const tx = buyInstrumentVirtually({
      instrument: selectedInstrument,
      quote,
      input: {
        mode: inputMode,
        value: numericValue,
      },
      fxRateToEur: buyPreview.fxRateToEur,
      fxTimestamp: buyPreview.fxTimestamp,
    });
    setCompletedTx(tx);
    setCompletedWeightPct(buyPreview.resultingPortfolioWeightPercent);
    setStep('success');
  };

  return (
    <section
      aria-labelledby="virtual-buy-heading"
      className="surface-card p-5 sm:p-6 space-y-6"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-xs font-semibold text-primary">
            Virtueller Wertpapierkauf · 100 % Simulation (Kein echtes Geld)
          </p>
          <h2 id="virtual-buy-heading" className="text-lg sm:text-xl font-bold">
            {step === 'select' && 'Schritt 1: Wertpapier suchen & auswählen'}
            {step === 'configure' && 'Schritt 2: Betrag oder Stückzahl eingeben'}
            {step === 'preview' && 'Schritt 3: Auftrags-Vorschau & Risiko prüfen'}
            {step === 'success' && 'Schritt 4: Virtueller Kauf simuliert & Reflexion'}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Kaufansicht schließen"
          className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* STEP 1: Search & Select Instrument */}
      {step === 'select' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="Wertpapier nach Name, Symbol oder Branche suchen"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, Symbol oder Branche (z. B. MSCI World, SAP, NVDA, Biotech) …"
                className="w-full min-h-[44px] rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm"
              />
            </div>

            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Nach Anlageklasse filtern"
            >
              {(
                [
                  { id: 'ALL', label: 'Alle' },
                  { id: 'ETF', label: 'ETFs' },
                  { id: 'Aktie', label: 'Einzelaktien' },
                  { id: 'Anleihen-ETF', label: 'Anleihen' },
                  { id: 'Rohstoff-ETC', label: 'Gold' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id)}
                  className={`min-h-[40px] rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    filterType === tab.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loadingSearch ? (
            <div className="rounded-xl border border-border bg-background p-6 text-center text-xs text-muted-foreground">
              Unterstützte Wertpapiere werden geladen …
            </div>
          ) : searchError ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-xs text-foreground"
            >
              {searchError}
            </div>
          ) : instruments.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/50 p-6 text-center space-y-2">
              <p className="text-sm font-bold text-foreground">
                Kein passendes Wertpapier gefunden.
              </p>
              <p className="text-xs text-muted-foreground">
                Probiere Begriffe wie „MSCI World“, „FTSE“, „SAP“, „NVIDIA“, „KWS“ oder „Gold“.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {instruments.map((inst) => (
                <div
                  key={inst.symbol}
                  className="rounded-xl border border-border bg-background p-4 flex flex-col justify-between gap-3 hover:border-primary/60 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        <strong className="font-mono text-foreground">{inst.symbol}</strong> ·{' '}
                        {inst.assetType} · {inst.exchange} ({inst.currency})
                      </span>
                      <span>Risiko: {inst.riskCategory}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">
                      {inst.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {inst.shortExplanation}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/70">
                    <button
                      type="button"
                      onClick={() => onOpenAssetDetail(inst, null)}
                      className="min-h-[38px] px-2 text-xs font-semibold text-muted-foreground hover:text-foreground underline"
                    >
                      Details & Risiko
                    </button>
                    <button
                      type="button"
                      data-testid={`select-instrument-${inst.symbol}`}
                      onClick={() => {
                        setSelectedInstrument(inst);
                        setStep('configure');
                      }}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <span>Auswählen</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Enter Amount or Quantity */}
      {step === 'configure' && selectedInstrument && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-background p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">
                {selectedInstrument.symbol} · {selectedInstrument.assetType} ·{' '}
                {selectedInstrument.exchange} ({selectedInstrument.currency})
              </div>
              <h3 className="text-base font-bold text-foreground">
                {selectedInstrument.name}
              </h3>
            </div>
            <div className="sm:text-right">
              <div className="text-xs text-muted-foreground">Verfügbares Übungsgeld</div>
              <div className="font-mono text-base font-bold tabular-nums text-primary">
                {formatEuro(portfolio.cashEur, 2)}
              </div>
            </div>
          </div>

          {loadingQuote ? (
            <div className="rounded-xl border border-border bg-muted/50 p-6 text-center text-xs text-muted-foreground">
              Aktueller Referenzkurs wird geladen …
            </div>
          ) : (
            <>
              {/* Mode Toggle: Euro Amount vs Share Quantity */}
              <div className="space-y-3">
                <div
                  className="inline-flex rounded-xl border border-border bg-muted p-1"
                  role="tablist"
                  aria-label="Eingabemodus wählen"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={inputMode === 'amount_eur'}
                    onClick={() => {
                      setInputMode('amount_eur');
                      setRawInputValue('500');
                    }}
                    className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      inputMode === 'amount_eur'
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Betrag in Euro (€)
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={inputMode === 'quantity'}
                    onClick={() => {
                      setInputMode('quantity');
                      setRawInputValue('2');
                    }}
                    className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      inputMode === 'quantity'
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Stückzahl (Anteile)
                  </button>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="virtual-buy-input"
                    className="block text-xs sm:text-sm font-semibold text-foreground"
                  >
                    {inputMode === 'amount_eur'
                      ? 'Wie viel virtuelles Geld möchtest du investieren (€)?'
                      : 'Wie viele Anteile (Stück) möchtest du virtuell kaufen?'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="virtual-buy-input"
                      data-testid="virtual-buy-value-input"
                      type="number"
                      min={0}
                      step={inputMode === 'amount_eur' ? 25 : 0.1}
                      value={rawInputValue}
                      onChange={(e) => setRawInputValue(e.target.value)}
                      className="w-full sm:w-56 min-h-[46px] rounded-xl border border-input bg-background px-3.5 py-2 font-mono text-base font-bold tabular-nums"
                    />
                    <span className="text-sm font-bold text-muted-foreground">
                      {inputMode === 'amount_eur' ? 'EUR (€)' : 'Stück'}
                    </span>
                  </div>

                  {inputMode === 'amount_eur' && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[100, 250, 500, 1000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setRawInputValue(String(preset))}
                          className="min-h-[36px] rounded-lg border border-border bg-muted px-3 py-1 text-xs font-mono font-semibold text-foreground hover:bg-secondary transition-colors"
                        >
                          {preset.toLocaleString('de-DE')} €
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Hinweis zu Bruchstücken: Wie bei modernen ETF-Sparplänen unterstützt das Übungsdepot auch Teil-Stücke (bis 4 Nachkommastellen), sodass du glatte Euro-Beträge investieren kannst.
                </p>
              </div>

              {buyPreview && !buyPreview.valid && (
                <div
                  role="alert"
                  data-testid="virtual-buy-error"
                  className="rounded-xl border border-destructive/50 bg-destructive/10 p-3.5 flex items-start gap-2.5 text-xs text-foreground"
                >
                  <AlertCircle
                    className="h-4 w-4 text-destructive shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{buyPreview.errorMessage}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Anderes Wertpapier wählen</span>
                </button>

                <button
                  type="button"
                  data-testid="virtual-buy-to-preview-btn"
                  disabled={!buyPreview?.valid}
                  onClick={() => setStep('preview')}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
                >
                  <span>Zur Auftrags-Vorschau</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 3: Transparent Order Preview */}
      {step === 'preview' && selectedInstrument && buyPreview && buyPreview.valid && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-background p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="text-muted-foreground">Ausgewähltes Wertpapier</span>
              <span className="font-bold text-foreground">
                {selectedInstrument.name} ({selectedInstrument.symbol})
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="text-muted-foreground">Verwendeter Referenzkurs</span>
              <span className="font-mono font-semibold tabular-nums text-foreground">
                {formatOriginalCurrency(
                  buyPreview.marketPriceOriginal,
                  buyPreview.currency,
                  2,
                )}
                {buyPreview.currency !== 'EUR' && (
                  <span className="text-muted-foreground">
                    {' '}
                    (≈ {formatEuro(buyPreview.marketPriceEur, 2)})
                  </span>
                )}
              </span>
            </div>

            {buyPreview.currency !== 'EUR' && (
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-muted-foreground">
                  Währungsumrechnung ({buyPreview.currency} → EUR)
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  1 {buyPreview.currency} = {buyPreview.fxRateToEur.toLocaleString('de-DE')} EUR (Stand:{' '}
                  {new Date(buyPreview.fxTimestamp).toLocaleDateString('de-DE')})
                </span>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="text-muted-foreground">Kurs-Zeitstempel & Datenstatus</span>
              <span className="text-xs font-medium text-foreground text-right">
                {new Date(buyPreview.priceTimestamp).toLocaleString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                ·{' '}
                {
                  formatMarketDataStatusBadge(
                    buyPreview.dataStatus,
                    buyPreview.isDemo,
                  ).shortText
                }
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-border pb-2.5">
              <span className="text-muted-foreground">Simulierte Stückzahl</span>
              <span className="font-mono font-bold tabular-nums shrink-0">
                {buyPreview.quantity.toLocaleString('de-DE', {
                  maximumFractionDigits: 4,
                })}{' '}
                Stück
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-border pb-2.5">
              <span className="text-muted-foreground">Geschätzter Auftragswert</span>
              <span
                data-testid="virtual-buy-preview-order-value"
                className="font-mono text-base font-extrabold tabular-nums text-primary shrink-0"
              >
                {formatEuro(buyPreview.estimatedOrderValueEur, 2)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-border pb-2.5">
              <span className="text-muted-foreground">Verbleibendes Übungsgeld (Cash)</span>
              <span className="font-mono font-semibold tabular-nums shrink-0">
                {formatEuro(buyPreview.remainingCashEur, 2)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">
                Künftiges Gewicht dieser Position im Depot
              </span>
              <span className="font-mono font-bold tabular-nums text-foreground shrink-0">
                {formatPercent(buyPreview.resultingPortfolioWeightPercent, 1)}
              </span>
            </div>
          </div>

          {/* Educational Risk / Diversification Note */}
          <div className="rounded-xl border border-primary/25 bg-secondary/80 p-4 flex items-start gap-2.5 text-xs leading-relaxed">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="font-bold text-foreground block mb-0.5">
                Einordnung zu Risiko & Streuung:
              </strong>
              <span className="text-muted-foreground">
                {buyPreview.educationalRiskNote}
              </span>
              {buyPreview.currency !== 'EUR' && (
                <span className="block mt-1 text-muted-foreground">
                  Zusatzhinweis Fremdwährung: Da {selectedInstrument.name} in {buyPreview.currency} notiert, können Wechselkursschwankungen zwischen {buyPreview.currency} und EUR dein Ergebnis in Euro positiv oder negativ beeinflussen.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setStep('configure')}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Betrag ändern</span>
            </button>

            <button
              type="button"
              data-testid="virtual-buy-confirm-btn"
              onClick={handleConfirmBuy}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Virtuell kaufen ({formatEuro(buyPreview.estimatedOrderValueEur, 2)})</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Simulated Success & Educational Reflection */}
      {step === 'success' && completedTx && (
        <div className="space-y-5" data-testid="virtual-buy-success">
          <div className="rounded-xl border border-primary/30 bg-secondary p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base">
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                Simulation ausgeführt: {completedTx.instrumentName} ins Übungsdepot aufgenommen
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Du hast virtuell{' '}
              <strong className="font-mono text-foreground">
                {completedTx.quantity.toLocaleString('de-DE')} Stück
              </strong>{' '}
              im Gegenwert von{' '}
              <strong className="font-mono text-foreground">
                {formatEuro(completedTx.totalAmountEur, 2)}
              </strong>{' '}
              simuliert gekauft. Es wurde kein echter Börsenauftrag erteilt.
            </p>
          </div>

          {/* Section 18 Reflection Prompt */}
          <div className="rounded-xl border border-border bg-background p-4 sm:p-5 space-y-3.5">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-primary">
                  Kurz-Reflexion zu deiner Entscheidung (Positionsgewicht aktuell:{' '}
                  {formatPercent(completedWeightPct, 1)})
                </p>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Welches Risiko entsteht, wenn diese Position einen großen Anteil deines Depots bildet?
                </h3>
              </div>
            </div>

            <div className="space-y-2" role="group" aria-label="Reflexionsfrage zum Positionsgewicht">
              {[
                {
                  label:
                    'Klumpenrisiko: Wenn dieses einzelne Wertpapier oder seine Branche stark fällt, leidet sofort mein gesamtes Depot überproportional.',
                  isBest: true,
                },
                {
                  label:
                    'Gar kein Risiko, weil große Positionen an der Börse immer bevorzugt steigen.',
                  isBest: false,
                },
              ].map((opt, idx) => {
                const chosen = reflectionChoice === idx;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setReflectionChoice(idx)}
                    aria-pressed={chosen}
                    className={`w-full min-h-[44px] rounded-xl border px-3.5 py-2.5 text-left text-xs sm:text-sm transition-colors ${
                      chosen
                        ? opt.isBest
                          ? 'border-primary bg-accent/50 font-semibold text-foreground'
                          : 'border-highlight bg-highlight/20 font-semibold text-foreground'
                        : 'border-border bg-card hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {reflectionChoice !== null && (
              <p className="text-xs text-muted-foreground rounded-lg bg-muted p-3 leading-relaxed">
                <strong className="text-foreground">Merke:</strong> Je höher das Gewicht einer einzelnen Aktie oder Branche, desto abhängiger bist du vom Schicksal weniger Firmen. Breit gestreute Welt-ETFs reduzieren dieses Einzelrisiko deutlich.
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              data-testid="virtual-buy-done-btn"
              onClick={onClose}
              className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              Zurück zur Depotübersicht
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export function VirtualSellFlowView({
  initialSymbol,
  onClose,
}: {
  initialSymbol?: string | null;
  onClose: () => void;
}) {
  const { portfolio, valuation, sellInstrumentVirtually } = useDepot();
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    initialSymbol ?? valuation.valuedPositions[0]?.symbol ?? '',
  );

  const selectedPos =
    valuation.valuedPositions.find(
      (p) => p.symbol.toUpperCase() === selectedSymbol.toUpperCase(),
    ) ?? null;

  const [rawQuantity, setRawQuantity] = useState<string>(() =>
    selectedPos ? String(selectedPos.quantity) : '1',
  );
  const [completedSellTx, setCompletedSellTx] = useState<DepotTransaction | null>(
    null,
  );

  useEffect(() => {
    if (selectedPos) {
      setRawQuantity(String(selectedPos.quantity));
    }
  }, [selectedPos?.symbol]);

  const quote = selectedPos
    ? portfolio.lastKnownQuotes[selectedPos.symbol.toUpperCase()] ?? {
        symbol: selectedPos.symbol,
        price: selectedPos.currentPriceOriginal,
        previousClose: selectedPos.currentPriceOriginal,
        changeAbsolute: 0,
        changePercent: 0,
        currency: selectedPos.currency,
        exchange: selectedPos.exchange,
        timestamp: selectedPos.priceTimestamp,
        status: selectedPos.dataStatus,
        providerName: 'Referenzkurs',
        isDemo: selectedPos.isDemo,
      }
    : null;

  const numericQty = Number(rawQuantity.replace(',', '.'));
  const sellPreview = previewVirtualSell({
    portfolio,
    symbol: selectedSymbol,
    quantityToSell: Number.isFinite(numericQty) ? numericQty : 0,
    quote,
    fxRateToEur: selectedPos?.currentFxRateToEur ?? 1,
  });

  const handleConfirmSell = () => {
    if (!quote || !sellPreview.valid) return;
    const tx = sellInstrumentVirtually({
      symbol: selectedSymbol,
      quantityToSell: sellPreview.quantitySold,
      quote,
      fxRateToEur: sellPreview.fxRateToEur,
    });
    setCompletedSellTx(tx);
  };

  return (
    <section
      aria-labelledby="virtual-sell-heading"
      className="surface-card p-5 sm:p-6 space-y-6"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-xs font-semibold text-primary">
            Virtueller Verkauf · Simulation (Keine Leerverkäufe möglich)
          </p>
          <h2 id="virtual-sell-heading" className="text-lg sm:text-xl font-bold">
            {completedSellTx
              ? 'Virtueller Verkauf abgeschlossen'
              : 'Position im Übungsdepot reduzieren oder schließen'}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Verkaufsansicht schließen"
          className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {completedSellTx ? (
        <div className="space-y-4" data-testid="virtual-sell-success">
          <div className="rounded-xl border border-primary/30 bg-secondary p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base">
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                Simulierter Verkauf verbucht: {completedSellTx.instrumentName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Du hast virtuell{' '}
              <strong className="font-mono text-foreground">
                {completedSellTx.quantity.toLocaleString('de-DE')} Stück
              </strong>{' '}
              für{' '}
              <strong className="font-mono text-foreground">
                {formatEuro(completedSellTx.totalAmountEur, 2)}
              </strong>{' '}
              verkauft. Realisierter Gewinn/Verlust dieser Simulation:{' '}
              <strong className="font-mono text-foreground">
                {formatSignedEuro(completedSellTx.realizedGainLossEur ?? 0, 2)}
              </strong>
              .
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              data-testid="virtual-sell-done-btn"
              onClick={onClose}
              className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              Zurück zur Depotübersicht
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Position Selector */}
          <div className="space-y-1.5">
            <label
              htmlFor="sell-position-select"
              className="block text-xs font-semibold text-foreground"
            >
              Welche Position möchtest du virtuell verkaufen?
            </label>
            <select
              id="sell-position-select"
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-input bg-background px-3.5 py-2 text-sm font-semibold"
            >
              {valuation.valuedPositions.map((pos) => (
                <option key={pos.symbol} value={pos.symbol}>
                  {pos.name} ({pos.symbol}) – Bestand:{' '}
                  {pos.quantity.toLocaleString('de-DE')} Stk. ({formatEuro(pos.currentValueEur, 2)})
                </option>
              ))}
            </select>
          </div>

          {selectedPos && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="virtual-sell-qty-input"
                    className="text-xs sm:text-sm font-semibold text-foreground"
                  >
                    Zu verkaufende Stückzahl (Maximalbestand:{' '}
                    {selectedPos.quantity.toLocaleString('de-DE')} Stück)
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="virtual-sell-qty-input"
                    data-testid="virtual-sell-qty-input"
                    type="number"
                    min={0}
                    max={selectedPos.quantity}
                    step={0.01}
                    value={rawQuantity}
                    onChange={(e) => setRawQuantity(e.target.value)}
                    className="w-full sm:w-56 min-h-[46px] rounded-xl border border-input bg-background px-3.5 py-2 font-mono text-base font-bold tabular-nums"
                  />
                  <span className="text-sm font-bold text-muted-foreground">
                    Stück
                  </span>
                </div>

                {/* Quick Fraction Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { label: '25 %', factor: 0.25 },
                    { label: '50 % (Hälfte)', factor: 0.5 },
                    { label: '100 % (Komplett)', factor: 1 },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      onClick={() =>
                        setRawQuantity(
                          String(
                            btn.factor === 1
                              ? selectedPos.quantity
                              : roundQuantity(selectedPos.quantity * btn.factor),
                          ),
                        )
                      }
                      className="min-h-[36px] rounded-lg border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground hover:bg-secondary"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {!sellPreview.valid ? (
                <div
                  role="alert"
                  data-testid="virtual-sell-error"
                  className="rounded-xl border border-destructive/50 bg-destructive/10 p-3.5 flex items-start gap-2.5 text-xs text-foreground"
                >
                  <AlertCircle
                    className="h-4 w-4 text-destructive shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{sellPreview.errorMessage}</span>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-background p-4 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                    <span className="text-muted-foreground">Verkaufte Stückzahl</span>
                    <span className="font-mono font-bold tabular-nums shrink-0">
                      {sellPreview.quantitySold.toLocaleString('de-DE')} Stück
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                    <span className="text-muted-foreground">Referenz-Marktpreis</span>
                    <span className="font-mono font-semibold tabular-nums shrink-0">
                      {formatEuro(sellPreview.referenceMarketPriceEur, 2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                    <span className="text-muted-foreground">Erwarteter virtueller Erlös</span>
                    <span className="font-mono font-bold tabular-nums text-foreground shrink-0">
                      {formatEuro(sellPreview.expectedProceedsEur, 2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                    <span className="text-muted-foreground">
                      Realisierter Gewinn / Verlust
                    </span>
                    <span
                      className={`font-mono font-bold tabular-nums shrink-0 ${
                        sellPreview.realizedGainLossEur >= 0
                          ? 'text-primary'
                          : 'text-destructive'
                      }`}
                    >
                      {formatSignedEuro(sellPreview.realizedGainLossEur, 2)} (
                      {formatSignedPercent(sellPreview.realizedGainLossPercent, 2)})
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                    <span className="text-muted-foreground">Verbleibende Stückzahl</span>
                    <span className="font-mono font-semibold tabular-nums shrink-0">
                      {sellPreview.remainingQuantity.toLocaleString('de-DE')} Stück
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      Neues verfügbares Übungsgeld (Cash)
                    </span>
                    <span className="font-mono font-bold tabular-nums text-primary shrink-0">
                      {formatEuro(sellPreview.updatedCashEur, 2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border bg-muted/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Simulierter Verkauf ohne echte Orderausführung. Gebühren und Steuern werden im Übungsdepot zur Vereinfachung nicht abgezogen.
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-[44px] items-center rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  data-testid="virtual-sell-confirm-btn"
                  disabled={!sellPreview.valid}
                  onClick={handleConfirmSell}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
                >
                  <span>Virtuell verkaufen</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
