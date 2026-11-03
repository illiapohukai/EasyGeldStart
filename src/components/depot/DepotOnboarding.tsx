import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Coins,
  Layers,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { formatEuro } from '@/lib/calculator';
import { useDepot } from '@/lib/depot-context';
import { STARTING_CASH_PRESETS } from '@/lib/depot-storage';

export function DepotOnboarding() {
  const { createPortfolio, providerStatus } = useDepot();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCash, setSelectedCash] = useState<number>(5000);
  const [portfolioName, setPortfolioName] = useState<string>('Mein Übungsdepot');

  const handleComplete = () => {
    createPortfolio(selectedCash, portfolioName);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress Header */}
      <section aria-labelledby="depot-onboarding-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Übungsdepot einrichten · Schritt {step} von 4</span>
          <span>100 % virtuell · Kein echtes Geld</span>
        </div>

        {/* 4-Step Indicator Bar */}
        <div
          className="grid grid-cols-4 gap-2"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={4}
          aria-label={`Einführung Schritt ${step} von 4`}
        >
          {[1, 2, 3, 4].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setStep(idx as 1 | 2 | 3 | 4)}
              aria-label={`Zu Schritt ${idx} wechseln`}
              className={`h-2.5 rounded-full transition-colors ${
                idx <= step ? 'bg-primary' : 'bg-muted hover:bg-border'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Step Card */}
      <div className="surface-card p-5 sm:p-7 space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
              <Layers className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary">
                Schritt 1 · Risikofreie Simulation
              </p>
              <h1
                id="depot-onboarding-heading"
                className="text-2xl font-extrabold tracking-tight sm:text-3xl"
              >
                Starte dein virtuelles Übungsdepot
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Im Übungsdepot kannst du das Wissen aus den Lernmodulen direkt praktisch ausprobieren – ganz ohne Risiko und ohne echtes Geld.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4 space-y-2.5 text-xs sm:text-sm">
              <div className="font-bold text-foreground">
                Was du hier gefahrlos testen kannst:
              </div>
              <ul className="space-y-2 text-muted-foreground list-disc pl-5 leading-relaxed">
                <li>
                  <strong className="text-foreground">Kein echtes Geld:</strong> Du handelst ausschließlich mit virtuellem Spielgeld. Es werden niemals echte Börsenaufträge ausgeführt.
                </li>
                <li>
                  <strong className="text-foreground">Kein Konto & keine Einzahlung:</strong> Dein Übungsdepot wird direkt lokal auf deinem Gerät gespeichert.
                </li>
                <li>
                  <strong className="text-foreground">Praxis-Vergleich:</strong> Beobachte selbst, wie sich ein breit gestreuter Welt-ETF im Vergleich zu einzelnen Aktien verhält.
                </li>
              </ul>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
              <Coins className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-primary">
                Schritt 2 · Virtuelles Startguthaben wählen
              </p>
              <h1
                id="depot-onboarding-heading"
                className="text-2xl font-extrabold tracking-tight sm:text-3xl"
              >
                Mit wie viel Übungsgeld möchtest du starten?
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Wähle einen sinnvollen virtuellen Startbetrag für deine Simulation. Dieser Betrag dient später als Maßstab für deine Wertentwicklung.
              </p>
            </div>

            <div
              className="grid gap-3 sm:grid-cols-2"
              role="radiogroup"
              aria-label="Virtuelles Startguthaben auswählen"
            >
              {STARTING_CASH_PRESETS.map((preset) => {
                const isSelected = selectedCash === preset.amount;
                return (
                  <button
                    key={preset.amount}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedCash(preset.amount)}
                    className={`rounded-xl border p-4 text-left transition-colors flex flex-col justify-between gap-2 min-h-[96px] ${
                      isSelected
                        ? 'border-2 border-primary bg-secondary/80 text-foreground'
                        : 'border-border bg-background hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-lg font-extrabold tabular-nums">
                        {preset.label}
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        {preset.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5 pt-2">
              <label
                htmlFor="depot-name-input"
                className="block text-xs font-semibold text-foreground"
              >
                Name deines Übungsdepots (optional)
              </label>
              <input
                id="depot-name-input"
                type="text"
                maxLength={40}
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                placeholder="Mein Übungsdepot"
                className="w-full min-h-[44px] rounded-xl border border-input bg-background px-3.5 py-2 text-sm font-medium"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
              <TrendingUp className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-primary">
                Schritt 3 · Vier wichtige Grundregeln vorab
              </p>
              <h1
                id="depot-onboarding-heading"
                className="text-2xl font-extrabold tracking-tight sm:text-3xl"
              >
                Was du beim Beobachten wissen solltest
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ein Übungsdepot hilft dir, typische Denkfehler an der Börse frühzeitig zu durchschauen:
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm">
              <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                <div className="font-bold text-foreground">
                  1. Kurse steigen und fallen
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Wertpapiere entwickeln sich nicht geradlinig. Zwischenzeitliche rote Zahlen sind an der Börse normal und kein Grund zur Panik.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                <div className="font-bold text-foreground">
                  2. Streuung (Diversifikation) zählt
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Wer alles auf eine einzige Aktie oder eine einzige Branche setzt, geht ein hohes Klumpenrisiko ein.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                <div className="font-bold text-foreground">
                  3. Kursdaten & Verzögerung
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Angezeigte Kurse sind je nach Datenquelle zeitverzögert oder als pädagogische Beispieldaten gekennzeichnet ({providerStatus.statusLabel}).
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                <div className="font-bold text-foreground">
                  4. Keine Anlageberatung
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Simulationsergebnisse sind keine Garantie für zukünftige Erträge und keine Empfehlung zum Kauf echter Finanzprodukte.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-primary">
                Schritt 4 · Bereit zum Start
              </p>
              <h1
                id="depot-onboarding-heading"
                className="text-2xl font-extrabold tracking-tight sm:text-3xl"
              >
                Dein Übungsdepot im Überblick
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Prüfe kurz deine Einstellungen. Du kannst dein Übungsdepot später jederzeit unter „Mehr“ wieder zurücksetzen.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-muted-foreground">Depotname</span>
                <span className="font-bold text-foreground">
                  {portfolioName.trim() || 'Mein Übungsdepot'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-muted-foreground">Virtuelles Startguthaben</span>
                <span className="font-mono font-bold tabular-nums text-primary">
                  {formatEuro(selectedCash, 2)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-muted-foreground">Basiswährung</span>
                <span className="font-semibold text-foreground">EUR (€)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Kursdaten-Modus</span>
                <span className="font-semibold text-foreground">
                  {providerStatus.statusLabel}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-primary/25 bg-secondary/80 p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground">
              <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <p className="leading-relaxed">
                <strong className="font-semibold text-foreground">
                  Nur zu Bildungszwecken – keine Anlageberatung. Alle Käufe und Verkäufe sind Simulationen. Geldanlagen können an Wert verlieren.
                </strong>
              </p>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4)}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Zurück</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(4)}
              className="inline-flex min-h-[44px] items-center px-2 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Direkt zur Zusammenfassung →
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(4, s + 1) as 1 | 2 | 3 | 4)}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <span>Weiter zu Schritt {step + 1}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              data-testid="depot-create-confirm-btn"
              onClick={handleComplete}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Übungsdepot jetzt anlegen ({formatEuro(selectedCash)})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
