import { formatEuro, formatPercent } from './calculator';
import type {
  ExchangeRateQuote,
  InstrumentAssetType,
  InstrumentMetadata,
  MarketDataStatus,
  MarketQuote,
  RiskCategory,
  SupportedCurrency,
} from './market-types';

export interface DepotPosition {
  symbol: string;
  name: string;
  assetType: InstrumentAssetType;
  sector: string;
  region: string;
  currency: SupportedCurrency;
  exchange: string;
  riskCategory: RiskCategory;
  quantity: number;
  /** Weighted average purchase price in original trading currency */
  averagePurchasePriceOriginal: number;
  /** Weighted average purchase price in EUR (portfolio base currency) */
  averagePurchasePriceEur: number;
  /** Total invested cost basis of currently held shares in EUR */
  investedCostBasisEur: number;
  updatedAt: string;
}

export interface DepotTransaction {
  id: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  instrumentName: string;
  assetType: InstrumentAssetType;
  quantity: number;
  priceOriginal: number;
  currency: SupportedCurrency;
  fxRateToEur: number;
  priceEur: number;
  totalAmountEur: number;
  /** For SELL transactions: realized gain/loss in EUR */
  realizedGainLossEur?: number;
  priceTimestamp: string;
  dataStatus: MarketDataStatus;
  executedAt: string;
  isSimulated: true;
}

export interface DepotSnapshot {
  id: string;
  timestamp: string;
  cashEur: number;
  positionsValueEur: number;
  totalValueEur: number;
  investedCostBasisEur: number;
  reason: 'creation' | 'buy' | 'sell' | 'refresh';
  dataStatus: MarketDataStatus;
}

export interface DepotPortfolioState {
  version: 1;
  isInitialized: boolean;
  portfolioName: string;
  baseCurrency: 'EUR';
  /** Virtual starting cash selected during onboarding (baseline for overall performance) */
  startingCashEur: number;
  /** Available uninvested virtual cash in EUR */
  cashEur: number;
  /** Cumulative realized gain/loss from closed or partial sales in EUR */
  realizedGainLossTotalEur: number;
  positions: DepotPosition[];
  transactions: DepotTransaction[];
  lastKnownQuotes: Record<string, MarketQuote>;
  lastKnownFxRates: Record<string, ExchangeRateQuote>;
  snapshots: DepotSnapshot[];
  createdAt: string;
  lastUpdatedAt: string;
}

export type TradeValidationErrorCode =
  | 'INVALID_QUANTITY'
  | 'INVALID_AMOUNT'
  | 'MISSING_PRICE'
  | 'INVALID_FX_RATE'
  | 'INSUFFICIENT_CASH'
  | 'POSITION_NOT_FOUND'
  | 'OVERSELLING'
  | 'FRACTIONAL_NOT_SUPPORTED';

export interface VirtualBuyInput {
  mode: 'amount_eur' | 'quantity';
  value: number;
}

export interface VirtualBuyPreview {
  valid: boolean;
  errorCode?: TradeValidationErrorCode;
  errorMessage?: string;
  instrument: InstrumentMetadata;
  marketPriceOriginal: number;
  marketPriceEur: number;
  currency: SupportedCurrency;
  fxRateToEur: number;
  fxTimestamp: string;
  priceTimestamp: string;
  dataStatus: MarketDataStatus;
  isDemo: boolean;
  quantity: number;
  estimatedOrderValueEur: number;
  remainingCashEur: number;
  resultingPositionQuantity: number;
  resultingWeightedAvgPriceOriginal: number;
  resultingWeightedAvgPriceEur: number;
  resultingPortfolioWeightPercent: number;
  educationalRiskNote: string;
}

export interface VirtualSellPreview {
  valid: boolean;
  errorCode?: TradeValidationErrorCode;
  errorMessage?: string;
  position: DepotPosition;
  quantitySold: number;
  ownedQuantity: number;
  remainingQuantity: number;
  referenceMarketPriceOriginal: number;
  referenceMarketPriceEur: number;
  currency: SupportedCurrency;
  fxRateToEur: number;
  priceTimestamp: string;
  dataStatus: MarketDataStatus;
  isDemo: boolean;
  expectedProceedsEur: number;
  costBasisRemovedEur: number;
  realizedGainLossEur: number;
  realizedGainLossPercent: number;
  updatedCashEur: number;
}

export interface ValuedPosition extends DepotPosition {
  currentPriceOriginal: number;
  currentPriceEur: number;
  currentFxRateToEur: number;
  currentValueEur: number;
  unrealizedGainLossEur: number;
  unrealizedGainLossPercent: number;
  /** Share of total portfolio value (including cash) in % */
  weightOfPortfolioPercent: number;
  /** Share of invested positions value (excluding cash) in % */
  weightOfInvestedPercent: number;
  priceTimestamp: string;
  dataStatus: MarketDataStatus;
  isDemo: boolean;
  hasMissingPrice: boolean;
}

export interface AllocationBucket {
  key: string;
  label: string;
  valueEur: number;
  shareOfPortfolioPercent: number;
  shareOfInvestedPercent: number;
}

export interface EducationalPortfolioInsight {
  id: string;
  tone: 'info' | 'warning';
  title: string;
  explanation: string;
  relatedLessonRoute: '/grundlagen' | '/anlageklassen' | '/zinseszins';
  relatedLessonLabel: string;
}

export interface PortfolioValuationSummary {
  portfolioName: string;
  startingCashEur: number;
  cashEur: number;
  investedCostBasisEur: number;
  positionsMarketValueEur: number;
  totalPortfolioValueEur: number;
  unrealizedGainLossEur: number;
  unrealizedGainLossPercent: number;
  realizedGainLossEur: number;
  /** Total portfolio gain/loss vs startingCashEur (= unrealized + realized) */
  totalGainLossEur: number;
  /** Total portfolio performance % vs startingCashEur */
  totalPerformancePercent: number;
  cashSharePercent: number;
  investedSharePercent: number;
  largestPositionWeightPercent: number;
  largestPositionName: string | null;
  valuedPositions: ValuedPosition[];
  assetAllocation: AllocationBucket[];
  sectorAllocation: AllocationBucket[];
  primaryInsight: EducationalPortfolioInsight;
  allInsights: EducationalPortfolioInsight[];
  missingPriceCount: number;
}

export interface DeterministicWeeklyReport {
  hasEnoughData: boolean;
  emptyMessage?: string;
  generatedAt: string;
  baselineTimestamp: string;
  latestTimestamp: string;
  valueChangeEur: number;
  valueChangePercent: number;
  strongestPosition: {
    name: string;
    symbol: string;
    gainLossPercent: number;
    gainLossEur: number;
  } | null;
  weakestPosition: {
    name: string;
    symbol: string;
    gainLossPercent: number;
    gainLossEur: number;
  } | null;
  largestWeightPosition: {
    name: string;
    symbol: string;
    weightPercent: number;
  } | null;
  diversificationNotice: string;
  dataCompletenessNotice: string;
  transactionCount: number;
}

export function roundCurrency(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function roundQuantity(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

export function formatOriginalCurrency(
  amount: number,
  currency: SupportedCurrency,
  fractionDigits = 2,
): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return safe.toLocaleString('de-DE', {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatSignedEuro(amount: number, fractionDigits = 2): string {
  const safe = roundCurrency(amount);
  const formatted = formatEuro(Math.abs(safe), fractionDigits);
  if (safe > 0) return `+${formatted}`;
  if (safe < 0) return `−${formatted}`;
  return `±${formatted}`;
}

export function formatSignedPercent(value: number, fractionDigits = 2): string {
  const safe = Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;
  const formatted = formatPercent(Math.abs(safe), fractionDigits);
  if (safe > 0) return `+${formatted}`;
  if (safe < 0) return `−${formatted}`;
  return `±${formatted}`;
}

export function previewVirtualBuy(params: {
  portfolio: DepotPortfolioState;
  instrument: InstrumentMetadata;
  quote: MarketQuote | null | undefined;
  input: VirtualBuyInput;
  fxRateToEur?: number;
  fxTimestamp?: string;
}): VirtualBuyPreview {
  const { portfolio, instrument, quote, input } = params;
  const fxRate =
    instrument.currency === 'EUR' ? 1 : (params.fxRateToEur ?? 0);
  const fxTimestamp = params.fxTimestamp ?? quote?.timestamp ?? new Date().toISOString();

  const buildInvalid = (
    errorCode: TradeValidationErrorCode,
    errorMessage: string,
  ): VirtualBuyPreview => ({
    valid: false,
    errorCode,
    errorMessage,
    instrument,
    marketPriceOriginal: quote?.price ?? 0,
    marketPriceEur: 0,
    currency: instrument.currency,
    fxRateToEur: fxRate,
    fxTimestamp,
    priceTimestamp: quote?.timestamp ?? '',
    dataStatus: quote?.status ?? 'unavailable',
    isDemo: quote?.isDemo ?? true,
    quantity: 0,
    estimatedOrderValueEur: 0,
    remainingCashEur: portfolio.cashEur,
    resultingPositionQuantity: 0,
    resultingWeightedAvgPriceOriginal: 0,
    resultingWeightedAvgPriceEur: 0,
    resultingPortfolioWeightPercent: 0,
    educationalRiskNote: '',
  });

  if (!quote || !Number.isFinite(quote.price) || quote.price <= 0 || quote.status === 'unavailable') {
    return buildInvalid(
      'MISSING_PRICE',
      'Für dieses Wertpapier liegt aktuell kein gültiger Marktpreis vor. Ohne verlässlichen Referenzkurs ist kein virtueller Kauf möglich.',
    );
  }

  if (!Number.isFinite(fxRate) || fxRate <= 0) {
    return buildInvalid(
      'INVALID_FX_RATE',
      `Für die Währungsumrechnung (${instrument.currency} → EUR) liegt kein gültiger Wechselkurs vor.`,
    );
  }

  const priceEur = roundCurrency(quote.price * fxRate);
  if (priceEur <= 0) {
    return buildInvalid(
      'MISSING_PRICE',
      'Der umgerechnete Referenzpreis in Euro ist ungültig.',
    );
  }

  if (!Number.isFinite(input.value) || input.value <= 0) {
    return buildInvalid(
      input.mode === 'amount_eur' ? 'INVALID_AMOUNT' : 'INVALID_QUANTITY',
      input.mode === 'amount_eur'
        ? 'Bitte gib einen positiven Anlagebetrag in Euro ein (z. B. 250 €).'
        : 'Bitte gib eine positive Stückzahl größer als 0 ein.',
    );
  }

  let quantity = 0;
  let estimatedOrderValueEur = 0;

  if (input.mode === 'amount_eur') {
    estimatedOrderValueEur = roundCurrency(input.value);
    if (!instrument.supportsFractional) {
      const wholeShares = Math.floor(estimatedOrderValueEur / priceEur);
      if (wholeShares < 1) {
        return buildInvalid(
          'FRACTIONAL_NOT_SUPPORTED',
          `Dieses Wertpapier unterstützt keine Bruchstücke. Für mindestens 1 ganzes Stück werden ${formatEuro(priceEur, 2)} benötigt.`,
        );
      }
      quantity = wholeShares;
      estimatedOrderValueEur = roundCurrency(quantity * priceEur);
    } else {
      quantity = roundQuantity(estimatedOrderValueEur / priceEur);
    }
  } else {
    if (!instrument.supportsFractional && !Number.isInteger(input.value)) {
      return buildInvalid(
        'FRACTIONAL_NOT_SUPPORTED',
        'Dieses Wertpapier unterstützt nur ganze Stückzahlen (keine Bruchstücke).',
      );
    }
    quantity = roundQuantity(input.value);
    estimatedOrderValueEur = roundCurrency(quantity * priceEur);
  }

  if (quantity <= 0 || estimatedOrderValueEur <= 0) {
    return buildInvalid(
      'INVALID_QUANTITY',
      'Der eingegebene Betrag ist zu klein für eine darstellbare Stückzahl (mindestens 0,0001 Stück bzw. 1,00 €).',
    );
  }

  if (estimatedOrderValueEur > portfolio.cashEur) {
    return buildInvalid(
      'INSUFFICIENT_CASH',
      `Nicht genügend virtuelles Bargeld verfügbar. Der Auftragswert beträgt ${formatEuro(estimatedOrderValueEur, 2)}, verfügbar sind ${formatEuro(portfolio.cashEur, 2)}.`,
    );
  }

  const remainingCashEur = roundCurrency(portfolio.cashEur - estimatedOrderValueEur);
  const existingPos = portfolio.positions.find(
    (p) => p.symbol.toUpperCase() === instrument.symbol.toUpperCase(),
  );

  const oldQty = existingPos?.quantity ?? 0;
  const oldCostEur = existingPos?.investedCostBasisEur ?? 0;
  const oldAvgOrig = existingPos?.averagePurchasePriceOriginal ?? 0;

  const resultingPositionQuantity = roundQuantity(oldQty + quantity);
  const newTotalCostEur = roundCurrency(oldCostEur + estimatedOrderValueEur);
  const resultingWeightedAvgPriceEur = roundCurrency(
    newTotalCostEur / resultingPositionQuantity,
  );
  const resultingWeightedAvgPriceOriginal = roundCurrency(
    (oldQty * oldAvgOrig + quantity * quote.price) / resultingPositionQuantity,
  );

  // Estimate total portfolio value to compute resulting weight
  const currentValuation = evaluatePortfolioValuation(portfolio);
  const totalPortfolioVal = Math.max(
    1,
    currentValuation.totalPortfolioValueEur,
  );
  const existingPosCurrentValueEur =
    currentValuation.valuedPositions.find(
      (p) => p.symbol.toUpperCase() === instrument.symbol.toUpperCase(),
    )?.currentValueEur ?? 0;

  const newPosValueEur = roundCurrency(
    existingPosCurrentValueEur + estimatedOrderValueEur,
  );
  const resultingPortfolioWeightPercent =
    Math.round((newPosValueEur / totalPortfolioVal) * 1000) / 10;

  let educationalRiskNote =
    'Breit gestreute Index-ETFs verteilen dein Kapital auf viele Unternehmen. Dennoch kann auch der Gesamtmarkt zeitweise im Wert schwanken.';
  if (instrument.assetType === 'Aktie') {
    if (resultingPortfolioWeightPercent >= 25) {
      educationalRiskNote = `Klumpenrisiko-Hinweis: Nach diesem virtuellen Kauf macht diese einzelne Aktie ${formatPercent(resultingPortfolioWeightPercent, 1)} deines gesamten Depots aus. Gerät ein einzelnes Unternehmen in Schwierigkeiten, trifft das dein Depot stark.`;
    } else {
      educationalRiskNote = `Einzelaktien-Hinweis: Mit ${instrument.name} setzt du gezielt auf ein einzelnes Unternehmen (${instrument.sector}). Einzelaktien schwanken meist stärker als breit gestreute Welt-ETFs.`;
    }
  } else if (resultingPortfolioWeightPercent >= 50 && instrument.assetType === 'ETF') {
    educationalRiskNote = `Dieser ETF bildet nach dem Kauf ${formatPercent(resultingPortfolioWeightPercent, 1)} deines Depots. Da ein breit gestreuter ETF bereits hunderte Unternehmen bündelt, ist ein hoher Anteil hier unkritischer als bei einer einzelnen Aktie.`;
  }

  return {
    valid: true,
    instrument,
    marketPriceOriginal: quote.price,
    marketPriceEur: priceEur,
    currency: instrument.currency,
    fxRateToEur: fxRate,
    fxTimestamp,
    priceTimestamp: quote.timestamp,
    dataStatus: quote.status,
    isDemo: quote.isDemo,
    quantity,
    estimatedOrderValueEur,
    remainingCashEur,
    resultingPositionQuantity,
    resultingWeightedAvgPriceOriginal,
    resultingWeightedAvgPriceEur,
    resultingPortfolioWeightPercent,
    educationalRiskNote,
  };
}

export function executeVirtualBuy(params: {
  portfolio: DepotPortfolioState;
  instrument: InstrumentMetadata;
  quote: MarketQuote;
  input: VirtualBuyInput;
  fxRateToEur?: number;
  fxTimestamp?: string;
  executedAt?: string;
}): {
  portfolio: DepotPortfolioState;
  transaction: DepotTransaction;
  preview: VirtualBuyPreview;
} {
  const preview = previewVirtualBuy(params);
  if (!preview.valid) {
    throw new Error(preview.errorMessage ?? 'Ungültiger virtueller Kaufauftrag.');
  }

  const nowIso = params.executedAt ?? new Date().toISOString();
  const { portfolio, instrument, quote } = params;

  const existingIndex = portfolio.positions.findIndex(
    (p) => p.symbol.toUpperCase() === instrument.symbol.toUpperCase(),
  );

  const nextPositions = [...portfolio.positions];
  if (existingIndex === -1) {
    nextPositions.push({
      symbol: instrument.symbol,
      name: instrument.name,
      assetType: instrument.assetType,
      sector: instrument.sector,
      region: instrument.region,
      currency: instrument.currency,
      exchange: instrument.exchange,
      riskCategory: instrument.riskCategory,
      quantity: preview.resultingPositionQuantity,
      averagePurchasePriceOriginal: preview.resultingWeightedAvgPriceOriginal,
      averagePurchasePriceEur: preview.resultingWeightedAvgPriceEur,
      investedCostBasisEur: preview.estimatedOrderValueEur,
      updatedAt: nowIso,
    });
  } else {
    const existing = nextPositions[existingIndex]!;
    const newInvestedCostBasisEur = roundCurrency(
      existing.investedCostBasisEur + preview.estimatedOrderValueEur,
    );
    nextPositions[existingIndex] = {
      ...existing,
      quantity: preview.resultingPositionQuantity,
      averagePurchasePriceOriginal: preview.resultingWeightedAvgPriceOriginal,
      averagePurchasePriceEur: preview.resultingWeightedAvgPriceEur,
      investedCostBasisEur: newInvestedCostBasisEur,
      updatedAt: nowIso,
    };
  }

  const transaction: DepotTransaction = {
    id: `tx-buy-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'BUY',
    symbol: instrument.symbol,
    instrumentName: instrument.name,
    assetType: instrument.assetType,
    quantity: preview.quantity,
    priceOriginal: preview.marketPriceOriginal,
    currency: instrument.currency,
    fxRateToEur: preview.fxRateToEur,
    priceEur: preview.marketPriceEur,
    totalAmountEur: preview.estimatedOrderValueEur,
    priceTimestamp: preview.priceTimestamp,
    dataStatus: preview.dataStatus,
    executedAt: nowIso,
    isSimulated: true,
  };

  const nextQuotes = {
    ...portfolio.lastKnownQuotes,
    [instrument.symbol.toUpperCase()]: quote,
  };

  const nextFxRates = { ...portfolio.lastKnownFxRates };
  if (instrument.currency !== 'EUR') {
    nextFxRates[`${instrument.currency}_EUR`] = {
      from: instrument.currency,
      to: 'EUR',
      rate: preview.fxRateToEur,
      timestamp: preview.fxTimestamp,
      source: quote.isDemo
        ? 'EZB-Referenzkurs-Simulation (Beispieldaten)'
        : 'Server-Wechselkurs',
      status: quote.status,
      isDemo: quote.isDemo,
    };
  }

  const draftPortfolio: DepotPortfolioState = {
    ...portfolio,
    cashEur: preview.remainingCashEur,
    positions: nextPositions,
    transactions: [transaction, ...portfolio.transactions],
    lastKnownQuotes: nextQuotes,
    lastKnownFxRates: nextFxRates,
    lastUpdatedAt: nowIso,
  };

  const snapshot = buildPortfolioSnapshot(draftPortfolio, 'buy', nowIso);
  return {
    portfolio: {
      ...draftPortfolio,
      snapshots: [...draftPortfolio.snapshots, snapshot],
    },
    transaction,
    preview,
  };
}

export function previewVirtualSell(params: {
  portfolio: DepotPortfolioState;
  symbol: string;
  quantityToSell: number;
  quote: MarketQuote | null | undefined;
  fxRateToEur?: number;
}): VirtualSellPreview {
  const { portfolio, symbol, quantityToSell, quote } = params;
  const position = portfolio.positions.find(
    (p) => p.symbol.toUpperCase() === symbol.trim().toUpperCase(),
  );

  const dummyPosition: DepotPosition = position ?? {
    symbol,
    name: symbol,
    assetType: 'Aktie',
    sector: '',
    region: '',
    currency: 'EUR',
    exchange: '',
    riskCategory: 'Hoch',
    quantity: 0,
    averagePurchasePriceOriginal: 0,
    averagePurchasePriceEur: 0,
    investedCostBasisEur: 0,
    updatedAt: '',
  };

  const fxRate =
    dummyPosition.currency === 'EUR' ? 1 : (params.fxRateToEur ?? 0);

  const buildInvalid = (
    errorCode: TradeValidationErrorCode,
    errorMessage: string,
  ): VirtualSellPreview => ({
    valid: false,
    errorCode,
    errorMessage,
    position: dummyPosition,
    quantitySold: 0,
    ownedQuantity: position?.quantity ?? 0,
    remainingQuantity: position?.quantity ?? 0,
    referenceMarketPriceOriginal: quote?.price ?? 0,
    referenceMarketPriceEur: 0,
    currency: dummyPosition.currency,
    fxRateToEur: fxRate,
    priceTimestamp: quote?.timestamp ?? '',
    dataStatus: quote?.status ?? 'unavailable',
    isDemo: quote?.isDemo ?? true,
    expectedProceedsEur: 0,
    costBasisRemovedEur: 0,
    realizedGainLossEur: 0,
    realizedGainLossPercent: 0,
    updatedCashEur: portfolio.cashEur,
  });

  if (!position || position.quantity <= 0) {
    return buildInvalid(
      'POSITION_NOT_FOUND',
      'Diese Position befindet sich nicht in deinem Übungsdepot.',
    );
  }

  if (!quote || !Number.isFinite(quote.price) || quote.price <= 0 || quote.status === 'unavailable') {
    return buildInvalid(
      'MISSING_PRICE',
      'Für dieses Wertpapier liegt aktuell kein gültiger Marktpreis vor. Ohne Referenzkurs kann kein Verkauf simuliert werden.',
    );
  }

  if (!Number.isFinite(fxRate) || fxRate <= 0) {
    return buildInvalid(
      'INVALID_FX_RATE',
      'Für die Währungsumrechnung liegt kein gültiger Wechselkurs vor.',
    );
  }

  const safeSellQty = roundQuantity(quantityToSell);
  if (!Number.isFinite(quantityToSell) || safeSellQty <= 0) {
    return buildInvalid(
      'INVALID_QUANTITY',
      'Bitte gib eine positive Verkaufs-Stückzahl größer als 0 ein.',
    );
  }

  if (safeSellQty > position.quantity) {
    return buildInvalid(
      'OVERSELLING',
      `Du kannst nicht mehr Anteile verkaufen, als du besitzt (Leerverkäufe sind ausgeschlossen). Aktueller Bestand: ${position.quantity.toLocaleString('de-DE')} Stück.`,
    );
  }

  const priceEur = roundCurrency(quote.price * fxRate);
  const expectedProceedsEur = roundCurrency(safeSellQty * priceEur);

  const isFullSale = safeSellQty === position.quantity;
  const costBasisRemovedEur = isFullSale
    ? position.investedCostBasisEur
    : roundCurrency(
        position.investedCostBasisEur * (safeSellQty / position.quantity),
      );

  const realizedGainLossEur = roundCurrency(
    expectedProceedsEur - costBasisRemovedEur,
  );
  const realizedGainLossPercent =
    costBasisRemovedEur > 0
      ? Math.round((realizedGainLossEur / costBasisRemovedEur) * 10000) / 100
      : 0;

  const remainingQuantity = roundQuantity(position.quantity - safeSellQty);
  const updatedCashEur = roundCurrency(portfolio.cashEur + expectedProceedsEur);

  return {
    valid: true,
    position,
    quantitySold: safeSellQty,
    ownedQuantity: position.quantity,
    remainingQuantity,
    referenceMarketPriceOriginal: quote.price,
    referenceMarketPriceEur: priceEur,
    currency: position.currency,
    fxRateToEur: fxRate,
    priceTimestamp: quote.timestamp,
    dataStatus: quote.status,
    isDemo: quote.isDemo,
    expectedProceedsEur,
    costBasisRemovedEur,
    realizedGainLossEur,
    realizedGainLossPercent,
    updatedCashEur,
  };
}

export function executeVirtualSell(params: {
  portfolio: DepotPortfolioState;
  symbol: string;
  quantityToSell: number;
  quote: MarketQuote;
  fxRateToEur?: number;
  executedAt?: string;
}): {
  portfolio: DepotPortfolioState;
  transaction: DepotTransaction;
  preview: VirtualSellPreview;
} {
  const preview = previewVirtualSell(params);
  if (!preview.valid) {
    throw new Error(preview.errorMessage ?? 'Ungültiger virtueller Verkaufsauftrag.');
  }

  const nowIso = params.executedAt ?? new Date().toISOString();
  const { portfolio, quote } = params;
  const pos = preview.position;

  const nextPositions: DepotPosition[] = [];
  for (const item of portfolio.positions) {
    if (item.symbol.toUpperCase() !== pos.symbol.toUpperCase()) {
      nextPositions.push(item);
      continue;
    }
    if (preview.remainingQuantity > 0) {
      const remainingCostBasisEur = roundCurrency(
        Math.max(0, item.investedCostBasisEur - preview.costBasisRemovedEur),
      );
      nextPositions.push({
        ...item,
        quantity: preview.remainingQuantity,
        investedCostBasisEur: remainingCostBasisEur,
        updatedAt: nowIso,
      });
    }
  }

  const transaction: DepotTransaction = {
    id: `tx-sell-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'SELL',
    symbol: pos.symbol,
    instrumentName: pos.name,
    assetType: pos.assetType,
    quantity: preview.quantitySold,
    priceOriginal: preview.referenceMarketPriceOriginal,
    currency: pos.currency,
    fxRateToEur: preview.fxRateToEur,
    priceEur: preview.referenceMarketPriceEur,
    totalAmountEur: preview.expectedProceedsEur,
    realizedGainLossEur: preview.realizedGainLossEur,
    priceTimestamp: preview.priceTimestamp,
    dataStatus: preview.dataStatus,
    executedAt: nowIso,
    isSimulated: true,
  };

  const nextQuotes = {
    ...portfolio.lastKnownQuotes,
    [pos.symbol.toUpperCase()]: quote,
  };

  const draftPortfolio: DepotPortfolioState = {
    ...portfolio,
    cashEur: preview.updatedCashEur,
    realizedGainLossTotalEur: roundCurrency(
      portfolio.realizedGainLossTotalEur + preview.realizedGainLossEur,
    ),
    positions: nextPositions,
    transactions: [transaction, ...portfolio.transactions],
    lastKnownQuotes: nextQuotes,
    lastUpdatedAt: nowIso,
  };

  const snapshot = buildPortfolioSnapshot(draftPortfolio, 'sell', nowIso);
  return {
    portfolio: {
      ...draftPortfolio,
      snapshots: [...draftPortfolio.snapshots, snapshot],
    },
    transaction,
    preview,
  };
}

export function buildPortfolioSnapshot(
  portfolio: DepotPortfolioState,
  reason: DepotSnapshot['reason'],
  timestampIso = new Date().toISOString(),
): DepotSnapshot {
  const valuation = evaluatePortfolioValuation(portfolio);
  const statuses = valuation.valuedPositions.map((p) => p.dataStatus);
  const dataStatus: MarketDataStatus =
    statuses.length === 0
      ? 'demo'
      : statuses.includes('demo')
        ? 'demo'
        : statuses[0] ?? 'delayed';

  return {
    id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: timestampIso,
    cashEur: valuation.cashEur,
    positionsValueEur: valuation.positionsMarketValueEur,
    totalValueEur: valuation.totalPortfolioValueEur,
    investedCostBasisEur: valuation.investedCostBasisEur,
    reason,
    dataStatus,
  };
}

export function evaluatePortfolioValuation(
  portfolio: DepotPortfolioState,
  overrideQuotes?: Record<string, MarketQuote | undefined>,
  overrideFxRates?: Record<string, ExchangeRateQuote | undefined>,
): PortfolioValuationSummary {
  const quotes = { ...portfolio.lastKnownQuotes, ...(overrideQuotes ?? {}) };
  const fxRates = { ...portfolio.lastKnownFxRates, ...(overrideFxRates ?? {}) };

  let investedCostBasisEur = 0;
  let positionsMarketValueEur = 0;
  let missingPriceCount = 0;

  const tempPositions = portfolio.positions.map((pos) => {
    const quote = quotes[pos.symbol.toUpperCase()];
    const hasValidQuote =
      Boolean(quote) &&
      Number.isFinite(quote!.price) &&
      quote!.price > 0 &&
      quote!.status !== 'unavailable';

    if (!hasValidQuote) {
      missingPriceCount += 1;
    }

    const fxObj =
      pos.currency === 'EUR' ? null : fxRates[`${pos.currency}_EUR`];
    const currentFxRateToEur =
      pos.currency === 'EUR'
        ? 1
        : fxObj && Number.isFinite(fxObj.rate) && fxObj.rate > 0
          ? fxObj.rate
          : pos.averagePurchasePriceOriginal > 0
            ? roundQuantity(pos.averagePurchasePriceEur / pos.averagePurchasePriceOriginal)
            : 1;

    const currentPriceOriginal = hasValidQuote
      ? quote!.price
      : pos.averagePurchasePriceOriginal;

    const currentPriceEur = hasValidQuote
      ? roundCurrency(currentPriceOriginal * currentFxRateToEur)
      : pos.averagePurchasePriceEur;

    const currentValueEur = roundCurrency(pos.quantity * currentPriceEur);
    const unrealizedGainLossEur = roundCurrency(
      currentValueEur - pos.investedCostBasisEur,
    );
    const unrealizedGainLossPercent =
      pos.investedCostBasisEur > 0
        ? Math.round((unrealizedGainLossEur / pos.investedCostBasisEur) * 10000) /
          100
        : 0;

    investedCostBasisEur = roundCurrency(
      investedCostBasisEur + pos.investedCostBasisEur,
    );
    positionsMarketValueEur = roundCurrency(
      positionsMarketValueEur + currentValueEur,
    );

    return {
      ...pos,
      currentPriceOriginal,
      currentPriceEur,
      currentFxRateToEur,
      currentValueEur,
      unrealizedGainLossEur,
      unrealizedGainLossPercent,
      priceTimestamp: quote?.timestamp ?? pos.updatedAt,
      dataStatus: hasValidQuote ? quote!.status : ('unavailable' as MarketDataStatus),
      isDemo: quote ? quote.isDemo : true,
      hasMissingPrice: !hasValidQuote,
    };
  });

  const cashEur = roundCurrency(portfolio.cashEur);
  const totalPortfolioValueEur = roundCurrency(
    cashEur + positionsMarketValueEur,
  );
  const unrealizedGainLossEur = roundCurrency(
    positionsMarketValueEur - investedCostBasisEur,
  );
  const unrealizedGainLossPercent =
    investedCostBasisEur > 0
      ? Math.round((unrealizedGainLossEur / investedCostBasisEur) * 10000) / 100
      : 0;

  const realizedGainLossEur = roundCurrency(portfolio.realizedGainLossTotalEur);
  const startingCashEur = roundCurrency(portfolio.startingCashEur);

  // Baseline definition: totalPortfolioValueEur vs startingCashEur
  const totalGainLossEur = roundCurrency(
    totalPortfolioValueEur - startingCashEur,
  );
  const totalPerformancePercent =
    startingCashEur > 0
      ? Math.round((totalGainLossEur / startingCashEur) * 10000) / 100
      : 0;

  const valuedPositions: ValuedPosition[] = tempPositions
    .map((p) => ({
      ...p,
      weightOfPortfolioPercent:
        totalPortfolioValueEur > 0
          ? Math.round((p.currentValueEur / totalPortfolioValueEur) * 1000) / 10
          : 0,
      weightOfInvestedPercent:
        positionsMarketValueEur > 0
          ? Math.round((p.currentValueEur / positionsMarketValueEur) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.currentValueEur - a.currentValueEur);

  const cashSharePercent =
    totalPortfolioValueEur > 0
      ? Math.round((cashEur / totalPortfolioValueEur) * 1000) / 10
      : 100;
  const investedSharePercent =
    totalPortfolioValueEur > 0
      ? Math.max(0, Math.round((100 - cashSharePercent) * 10) / 10)
      : 0;

  const largestPos = valuedPositions[0] ?? null;
  const largestPositionWeightPercent = largestPos
    ? largestPos.weightOfPortfolioPercent
    : 0;
  const largestPositionName = largestPos ? largestPos.name : null;

  // Build Asset Class Allocation (including Cash)
  const assetGroups = new Map<string, number>();
  for (const pos of valuedPositions) {
    assetGroups.set(
      pos.assetType,
      roundCurrency((assetGroups.get(pos.assetType) ?? 0) + pos.currentValueEur),
    );
  }
  const assetAllocation: AllocationBucket[] = Array.from(assetGroups.entries())
    .map(([assetType, val]) => ({
      key: assetType,
      label:
        assetType === 'ETF'
          ? 'Aktien-ETFs (breit gestreut)'
          : assetType === 'Aktie'
            ? 'Einzelaktien'
            : assetType === 'Anleihen-ETF'
              ? 'Anleihen-ETFs'
              : 'Rohstoffe / Edelmetalle',
      valueEur: val,
      shareOfPortfolioPercent:
        totalPortfolioValueEur > 0
          ? Math.round((val / totalPortfolioValueEur) * 1000) / 10
          : 0,
      shareOfInvestedPercent:
        positionsMarketValueEur > 0
          ? Math.round((val / positionsMarketValueEur) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.valueEur - a.valueEur);

  if (cashEur > 0) {
    assetAllocation.push({
      key: 'CASH',
      label: 'Verfügbares Übungsgeld (Cash)',
      valueEur: cashEur,
      shareOfPortfolioPercent: cashSharePercent,
      shareOfInvestedPercent: 0,
    });
  }

  // Build Sector Allocation (for invested positions)
  const sectorGroups = new Map<string, number>();
  for (const pos of valuedPositions) {
    sectorGroups.set(
      pos.sector,
      roundCurrency((sectorGroups.get(pos.sector) ?? 0) + pos.currentValueEur),
    );
  }
  const sectorAllocation: AllocationBucket[] = Array.from(sectorGroups.entries())
    .map(([sector, val]) => ({
      key: sector,
      label: sector,
      valueEur: val,
      shareOfPortfolioPercent:
        totalPortfolioValueEur > 0
          ? Math.round((val / totalPortfolioValueEur) * 1000) / 10
          : 0,
      shareOfInvestedPercent:
        positionsMarketValueEur > 0
          ? Math.round((val / positionsMarketValueEur) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.valueEur - a.valueEur);

  const allInsights = buildDynamicEducationalInsights({
    valuedPositions,
    sectorAllocation,
    totalGainLossEur,
    cashSharePercent,
  });

  const primaryInsight = allInsights[0]!;

  return {
    portfolioName: portfolio.portfolioName,
    startingCashEur,
    cashEur,
    investedCostBasisEur,
    positionsMarketValueEur,
    totalPortfolioValueEur,
    unrealizedGainLossEur,
    unrealizedGainLossPercent,
    realizedGainLossEur,
    totalGainLossEur,
    totalPerformancePercent,
    cashSharePercent,
    investedSharePercent,
    largestPositionWeightPercent,
    largestPositionName,
    valuedPositions,
    assetAllocation,
    sectorAllocation,
    primaryInsight,
    allInsights,
    missingPriceCount,
  };
}

function buildDynamicEducationalInsights(params: {
  valuedPositions: ValuedPosition[];
  sectorAllocation: AllocationBucket[];
  totalGainLossEur: number;
  cashSharePercent: number;
}): EducationalPortfolioInsight[] {
  const { valuedPositions, sectorAllocation, totalGainLossEur, cashSharePercent } =
    params;
  const insights: EducationalPortfolioInsight[] = [];

  if (valuedPositions.length === 0) {
    insights.push({
      id: 'empty-portfolio',
      tone: 'info',
      title: 'Dein Übungsdepot liegt noch zu 100 % in virtuellem Bargeld.',
      explanation:
        'Starte mit einem ersten virtuellen Kauf – vergleiche zum Beispiel einen breit gestreuten Welt-ETF mit einer einzelnen Aktie, um deren unterschiedliche Schwankungen zu beobachten.',
      relatedLessonRoute: '/anlageklassen',
      relatedLessonLabel: 'Lektion „Anlageklassen“ öffnen',
    });
    return insights;
  }

  const largest = valuedPositions[0]!;
  const singleStocks = valuedPositions.filter((p) => p.assetType === 'Aktie');
  const etfs = valuedPositions.filter((p) => p.assetType === 'ETF');

  // 1. Single stock concentration warning
  const largestSingleStock = singleStocks[0];
  if (largestSingleStock && largestSingleStock.weightOfPortfolioPercent >= 25) {
    insights.push({
      id: 'single-stock-concentration',
      tone: 'warning',
      title: `Eine einzelne Aktie (${largestSingleStock.name}) macht ${formatPercent(largestSingleStock.weightOfPortfolioPercent, 1)} deines Depots aus.`,
      explanation:
        'Wenn eine einzige Firma einen so großen Anteil bildet, entsteht ein Klumpenrisiko: Schlechte Nachrichten bei diesem Unternehmen ziehen sofort dein gesamtes Depot nach unten.',
      relatedLessonRoute: '/grundlagen',
      relatedLessonLabel: 'Risikostreuung in „Grundlagen“ nachlesen',
    });
  } else if (largest.weightOfInvestedPercent >= 40 && valuedPositions.length >= 2) {
    insights.push({
      id: 'largest-position-share',
      tone: largest.assetType === 'Aktie' ? 'warning' : 'info',
      title: `Eine einzelne Position (${largest.name}) macht ${formatPercent(largest.weightOfInvestedPercent, 1)} deiner angelegten Wertpapiere aus.`,
      explanation:
        largest.assetType === 'ETF'
          ? 'Da es sich um einen breit gestreuten ETF handelt, stecken dahinter bereits hunderte Unternehmen. Bei einer einzelnen Aktie wäre dieser Anteil ein hohes Klumpenrisiko.'
          : 'Achte darauf, wie stark diese einzelne Position das Gesamtergebnis deines Depots bestimmt.',
      relatedLessonRoute: '/anlageklassen',
      relatedLessonLabel: 'ETF vs. Einzelaktie vergleichen',
    });
  }

  // 2. Sector concentration / thematic overlap
  const topNonBroadSector = sectorAllocation.find(
    (s) => !s.key.includes('Breit gestreut'),
  );
  if (topNonBroadSector && topNonBroadSector.shareOfInvestedPercent >= 45 && singleStocks.length >= 1) {
    insights.push({
      id: 'sector-concentration',
      tone: 'warning',
      title: `Dein Depot ist derzeit stark auf eine Branche konzentriert (${topNonBroadSector.label}: ${formatPercent(topNonBroadSector.shareOfInvestedPercent, 1)}).`,
      explanation:
        singleStocks.length >= 2
          ? 'Mehr Positionen bedeuten nicht automatisch gute Diversifikation: Wenn mehrere Einzelaktien aus derselben Branche stammen, fallen sie bei Branchenkrisen oft gleichzeitig.'
          : 'Einzelne Branchen können über Jahre hinweg hinter dem Gesamtmarkt zurückbleiben.',
      relatedLessonRoute: '/grundlagen',
      relatedLessonLabel: 'Warum breite Streuung schützt',
    });
  }

  // 3. Portfolio decline reassurance
  if (totalGainLossEur < 0) {
    insights.push({
      id: 'negative-fluctuation',
      tone: 'info',
      title: `Der Wert deines Depots ist um ${formatEuro(Math.abs(totalGainLossEur), 2)} gefallen. Kurzfristige Schwankungen sind normal.`,
      explanation:
        'An der Börse bewegen sich Kurse niemals wie auf einer geraden Linie. Buchverluste entstehen erst dann real, wenn man in einer Schwächephase hektisch verkauft.',
      relatedLessonRoute: '/zinseszins',
      relatedLessonLabel: 'Glatte Modellkurve vs. Börsenalltag',
    });
  }

  // 4. ETF + Single Stock direct comparison insight
  if (etfs.length > 0 && singleStocks.length > 0) {
    insights.push({
      id: 'etf-vs-stock-active',
      tone: 'info',
      title: 'Guter Praxisvergleich: Du hältst sowohl breit gestreute ETFs als auch Einzelaktien.',
      explanation:
        'Beobachte beim Aktualisieren der Kurse oder in verschiedenen Marktszenarien, wie unterschiedlich stark deine Einzelaktien im Vergleich zum Welt-ETF ausschlagen.',
      relatedLessonRoute: '/anlageklassen',
      relatedLessonLabel: 'Hintergrund zu Anlageklassen',
    });
  }

  // 5. Fallback general insight
  if (insights.length === 0) {
    insights.push({
      id: 'balanced-overview',
      tone: 'info',
      title:
        cashSharePercent > 60
          ? `Du hältst aktuell noch ${formatPercent(cashSharePercent, 1)} als virtuelle Barreserve.`
          : `Dein größter Baustein ist aktuell ${largest.name} (${formatPercent(largest.weightOfPortfolioPercent, 1)} des Depots).`,
      explanation:
        'Nutze das Übungsdepot, um risikofrei zu testen, wie sich Nachkäufe auf den durchschnittlichen Kaufpreis und die Gewichtung deiner Positionen auswirken.',
      relatedLessonRoute: '/anlageklassen',
      relatedLessonLabel: 'Mehr über Anlageklassen erfahren',
    });
  }

  return insights;
}

export function generateDeterministicWeeklyReport(
  portfolio: DepotPortfolioState,
  valuation: PortfolioValuationSummary,
): DeterministicWeeklyReport {
  if (
    !portfolio.isInitialized ||
    portfolio.positions.length === 0 ||
    portfolio.snapshots.length < 2
  ) {
    return {
      hasEnoughData: false,
      emptyMessage: 'Noch nicht genügend Daten für einen Wochenbericht.',
      generatedAt: new Date().toISOString(),
      baselineTimestamp: portfolio.createdAt,
      latestTimestamp: portfolio.lastUpdatedAt,
      valueChangeEur: 0,
      valueChangePercent: 0,
      strongestPosition: null,
      weakestPosition: null,
      largestWeightPosition: null,
      diversificationNotice: '',
      dataCompletenessNotice: '',
      transactionCount: portfolio.transactions.length,
    };
  }

  const firstSnapshot = portfolio.snapshots[0]!;
  const latestSnapshot = portfolio.snapshots[portfolio.snapshots.length - 1]!;

  const valueChangeEur = roundCurrency(
    valuation.totalPortfolioValueEur - firstSnapshot.totalValueEur,
  );
  const valueChangePercent =
    firstSnapshot.totalValueEur > 0
      ? Math.round((valueChangeEur / firstSnapshot.totalValueEur) * 10000) / 100
      : 0;

  const sortedByPerf = [...valuation.valuedPositions].sort(
    (a, b) => b.unrealizedGainLossPercent - a.unrealizedGainLossPercent,
  );

  const topPos = sortedByPerf[0] ?? null;
  const bottomPos = sortedByPerf[sortedByPerf.length - 1] ?? null;
  const largestWeight = valuation.valuedPositions[0] ?? null;

  const singleStockShare = valuation.valuedPositions
    .filter((p) => p.assetType === 'Aktie')
    .reduce((acc, p) => acc + p.weightOfPortfolioPercent, 0);

  let diversificationNotice =
    'Deine Positionen verteilen sich moderat. Prüfe dennoch regelmäßig, ob sich hinter verschiedenen Wertpapieren dieselben Branchen verbergen.';
  if (largestWeight && largestWeight.weightOfPortfolioPercent >= 35) {
    diversificationNotice = `Hohe Einzelgewichtung: ${largestWeight.name} macht ${formatPercent(largestWeight.weightOfPortfolioPercent, 1)} des Gesamtdepots aus.`;
  } else if (singleStockShare >= 60) {
    diversificationNotice = `Hoher Einzelaktien-Anteil (${formatPercent(singleStockShare, 1)} des Depots): Trotz mehrerer Positionen können thematische Überschneidungen (z. B. Technologie, Robotik oder Biotechnologie) das Schwankungsrisiko erhöhen.`;
  }

  const hasDemoPositions = valuation.valuedPositions.some((p) => p.isDemo);
  const dataCompletenessNotice =
    valuation.missingPriceCount > 0
      ? `Für ${valuation.missingPriceCount} Position(en) fehlt aktuell ein abrufbarer Marktpreis; dort wird der letzte bekannte Einstandskurs verwendet.`
      : hasDemoPositions
        ? 'Bericht basiert auf pädagogischen Beispieldaten (keine Live-Börsenkurse) sowie deinen simulierten Transaktionen.'
        : 'Bericht basiert auf den zuletzt abgerufenen verzögerten Marktdaten und deinen simulierten Transaktionen.';

  return {
    hasEnoughData: true,
    generatedAt: new Date().toISOString(),
    baselineTimestamp: firstSnapshot.timestamp,
    latestTimestamp: latestSnapshot.timestamp,
    valueChangeEur,
    valueChangePercent,
    strongestPosition: topPos
      ? {
          name: topPos.name,
          symbol: topPos.symbol,
          gainLossPercent: topPos.unrealizedGainLossPercent,
          gainLossEur: topPos.unrealizedGainLossEur,
        }
      : null,
    weakestPosition:
      bottomPos && bottomPos.symbol !== topPos?.symbol
        ? {
            name: bottomPos.name,
            symbol: bottomPos.symbol,
            gainLossPercent: bottomPos.unrealizedGainLossPercent,
            gainLossEur: bottomPos.unrealizedGainLossEur,
          }
        : null,
    largestWeightPosition: largestWeight
      ? {
          name: largestWeight.name,
          symbol: largestWeight.symbol,
          weightPercent: largestWeight.weightOfPortfolioPercent,
        }
      : null,
    diversificationNotice,
    dataCompletenessNotice,
    transactionCount: portfolio.transactions.length,
  };
}
