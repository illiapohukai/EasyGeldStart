import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { DEMO_STATUS_LABEL, searchDemoInstruments } from './src/lib/market-demo-adapter';
import type {
  ExchangeRateQuote,
  HistoricalSeries,
  MarketQuote,
  ProviderStatusInfo,
} from './src/lib/market-types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

// Server-side in-memory cache to protect provider rate limits (e.g. Twelve Data 8 req/min)
const serverQuoteCache = new Map<string, { quote: MarketQuote; expiresAt: number }>();
const serverHistoryCache = new Map<string, { series: HistoricalSeries; expiresAt: number }>();
const serverFxCache = new Map<string, { fx: ExchangeRateQuote; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getTwelveDataKey(): string | null {
  const raw = process.env.TWELVE_DATA_API_KEY?.trim();
  if (!raw || raw === 'MY_TWELVE_DATA_API_KEY' || raw.length < 8) {
    return null;
  }
  return raw;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Provider Status Endpoint (never exposes the API key)
  app.get('/api/market/status', (_req, res) => {
    const apiKey = getTwelveDataKey();
    const configured = Boolean(apiKey);
    const payload: ProviderStatusInfo = {
      mode: configured ? 'live_provider' : 'demo',
      configured,
      providerName: configured ? 'Twelve Data API (Server-Proxy)' : DEMO_STATUS_LABEL,
      defaultStatus: configured ? 'delayed' : 'demo',
      statusLabel: configured
        ? 'Verzögerte Marktdaten (Twelve Data Server-Proxy)'
        : DEMO_STATUS_LABEL,
      disclaimerLabel:
        'Nur zu Bildungszwecken – keine Anlageberatung. Alle Käufe und Verkäufe sind Simulationen.',
      lastCheckedAt: new Date().toISOString(),
    };
    res.json(payload);
  });

  // 2. Instrument Search Endpoint
  app.get('/api/market/search', (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const filter =
      typeof req.query.type === 'string'
        ? (req.query.type as 'ALL' | 'ETF' | 'Aktie' | 'Anleihen-ETF' | 'Rohstoff-ETC')
        : 'ALL';
    const instruments = searchDemoInstruments(q, filter);
    res.json({ instruments });
  });

  // 3. Quote Endpoint (Server-Side Twelve Data Proxy with Cache)
  app.get('/api/market/quote', async (req, res) => {
    const apiKey = getTwelveDataKey();
    const symbol = typeof req.query.symbol === 'string' ? req.query.symbol.trim().toUpperCase() : '';
    if (!symbol) {
      res.status(400).json({ error: 'Missing symbol parameter' });
      return;
    }

    if (!apiKey) {
      res.status(503).json({
        error: 'TWELVE_DATA_API_KEY not configured on server. Use educational demo mode.',
      });
      return;
    }

    const cached = serverQuoteCache.get(symbol);
    if (cached && Date.now() < cached.expiresAt) {
      res.json({ ...cached.quote, status: 'cached' });
      return;
    }

    try {
      const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`;
      const upstream = await fetch(url);
      if (upstream.status === 429) {
        res.status(429).json({ error: 'Rate limit reached at Twelve Data provider' });
        return;
      }
      const data = (await upstream.json()) as Record<string, unknown>;
      if (data.code === 429) {
        res.status(429).json({ error: 'Rate limit reached at Twelve Data provider' });
        return;
      }
      if (data.status === 'error' || !data.close) {
        res.status(404).json({ error: 'Symbol not supported or quote unavailable' });
        return;
      }

      const price = Number(data.close);
      const previousClose = Number(data.previous_close) || price;
      const changeAbsolute = Math.round((price - previousClose) * 100) / 100;
      const changePercent =
        previousClose > 0
          ? Math.round(((price - previousClose) / previousClose) * 10000) / 100
          : 0;

      const quote: MarketQuote = {
        symbol,
        price,
        previousClose,
        changeAbsolute,
        changePercent,
        currency: data.currency === 'USD' ? 'USD' : 'EUR',
        exchange: typeof data.exchange === 'string' ? data.exchange : 'XETRA/NASDAQ',
        timestamp:
          typeof data.datetime === 'string'
            ? new Date(data.datetime).toISOString()
            : new Date().toISOString(),
        status: 'delayed',
        providerName: 'Twelve Data (Server-Proxy)',
        isDemo: false,
      };

      serverQuoteCache.set(symbol, { quote, expiresAt: Date.now() + CACHE_TTL_MS });
      res.json(quote);
    } catch {
      res.status(502).json({ error: 'Upstream market provider unreachable' });
    }
  });

  // 4. Historical Series Endpoint
  app.get('/api/market/history', async (req, res) => {
    const apiKey = getTwelveDataKey();
    const symbol = typeof req.query.symbol === 'string' ? req.query.symbol.trim().toUpperCase() : '';
    const range =
      req.query.range === '1M' || req.query.range === '6M' || req.query.range === '1Y'
        ? req.query.range
        : '1Y';

    if (!apiKey || !symbol) {
      res.status(503).json({ error: 'Provider not configured' });
      return;
    }

    const cacheKey = `${symbol}_${range}`;
    const cached = serverHistoryCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      res.json(cached.series);
      return;
    }

    try {
      const outputsize = range === '1M' ? 22 : range === '6M' ? 26 : 12;
      const interval = range === '1M' ? '1day' : range === '6M' ? '1week' : '1month';
      const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${encodeURIComponent(apiKey)}`;
      const upstream = await fetch(url);
      const data = (await upstream.json()) as Record<string, unknown>;
      if (data.code === 429) {
        res.status(429).json({ error: 'Rate limit reached' });
        return;
      }
      if (!Array.isArray(data.values)) {
        res.status(404).json({ error: 'No historical series available' });
        return;
      }

      const points = (data.values as Array<{ datetime: string; close: string }>)
        .map((v) => ({
          date: v.datetime,
          close: Number(v.close),
        }))
        .filter((p) => Number.isFinite(p.close))
        .reverse();

      const meta = (data.meta as Record<string, unknown>) || {};
      const series: HistoricalSeries = {
        symbol,
        currency: meta.currency === 'USD' ? 'USD' : 'EUR',
        range,
        points,
        status: 'end-of-day',
        providerName: 'Twelve Data (Server-Proxy)',
        timestamp: new Date().toISOString(),
        isDemo: false,
      };

      serverHistoryCache.set(cacheKey, { series, expiresAt: Date.now() + CACHE_TTL_MS });
      res.json(series);
    } catch {
      res.status(502).json({ error: 'Failed to load history' });
    }
  });

  // 5. Exchange Rate Endpoint
  app.get('/api/market/fx', async (req, res) => {
    const apiKey = getTwelveDataKey();
    const from = req.query.from === 'USD' ? 'USD' : 'EUR';
    const to = req.query.to === 'USD' ? 'USD' : 'EUR';
    const key = `${from}_${to}`;

    if (!apiKey) {
      res.status(503).json({ error: 'Provider not configured' });
      return;
    }

    const cached = serverFxCache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      res.json(cached.fx);
      return;
    }

    try {
      const pair = `${from}/${to}`;
      const url = `https://api.twelvedata.com/exchange_rate?symbol=${encodeURIComponent(pair)}&apikey=${encodeURIComponent(apiKey)}`;
      const upstream = await fetch(url);
      const data = (await upstream.json()) as Record<string, unknown>;
      if (data.code === 429) {
        res.status(429).json({ error: 'Rate limit reached' });
        return;
      }
      const rate = Number(data.rate);
      if (!Number.isFinite(rate) || rate <= 0) {
        res.status(502).json({ error: 'Invalid FX response' });
        return;
      }

      const fx: ExchangeRateQuote = {
        from,
        to,
        rate,
        timestamp: new Date().toISOString(),
        source: 'Twelve Data FX (Server-Proxy)',
        status: 'delayed',
        isDemo: false,
      };
      serverFxCache.set(key, { fx, expiresAt: Date.now() + CACHE_TTL_MS });
      res.json(fx);
    } catch {
      res.status(502).json({ error: 'FX upstream error' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Geldstart server listening on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
