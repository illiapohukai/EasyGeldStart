export type MarketDataStatus =
  | 'real-time'
  | 'delayed'
  | 'end-of-day'
  | 'cached'
  | 'demo'
  | 'unavailable';

export type InstrumentAssetType = 'ETF' | 'Aktie' | 'Anleihen-ETF' | 'Rohstoff-ETC';

export type SupportedCurrency = 'EUR' | 'USD';

export type RiskCategory =
  | 'Niedrig bis mittel'
  | 'Mittel'
  | 'Mittel bis hoch'
  | 'Hoch'
  | 'Sehr hoch';

export interface InstrumentMetadata {
  symbol: string;
  name: string;
  isin?: string;
  assetType: InstrumentAssetType;
  exchange: string;
  currency: SupportedCurrency;
  sector: string;
  region: string;
  riskCategory: RiskCategory;
  shortExplanation: string;
  educationalNotes: string[];
  /** Whether fractional shares (e.g. Sparplan-Bruchstücke) are supported in the simulator */
  supportsFractional: boolean;
}

export interface MarketQuote {
  symbol: string;
  price: number;
  previousClose: number;
  changeAbsolute: number;
  changePercent: number;
  currency: SupportedCurrency;
  exchange: string;
  timestamp: string;
  status: MarketDataStatus;
  providerName: string;
  isDemo: boolean;
}

export interface HistoricalPricePoint {
  date: string;
  close: number;
}

export type HistoricalRange = '1M' | '6M' | '1Y';

export interface HistoricalSeries {
  symbol: string;
  currency: SupportedCurrency;
  range: HistoricalRange;
  points: HistoricalPricePoint[];
  status: MarketDataStatus;
  providerName: string;
  timestamp: string;
  isDemo: boolean;
}

export interface ExchangeRateQuote {
  from: SupportedCurrency;
  to: SupportedCurrency;
  rate: number;
  timestamp: string;
  source: string;
  status: MarketDataStatus;
  isDemo: boolean;
}

export type MarketServiceErrorCode =
  | 'RATE_LIMIT'
  | 'PROVIDER_ERROR'
  | 'OFFLINE'
  | 'UNSUPPORTED_SYMBOL'
  | 'STALE_DATA';

export interface MarketServiceError {
  code: MarketServiceErrorCode;
  message: string;
  retryAfterSeconds?: number;
}

export interface ProviderStatusInfo {
  mode: 'live_provider' | 'demo';
  configured: boolean;
  providerName: string;
  defaultStatus: MarketDataStatus;
  statusLabel: string;
  disclaimerLabel: string;
  lastCheckedAt: string;
}

export type DemoMarketScenarioId =
  | 'baseline'
  | 'normal_day'
  | 'market_dip'
  | 'tech_rally'
  | 'sector_rotation';

export interface DemoMarketScenario {
  id: DemoMarketScenarioId;
  label: string;
  description: string;
  educationalTakeaway: string;
}

export interface MarketDataService {
  getProviderStatus(): Promise<ProviderStatusInfo>;
  searchInstruments(query: string, filterType?: InstrumentAssetType | 'ALL'): Promise<InstrumentMetadata[]>;
  getInstrumentDetails(symbol: string): Promise<InstrumentMetadata | null>;
  getQuote(symbol: string, options?: { forceRefresh?: boolean }): Promise<MarketQuote>;
  getBatchQuotes(symbols: string[], options?: { forceRefresh?: boolean }): Promise<Record<string, MarketQuote>>;
  getHistoricalPrices(symbol: string, range: HistoricalRange): Promise<HistoricalSeries>;
  getExchangeRate(from: SupportedCurrency, to: SupportedCurrency, options?: { forceRefresh?: boolean }): Promise<ExchangeRateQuote>;
}
