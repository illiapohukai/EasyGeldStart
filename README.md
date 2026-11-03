# Geldstart – Finanzbildung & Virtuelles Übungsdepot für junge Leute (16–20 Jahre)

**Geldstart** ist eine mobil-optimierte Web-Anwendung zur finanziellen Grundbildung für Jugendliche und junge Erwachsene (ca. 16–20 Jahre).

Die App verbindet verständliche Finanzbildung direkt mit einer praktischen, risikofreien Simulation entlang eines klaren pädagogischen Lernflusses:
**Lernen → Verstehen → Im Depot ausprobieren → Ergebnis beobachten → Entscheidung reflektieren**

> **Wichtiger rechtlicher Hinweis:**  
> *Nur zu Bildungszwecken – keine Anlageberatung. Alle Käufe und Verkäufe sind Simulationen. Geldanlagen können an Wert verlieren.*

---

## Inhaltsverzeichnis & Funktionsumfang

Die primäre Navigation umfasst 4 Hauptbereiche (`Start`, `Lernen`, `Depot`, `Mehr`) sowie das jederzeit erreichbare Rechenwerkzeug (`Rechner`):

1. **Start (`/`)** – Persönliches Lern-Dashboard mit Fortschrittsanzeige, kompaktem **Übungsdepot-Überblick** (bzw. Onboarding-Karte *„Starte dein Übungsdepot“* für neue Nutzerinnen und Nutzer), prominentem Schnellzugriff auf den **Zinseszins- & Budget-Rechner**, direktem Einstieg in die nächste Lektion (`Weiterlernen`) und interaktiver Wissensfrage.
2. **Lernen (`/lernen`)** – Strukturierter Lernpfad mit 6 Kernmodulen, Praxis-Brücken ins Übungsdepot und interaktiven Rechnern:
   - **Grundlagen (`/grundlagen`)**: Sparen vs. Investieren, Inflation & Kaufkraftverlust (inkl. Kaufkraft-Simulator), Notgroschen, Risikostreuung (Diversifikation) und direkte Brücke zum Depot.
   - **Zinseszins (`/zinseszins`)**: Zinsen auf Zinsen, der Faktor Zeit, Vergleich frühes vs. spätes Starten sowie direkter Übergang in den Zinseszins-Rechner und das Übungsdepot.
   - **Anlageklassen (`/anlageklassen`)**: Interaktiver Direktvergleich von 7 Anlageklassen (*Tagesgeld & Festgeld*, *Anleihen*, *Einzelaktien*, *ETFs*, *Immobilien*, *Gold* und *Kryptowährungen*) inklusive direktem Übergang zum Ausprobieren im Übungsdepot.
   - **Sparen mit kleinen Beträgen & Kindergeld (`/kindergeld`)**: Regelmäßigkeit vs. Startsumme, Trennung von Alltag, Rücklage und Sparplan sowie interaktiver Kleinbetrags-Simulator.
   - **Altersvorsorge (`/altersvorsorgedepot`)**: Gesetzliche Rente (Umlageverfahren) vs. private Vorsorge, lange Kapitalbindung und transparente Einordnung geplanter Gesetzeskonzepte.
   - **Hilfe vom Staat (`/staat`)**: Klare Trennung zwischen bereits aktiven Programmen (*Vermögenswirksame Leistungen*, *Arbeitnehmersparzulage*, *Wohnungsbauprämie*, *Riester-Zulagen*) und politisch geplanten Vorhaben (*Frühstart-Rente*, *Altersvorsorgedepot*).
   - **Budget & Taschengeld (`/taschengeld`)**: Monatlicher Einnahmen- und Ausgaben-Rechner zur Ermittlung des realen Sparpotenzials.
3. **Depot (`/depot`)** – **Virtuelles Übungsdepot (Neu)**:
   - **4-Schritte-Onboarding**: Erklärung des reinen Spielgeld-Charakters, Auswahl des virtuellen Startguthabens (`1.000 €`, `5.000 €`, `10.000 €`, `25.000 €`), Grundregeln zu Kursschwankungen & Streuung.
   - **Mobile-first Depot-Übersicht**: Aktueller Gesamtwert, Gewinn/Verlust in Euro und Prozent, verfügbares Spielgeld, transparenter Datenstatus, Wertentwicklungs-Chart (ohne erfundene Vergangenheit vor Depoterstellung), Streuung nach Anlageklassen & Branchen, deterministischer Wochenbericht und dynamische Lern-Erkenntnisse.
   - **Wertpapier-Detailansicht**: Verständliche Erklärung jedes Instruments, eigene Positionskennzahlen (Stückzahl, Ø Kaufpreis, Einstandswert, aktueller Wert, G/V) und Kursverlauf.
   - **Geführter 4-Schritte-Kauf & Verkauf**: Suche & Filterung nach Anlageklassen, Betrags-/Stückzahl-Wahl, Auswirkung auf Barbestand und Depotanteil, pädagogische Reflexionsfrage nach dem Kauf sowie Verkauf einzelner oder aller Anteile (mit Schutz vor Überverkauf).
4. **Mehr (`/mehr`)** – **Finanz-Werkzeuge** (Zinseszins- & Budget-Rechner, Übungsdepot), transparente Dokumentation der Marktdaten-Architektur, **getrenntes Zurücksetzen** von Lernfortschritt und Übungsdepot, unabhängige Quellen (Verbraucherzentrale, BaFin, Bundesbank) und rechtliche Hinweise.
5. **Zinseszins- & Budget-Rechner (`/rechner`)** – Erreichbar über die Startseite, die Lektion *Zinseszins*, den Bereich *Lernen* und *Mehr*.

---

## Marktdaten-Architektur & Bildungs-Demomodus

Das Depot-Modul verwendet eine anbieterunabhängige Marktdaten-Schicht (`src/lib/market-types.ts`, `src/lib/market-service.ts`):

1. **Server-seitiger Proxy (`server.ts`) für Twelve Data (`TWELVE_DATA_API_KEY`)**:
   - Ist auf dem Server die Umgebungsvariable `TWELVE_DATA_API_KEY` gesetzt, ruft der Express-Server (`/api/market/*`) echte bzw. verzögerte Kursdaten, Zeitreihen und EUR/USD-Wechselkurse sicher über Twelve Data ab (inkl. 5-Minuten-Server-Cache zur Schonung von API-Limits).
   - Im Frontend-Code oder Browser-Bundle sind **niemals** API-Schlüssel enthalten.
2. **Expliziter Bildungs-Demomodus (`src/lib/market-demo-adapter.ts`)**:
   - Ist kein `TWELVE_DATA_API_KEY` konfiguriert oder ist die Anwendung offline/statisch gehostet, wechselt das Depot automatisch und transparent in den **Bildungs-Demomodus**.
   - Dieser ist im Interface unmissverständlich gekennzeichnet als: **`Beispieldaten – keine aktuellen Marktdaten`**.
   - Im Demomodus können Lernende zusätzlich 5 deterministische Marktszenarien (*Basis-Markt*, *Weltmarkt-Aufschwung*, *Tech-Rücksetzer*, *Zins- & Inflationsschock*, *Rohstoff- & Defensiv-Fokus*) durchspielen, um Auswirkungen auf ihr Portfolio unmittelbar zu beobachten.

---

## Technologie-Stack

- **Framework**: React 19 + TypeScript
- **Server / Dev-Middleware**: Express + Vite (`server.ts`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) mit eigenen Design-Tokens (`Bricolage Grotesque`, `Figtree`, `JetBrains Mono`)
- **Persistenz**: Rein lokal im Browser über versionierte `localStorage`-Schlüssel (`geldstart_progress_v2` für Lernfortschritt, `geldstart_depot_v1` für das Übungsdepot)
- **Tests**: Node.js Test-Runner mit `tsx` (`src/test/app.test.ts`)

---

## Lokale Entwicklung, Tests & Build

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver (Express + Vite auf Port 3000) starten
npm run dev

# Produktions-Build erstellen (Ausgabe im Ordner dist/)
npm run build

# TypeScript-Typprüfung (Linting) ausführen
npm run lint

# Unit-Tests für Rechner-Logik, Depot-Arithmetik & Persistenz ausführen
npx tsx --test src/test/app.test.ts
```
