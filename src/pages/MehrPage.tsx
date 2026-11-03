/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Database,
  Info,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useDepot } from '@/lib/depot-context';
import { useProgress } from '@/lib/progress-context';
import { AppLink } from '@/lib/router';

const GLOSSARY_ITEMS = [
  {
    term: 'Inflation (Kaufkraftverlust)',
    definition:
      'Wenn das allgemeine Preisniveau steigt, bekommst du für denselben Euro-Betrag weniger Waren oder Dienstleistungen.',
  },
  {
    term: 'Notgroschen',
    definition:
      'Kurzfristig verfügbare Rücklage auf einem sicheren Tagesgeldkonto (meist 2–3 Monatsausgaben) für unvorhergesehene Kosten.',
  },
  {
    term: 'ETF (Börsengehandelter Indexfonds)',
    definition:
      'Ein Fonds, der einen ganzen Marktindex (z. B. weltweit hunderte Unternehmen) in einem einzigen Wertpapier kostengünstig abbildet.',
  },
  {
    term: 'Diversifikation (Risikostreuung)',
    definition:
      'Verteilung des angelegten Geldes auf viele Unternehmen, Branchen und Länder, damit einzelne Rückschläge nicht das gesamte Ersparte treffen.',
  },
  {
    term: 'Freistellungsauftrag',
    definition:
      'Kostenloser Auftrag an deine Bank, damit Kapitalerträge bis zum Sparer-Pauschbetrag (1.000 € pro Jahr für Alleinstehende) steuerfrei bleiben.',
  },
];

export function MehrPage() {
  const {
    completedCoreCount,
    totalCoreCount,
    resetAllProgress,
  } = useProgress();
  const { valuation, providerStatus, resetDepot } = useDepot();

  // Progressive menu panels (only opened when selected)
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Independent confirmation states for learning progress vs. virtual portfolio
  const [confirmResetProgress, setConfirmResetProgress] = useState(false);
  const [progressResetSuccess, setProgressResetSuccess] = useState(false);

  const [confirmResetDepot, setConfirmResetDepot] = useState(false);
  const [depotResetSuccess, setDepotResetSuccess] = useState(false);

  const toggleSection = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const handleConfirmResetProgress = () => {
    resetAllProgress();
    setConfirmResetProgress(false);
    setProgressResetSuccess(true);
  };

  const handleConfirmResetDepot = () => {
    resetDepot();
    setConfirmResetDepot(false);
    setDepotResetSuccess(true);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <header className="surface-card p-6 sm:p-7 space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          Menü & Einstellungen
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Mehr
        </h1>
        <p className="text-base text-muted-foreground">
          Werkzeuge, Hintergrund zu GeldStart, Daten-Transparenz und unabhängige Zurücksetzen-Optionen.
        </p>
      </header>

      {/* Group 1: Werkzeuge */}
      <section aria-labelledby="group-werkzeuge" className="space-y-3">
        <h2
          id="group-werkzeuge"
          className="px-1 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          1. Werkzeuge
        </h2>

        <div className="surface-card divide-y divide-border overflow-hidden">
          <AppLink
            to="/rechner"
            data-testid="mehr-open-calculator-link"
            className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-secondary/40"
          >
            <div className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Calculator className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-extrabold text-foreground">
                  Zinseszins- & Budget-Rechner
                </p>
                <p className="text-sm text-muted-foreground">
                  Sparrate, Laufzeit und monatliche Lernaufteilung interaktiv berechnen
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </AppLink>

          <div>
            <button
              type="button"
              onClick={() => toggleSection('glossary')}
              aria-expanded={openSection === 'glossary'}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-secondary/40"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-extrabold text-foreground">
                    Kompakt-Glossar der wichtigsten Begriffe
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Inflation, Notgroschen, ETF, Diversifikation & Freistellungsauftrag kurz erklärt
                  </p>
                </div>
              </div>
              {openSection === 'glossary' ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
            </button>

            {openSection === 'glossary' && (
              <div className="border-t border-border bg-secondary/30 p-5 space-y-3">
                {GLOSSARY_ITEMS.map((item) => (
                  <div
                    key={item.term}
                    className="rounded-xl border border-border bg-card p-4 space-y-1"
                  >
                    <p className="text-sm font-extrabold text-foreground">{item.term}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Group 2: Über GeldStart */}
      <section aria-labelledby="group-about" className="space-y-3">
        <h2
          id="group-about"
          className="px-1 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          2. Über GeldStart
        </h2>

        <div className="surface-card divide-y divide-border overflow-hidden">
          <div>
            <button
              type="button"
              onClick={() => toggleSection('mission')}
              aria-expanded={openSection === 'mission'}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-secondary/40"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-extrabold text-foreground">
                    Didaktik & Lernkonzept
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Warum GeldStart auf kurze Schritte, neutrale Beispiele und ehrliche Einordnung setzt
                  </p>
                </div>
              </div>
              {openSection === 'mission' ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
            </button>

            {openSection === 'mission' && (
              <div className="border-t border-border bg-secondary/30 p-5 text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  GeldStart richtet sich an 16- bis 20-Jährige in Schule, Ausbildung, Studium oder beim ersten eigenen Gehalt. Jedes Modul zerlegt komplexe Finanzthemen in leicht verdauliche Schritte mit direktem Alltagsbezug.
                </p>
                <p>
                  Wir nennen bewusst keine einzelnen Banken oder Broker als Empfehlung, sondern zeigen dir die zugrundeliegenden Prinzipien: Notgroschen, Risikostreuung, Kostenbewusstsein und langfristiges Denken.
                </p>
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => toggleSection('legal')}
              aria-expanded={openSection === 'legal'}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-secondary/40"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Info className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-extrabold text-foreground">
                    Rechtlicher Bildungshinweis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Keine Anlage-, Steuer- oder Rechtsberatung
                  </p>
                </div>
              </div>
              {openSection === 'legal' ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
            </button>

            {openSection === 'legal' && (
              <div className="border-t border-border bg-secondary/30 p-5 text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  Sämtliche Inhalte, Rechenbeispiele und das virtuelle Übungsdepot in GeldStart dienen ausschließlich der allgemeinen Finanzbildung. Sie stellen ausdrücklich keine Anlageberatung, Empfehlung oder Aufforderung zum Kauf oder Verkauf von Finanzinstrumenten dar.
                </p>
                <p>
                  Wertpapiergeschäfte am Kapitalmarkt sind mit Kursrisiken bis hin zum Kapitalverlust verbunden. Vergangene Wertentwicklungen und Beispielrechnungen sind keine Garantie für zukünftige Erträge.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Group 3: Daten & Transparenz */}
      <section aria-labelledby="group-transparency" className="space-y-3">
        <h2
          id="group-transparency"
          className="px-1 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          3. Daten & Transparenz
        </h2>

        <div className="surface-card divide-y divide-border overflow-hidden">
          <div>
            <button
              type="button"
              onClick={() => toggleSection('marketdata')}
              aria-expanded={openSection === 'marketdata'}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-secondary/40"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Database className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-extrabold text-foreground">
                    Marktdaten-Quelle im Übungsdepot
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Aktueller Modus: {providerStatus.statusLabel}
                  </p>
                </div>
              </div>
              {openSection === 'marketdata' ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
            </button>

            {openSection === 'marketdata' && (
              <div className="border-t border-border bg-secondary/30 p-5 text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  Im statischen Betrieb (z. B. auf GitHub Pages oder ohne hinterlegten Server-API-Schlüssel) arbeitet das Übungsdepot automatisch im transparent gekennzeichneten <strong>Lern-Modus („Beispieldaten – keine aktuellen Marktdaten“)</strong> mit realistischen historischen Verläufen.
                </p>
                <p>
                  Es wird zu keinem Zeitpunkt echtes Geld eingezahlt oder gehandelt. Alle Transaktionen im Übungsdepot sind rein virtuell.
                </p>
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => toggleSection('privacy')}
              aria-expanded={openSection === 'privacy'}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-secondary/40"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-extrabold text-foreground">
                    Lokale Speicherung & Datenschutz
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Kein Account-Zwang – dein Fortschritt bleibt in deinem Browser
                  </p>
                </div>
              </div>
              {openSection === 'privacy' ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
            </button>

            {openSection === 'privacy' && (
              <div className="border-t border-border bg-secondary/30 p-5 text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  GeldStart speichert deinen Lernfortschritt (`geldstart_progress_v1`) und dein virtuelles Übungsdepot (`geldstart_depot_v1`) ausschließlich lokal im `localStorage` deines Browsers. Es werden keine persönlichen Finanzdaten an externe Server übertragen.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Group 4: Einstellungen (Independent Reset Controls) */}
      <section aria-labelledby="group-settings" className="space-y-3">
        <h2
          id="group-settings"
          className="px-1 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          4. Einstellungen & Zurücksetzen
        </h2>

        <div className="surface-card divide-y divide-border overflow-hidden">
          {/* A. Reset Learning Progress Independently */}
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-base font-extrabold text-foreground">
                  Lernfortschritt zurücksetzen
                </p>
                <p className="text-sm text-muted-foreground">
                  Aktuell {completedCoreCount} von {totalCoreCount} Kernmodulen abgeschlossen. Dein Übungsdepot bleibt dabei unverändert.
                </p>
              </div>

              {!confirmResetProgress && (
                <button
                  type="button"
                  data-testid="mehr-reset-progress-btn"
                  onClick={() => {
                    setProgressResetSuccess(false);
                    setConfirmResetProgress(true);
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted shrink-0"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Lernfortschritt zurücksetzen</span>
                </button>
              )}
            </div>

            {confirmResetProgress && (
              <div className="rounded-2xl border border-warning bg-warning/15 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-warning-foreground shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-foreground">
                    Möchtest du deinen gesamten Lernfortschritt und gespeicherte Schritte wirklich auf Null setzen? (Dein virtuelles Depot bleibt erhalten.)
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    data-testid="mehr-confirm-reset-progress-btn"
                    onClick={handleConfirmResetProgress}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                  >
                    Ja, Lernfortschritt löschen
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetProgress(false)}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}

            {progressResetSuccess && (
              <div
                role="status"
                data-testid="mehr-progress-reset-success"
                className="flex items-center gap-2 rounded-xl bg-accent/25 px-4 py-2.5 text-sm font-bold text-accent-foreground"
              >
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>Lernfortschritt wurde zurückgesetzt.</span>
              </div>
            )}
          </div>

          {/* B. Reset Virtual Portfolio Independently */}
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-base font-extrabold text-foreground">
                  Virtuelles Übungsdepot zurücksetzen
                </p>
                <p className="text-sm text-muted-foreground">
                  Aktuell {valuation.valuedPositions.length} Positionen im Depot. Setzt das Übungsdepot komplett zurück (Lernfortschritt bleibt erhalten).
                </p>
              </div>

              {!confirmResetDepot && (
                <button
                  type="button"
                  data-testid="mehr-reset-depot-btn"
                  onClick={() => {
                    setDepotResetSuccess(false);
                    setConfirmResetDepot(true);
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted shrink-0"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Übungsdepot zurücksetzen</span>
                </button>
              )}
            </div>

            {confirmResetDepot && (
              <div className="rounded-2xl border border-warning bg-warning/15 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-warning-foreground shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-foreground">
                    Möchtest du alle virtuellen Positionen und Transaktionen löschen und wieder mit 10.000 € Spielgeld starten? (Dein Lernfortschritt bleibt erhalten.)
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    data-testid="mehr-confirm-reset-depot-btn"
                    onClick={handleConfirmResetDepot}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                  >
                    Ja, Übungsdepot zurücksetzen
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetDepot(false)}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}

            {depotResetSuccess && (
              <div
                role="status"
                data-testid="mehr-depot-reset-success"
                className="flex items-center gap-2 rounded-xl bg-accent/25 px-4 py-2.5 text-sm font-bold text-accent-foreground"
              >
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>Dein Übungsdepot wurde auf 10.000 € Startguthaben zurückgesetzt.</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
