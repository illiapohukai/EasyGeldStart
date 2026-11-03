import {
  DEMO_STATUS_LABEL,
  getDemoExchangeRate,
  getDemoHistoricalSeries,
  getDemoInstrumentMetadata,
  getDemoQuote,
  searchDemoInstruments,
} from './market-demo-adapter';
import type {
  ExchangeRateQuote,
  HistoricalRange,
  HistoricalSeries,
  InstrumentAssetType,
  InstrumentMetadata,
  MarketDataService,
  MarketDataStatus,
  MarketQuote,
  MarketServiceErrorCode,
  ProviderStatusInfo,
  SupportedCurrency,
} from './market-types';

export class MarketServiceException extends Error {
  readonly code: MarketServiceErrorCode;
  readonly retryAfterSeconds?: number;

  constructor(code: MarketServiceErrorCode, message: string, retryAfterSeconds?: number) {
    super(message);
    this.name = 'MarketServiceException';
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function formatMarketDataStatusBadge(
  status: MarketDataStatus,
  isDemo?: boolean,
): {
  shortText: string;
  detailText: string;
  tone: 'demo' | 'live' | 'delayed' | 'cached' | 'unavailable';
} {
  if (isDemo || status === 'demo') {
    return {
      shortText: DEMO_STATUS_LABEL,
      detailText:
        'Bildungs-Demomodus: Alle Kurse sind pädagogische Beispieldaten und keine aktuellen Börsenkurse.',
      tone: 'demo',
    };
  }

  switch (status) {
    case 'real-time':
      return {
        shortText: 'Echtzeit-Kursdaten',
        detailText: 'Vom Kursdatenanbieter als Echtzeit-Indikation geliefert (kann von ausführbaren Börsenpreisen abweichen).',
        tone: 'live',
      };
    case 'delayed':
      return {
        shortText: 'Verzögerte Marktdaten (ca. 15 Min.)',
        detailText: 'Börsenkurse werden zeitverzögert bereitgestellt und weichen von ausführbaren Marktpreisen ab.',
        tone: 'delayed',
      };
    case 'end-of-day':
      return {
        shortText: 'Tagesschlusskurs (End-of-Day)',
        detailText: 'Letzter verfügbarer Börsenschlusskurs des Handelsplatzes.',
        tone: 'delayed',
      };
    case 'cached':
      return {
        shortText: 'Zwischengespeicherter Kurs (Cache)',
        detailText: 'Zuletzt abgerufener Kurs aus dem Zwischenspeicher zur Schonung des Abfragelimits.',
        tone: 'cached',
      };
    case 'unavailable':
    default:
      return {
        shortText: 'Kursdaten derzeit nicht verfügbar',
        detailText: 'Für dieses Wertpapier konnte aktuell kein Marktpreis abgerufen werden.',
        tone: 'unavailable',
      };
  }
}

const QUOTE_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes client-side cache
const quoteCache = new Map<string, { quote: MarketQuote; fetchedAtMs: number }>();
const fxCache = new Map<string, { fx: ExchangeRateQuote; fetchedAtMs: number }>();
let cachedProviderStatus: ProviderStatusInfo | null = null;

export function clearMarketClientCache(): void {
  quoteCache.clear();
  fxCache.clear();
  cachedProviderStatus = null;
}

class DefaultMarketDataService implements MarketDataService {
  private forcedSimulatedError: MarketServiceErrorCode | null = null;

  /**
   * Allows testing loading/error/rate-limit/offline UI states deterministically
   */
  public setSimulatedErrorState(code: MarketServiceErrorCode | null): void {
    this.forcedSimulatedError = code;
  }

  public getSimulatedErrorState(): MarketServiceErrorCode | null {
    return this.forcedSimulatedError;
  }

  private checkSimulatedError(): void {
    if (!this.forcedSimulatedError) return;
    switch (this.forcedSimulatedError) {
      case 'RATE_LIMIT':
        throw new MarketServiceException(
          'RATE_LIMIT',
          'Abfragelimit des Kursdatenanbieters erreicht (Rate-Limit). Bitte warte einen Moment vor der nächsten Aktualisierung.',
          60,
        );
      case 'OFFLINE':
        throw new MarketServiceException(
          'OFFLINE',
          'Keine Internetverbindung erkannt. Es werden die zuletzt lokal gespeicherten Kurse angezeigt.',
        );
      case 'PROVIDER_ERROR':
        throw new MarketServiceException(
          'PROVIDER_ERROR',
          'Der externe Marktdaten-Dienst antwortet derzeit nicht. Es werden keine gefälschten Live-Kurse erzeugt.',
        );
      case 'UNSUPPORTED_SYMBOL':
        throw new MarketServiceException(
          'UNSUPPORTED_SYMBOL',
          'Dieses Wertpapier-Symbol wird vom Kursdatenanbieter im aktuellen Tarif nicht unterstützt.',
        );
      case 'STALE_DATA':
        throw new MarketServiceException(
          'STALE_DATA',
          'Die abgerufenen Marktdaten sind älter als erwartet (veralteter Datenstand).',
        );
    }
  }

  async getProviderStatus(): Promise<ProviderStatusInfo> {
    if (cachedProviderStatus) {
      return cachedProviderStatus;
    }

    try {
      const response = await fetch('/api/market/status', {
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        const data = (await response.json()) as Partial<ProviderStatusInfo>;
        if (data && typeof data.configured === 'boolean') {
          cachedProviderStatus = {
            mode: data.configured ? 'live_provider' : 'demo',
            configured: data.configured,
            providerName:
              data.providerName ||
              (data.configured ? 'Twelve Data API (Server-Proxy)' : DEMO_STATUS_LABEL),
            defaultStatus: data.configured ? (data.defaultStatus ?? 'delayed') : 'demo',
            statusLabel:
              data.statusLabel ||
              (data.configured
                ? 'Verzögerte / Tagesschluss-Marktdaten über Server-Proxy'
                : DEMO_STATUS_LABEL),
            disclaimerLabel:
              'Nur zu Bildungszwecken – keine Anlageberatung. Angezeigte Kurse können von ausführbaren Börsenpreisen abweichen.',
            lastCheckedAt: new Date().toISOString(),
          };
          return cachedProviderStatus;
        }
      }
    } catch {
      // Static hosting or offline: operate in explicit educational demo mode
    }

    cachedProviderStatus = {
      mode: 'demo',
      configured: false,
      providerName: DEMO_STATUS_LABEL,
      defaultStatus: 'demo',
      statusLabel: DEMO_STATUS_LABEL,
      disclaimerLabel:
        'Bildungs-Demomodus aktiv (kein Server-API-Schlüssel hinterlegt). Alle Kurse sind ausdrücklich als Beispieldaten gekennzeichnet.',
      lastCheckedAt: new Date().toISOString(),
    };
    return cachedProviderStatus;
  }

  async searchInstruments(
    query: string,
    filterType: InstrumentAssetType | 'ALL' = 'ALL',
  ): Promise<InstrumentMetadata[]> {
    this.checkSimulatedError();
    const status = await this.getProviderStatus();

    if (status.mode === 'live_provider') {
      const params = new URLSearchParams({
        q: query.trim(),
        type: filterType,
      });
      const res = await fetch(`/api/market/search?${params.toString()}`);
      if (res.status === 429) {
        throw new MarketServiceException(
          'RATE_LIMIT',
          'Abfragelimit bei der Wertpapiersuche erreicht. Bitte kurz warten.',
          60,
        );
      }
      if (!res.ok) {
        throw new MarketServiceException(
          'PROVIDER_ERROR',
          'Wertpapiersuche über den Kursdatenanbieter fehlgeschlagen.',
        );
      }
      const payload = (await res.json()) as { instruments?: InstrumentMetadata[] };
      return payload.instruments ?? [];
    }

    return searchDemoInstruments(query, filterType);
  }

  async getInstrumentDetails(symbol: string): Promise<InstrumentMetadata | null> {
    this.checkSimulatedError();
    const localMeta = getDemoInstrumentMetadata(symbol);
    if (localMeta) return localMeta;

    const status = await this.getProviderStatus();
    if (status.mode === 'live_provider') {
      const results = await this.searchInstruments(symbol, 'ALL');
      return (
        results.find((r) => r.symbol.toUpperCase() === symbol.trim().toUpperCase()) ?? null
      );
    }

    return null;
  }

  async getQuote(
    symbol: string,
    options?: { forceRefresh?: boolean },
  ): Promise<MarketQuote> {
    this.checkSimulatedError();
    const normalized = symbol.trim().toUpperCase();
    const now = Date.now();

    if (!options?.forceRefresh) {
      const cached = quoteCache.get(normalized);
      if (cached && now - cached.fetchedAtMs < QUOTE_CACHE_TTL_MS) {
        return {
          ...cached.quote,
          status: cached.quote.isDemo ? 'demo' : 'cached',
        };
      }
    }

    const status = await this.getProviderStatus();
    if (status.mode === 'live_provider') {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new MarketServiceException(
          'OFFLINE',
          'Du bist aktuell offline. Neue Marktdaten können nicht abgerufen werden.',
        );
      }

      const res = await fetch(
        `/api/market/quote?symbol=${encodeURIComponent(normalized)}`,
      );
      if (res.status === 429) {
        throw new MarketServiceException(
          'RATE_LIMIT',
          'Das Abfragelimit des Kursdatenanbieters (Rate-Limit) wurde erreicht. Bitte warte ca. 60 Sekunden.',
          60,
        );
      }
      if (res.status === 404) {
        throw new MarketServiceException(
          'UNSUPPORTED_SYMBOL',
          `Für das Symbol „${normalized}“ sind beim Anbieter keine Kursdaten verfügbar.`,
        );
      }
      if (!res.ok) {
        throw new MarketServiceException(
          'PROVIDER_ERROR',
          `Kursabruf für „${normalized}“ fehlgeschlagen (Anbieter-Fehler).`,
        );
      }

      const quote = (await res.json()) as MarketQuote;
      quoteCache.set(normalized, { quote, fetchedAtMs: now });
      return quote;
    }

    // Explicit Demo Mode
    const demoQuote = getDemoQuote(normalized);
    if (!demoQuote) {
      throw new MarketServiceException(
        'UNSUPPORTED_SYMBOL',
        `Das Wertpapier „${normalized}“ ist im kuratierten Bildungs-Demokatalog nicht enthalten.`,
      );
    }
    quoteCache.set(normalized, { quote: demoQuote, fetchedAtMs: now });
    return demoQuote;
  }

  async getBatchQuotes(
    symbols: string[],
    options?: { forceRefresh?: boolean },
  ): Promise<Record<string, MarketQuote>> {
    this.checkSimulatedError();
    const unique = Array.from(new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean)));
    const result: Record<string, MarketQuote> = {};

    for (const sym of unique) {
      const q = await this.getQuote(sym, options);
      result[sym] = q;
    }
    return result;
  }

  async getHistoricalPrices(
    symbol: string,
    range: HistoricalRange,
  ): Promise<HistoricalSeries> {
    this.checkSimulatedError();
    const normalized = symbol.trim().toUpperCase();
    const status = await this.getProviderStatus();

    if (status.mode === 'live_provider') {
      const res = await fetch(
        `/api/market/history?symbol=${encodeURIComponent(normalized)}&range=${encodeURIComponent(range)}`,
      );
      if (res.status === 429) {
        throw new MarketServiceException(
          'RATE_LIMIT',
          'Abfragelimit beim Laden der Kurshistorie erreicht.',
          60,
        );
      }
      if (!res.ok) {
        throw new MarketServiceException(
          'PROVIDER_ERROR',
          'Historische Kursdaten konnten vom Anbieter nicht geladen werden.',
        );
      }
      return (await res.json()) as HistoricalSeries;
    }

    const demoHistory = getDemoHistoricalSeries(normalized, range);
    if (!demoHistory) {
      throw new MarketServiceException(
        'UNSUPPORTED_SYMBOL',
        `Keine Beispiel-Historie für „${normalized}“ verfügbar.`,
      );
    }
    return demoHistory;
  }

  async getExchangeRate(
    from: SupportedCurrency,
    to: SupportedCurrency,
    options?: { forceRefresh?: boolean },
  ): Promise<ExchangeRateQuote> {
    this.checkSimulatedError();
    if (from === to) {
      return {
        from,
        to,
        rate: 1,
        timestamp: new Date().toISOString(),
        source: 'Identische Währung (1:1)',
        status: 'real-time',
        isDemo: false,
      };
    }

    const key = `${from}_${to}`;
    const now = Date.now();
    if (!options?.forceRefresh) {
      const cached = fxCache.get(key);
      if (cached && now - cached.fetchedAtMs < QUOTE_CACHE_TTL_MS) {
        return cached.fx;
      }
    }

    const status = await this.getProviderStatus();
    if (status.mode === 'live_provider') {
      const res = await fetch(
        `/api/market/fx?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      );
      if (res.status === 429) {
        throw new MarketServiceException(
          'RATE_LIMIT',
          'Abfragelimit beim Laden des Wechselkurses erreicht.',
          60,
        );
      }
      if (!res.ok) {
        throw new MarketServiceException(
          'PROVIDER_ERROR',
          `Wechselkurs ${from}/${to} konnte nicht abgerufen werden.`,
        );
      }
      const fx = (await res.json()) as ExchangeRateQuote;
      fxCache.set(key, { fx, fetchedAtMs: now });
      return fx;
    }

    const demoFx = getDemoExchangeRate(from, to);
    fxCache.set(key, { fx: demoFx, fetchedAtMs: now });
    return demoFx;
  }
}

export const marketDataService = new DefaultMarketDataService();
