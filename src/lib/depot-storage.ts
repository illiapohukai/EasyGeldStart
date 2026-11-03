import {
  buildPortfolioSnapshot,
  type DepotPortfolioState,
  type DepotPosition,
  type DepotSnapshot,
  type DepotTransaction,
  roundCurrency,
  roundQuantity,
} from './depot-calculations';
import type { ExchangeRateQuote, MarketQuote } from './market-types';
import type { StorageLike } from './storage';

export const DEPOT_STORAGE_KEY = 'geldstart_depot_v1';

export const STARTING_CASH_PRESETS = [
  {
    amount: 1000,
    label: '1.000 €',
    subtitle: 'Kompakter Einstieg',
    description: 'Ideal, um mit ersten Sparplan-Beträgen (z. B. 50 € bis 250 €) zu üben.',
  },
  {
    amount: 5000,
    label: '5.000 €',
    subtitle: 'Empfohlener Standard',
    description: 'Gute Größe, um ein ausgewogenes Depot aus Welt-ETF und 2–3 Einzelwerten zu testen.',
  },
  {
    amount: 10000,
    label: '10.000 €',
    subtitle: 'Größeres Übungsbudget',
    description: 'Viel Spielraum zum Vergleichen verschiedener Anlageklassen, Branchen und Währungen.',
  },
  {
    amount: 25000,
    label: '25.000 €',
    subtitle: 'Zukunftsdepot-Referenz',
    description: 'Entspricht dem früheren 25.000-Startwert für umfangreichere Diversifikations-Tests.',
  },
] as const;

export function createUninitializedDepotState(): DepotPortfolioState {
  const nowIso = new Date().toISOString();
  return {
    version: 1,
    isInitialized: false,
    portfolioName: 'Mein Übungsdepot',
    baseCurrency: 'EUR',
    startingCashEur: 5000,
    cashEur: 5000,
    realizedGainLossTotalEur: 0,
    positions: [],
    transactions: [],
    lastKnownQuotes: {},
    lastKnownFxRates: {},
    snapshots: [],
    createdAt: nowIso,
    lastUpdatedAt: nowIso,
  };
}

export function initializeVirtualPortfolio(params: {
  startingCashEur: number;
  portfolioName?: string;
  createdAt?: string;
}): DepotPortfolioState {
  const safeStart = roundCurrency(
    Number.isFinite(params.startingCashEur) && params.startingCashEur >= 100
      ? Math.min(1000000, params.startingCashEur)
      : 5000,
  );
  const name =
    params.portfolioName && params.portfolioName.trim().length > 0
      ? params.portfolioName.trim().slice(0, 50)
      : 'Mein Übungsdepot';
  const nowIso = params.createdAt ?? new Date().toISOString();

  const initial: DepotPortfolioState = {
    version: 1,
    isInitialized: true,
    portfolioName: name,
    baseCurrency: 'EUR',
    startingCashEur: safeStart,
    cashEur: safeStart,
    realizedGainLossTotalEur: 0,
    positions: [],
    transactions: [],
    lastKnownQuotes: {},
    lastKnownFxRates: {},
    snapshots: [],
    createdAt: nowIso,
    lastUpdatedAt: nowIso,
  };

  const firstSnapshot = buildPortfolioSnapshot(initial, 'creation', nowIso);
  return {
    ...initial,
    snapshots: [firstSnapshot],
  };
}

function getSafeStorage(customStorage?: StorageLike | null): StorageLike | null {
  if (customStorage !== undefined) return customStorage;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export function sanitizeDepotState(raw: unknown): DepotPortfolioState {
  const fallback = createUninitializedDepotState();
  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const candidate = raw as Record<string, unknown>;
  const isInitialized = Boolean(candidate.isInitialized);
  if (!isInitialized) {
    return fallback;
  }

  const portfolioName =
    typeof candidate.portfolioName === 'string' && candidate.portfolioName.trim().length > 0
      ? candidate.portfolioName.trim().slice(0, 50)
      : 'Mein Übungsdepot';

  const startingCashEur =
    typeof candidate.startingCashEur === 'number' &&
    Number.isFinite(candidate.startingCashEur) &&
    candidate.startingCashEur > 0
      ? roundCurrency(candidate.startingCashEur)
      : 5000;

  const cashEur =
    typeof candidate.cashEur === 'number' &&
    Number.isFinite(candidate.cashEur) &&
    candidate.cashEur >= 0
      ? roundCurrency(candidate.cashEur)
      : startingCashEur;

  const realizedGainLossTotalEur =
    typeof candidate.realizedGainLossTotalEur === 'number' &&
    Number.isFinite(candidate.realizedGainLossTotalEur)
      ? roundCurrency(candidate.realizedGainLossTotalEur)
      : 0;

  const positions: DepotPosition[] = [];
  if (Array.isArray(candidate.positions)) {
    for (const rawPos of candidate.positions) {
      if (!rawPos || typeof rawPos !== 'object') continue;
      const p = rawPos as Record<string, unknown>;
      if (
        typeof p.symbol === 'string' &&
        p.symbol.trim().length > 0 &&
        typeof p.name === 'string' &&
        typeof p.quantity === 'number' &&
        Number.isFinite(p.quantity) &&
        p.quantity > 0
      ) {
        const qty = roundQuantity(p.quantity);
        const avgEur =
          typeof p.averagePurchasePriceEur === 'number' &&
          Number.isFinite(p.averagePurchasePriceEur) &&
          p.averagePurchasePriceEur > 0
            ? roundCurrency(p.averagePurchasePriceEur)
            : 1;
        const avgOrig =
          typeof p.averagePurchasePriceOriginal === 'number' &&
          Number.isFinite(p.averagePurchasePriceOriginal) &&
          p.averagePurchasePriceOriginal > 0
            ? roundCurrency(p.averagePurchasePriceOriginal)
            : avgEur;
        const costBasis =
          typeof p.investedCostBasisEur === 'number' &&
          Number.isFinite(p.investedCostBasisEur) &&
          p.investedCostBasisEur >= 0
            ? roundCurrency(p.investedCostBasisEur)
            : roundCurrency(qty * avgEur);

        positions.push({
          symbol: p.symbol.trim().toUpperCase(),
          name: p.name,
          assetType:
            p.assetType === 'ETF' ||
            p.assetType === 'Aktie' ||
            p.assetType === 'Anleihen-ETF' ||
            p.assetType === 'Rohstoff-ETC'
              ? p.assetType
              : 'Aktie',
          sector: typeof p.sector === 'string' ? p.sector : 'Sonstige',
          region: typeof p.region === 'string' ? p.region : 'Global',
          currency: p.currency === 'USD' ? 'USD' : 'EUR',
          exchange: typeof p.exchange === 'string' ? p.exchange : 'XETRA',
          riskCategory:
            p.riskCategory === 'Niedrig bis mittel' ||
            p.riskCategory === 'Mittel' ||
            p.riskCategory === 'Mittel bis hoch' ||
            p.riskCategory === 'Hoch' ||
            p.riskCategory === 'Sehr hoch'
              ? p.riskCategory
              : 'Hoch',
          quantity: qty,
          averagePurchasePriceOriginal: avgOrig,
          averagePurchasePriceEur: avgEur,
          investedCostBasisEur: costBasis,
          updatedAt:
            typeof p.updatedAt === 'string' ? p.updatedAt : new Date().toISOString(),
        });
      }
    }
  }

  const transactions: DepotTransaction[] = [];
  if (Array.isArray(candidate.transactions)) {
    for (const rawTx of candidate.transactions) {
      if (!rawTx || typeof rawTx !== 'object') continue;
      const t = rawTx as Record<string, unknown>;
      if (
        typeof t.id === 'string' &&
        (t.type === 'BUY' || t.type === 'SELL') &&
        typeof t.symbol === 'string' &&
        typeof t.quantity === 'number' &&
        Number.isFinite(t.quantity) &&
        t.quantity > 0
      ) {
        transactions.push({
          id: t.id,
          type: t.type,
          symbol: t.symbol.toUpperCase(),
          instrumentName:
            typeof t.instrumentName === 'string' ? t.instrumentName : t.symbol,
          assetType:
            t.assetType === 'ETF' ||
            t.assetType === 'Aktie' ||
            t.assetType === 'Anleihen-ETF' ||
            t.assetType === 'Rohstoff-ETC'
              ? t.assetType
              : 'Aktie',
          quantity: roundQuantity(t.quantity),
          priceOriginal:
            typeof t.priceOriginal === 'number' && Number.isFinite(t.priceOriginal)
              ? roundCurrency(t.priceOriginal)
              : 0,
          currency: t.currency === 'USD' ? 'USD' : 'EUR',
          fxRateToEur:
            typeof t.fxRateToEur === 'number' && Number.isFinite(t.fxRateToEur) && t.fxRateToEur > 0
              ? t.fxRateToEur
              : 1,
          priceEur:
            typeof t.priceEur === 'number' && Number.isFinite(t.priceEur)
              ? roundCurrency(t.priceEur)
              : 0,
          totalAmountEur:
            typeof t.totalAmountEur === 'number' && Number.isFinite(t.totalAmountEur)
              ? roundCurrency(t.totalAmountEur)
              : 0,
          realizedGainLossEur:
            typeof t.realizedGainLossEur === 'number' &&
            Number.isFinite(t.realizedGainLossEur)
              ? roundCurrency(t.realizedGainLossEur)
              : undefined,
          priceTimestamp:
            typeof t.priceTimestamp === 'string'
              ? t.priceTimestamp
              : new Date().toISOString(),
          dataStatus:
            t.dataStatus === 'real-time' ||
            t.dataStatus === 'delayed' ||
            t.dataStatus === 'end-of-day' ||
            t.dataStatus === 'cached' ||
            t.dataStatus === 'demo' ||
            t.dataStatus === 'unavailable'
              ? t.dataStatus
              : 'demo',
          executedAt:
            typeof t.executedAt === 'string' ? t.executedAt : new Date().toISOString(),
          isSimulated: true,
        });
      }
    }
  }

  const lastKnownQuotes: Record<string, MarketQuote> = {};
  if (candidate.lastKnownQuotes && typeof candidate.lastKnownQuotes === 'object') {
    for (const [sym, qVal] of Object.entries(
      candidate.lastKnownQuotes as Record<string, unknown>,
    )) {
      if (qVal && typeof qVal === 'object') {
        const q = qVal as Record<string, unknown>;
        if (typeof q.price === 'number' && Number.isFinite(q.price) && q.price > 0) {
          lastKnownQuotes[sym.toUpperCase()] = {
            symbol: sym.toUpperCase(),
            price: roundCurrency(q.price),
            previousClose:
              typeof q.previousClose === 'number' && Number.isFinite(q.previousClose)
                ? roundCurrency(q.previousClose)
                : roundCurrency(q.price),
            changeAbsolute:
              typeof q.changeAbsolute === 'number' && Number.isFinite(q.changeAbsolute)
                ? roundCurrency(q.changeAbsolute)
                : 0,
            changePercent:
              typeof q.changePercent === 'number' && Number.isFinite(q.changePercent)
                ? q.changePercent
                : 0,
            currency: q.currency === 'USD' ? 'USD' : 'EUR',
            exchange: typeof q.exchange === 'string' ? q.exchange : 'XETRA',
            timestamp:
              typeof q.timestamp === 'string' ? q.timestamp : new Date().toISOString(),
            status:
              q.status === 'real-time' ||
              q.status === 'delayed' ||
              q.status === 'end-of-day' ||
              q.status === 'cached' ||
              q.status === 'demo' ||
              q.status === 'unavailable'
                ? q.status
                : 'demo',
            providerName:
              typeof q.providerName === 'string'
                ? q.providerName
                : 'Beispieldaten – keine aktuellen Marktdaten',
            isDemo: typeof q.isDemo === 'boolean' ? q.isDemo : true,
          };
        }
      }
    }
  }

  const lastKnownFxRates: Record<string, ExchangeRateQuote> = {};
  if (candidate.lastKnownFxRates && typeof candidate.lastKnownFxRates === 'object') {
    for (const [k, fxVal] of Object.entries(
      candidate.lastKnownFxRates as Record<string, unknown>,
    )) {
      if (fxVal && typeof fxVal === 'object') {
        const fx = fxVal as Record<string, unknown>;
        if (typeof fx.rate === 'number' && Number.isFinite(fx.rate) && fx.rate > 0) {
          lastKnownFxRates[k] = {
            from: fx.from === 'USD' ? 'USD' : 'EUR',
            to: fx.to === 'USD' ? 'USD' : 'EUR',
            rate: fx.rate,
            timestamp:
              typeof fx.timestamp === 'string' ? fx.timestamp : new Date().toISOString(),
            source: typeof fx.source === 'string' ? fx.source : 'Wechselkurs',
            status: 'demo',
            isDemo: typeof fx.isDemo === 'boolean' ? fx.isDemo : true,
          };
        }
      }
    }
  }

  const snapshots: DepotSnapshot[] = [];
  if (Array.isArray(candidate.snapshots)) {
    for (const rawSnap of candidate.snapshots) {
      if (!rawSnap || typeof rawSnap !== 'object') continue;
      const s = rawSnap as Record<string, unknown>;
      if (
        typeof s.timestamp === 'string' &&
        typeof s.totalValueEur === 'number' &&
        Number.isFinite(s.totalValueEur)
      ) {
        snapshots.push({
          id: typeof s.id === 'string' ? s.id : `snap-${snapshots.length}`,
          timestamp: s.timestamp,
          cashEur:
            typeof s.cashEur === 'number' && Number.isFinite(s.cashEur)
              ? roundCurrency(s.cashEur)
              : cashEur,
          positionsValueEur:
            typeof s.positionsValueEur === 'number' &&
            Number.isFinite(s.positionsValueEur)
              ? roundCurrency(s.positionsValueEur)
              : 0,
          totalValueEur: roundCurrency(s.totalValueEur),
          investedCostBasisEur:
            typeof s.investedCostBasisEur === 'number' &&
            Number.isFinite(s.investedCostBasisEur)
              ? roundCurrency(s.investedCostBasisEur)
              : 0,
          reason:
            s.reason === 'creation' ||
            s.reason === 'buy' ||
            s.reason === 'sell' ||
            s.reason === 'refresh'
              ? s.reason
              : 'refresh',
          dataStatus: 'demo',
        });
      }
    }
  }

  const createdAt =
    typeof candidate.createdAt === 'string'
      ? candidate.createdAt
      : new Date().toISOString();
  const lastUpdatedAt =
    typeof candidate.lastUpdatedAt === 'string'
      ? candidate.lastUpdatedAt
      : createdAt;

  return {
    version: 1,
    isInitialized: true,
    portfolioName,
    baseCurrency: 'EUR',
    startingCashEur,
    cashEur,
    realizedGainLossTotalEur,
    positions,
    transactions,
    lastKnownQuotes,
    lastKnownFxRates,
    snapshots,
    createdAt,
    lastUpdatedAt,
  };
}

export function loadDepotState(customStorage?: StorageLike | null): DepotPortfolioState {
  const storage = getSafeStorage(customStorage);
  if (!storage) return createUninitializedDepotState();

  try {
    const raw = storage.getItem(DEPOT_STORAGE_KEY);
    if (!raw) return createUninitializedDepotState();
    const parsed: unknown = JSON.parse(raw);
    return sanitizeDepotState(parsed);
  } catch {
    return createUninitializedDepotState();
  }
}

export function saveDepotState(
  state: DepotPortfolioState,
  customStorage?: StorageLike | null,
): boolean {
  const storage = getSafeStorage(customStorage);
  if (!storage) return false;

  try {
    if (!state.isInitialized) {
      storage.removeItem(DEPOT_STORAGE_KEY);
      return true;
    }
    const sanitized = sanitizeDepotState(state);
    storage.setItem(DEPOT_STORAGE_KEY, JSON.stringify(sanitized));
    return true;
  } catch {
    return false;
  }
}

export function resetDepotStorage(
  customStorage?: StorageLike | null,
): DepotPortfolioState {
  const storage = getSafeStorage(customStorage);
  if (storage) {
    try {
      storage.removeItem(DEPOT_STORAGE_KEY);
    } catch {
      // Ignore in restricted storage environments
    }
  }
  return createUninitializedDepotState();
}
