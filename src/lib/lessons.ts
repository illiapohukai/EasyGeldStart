export type LessonId =
  | 'grundlagen'
  | 'zinseszins'
  | 'anlageklassen'
  | 'kindergeld'
  | 'altersvorsorgedepot'
  | 'staat'
  | 'taschengeld';

export interface LessonSection {
  heading: string;
  paragraphs: string[];
  bulletPoints?: string[];
  callout?: {
    tone: 'info' | 'warning';
    title: string;
    text: string;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanationCorrect: string;
  explanationWrong: string;
}

export interface PracticalExample {
  title: string;
  scenario: string;
  takeaway: string;
}

export interface StepMoreInfo {
  title: string;
  points: string[];
  sourceNote?: string;
}

export type LessonVisualMotif =
  | 'purchasing-power'
  | 'compound-curve'
  | 'asset-blocks'
  | 'three-pots'
  | 'time-horizon'
  | 'state-check'
  | 'budget-balance'
  | 'emergency-shield'
  | 'snowball-effect'
  | 'pay-first'
  | 'pension-balance'
  | 'cost-warning'
  | 'abo-check';

export type InteractiveStepWidget =
  | 'inflation-slider'
  | 'compound-slider'
  | 'asset-inspector'
  | 'small-amounts-slider'
  | 'retirement-slider'
  | 'state-status-checker'
  | 'budget-mini';

export interface IntroStep {
  id: string;
  type: 'intro';
  kicker: string;
  title: string;
  hook: string;
  body: string;
  visual: LessonVisualMotif;
  ctaLabel?: string;
}

export interface ExplanationStep {
  id: string;
  type: 'explanation';
  kicker: string;
  title: string;
  body: string;
  highlightPoint?: string;
  visual?: LessonVisualMotif;
  moreInfo?: StepMoreInfo;
}

export interface ComparisonCardItem {
  label: string;
  title: string;
  points: string[];
  badge: string;
  tone: 'neutral' | 'accent' | 'warning';
}

export interface ComparisonStep {
  id: string;
  type: 'comparison';
  kicker: string;
  title: string;
  body: string;
  leftCard: ComparisonCardItem;
  rightCard: ComparisonCardItem;
  takeaway: string;
  moreInfo?: StepMoreInfo;
}

export interface VisualChoiceOption {
  id: string;
  label: string;
  subtitle: string;
  visualType: 'single-concentration' | 'diversified-basket' | 'short-term-safe' | 'long-term-growth';
  metrics: string[];
}

export interface VisualChoiceStep {
  id: string;
  type: 'visual_choice';
  kicker: string;
  title: string;
  question: string;
  options: [VisualChoiceOption, VisualChoiceOption];
  correctIndex: 0 | 1;
  explanationCorrect: string;
  explanationWrong: string;
  moreInfo?: StepMoreInfo;
}

export interface QuestionStep {
  id: string;
  type: 'question';
  kicker: string;
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanationCorrect: string;
  explanationWrong: string;
  moreInfo?: StepMoreInfo;
}

export interface ScenarioFact {
  label: string;
  value: string;
}

export interface ScenarioStep {
  id: string;
  type: 'scenario';
  kicker: string;
  title: string;
  personTag: string;
  situation: string;
  contextFacts?: ScenarioFact[];
  question: string;
  options: string[];
  correctIndex: number;
  explanationCorrect: string;
  explanationWrong: string;
  moreInfo?: StepMoreInfo;
}

export interface InteractiveStep {
  id: string;
  type: 'interactive';
  kicker: string;
  title: string;
  body: string;
  widget: InteractiveStepWidget;
  moreInfo?: StepMoreInfo;
}

export interface CompletionStep {
  id: string;
  type: 'completion';
  kicker: string;
  title: string;
  body: string;
  summaryPoints: string[];
  depotBridge?: {
    label: string;
    description: string;
    to: '/depot' | '/rechner';
  };
}

export type LessonStep =
  | IntroStep
  | ExplanationStep
  | ComparisonStep
  | VisualChoiceStep
  | QuestionStep
  | ScenarioStep
  | InteractiveStep
  | CompletionStep;

export interface LessonModule {
  id: LessonId;
  route: `/${LessonId}`;
  order: number;
  isCoreTopic: boolean;
  categoryLabel: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  oneLineDescription: string;
  readingMinutes: number;
  hook: string;
  intro: string;
  steps: LessonStep[];
  sections: LessonSection[];
  practicalExample: PracticalExample;
  interactiveType:
    | 'inflation'
    | 'compound-preview'
    | 'asset-classes'
    | 'small-amounts'
    | 'retirement-horizon'
    | 'state-support'
    | 'budget-planner';
  merkeSummary: string[];
  quiz: QuizQuestion[];
  nextRoute?: `/${LessonId}`;
}

export interface AssetClassProfile {
  id: string;
  name: string;
  shortLabel: string;
  explanation: string;
  riskLevel: 'Niedrig' | 'Niedrig bis mittel' | 'Mittel' | 'Mittel bis hoch' | 'Hoch' | 'Sehr hoch';
  riskScore: 1 | 2 | 3 | 4 | 5;
  typicalFluctuation: string;
  accessibility: string;
  liquidity: string;
  beginnerConsideration: string;
  details: string[];
}

export interface StateSupportProgram {
  id: string;
  name: string;
  status: 'active' | 'planned' | 'changing';
  statusBadgeText: string;
  standNote: string;
  summary: string;
  whoIsItFor: string;
  howItWorks: string[];
  importantConditions: string;
  verificationSource: string;
}

export interface DailyQuestionItem {
  id: string;
  topicId: LessonId;
  topicLabel: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const ASSET_CLASSES: AssetClassProfile[] = [
  {
    id: 'tagesgeld-festgeld',
    name: 'Tagesgeld & Festgeld',
    shortLabel: 'Tages- & Festgeld',
    explanation:
      'Verzinste Bankkonten ohne Kursschwankungen. Beim Tagesgeld kommst du jederzeit an dein Geld, beim Festgeld legst du es für eine feste Laufzeit zu einem vereinbarten Zinssatz fest.',
    riskLevel: 'Niedrig',
    riskScore: 1,
    typicalFluctuation: 'Keine Kursschwankung (0 % nominal), Zins beim Tagesgeld variabel',
    accessibility: 'Sehr einfach – oft ab 1 € bei fast jeder Bank eröffnenbar',
    liquidity: 'Tagesgeld: täglich verfügbar · Festgeld: bis Laufzeitende gebunden',
    beginnerConsideration:
      'Ideal für den Notgroschen und Sparziele in den nächsten 1–3 Jahren. In der EU greift die gesetzliche Einlagensicherung bis 100.000 € pro Person und Bank.',
    details: [
      'Tagesgeld eignet sich als flexibler Sicherheitspuffer für unvorhergesehene Ausgaben.',
      'Festgeld bietet planbarere Zinsen, dafür ist das Geld bis zum Laufzeitende gebunden.',
      'Reicht langfristig oft nur knapp aus, um die Inflation vollständig auszugleichen.',
    ],
  },
  {
    id: 'anleihen',
    name: 'Anleihen (Staats- & Unternehmensanleihen)',
    shortLabel: 'Anleihen',
    explanation:
      'Mit einer Anleihe leihst du einem Staat oder Unternehmen für eine feste Zeit Geld. Dafür erhältst du Zinsen (Kupon) und am Ende den Nennwert zurück – sofern der Schuldner zahlungsfähig bleibt.',
    riskLevel: 'Niedrig bis mittel',
    riskScore: 2,
    typicalFluctuation: 'Gering bis moderat (abhängig von Laufzeit, Zinsniveau und Bonität)',
    accessibility: 'Über ein Wertpapierdepot oder gebündelt als Anleihen-ETF handelbar',
    liquidity: 'Börsentäglich verkaufbar, Kurs kann vor Laufzeitende jedoch schwanken',
    beginnerConsideration:
      'Staatsanleihen stabiler Industrieländer gelten als risikoarm; Anleihen schwächerer Schuldner tragen ein höheres Ausfallrisiko.',
    details: [
      'Steigen die allgemeinen Marktzinsen, sinkt oft der Börsenkurs bereits laufender Anleihen.',
      'Am Ende der Laufzeit wird die Anleihe im Normalfall zu 100 % des Nennwerts zurückgezahlt.',
      'Wird häufig genutzt, um Schwankungen in einem gemischten Portfolio abzufedern.',
    ],
  },
  {
    id: 'aktien',
    name: 'Einzelaktien',
    shortLabel: 'Aktien',
    explanation:
      'Mit einer Aktie kaufst du einen Miteigentumsanteil an einem einzelnen Unternehmen. Läuft das Geschäft gut, kannst du von steigenden Kursen und Dividenden profitieren.',
    riskLevel: 'Hoch',
    riskScore: 4,
    typicalFluctuation: 'Deutlich – einzelne Aktien können stark steigen, aber auch um 50 % oder mehr fallen',
    accessibility: 'Über ein Depot ab wenigen Euro (oder per Sparplan) kaufbar',
    liquidity: 'Hoch – an Börsenhandelstagen jederzeit verkaufbar (zum jeweiligen Tageskurs)',
    beginnerConsideration:
      'Wer nur wenige Einzelaktien kauft, geht ein hohes Klumpenrisiko ein: Gerät genau diese eine Firma in eine Krise, leidet dein gesamter Einsatz.',
    details: [
      'Erfordert Zeit und Wissen, um Geschäftsmodelle einzelner Firmen zu beurteilen.',
      'Bekannte Marken sind nicht automatisch gute oder sichere Geldanlagen.',
      'Nur für Geld geeignet, auf das du mindestens 10 Jahre verzichten kannst.',
    ],
  },
  {
    id: 'etfs',
    name: 'ETFs (Börsengehandelte Indexfonds)',
    shortLabel: 'ETFs',
    explanation:
      'Ein ETF bündelt automatisch hunderte oder tausende Wertpapiere (z. B. aus einem Welt-Index) in einem einzigen Baustein. So verteilst du dein Geld sofort breit über viele Länder und Branchen.',
    riskLevel: 'Mittel bis hoch',
    riskScore: 3,
    typicalFluctuation: 'Marktübliche Kursschwankungen (Zwischentiefs von 20–40 % in Krisenjahren möglich)',
    accessibility: 'Sehr einsteigerfreundlich – per Sparplan oft schon ab 1 € bis 25 € monatlich',
    liquidity: 'Börsentäglich handelbar; sinnvoll jedoch nur mit langem Anlagehorizont',
    beginnerConsideration:
      'Breit gestreute Welt-ETFs gelten als beliebter Einstieg für den langfristigen Vermögensaufbau, können aber zeitweise ebenfalls im Minus stehen.',
    details: [
      'Automatische Risikostreuung (Diversifikation) über viele Unternehmen weltweit.',
      'Geringe laufende Kosten (oft 0,1 % bis 0,3 % pro Jahr).',
      'Funktioniert am besten über viele Jahre hinweg durch geduldiges Durchhalten.',
    ],
  },
  {
    id: 'immobilien',
    name: 'Immobilien',
    shortLabel: 'Immobilien',
    explanation:
      'Eigentumswohnungen oder Häuser zur Eigennutzung oder Vermietung – alternativ indirekt über börsengehandelte Immobilienunternehmen (REITs) oder Immobilienfonds.',
    riskLevel: 'Mittel',
    riskScore: 3,
    typicalFluctuation: 'Wert schwankt langsamer als an der Börse, hängt stark von Lage, Zinsen und Zustand ab',
    accessibility: 'Direktkauf erfordert hohes Eigenkapital & Kredit; indirekt über Fonds ab kleinen Beträgen',
    liquidity: 'Niedrig – ein Haus oder eine Wohnung lässt sich nicht spontan in wenigen Tagen verkaufen',
    beginnerConsideration:
      'Für 16- bis 20-Jährige ist ein direkter Immobilienkauf meist unrealistisch und unflexibel, weil Ausbildung und Wohnort sich noch oft ändern.',
    details: [
      'Hohe Kaufnebenkosten (Grunderwerbsteuer, Notar, Makler) von oft 8–12 % des Kaufpreises.',
      'Laufende Kosten für Instandhaltung und Rücklagen werden leicht unterschätzt.',
      'Offene Immobilienfonds haben gesetzliche Halte- und Kündigungsfristen.',
    ],
  },
  {
    id: 'gold',
    name: 'Gold (Edelmetalle)',
    shortLabel: 'Gold',
    explanation:
      'Physisches Gold (Münzen, Barren) oder besicherte Gold-Wertpapiere. Gold arbeitet nicht wie ein Unternehmen und zahlt weder Zinsen noch Dividenden – der Ertrag hängt allein vom Goldpreis ab.',
    riskLevel: 'Mittel bis hoch',
    riskScore: 3,
    typicalFluctuation: 'Spürbare Preisschwankungen; zudem Wechselkurseinfluss (Handel meist in US-Dollar)',
    accessibility: 'Als kleine Münzen/Barren bei Händlern oder als Wertpapier über das Depot',
    liquidity: 'Mittel bis hoch – jederzeit verkaufbar, bei Münzen/Barren aber mit Händleraufschlag',
    beginnerConsideration:
      'Wird oft als kleine Beimischung (z. B. 5–10 %) gesehen, ersetzt aber keinen breit gestreuten Vermögensaufbau.',
    details: [
      'Kein laufender Ertrag (0 % Zins, 0 % Dividende) – daher kein klassischer Zinseszins-Effekt.',
      'Bei physischem Gold entstehen Kosten für sichere Aufbewahrung.',
      'Der Goldpreis kann über viele Jahre seitwärts laufen oder deutlich schwanken.',
    ],
  },
  {
    id: 'krypto',
    name: 'Kryptowährungen (Krypto-Assets)',
    shortLabel: 'Krypto',
    explanation:
      'Digitale Token auf Basis der Blockchain-Technologie (z. B. Bitcoin oder Ethereum). Ihr Preis richtet sich fast ausschließlich nach Angebot, Nachfrage und Marktstimmung.',
    riskLevel: 'Sehr hoch',
    riskScore: 5,
    typicalFluctuation: 'Extrem – Kurseinbrüche von 50 % bis 90 % oder ein Totalverlust einzelner Coins sind möglich',
    accessibility: 'Über Krypto-Börsen oder Broker (in der Regel erst ab 18 Jahren)',
    liquidity: 'Handel rund um die Uhr möglich, aber mit extremen Kurssprüngen',
    beginnerConsideration:
      'Reine Spekulation, keine sichere Geldanlage. Vorsicht vor Versprechen auf Social Media und „Pump-and-Dump“-Gruppen.',
    details: [
      'Keine Einlagensicherung und kein Unternehmensumsatz hinter den meisten Coins.',
      'Verlust des privaten Schlüssels (Seed Phrase) bedeutet oft den unwiederbringlichen Verlust.',
      'Wenn überhaupt, nur mit Spielgeld ausprobieren, dessen Totalverlust dir nicht schadet.',
    ],
  },
];

export const STATE_SUPPORT_PROGRAMS: StateSupportProgram[] = [
  {
    id: 'vl',
    name: 'Vermögenswirksame Leistungen (VL)',
    status: 'active',
    statusBadgeText: 'Aktiv · Bestehende Regelung',
    standNote: 'Stand: 2025/2026',
    summary:
      'Viele Arbeitgeber zahlen Auszubildenden und Beschäftigten freiwillig oder per Tarifvertrag bis zu 40 € monatlich zusätzlich zum Gehalt in einen VL-Sparvertrag.',
    whoIsItFor: 'Auszubildende, Angestellte, Beamte und dual Studierende (je nach Tarif- oder Arbeitsvertrag)',
    howItWorks: [
      'Frag in der Personalabteilung oder deinem Ausbildungsvertrag nach, ob dein Betrieb VL zahlt.',
      'Du eröffnest einen VL-fähigen Vertrag (z. B. VL-Fondssparplan, Banksparplan oder Bausparvertrag).',
      'Dein Arbeitgeber überweist den Betrag direkt monatlich in diesen Vertrag.',
    ],
    importantConditions:
      'Typische Laufzeit: 6 Jahre einzahlen plus bis zu 1 Jahr Ruhezeit (ca. 7 Jahre). Höhe hängt vom Tarif-/Arbeitsvertrag ab.',
    verificationSource: 'Verbraucherzentrale & Personalabteilung deines Ausbildungsbetriebs',
  },
  {
    id: 'arbeitnehmersparzulage',
    name: 'Arbeitnehmersparzulage',
    status: 'active',
    statusBadgeText: 'Aktiv · Staatlicher Zuschuss',
    standNote: 'Stand: 2025/2026',
    summary:
      'Wenn du vermögenswirksame Leistungen (VL) in einen geförderten Vertrag (z. B. Aktienfondssparplan oder Bausparvertrag) anlegst, legt der Staat innerhalb der Einkommensgrenzen jährlich eine Zulage obendrauf.',
    whoIsItFor:
      'Auszubildende und Arbeitnehmer mit einem zu versteuernden Einkommen innerhalb der gesetzlichen Fördergrenzen',
    howItWorks: [
      'Dein Arbeitgeber oder du selbst zahlt VL in einen förderfähigen Vertrag ein.',
      'Du beantragst die Arbeitnehmersparzulage über deine Einkommensteuererklärung.',
      'Nach Ablauf der Sperrfrist wird die gesammelte Zulage in deinen Vertrag ausgezahlt.',
    ],
    importantConditions:
      'Die Einkommensgrenzen wurden deutlich angehoben, sodass fast alle Azubis und Berufseinsteiger darunter liegen. Es gelten feste Sperrfristen.',
    verificationSource: 'Bundesministerium der Finanzen / Finanzamt / Verbraucherzentrale',
  },
  {
    id: 'wohnungsbaupraemie',
    name: 'Wohnungsbauprämie (inkl. U25-Sonderregel)',
    status: 'active',
    statusBadgeText: 'Aktiv · Mit Bedingungen',
    standNote: 'Stand: 2025/2026',
    summary:
      'Staatlicher Zuschuss auf eigene Einzahlungen in einen Bausparvertrag (ab 16 Jahren). Für unter 25-Jährige gibt es eine gesetzliche Ausnahmeregel bei der Verwendung.',
    whoIsItFor:
      'Sparer ab 16 Jahren innerhalb der Einkommensgrenzen, die mindestens den jährlichen Mindestbetrag in einen Bausparvertrag einzahlen',
    howItWorks: [
      'Normalerweise ist die Wohnungsbauprämie an eine wohnwirtschaftliche Nutzung gebunden.',
      'Sonderregel unter 25 Jahren: Wer bei Abschluss jünger als 25 ist, darf nach 7 Jahren Sparzeit einmalig frei über das Guthaben inkl. Prämie verfügen.',
    ],
    importantConditions:
      'Achte auf Abschlussgebühren (oft 1,0 % bis 1,6 % der Bausparsumme) und niedrige Guthabenzinsen – ein Bausparvertrag lohnt sich nicht automatisch nur wegen der Prämie.',
    verificationSource: 'Verbraucherzentrale & unabhängige Finanzberatung',
  },
  {
    id: 'riester',
    name: 'Riester-Förderung & Berufseinsteiger-Bonus',
    status: 'changing',
    statusBadgeText: 'Aktiv · Reformen in Diskussion',
    standNote: 'Stand: 2025/2026',
    summary:
      'Staatlich geförderte private Altersvorsorge mit Grundzulage und einem einmaligen Berufseinsteiger-Bonus für junge Sparer unter 25 Jahren.',
    whoIsItFor:
      'Rentenversicherungspflichtige Beschäftigte und Auszubildende, die den erforderlichen Mindesteigenbeitrag einzahlen',
    howItWorks: [
      'Für die volle Zulage müssen mindestens 4 % des Vorjahres-Bruttoeinkommens (abzgl. Zulage, mind. 60 € Sockelbetrag) eingezahlt werden.',
      'Unter 25-Jährige können im ersten Förderjahr einen einmaligen Berufseinsteiger-Bonus erhalten.',
    ],
    importantConditions:
      'Viele bestehende Riester-Verträge haben hohe Abschluss- und Verwaltungskosten sowie eine Bindung bis zum Rentenalter. Die Politik diskutiert über Reformen.',
    verificationSource: 'Deutsche Rentenversicherung (Ihre Vorsorge) & Verbraucherzentrale',
  },
  {
    id: 'fruehstart-altersvorsorgedepot',
    name: 'Frühstart-Rente & gefördertes Altersvorsorgedepot',
    status: 'planned',
    statusBadgeText: 'Geplant · Noch nicht in Kraft',
    standNote: 'Stand: 2025/2026 (Politisches Vorhaben)',
    summary:
      'In der Politik werden Konzepte wie eine staatlich bezuschusste „Frühstart-Rente“ sowie ein steuerlich gefördertes „Altersvorsorgedepot“ diskutiert.',
    whoIsItFor:
      'Aktuell noch für niemanden abschließbar – es handelt sich um politische Vorschläge, die noch nicht als Gesetz beschlossen und nicht aktiv sind.',
    howItWorks: [
      'Diskutiert wird, private Altersvorsorge künftig stärker über kostengünstige Wertpapierdepots (z. B. mit ETFs) zu fördern.',
      'Auch ein staatlicher Startbeitrag für junge Menschen („Frühstart-Rente“) wurde vorgeschlagen.',
    ],
    importantConditions:
      'Wichtig: Verlass dich bei deiner Planung niemals auf Gesetzesentwürfe, die noch nicht in Kraft getreten sind.',
    verificationSource: 'Bundesministerium der Finanzen & Verbraucherzentralen',
  },
];

export const LESSONS: LessonModule[] = [
  {
    id: 'grundlagen',
    route: '/grundlagen',
    order: 1,
    isCoreTopic: true,
    categoryLabel: 'Modul 01 · Fundament',
    title: 'Grundlagen der Geldanlage',
    shortTitle: 'Grundlagen',
    subtitle: 'Sparen vs. Investieren, Inflation, Notgroschen und Streuung.',
    oneLineDescription: 'Sparen, Inflation, Notgroschen und warum Streuung dich schützt.',
    readingMinutes: 4,
    hook: 'Warum verlieren 100 € mit der Zeit an Wert?',
    intro:
      'Bevor du den ersten Euro anlegst, brauchst du ein stabiles Fundament: Wann sparst du auf dem Konto, wann investierst du langfristig – und wie schützt du dich vor unnötigen Risiken?',
    steps: [
      {
        id: 'grundlagen-1-intro',
        type: 'intro',
        kicker: 'Modul 01 · Grundlagen',
        title: 'Warum verlieren 100 € mit der Zeit an Wert?',
        hook: '100 € auf dem Konto bleiben zwar 100 € – aber im Alltag bekommst du dafür später oft spürbar weniger.',
        body: 'In dieser kurzen Einheit lernst du den Unterschied zwischen Sparen und Investieren, warum du zuerst einen Notgroschen brauchst und wie Risikostreuung funktioniert.',
        visual: 'purchasing-power',
        ctaLabel: 'Lektion starten',
      },
      {
        id: 'grundlagen-2-compare',
        type: 'comparison',
        kicker: 'Konzept 1 · Zwei Werkzeuge',
        title: 'Sparen oder investieren?',
        body: 'Beide Wege sind wichtig – sie erfüllen aber völlig unterschiedliche Aufgaben in deinem Leben.',
        leftCard: {
          label: 'Kurzfristig · 0–3 Jahre',
          title: 'Sparen (Tagesgeld)',
          badge: 'Sicher & verfügbar',
          tone: 'neutral',
          points: [
            'Geld bleibt jederzeit griffbereit',
            'Keine Kursschwankungen (100 € bleiben 100 €)',
            'Für Notgroschen, Urlaub oder Führerschein',
          ],
        },
        rightCard: {
          label: 'Langfristig · ab 10 Jahren',
          title: 'Investieren (z. B. Welt-ETF)',
          badge: 'Wachstumschance',
          tone: 'accent',
          points: [
            'Geld arbeitet langfristig in Unternehmen mit',
            'Höhere Ertragschancen über viele Jahre',
            'Kurse können zwischendurch deutlich schwanken',
          ],
        },
        takeaway: 'Kurzfristige Ziele gehören aufs sichere Konto. Nur langfristig freies Geld gehört an die Börse.',
        moreInfo: {
          title: 'Was bedeutet Einlagensicherung?',
          points: [
            'Auf Giro-, Tagesgeld- und Festgeldkonten sind Guthaben in der EU gesetzlich bis zu 100.000 € pro Person und Bank geschützt.',
            'An der Börse gibt es dagegen keine Kursgarantie: Wertpapiere können im Wert steigen, aber auch fallen.',
          ],
        },
      },
      {
        id: 'grundlagen-3-scenario-1000',
        type: 'scenario',
        kicker: 'Verständnis-Check · Zeithorizont',
        title: 'Wohin mit kurzfristigem Geld?',
        personTag: 'Alltags-Entscheidung',
        situation: 'Du hast 1.000 € gespart, die du in genau sechs Monaten sicher für deinen Führerschein oder eine Reise brauchst.',
        contextFacts: [
          { label: 'Betrag', value: '1.000 €' },
          { label: 'Zeitpunkt', value: 'in 6 Monaten' },
        ],
        question: 'Du brauchst 1.000 € in sechs Monaten. Wo gehört das Geld hin?',
        options: [
          'Auf ein Tagesgeldkonto ohne Kursschwankungen',
          'In eine einzelne bekannte Tech-Aktie',
          'In Kryptowährungen, weil sie rund um die Uhr handelbar sind',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Richtig. Geld, das du bald brauchst, sollte keinen starken Kursschwankungen ausgesetzt sein.',
        explanationWrong:
          'Noch nicht ganz. Eine einzelne Aktie oder Kryptowährung kann genau dann im Minus sein, wenn du das Geld in sechs Monaten brauchst.',
      },
      {
        id: 'grundlagen-4-inflation',
        type: 'interactive',
        kicker: 'Konzept 2 · Kaufkraft',
        title: 'Inflation: Gleiche Zahl, weniger im Einkaufswagen',
        body: '100 € bleiben auf dem Konto 100 €. Wenn Preise steigen, kannst du dir später trotzdem weniger dafür kaufen. Probier es mit dem Regler aus:',
        widget: 'inflation-slider',
        moreInfo: {
          title: 'Warum strebt die Zentralbank ca. 2 % Inflation an?',
          points: [
            'Die Europäische Zentralbank (EZB) hält eine jährliche Preissteigerung von rund 2 % für gesund für die Wirtschaft.',
            'Für unverzinstes Bargeld bedeutet selbst diese normale Inflation nach 10 Jahren rund 18 % weniger reale Kaufkraft.',
          ],
          sourceNote: 'Quelle: Deutsche Bundesbank / EZB',
        },
      },
      {
        id: 'grundlagen-5-inflation-check',
        type: 'question',
        kicker: 'Kurz-Check · Inflation',
        title: 'Was passiert auf dem Girokonto?',
        question: 'Auf deinem Girokonto liegen 100 € zu 0 % Zinsen. Die Inflation beträgt 3 % pro Jahr. Was stimmt?',
        options: [
          'Die Bank bucht jedes Jahr 3 € Gebühr ab.',
          'Auf dem Konto stehen weiter 100 €, aber deine Kaufkraft sinkt.',
          'Deine Kaufkraft steigt automatisch mit den Preisen.',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Genau richtig. Der Kontostand bleibt bei 100 €, aber weil Waren und Tickets teurer werden, bekommst du real weniger dafür.',
        explanationWrong:
          'Nicht ganz: Die Zahl auf dem Konto bleibt zwar 100 €, aber durch steigende Preise sinkt das, was du dir real davon kaufen kannst.',
      },
      {
        id: 'grundlagen-6-notgroschen',
        type: 'explanation',
        kicker: 'Konzept 3 · Sicherheitsreserve',
        title: 'Erst der Notgroschen, dann die Börse',
        body: 'Dein Laptop geht kurz vor den Prüfungen kaputt oder das Handy muss repariert werden. Mit einem Notgroschen auf dem Tagesgeldkonto bezahlst du solche Kosten entspannt – ohne Wertpapiere im Minus verkaufen zu müssen.',
        highlightPoint: 'Orientierung für junge Leute: 500 € bis 1.500 € (ca. 2–3 Monatsausgaben) als eiserne Reserve.',
        visual: 'emergency-shield',
        moreInfo: {
          title: 'Wie baue ich den Notgroschen am besten auf?',
          points: [
            'Nutze ein kostenloses Tagesgeldkonto getrennt von deinem normalen Girokonto, damit du die Reserve nicht aus Versehen im Alltag ausgibst.',
            'Solange dein Notgroschen noch nicht steht, hat er Vorrang vor jedem Börsen-Sparplan.',
          ],
        },
      },
      {
        id: 'grundlagen-7-diversifikation',
        type: 'visual_choice',
        kicker: 'Konzept 4 · Risikostreuung',
        title: 'Diversifikation: Nicht alles auf eine Karte',
        question: 'Welcher Aufbau schützt dich besser, falls ein einzelnes Unternehmen in eine Krise gerät?',
        options: [
          {
            id: 'single',
            label: '1 Einzelposition',
            subtitle: '100 % in eine einzige bekannte Firma',
            visualType: 'single-concentration',
            metrics: ['1 Unternehmen', '1 Branche', 'Hohes Klumpenrisiko'],
          },
          {
            id: 'basket',
            label: 'Breit gestreuter Korb',
            subtitle: 'Verteilt auf hunderte Firmen weltweit',
            visualType: 'diversified-basket',
            metrics: ['Viele Unternehmen', 'Viele Branchen & Länder', 'Einzelrisiko abgefedert'],
          },
        ],
        correctIndex: 1,
        explanationCorrect:
          'Richtig. Wenn dein Geld breit über viele Unternehmen, Branchen und Länder verteilt ist, fängt die Gesamtanlage den Ausfall einzelner Firmen ab.',
        explanationWrong:
          'Vorsicht: Wer alles auf eine einzige Firma setzt, trägt ein hohes Klumpenrisiko. Geht genau diese Firma baden, leidet dein gesamtes Geld.',
        moreInfo: {
          title: 'Warnsignal bei Finanz-Tipps auf Social Media',
          points: [
            'Höhere Renditechancen gibt es an den Finanzmärkten nur mit Kursschwankungen.',
            'Verspricht jemand „hohe Gewinne ohne jedes Risiko in kurzer Zeit“, handelt es sich fast immer um unseriöse Werbung oder Betrug.',
          ],
          sourceNote: 'Quelle: BaFin Verbraucherwarnungen',
        },
      },
      {
        id: 'grundlagen-8-leonie',
        type: 'scenario',
        kicker: 'Praxis-Entscheidung · Leonie (17)',
        title: 'Wie sollte Leonie ihr Geld aufteilen?',
        personTag: 'Leonie · 17 Jahre · Schülerin mit Ferienjob',
        situation: 'Leonie hat durch Ferienjobs 1.800 € angespart. In 8 Monaten muss sie ihren Führerschein bezahlen (ca. 1.400 €). Die übrigen 400 € sind ihre einzige Reserve.',
        contextFacts: [
          { label: 'Erspartes', value: '1.800 €' },
          { label: 'Führerschein (in 8 Mon.)', value: '1.400 €' },
          { label: 'Rest-Reserve', value: '400 €' },
        ],
        question: 'Welche Entscheidung ist für Leonie jetzt am sinnvollsten?',
        options: [
          'Die gesamten 1.800 € sicher auf dem Tagesgeldkonto lassen, bis der Führerschein bezahlt ist',
          'Die 1.800 € sofort für 8 Monate in einen Aktien-ETF investieren',
          'Die 400 € Reserve in Einzelaktien stecken, um schneller mehr Geld zu haben',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Perfekt entschieden! Weil Leonie die 1.400 € schon in 8 Monaten sicher braucht und die 400 € ihr Notgroschen sind, bleibt das Geld auf dem Tagesgeldkonto. Einen kleinen ETF-Sparplan startet sie erst später mit neuem, langfristig freiem Geld.',
        explanationWrong:
          'Denk an den Zeithorizont: In 8 Monaten kann auch ein ETF im Minus stehen, und die 400 € braucht Leonie als Notgroschen. Kurzfristig geplantes Geld bleibt auf dem Tagesgeldkonto.',
      },
      {
        id: 'grundlagen-9-completion',
        type: 'completion',
        kicker: 'Modul 01 abgeschlossen',
        title: 'Stark! Dein Fundament steht.',
        body: 'Du kennst jetzt die vier wichtigsten Grundregeln jeder soliden Finanzplanung.',
        summaryPoints: [
          'Sparen (Tagesgeld) sichert kurzfristige Ziele; Investieren braucht Zeit (10+ Jahre).',
          'Inflation senkt über die Jahre die reale Kaufkraft von unverzinstem Geld.',
          'Ein Notgroschen (ca. 2–3 Monatsausgaben) schützt dich vor ungeplanten Kosten.',
          'Breite Streuung (Diversifikation) vermeidet gefährliche Klumpenrisiken.',
        ],
        depotBridge: {
          label: 'Streuung im Depot ansehen',
          description: 'Schau dir im virtuellen Übungsdepot an, wie sich eine Einzelaktie und ein Welt-ETF im Gewicht unterscheiden.',
          to: '/depot',
        },
      },
    ],
    sections: [
      {
        heading: '1. Der Unterschied zwischen Sparen und Investieren',
        paragraphs: [
          'Beim klassischen Sparen legst du Geld auf ein sicheres Konto (z. B. Girokonto oder Tagesgeld). Der Betrag schwankt nicht – 500 € bleiben genau 500 € plus eventuelle Zinsen.',
          'Beim Investieren kaufst du Werte wie Unternehmensanteile (Aktien/ETFs) oder Anleihen. Langfristig bietet das höhere Ertragschancen, kurzfristig kann der Wert aber spürbar schwanken.',
        ],
      },
      {
        heading: '2. Inflation und Notgroschen',
        paragraphs: [
          'Steigen die Preise im Alltag (Inflation), bekommst du für denselben Euro-Betrag später weniger. Bei 2 % Inflation haben 100 € nach 10 Jahren nur noch rund 82 € Kaufkraft.',
          'Bevor du langfristig investierst, brauchst du einen jederzeit verfügbaren Notgroschen auf dem Tagesgeldkonto, und an der Börse streust du dein Geld breit (Diversifikation).',
        ],
      },
    ],
    practicalExample: {
      title: 'Praxisbeispiel: Leonie (17) plant Führerschein und Zukunft',
      scenario:
        'Leonie hat durch Ferienjobs 1.800 € angespart. In 8 Monaten möchte sie ihren Führerschein bezahlen (ca. 1.400 €). Die restlichen 400 € sind ihre Reserve.',
      takeaway:
        'Weil Leonie das Geld schon in wenigen Monaten sicher braucht, gehört es auf ein Tagesgeldkonto – nicht in Aktien oder ETFs.',
    },
    interactiveType: 'inflation',
    merkeSummary: [
      'Sparen sichert kurzfristige Ziele; Investieren dient dem langfristigen Vermögensaufbau.',
      'Inflation verringert über die Jahre die Kaufkraft von unverzinstem Bargeld.',
      'Geld für die nächsten 3–5 Jahre gehört auf ein sicheres Konto (Notgroschen), nicht an die Börse.',
      'Breite Streuung (Diversifikation) senkt das Risiko einzelner Fehlgriffe deutlich.',
    ],
    quiz: [
      {
        id: 'grundlagen-q1',
        question: 'Was passiert bei einer jährlichen Inflation von 3 %, wenn dein Geld zu 0 % Zinsen auf dem Girokonto liegt?',
        options: [
          'Der Euro-Betrag auf dem Konto wird jedes Jahr automatisch um 3 % abgebucht.',
          'Der Betrag auf dem Konto bleibt gleich, aber du kannst dir davon im Alltag weniger kaufen.',
          'Dein Geld gewinnt an Kaufkraft, weil Preise sinken.',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Genau richtig! Die Zahl auf dem Konto bleibt identisch, aber durch steigende Preise sinkt die reale Kaufkraft.',
        explanationWrong:
          'Nicht ganz: Die Bank zieht dir kein Geld ab, aber weil Waren teurer werden, bekommst du für denselben Betrag weniger.',
      },
      {
        id: 'grundlagen-q2',
        question: 'Du brauchst 1.000 € in sechs Monaten. Wo gehört das Geld hin?',
        options: [
          'In eine einzelne Tech-Aktie, damit es sich schnell verdoppelt.',
          'In Kryptowährungen, weil man die jederzeit verkaufen kann.',
          'Auf ein sicheres Tagesgeldkonto ohne Kursschwankungen.',
        ],
        correctIndex: 2,
        explanationCorrect:
          'Richtig. Geld, das du bald brauchst, sollte keinen starken Kursschwankungen ausgesetzt sein.',
        explanationWrong:
          'Noch nicht ganz. Eine einzelne Aktie kann genau dann im Minus sein, wenn du das Geld brauchst.',
      },
      {
        id: 'grundlagen-q3',
        question: 'Was bedeutet „Diversifikation“ (Risikostreuung) bei der Geldanlage?',
        options: [
          'Man verteilt sein Geld auf viele verschiedene Unternehmen, Branchen und Länder.',
          'Man wechselt jeden Tag die Bank, um Bonusprämien mitzunehmen.',
          'Man investiert sein gesamtes Geld in das aktuell bekannteste Unternehmen.',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Perfekt! Durch breite Streuung fängt die Gesamtanlage es auf, falls einzelne Unternehmen schlecht laufen.',
        explanationWrong:
          'Diversifikation heißt „nicht alles auf eine Karte setzen“: Du verteilst dein Geld breit auf viele Unternehmen und Regionen.',
      },
    ],
    nextRoute: '/zinseszins',
  },
  {
    id: 'zinseszins',
    route: '/zinseszins',
    order: 2,
    isCoreTopic: true,
    categoryLabel: 'Modul 02 · Zeit & Wachstum',
    title: 'Der Zinseszins-Effekt',
    shortTitle: 'Zinseszins',
    subtitle: 'Warum Zeit dein größter Verbündeter ist – und wie Erträge mitwachsen.',
    oneLineDescription: 'Warum Zeit wichtiger ist als ein hoher Startbetrag.',
    readingMinutes: 4,
    hook: 'Wie werden aus kleinen Monatsraten über Jahrzehnte große Summen?',
    intro:
      'Der Zinseszins ist der stärkste Hebel beim langfristigen Sparen: Wenn deine Erträge angelegt bleiben, erwirtschaften sie in den Folgejahren selbst wieder neue Erträge.',
    steps: [
      {
        id: 'zinseszins-1-intro',
        type: 'intro',
        kicker: 'Modul 02 · Zinseszins',
        title: 'Wenn Erträge eigene Erträge verdienen',
        hook: 'Nicht die Höhe deiner ersten Sparrate ist entscheidend – sondern wie lange dein Geld Zeit hat zu arbeiten.',
        body: 'In dieser Lektion siehst du, wie aus 25 Cent im zweiten Jahr über Jahrzehnte ein kräftiger Wachstumsmotor wird.',
        visual: 'compound-curve',
        ctaLabel: 'Lektion starten',
      },
      {
        id: 'zinseszins-2-prinzip',
        type: 'explanation',
        kicker: 'Konzept 1 · Das Prinzip',
        title: 'Zinsen auf deine Zinsen',
        body: 'Legst du 100 € zu 5 % Rendite pro Jahr an, hast du nach einem Jahr 105 €. Im zweiten Jahr bekommst du 5 % auf die vollen 105 € – also 5,25 € dazu (Endstand: 110,25 €).',
        highlightPoint: 'Diese zusätzlichen 0,25 € wirken winzig – sind aber der Beginn des Zinseszins-Effekts.',
        visual: 'snowball-effect',
        moreInfo: {
          title: 'Wann entsteht ein Zinseszins-Effekt?',
          points: [
            'Auf einem Tagesgeldkonto, wenn gutgeschriebene Zinsen auf dem Konto bleiben.',
            'Bei breit gestreuten ETFs oder Aktien, wenn Dividenden wieder angelegt werden (thesaurierend) und Unternehmensgewinne über Jahre weiterwachsen.',
          ],
        },
      },
      {
        id: 'zinseszins-3-check1',
        type: 'question',
        kicker: 'Verständnis-Check · Jahr 2',
        title: 'Rechne kurz nach',
        question: 'Du legst 100 € zu 5 % pro Jahr an und lässt die Erträge liegen. Wie viel hast du nach 2 Jahren?',
        options: [
          'Genau 110,00 € (jedes Jahr 5,00 €)',
          '110,25 €, weil im zweiten Jahr auch die 5 € Ertrag mitwachsen',
          '105,00 €, weil Zinsen nur einmal gezahlt werden',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Richtig. Im zweiten Jahr werden die vollen 105 € verzinst (5 % von 105 € = 5,25 €).',
        explanationWrong:
          'Noch nicht ganz: Nach Jahr 1 hast du 105 €. Im zweiten Jahr gibt es 5 % auf die 105 €, also 5,25 € dazu – zusammen 110,25 €.',
      },
      {
        id: 'zinseszins-4-interactive',
        type: 'interactive',
        kicker: 'Konzept 2 · Selbst ausprobieren',
        title: 'Erst flach, später steil',
        body: 'In den ersten 5 Jahren besteht dein Guthaben fast nur aus deinen Einzahlungen. Verschiebe die Anlagedauer auf 25 oder 35 Jahre und beobachte den dunkelgrünen Ertragsbalken:',
        widget: 'compound-slider',
        moreInfo: {
          title: 'Modellrechnung vs. echte Börsenkurse',
          points: [
            'Ein Zinseszins-Rechner rechnet mit einer glatten Durchschnittsrendite pro Jahr (z. B. 6 % p.a.).',
            'An der Börse verlaufen Kurse niemals geradlinig: Es gibt Jahre mit +15 % und Jahre mit −10 %. Die Rendite ist eine unverbindliche Annahme, keine Garantie.',
          ],
        },
      },
      {
        id: 'zinseszins-5-compare-noah',
        type: 'comparison',
        kicker: 'Konzept 3 · Der Faktor Zeit',
        title: 'Früh starten schlägt später viel einzahlen',
        body: 'Noah legt monatlich 40 € an (angenommene 6 % Rendite p.a.). Schau dir den Unterschied bis zum 47. Geburtstag an:',
        leftCard: {
          label: 'Start mit 17 Jahren (30 Jahre)',
          title: 'Rund 40.180 € Endwert',
          badge: '10 Jahre Vorsprung',
          tone: 'accent',
          points: [
            'Eigene Einzahlung: 14.400 €',
            'Rechnerischer Ertrag: +25.780 €',
            'Der Ertrag übersteigt die Einzahlung deutlich',
          ],
        },
        rightCard: {
          label: 'Start erst mit 27 Jahren (20 Jahre)',
          title: 'Rund 18.480 € Endwert',
          badge: 'Halbierter Endwert',
          tone: 'neutral',
          points: [
            'Eigene Einzahlung: 9.600 € (nur 4.800 € weniger)',
            'Rechnerischer Ertrag: +8.880 €',
            'Es fehlen 10 entscheidende Wachstumsjahre',
          ],
        },
        takeaway: 'Wer 10 Jahre früher mit kleinen Beträgen startet, zahlt nur wenig mehr ein, hat am Ende aber oft mehr als doppelt so viel.',
      },
      {
        id: 'zinseszins-6-scenario',
        type: 'scenario',
        kicker: 'Praxis-Szenario · Erwartungscheck',
        title: 'Geduld in den ersten Jahren',
        personTag: 'Lukas · 18 Jahre · 18 Monate Sparplan',
        situation: 'Lukas spart seit anderthalb Jahren jeden Monat 30 € in einen Welt-ETF. Er schaut ins Depot und sagt: „Der Zinseszins bringt ja kaum etwas, bisher ist fast alles nur mein eigenes eingezahltes Geld.“',
        contextFacts: [
          { label: 'Laufzeit bisher', value: '1,5 Jahre' },
          { label: 'Sparrate', value: '30 € / Monat' },
        ],
        question: 'Was erklärst du Lukas?',
        options: [
          'Das ist völlig normal: Der Zinseszins wirkt exponentiell und wird erst nach 10 bis 20 Jahren richtig stark.',
          'Er sollte den Sparplan sofort abbrechen, weil Zinseszins schon im ersten Monat das Geld verdoppeln müsste.',
          'Er muss jeden Monat das Wertpapier wechseln, damit der Zinseszins startet.',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Richtig. In den ersten Jahren legst du die Basis. Erst wenn über viele Jahre Erträge auf Erträge wachsen, wird die Kurve steil.',
        explanationWrong:
          'Geduld ist der Schlüssel: Nach 18 Monaten ist die Basis noch klein. Der Zinseszins entfaltet seine Kraft erst über 10, 20 und mehr Jahre.',
      },
      {
        id: 'zinseszins-7-check2',
        type: 'question',
        kicker: 'Wissens-Check · Rechner verstehen',
        title: 'Annahme statt Garantie',
        question: 'Warum zeigt der Zinseszins-Rechner bei 6 % Rendite p.a. eine Schätzung und kein festes Versprechen?',
        options: [
          'Weil Börsenkurse in der Realität schwanken und zukünftige Renditen nicht garantiert sind.',
          'Weil Banken Zinsen jedes Jahr auswürfeln.',
          'Weil der Rechner keine großen Zahlen addieren kann.',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Genau richtig. Der Rechner zeigt eine gleichmäßige Modellrechnung zur Orientierung – an der Börse schwanken Kurse von Jahr zu Jahr.',
        explanationWrong:
          'Merke dir: Ein Rechner nutzt eine geglättete Durchschnittsannahme. Echte Marktrenditen schwanken und sind niemals garantiert.',
      },
      {
        id: 'zinseszins-8-completion',
        type: 'completion',
        kicker: 'Modul 02 abgeschlossen',
        title: 'Du hast den Faktor Zeit gemeistert!',
        body: 'Du weißt jetzt, warum frühes Anfangen mit kleinen Beträgen langfristig den größten Unterschied macht.',
        summaryPoints: [
          'Zinseszins entsteht, wenn Erträge angelegt bleiben und selbst neue Erträge erwirtschaften.',
          'Zeit ist der wichtigste Hebel: Die Kurve startet flach und wird nach 10–25 Jahren steil.',
          'Rechner zeigen geglättete Modellwerte vor Steuern, Kosten und Kursschwankungen.',
        ],
        depotBridge: {
          label: 'Im Zinseszins-Rechner testen',
          description: 'Probiere deine eigene Wunschrate und Laufzeit im vereinfachten Rechner aus.',
          to: '/rechner',
        },
      },
    ],
    sections: [
      {
        heading: '1. Zinsen auf deine Zinsen – das Grundprinzip',
        paragraphs: [
          'Legst du 100 € zu 5 % jährlicher Rendite an, hast du nach dem ersten Jahr 105 €. Im zweiten Jahr werden die 5 % auf die gesamten 105 € berechnet (= 110,25 €).',
          'Nach 15 oder 25 Jahren wird der angesammelte Ertrag so groß, dass er jedes Jahr mehr neues Wachstum erzeugt als deine eigenen Einzahlungen.',
        ],
      },
      {
        heading: '2. Eigene Einzahlungen vs. Wertzuwachs',
        paragraphs: [
          'Unterscheide immer deine eigenen Einzahlungen vom geschätzten Ertrag. An der Börse verläuft Wachstum wellenförmig – ein Rechner nutzt einen geglätteten Durchschnittswert.',
        ],
      },
    ],
    practicalExample: {
      title: 'Praxisbeispiel: Früh starten (mit 17) vs. später starten (mit 27)',
      scenario:
        'Noah startet mit 17 Jahren einen Sparplan über 40 € im Monat (6 % p.a.). Bis 47 (30 Jahre) zahlt er 14.400 € ein und erreicht rechnerisch rund 40.180 €.',
      takeaway:
        'Startet er erst mit 27 (20 Jahre), zahlt er 9.600 € ein, kommt aber nur auf rund 18.480 €.',
    },
    interactiveType: 'compound-preview',
    merkeSummary: [
      'Zinseszins entsteht, wenn erwirtschaftete Zinsen oder Erträge direkt weiter angelegt bleiben.',
      'Zeit ist wichtiger als die Höhe der ersten Sparrate.',
      'Rechenmodelle zeigen glatte Durchschnittskurven – an der Börse schwanken reale Kurse.',
    ],
    quiz: [
      {
        id: 'zinseszins-q1',
        question: 'Du legst 100 € zu 5 % Zinsen pro Jahr an und lässt die Zinsen auf dem Konto. Wie viel hast du nach genau 2 Jahren?',
        options: [
          'Genau 110,00 € (jedes Jahr 5,00 €).',
          '110,25 €, weil im zweiten Jahr auch die 5 € Zinsen aus dem ersten Jahr mitverzinst werden.',
          '105,00 €, weil Zinsen nur einmalig gezahlt werden.',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Exakt! Im 2. Jahr gibt es 5 % auf 105 € (= 5,25 €). Die zusätzlichen 25 Cent sind der Zinseszins.',
        explanationWrong:
          'Schau genau hin: Nach Jahr 1 hast du 105 €. Im 2. Jahr bekommst du 5 % auf die vollen 105 €, also 5,25 € dazu.',
      },
      {
        id: 'zinseszins-q2',
        question: 'Welcher Faktor verstärkt den Zinseszins-Effekt auf lange Sicht am stärksten?',
        options: [
          'Eine möglichst lange Anlagedauer (Zeit), in der die Erträge ungestört weiterarbeiten können.',
          'Das ständige Ein- und Auszahlen des Geldes jeden Monat.',
          'Ein möglichst häufiger Wechsel zwischen verschiedenen Konten.',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Richtig! Je länger das Geld angelegt bleibt, desto stärker wächst der Anteil der Zinseszinsen.',
        explanationWrong:
          'Der entscheidende Hebel beim Zinseszins ist die Zeit.',
      },
      {
        id: 'zinseszins-q3',
        question: 'Warum zeigt ein Zinseszins-Rechner bei 6 % angenommener ETF-Rendite nur eine Schätzung und keine Garantie?',
        options: [
          'Weil Taschenrechner keine Prozentrechnung beherrschen.',
          'Weil Börsenkurse in der Realität schwanken und zukünftige Renditen nicht feststehen.',
          'Weil Banken die Zinsen jedes Jahr zufällig auswürfeln.',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Vollkommen richtig! Ein Rechner rechnet mit einem konstanten Durchschnittswert.',
        explanationWrong:
          'Der Rechner nutzt eine gleichmäßige Durchschnittsannahme. Echte Börsenrenditen schwanken.',
      },
    ],
    nextRoute: '/anlageklassen',
  },
  {
    id: 'anlageklassen',
    route: '/anlageklassen',
    order: 3,
    isCoreTopic: true,
    categoryLabel: 'Modul 03 · Bausteine',
    title: 'Anlageklassen im Überblick',
    shortTitle: 'Anlageklassen',
    subtitle: 'Tagesgeld, Anleihen, Aktien, ETFs, Immobilien, Gold & Krypto vergleichen.',
    oneLineDescription: 'Tagesgeld, ETFs, Aktien, Anleihen, Gold & Krypto sachlich einordnen.',
    readingMinutes: 5,
    hook: 'Worin unterscheiden sich Tagesgeld, ein Welt-ETF und eine Einzelaktie?',
    intro:
      'Nicht jede Geldanlage funktioniert gleich: Manche Bausteine halten dein Geld stabil, andere schwanken stärker, bieten dafür aber langfristige Wachstumschancen.',
    steps: [
      {
        id: 'anlageklassen-1-intro',
        type: 'intro',
        kicker: 'Modul 03 · Anlageklassen',
        title: 'Sieben Bausteine – klare Unterschiede',
        hook: 'Wer die Spielregeln von Tagesgeld, ETFs, Aktien und Krypto kennt, fällt nicht auf falsche Versprechen herein.',
        body: 'Hier lernst du, wie du jede Anlageform anhand von Risiko, Schwankung und Verfügbarkeit (Liquidität) einordnest.',
        visual: 'asset-blocks',
        ctaLabel: 'Lektion starten',
      },
      {
        id: 'anlageklassen-2-compare-etf-stock',
        type: 'comparison',
        kicker: 'Konzept 1 · Börsen-Bausteine',
        title: 'Einzelaktie vs. breit gestreuter ETF',
        body: 'An der Börse kannst du entweder einzelne Firmen auswählen oder mit einem ETF gleich einen ganzen Marktindex kaufen.',
        leftCard: {
          label: 'Einzelaktie',
          title: '1 einzelnes Unternehmen',
          badge: 'Hohes Einzelrisiko',
          tone: 'warning',
          points: [
            'Du bist Miteigentümer einer einzigen Firma',
            'Starke Kursausschläge nach oben und unten',
            'Gerät diese Firma in Not, leidet dein Einsatz',
          ],
        },
        rightCard: {
          label: 'Welt-ETF (Indexfonds)',
          title: 'Hunderte Firmen im Paket',
          badge: 'Breite Streuung',
          tone: 'accent',
          points: [
            'Bündelt z. B. über 1.000 Unternehmen weltweit',
            'Sehr niedrige laufende Kosten (ca. 0,1–0,3 % p.a.)',
            'Schwankt mit dem Gesamtmarkt, aber ohne Einzelpleite-Schock',
          ],
        },
        takeaway: 'Ein breit gestreuter ETF nimmt dir das Risiko ab, auf die falsche Einzelfirma zu setzen – braucht aber trotzdem 10+ Jahre Zeit.',
      },
      {
        id: 'anlageklassen-3-inspector',
        type: 'interactive',
        kicker: 'Konzept 2 · Direktvergleich',
        title: 'Alle 7 Anlageklassen prüfen',
        body: 'Tippe auf die Anlageklassen, um Risikostufe (1 bis 5), typische Wertschwankung und Verfügbarkeit zu vergleichen:',
        widget: 'asset-inspector',
      },
      {
        id: 'anlageklassen-4-check-etf',
        type: 'question',
        kicker: 'Verständnis-Check · ETF',
        title: 'Was leistet ein Welt-ETF?',
        question: 'Was ist der wichtigste Vorteil eines breit gestreuten Welt-ETFs gegenüber einer einzelnen Aktie?',
        options: [
          'Ein ETF darf gesetzlich niemals im Kurs fallen.',
          'Dein Geld wird automatisch auf viele Unternehmen verteilt, sodass eine einzelne Firmenkrise nicht alles gefährdet.',
          'Ein ETF verdoppelt dein Geld garantiert jedes Jahr.',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Richtig. Ein ETF schwankt zwar mit dem Gesamtmarkt, verteilt dein Risiko aber sofort auf hunderte Unternehmen.',
        explanationWrong:
          'Achtung: Auch ETFs schwanken und bieten keine Gewinn-Garantie. Ihr Vorteil gegenüber einer Einzelaktie ist die breite Risikostreuung.',
      },
      {
        id: 'anlageklassen-5-sachwerte',
        type: 'explanation',
        kicker: 'Konzept 3 · Gold, Immobilien & Krypto',
        title: 'Warum nicht alles glänzt',
        body: 'Immobilien binden viel Geld und sind unflexibel. Gold zahlt weder Zinsen noch Dividenden. Und Kryptowährungen wie Bitcoin schwanken extrem (oft −50 % bis −90 %) und sind reine Spekulation.',
        highlightPoint: 'Liquidität heißt: Wie schnell kommst du ohne hohe Abschläge wieder an dein Geld?',
        moreInfo: {
          title: 'Detaillierte Einordnung für 16- bis 20-Jährige',
          points: [
            'Immobilien: Beim Direktkauf fallen oft 8–12 % Kaufnebenkosten (Steuer, Notar, Makler) an, und ein Verkauf dauert Monate.',
            'Gold: Kein laufender Zinseszins-Effekt, da Gold keine Zinsen oder Dividenden ausschüttet.',
            'Krypto: Keine Einlagensicherung. Verlust des Zugangs-Schlüssels (Seed Phrase) bedeutet Totalverlust.',
          ],
        },
      },
      {
        id: 'anlageklassen-6-check-gold',
        type: 'question',
        kicker: 'Kurz-Check · Eigenschaften',
        title: 'Gold & Liquidität verstehen',
        question: 'Welche Aussage über Gold und Tagesgeld ist zutreffend?',
        options: [
          'Gold zahlt jedes Quartal feste Zinsen auf dein Konto.',
          'Gold zahlt keine Zinsen oder Dividenden; Tagesgeld ist dagegen täglich verfügbar (hohe Liquidität).',
          'Tagesgeld ist mindestens 10 Jahre fest gesperrt.',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Genau richtig. Gold erwirtschaftet keine laufenden Zinsen, während Tagesgeld jederzeit flexibel verfügbar ist.',
        explanationWrong:
          'Merke: Gold zahlt weder Zinsen noch Dividenden. Tagesgeld hat dagegen eine sehr hohe Liquidität (täglich verfügbar).',
      },
      {
        id: 'anlageklassen-7-scenario-samira',
        type: 'scenario',
        kicker: 'Praxis-Entscheidung · Samira (19)',
        title: 'Zwei Töpfe für zwei Ziele',
        personTag: 'Samira · 19 Jahre · Studentin',
        situation: 'Samira hat 1.000 € als Sicherheitsreserve angespart. Zusätzlich möchte sie jeden Monat 35 € für ihre Zukunft in 15+ Jahren zurücklegen.',
        contextFacts: [
          { label: 'Notgroschen', value: '1.000 €' },
          { label: 'Monatlich frei', value: '35 € (15+ Jahre)' },
        ],
        question: 'Wie kombiniert Samira die Anlageklassen sinnvoll?',
        options: [
          '1.000 € Notgroschen auf dem Tagesgeldkonto lassen und die 35 € monatlich in einen weltweit gestreuten ETF-Sparplan investieren',
          'Die 1.000 € und die 35 € komplett in eine einzige Mode-Aktie stecken',
          'Alles für 10 Jahre in einem unflexiblen Vertrag festschließen',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Richtig! Topf 1 (Sicherheit) bleibt schwankungsfrei auf dem Tagesgeld. Topf 2 (Langfrist-Wachstum) nutzt die breite Streuung eines Welt-ETFs.',
        explanationWrong:
          'Ihr Notgroschen (1.000 €) darf nicht schwanken und gehört aufs Tagesgeld. Für die langfristigen 35 € pro Monat bietet ein breit gestreuter ETF das bessere Verhältnis aus Chance und Streuung.',
      },
      {
        id: 'anlageklassen-8-completion',
        type: 'completion',
        kicker: 'Modul 03 abgeschlossen',
        title: 'Alle 7 Anlageklassen im Griff!',
        body: 'Du kannst Finanzbausteine jetzt sachlich nach Risiko, Schwankung und Verfügbarkeit einordnen.',
        summaryPoints: [
          'Tagesgeld sichert deine kurzfristige Liquidität ohne Kursschwankung.',
          'Breit gestreute ETFs verteilen das Marktrisiko auf hunderte Firmen weltweit.',
          'Einzelaktien und Krypto-Assets haben hohe bis sehr hohe Verlustrisiken.',
        ],
        depotBridge: {
          label: 'ETF und Einzelaktie vergleichen',
          description: 'Teste im Übungsdepot mit virtuellem Spielgeld den Unterschied zwischen Welt-ETF und Einzelaktie.',
          to: '/depot',
        },
      },
    ],
    sections: [
      {
        heading: '1. Sicherheitsbausteine: Tagesgeld, Festgeld & Anleihen',
        paragraphs: [
          'Tagesgeld ist täglich verfügbar und ideal für deinen Notgroschen. Festgeld bietet feste Zinsen für eine feste Laufzeit.',
          'Mit Anleihen leihst du Staaten oder Unternehmen Geld gegen Zinsen.',
        ],
      },
      {
        heading: '2. Wachstumsbausteine & Sachwerte',
        paragraphs: [
          'Einzelaktien beteiligen dich an einer einzelnen Firma (Klumpenrisiko). Ein Welt-ETF bündelt hunderte Unternehmen in einem Baustein.',
          'Immobilien sind unflexibel, Gold zahlt keine Zinsen, und Kryptowährungen sind hochspekulativ.',
        ],
      },
    ],
    practicalExample: {
      title: 'Praxisbeispiel: Zwei Töpfe für zwei Ziele',
      scenario:
        'Samira (19) hat 1.000 € Rücklage und möchte zusätzlich jeden Monat 35 € für ihre Zukunft in 15+ Jahren anlegen.',
      takeaway:
        'Topf 1 (Sicherheit): 1.000 € aufs Tagesgeldkonto. Topf 2 (Wachstum): 35 € monatlich in einen weltweit gestreuten Aktien-ETF.',
    },
    interactiveType: 'asset-classes',
    merkeSummary: [
      'Prüfe bei jeder Anlageklasse Risiko, Wertschwankung, Verfügbarkeit (Liquidität) und Kosten.',
      'Einzelaktien und Krypto-Assets bergen hohe bis sehr hohe Verlustrisiken.',
      'Breit gestreute ETFs verteilen das Risiko auf hunderte Unternehmen, schwanken aber ebenfalls mit dem Gesamtmarkt.',
    ],
    quiz: [
      {
        id: 'anlageklassen-q1',
        question: 'Was ist der wichtigste Vorteil eines breit gestreuten Welt-ETFs gegenüber einer einzelnen Aktie?',
        options: [
          'Ein ETF kann gesetzlich niemals im Kurs schwanken.',
          'Das Geld wird automatisch auf hunderte oder tausende Unternehmen verteilt, sodass die Krise einer einzelnen Firma nicht alles gefährdet.',
          'Man verdoppelt sein Geld mit einem ETF garantiert jedes Jahr.',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Richtig! Durch die breite Streuung sinkt das Risiko einzelner Firmenabstürze.',
        explanationWrong:
          'Auch ETFs schwanken mit dem Markt. Ihr Vorteil gegenüber einer Einzelaktie ist die breite Risikostreuung.',
      },
      {
        id: 'anlageklassen-q2',
        question: 'Welche Eigenschaft trifft auf Gold als Anlageklasse zu?',
        options: [
          'Gold zahlt jedes Quartal feste Zinsen auf dein Konto.',
          'Gold erwirtschaftet keine laufenden Zinsen oder Dividenden; der Wert hängt allein vom Marktpreis ab.',
          'Gold hat einen staatlich garantierten Mindestpreis, der nie sinken kann.',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Genau! Gold zahlt weder Zinsen noch Dividenden.',
        explanationWrong:
          'Gold zahlt keine laufenden Erträge aus, und der Preis kann schwanken.',
      },
      {
        id: 'anlageklassen-q3',
        question: 'Was bedeutet „hohe Liquidität“ bei einer Geldanlage?',
        options: [
          'Dass du dein angelegtes Geld schnell und unkompliziert wieder in verfügbares Guthaben umwandeln kannst.',
          'Dass die Geldanlage besonders hohe Gewinne verspricht.',
          'Dass das Geld mindestens 10 Jahre fest eingeschlossen ist.',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Stimmt genau! Tagesgeld hat z. B. eine sehr hohe Liquidität.',
        explanationWrong:
          'Liquidität beschreibt, wie schnell verfügbar dein Geld ist.',
      },
    ],
    nextRoute: '/kindergeld',
  },
  {
    id: 'kindergeld',
    route: '/kindergeld',
    order: 4,
    isCoreTopic: true,
    categoryLabel: 'Modul 04 · Alltag & Sparrate',
    title: 'Sparen mit kleinen Beträgen & Kindergeld',
    shortTitle: 'Kleine Beträge',
    subtitle: 'Warum 15 € oder 25 € im Monat ein starker Start sind – und wie du Töpfe trennst.',
    oneLineDescription: 'Mit 15–25 € im Monat starten und Alltag, Reserve & Sparplan trennen.',
    readingMinutes: 4,
    hook: 'Lohnt sich ein Sparplan überhaupt schon mit 15 € oder 25 € im Monat?',
    intro:
      'Du musst nicht reich sein, um anzufangen. Entscheidend ist die feste Gewohnheit – und dass dein Alltag sowie deine Rücklage immer Vorrang behalten.',
    steps: [
      {
        id: 'kindergeld-1-intro',
        type: 'intro',
        kicker: 'Modul 04 · Kleine Beträge',
        title: 'Gewohnheit schlägt große Startsummen',
        hook: 'Schon 15 € oder 25 € monatlich bauen über die Jahre ein echtes Polster auf – ohne dass dein Alltag zu kurz kommt.',
        body: 'Hier lernst du die 3-Töpfe-Trennung kennen und siehst, warum niemals das gesamte freie Geld in einen Börsen-Sparplan fließen darf.',
        visual: 'three-pots',
        ctaLabel: 'Lektion starten',
      },
      {
        id: 'kindergeld-2-dreitoepfe',
        type: 'explanation',
        kicker: 'Konzept 1 · Saubere Trennung',
        title: 'Das 3-Töpfe-Prinzip für dein Geld',
        body: 'Damit du nie in Geldnot gerätst, trennst du dein Geld klar: 1. Girokonto für laufende Alltagskosten, 2. Tagesgeld für Notgroschen & kurzfristige Wünsche, 3. Sparplan nur für den kleinen Betrag, den du jahrelang nicht brauchst.',
        highlightPoint: 'Wichtig: Kindergeld (Richtwert 255 € / Monat, Stand 2025/2026) ist primär für deinen Lebensunterhalt und deine Ausbildung da – niemals komplett investieren!',
        visual: 'three-pots',
        moreInfo: {
          title: 'Depot-Eröffnung unter 18 Jahren',
          points: [
            'Jugendliche unter 18 Jahren können ein Wertpapierdepot nicht allein eröffnen – dafür ist die Zustimmung der Eltern (Junior-Depot) erforderlich.',
            'Ein guter Sparplan lässt sich jederzeit kostenlos pausieren, senken oder erhöhen, falls sich dein Einkommen ändert.',
          ],
        },
      },
      {
        id: 'kindergeld-3-check1',
        type: 'question',
        kicker: 'Verständnis-Check · Prioritäten',
        title: 'Warum nicht alles investieren?',
        question: 'Warum solltest du niemals dein gesamtes übriges Monatsgeld oder das komplette Kindergeld in Aktien/ETFs stecken?',
        options: [
          'Weil Banken maximal 50 € pro Monat annehmen dürfen.',
          'Weil laufende Alltagskosten und ein sicherer Notgroschen Vorrang haben, damit du bei spontanen Kosten nicht im Minus verkaufen musst.',
          'Weil kleine Beträge prozentual höhere Zinsen bekommen als große.',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Richtig. Wenn dein Alltag und dein Notgroschen gesichert sind, musst du deinen Sparplan bei einer unerwarteten Rechnung nicht im Minus antasten.',
        explanationWrong:
          'Denk daran: Ohne Puffer auf dem Konto fehlt dir schon bei der nächsten kaputten Handydisplay-Reparatur das Geld.',
      },
      {
        id: 'kindergeld-4-interactive',
        type: 'interactive',
        kicker: 'Konzept 2 · Kleinbetrags-Rechner',
        title: 'Was wird aus 15 € bis 50 € im Monat?',
        body: 'Teste selbst, wie sich ein kleiner Monatsbetrag (z. B. 10 % vom Kindergeld = ca. 25 €) über 10 bis 25 Jahre entwickeln kann:',
        widget: 'small-amounts-slider',
      },
      {
        id: 'kindergeld-5-routine',
        type: 'explanation',
        kicker: 'Konzept 3 · Alltags-Trick',
        title: 'Bezahle dich am Monatsanfang zuerst',
        body: 'Wer wartet, was am Monatsende zufällig übrig bleibt, spart meistens gar nichts. Geht dein kleiner Sparbetrag gleich am Tag nach Geldeingang automatisch weg, merkst du ihn im Alltag kaum.',
        highlightPoint: 'Regelmäßigkeit am Monatsanfang nimmt dir jede Willenskraft-Entscheidung ab.',
        visual: 'pay-first',
      },
      {
        id: 'kindergeld-6-scenario-jonas',
        type: 'scenario',
        kicker: 'Praxis-Entscheidung · Jonas (18)',
        title: '60 € am Monatsende übrig – wie aufteilen?',
        personTag: 'Jonas · 18 Jahre · Nebenjob & Taschengeld',
        situation: 'Jonas hat 220 € monatlich zur Verfügung. Nach Fixkosten (65 €) und Freizeit (95 €) bleiben ihm jeden Monat 60 € übrig. Sein Notgroschen ist noch im Aufbau.',
        contextFacts: [
          { label: 'Einnahmen', value: '220 €' },
          { label: 'Ausgaben', value: '160 €' },
          { label: 'Übrig pro Monat', value: '60 €' },
        ],
        question: 'Welche Aufteilung der 60 € ist für Jonas am vernünftigsten?',
        options: [
          'Aufteilen: 35 € aufs Tagesgeld für Notgroschen & Urlaub, 25 € in einen langfristigen ETF-Sparplan',
          'Die vollen 60 € in eine riskante Einzelaktie stecken',
          'Einen festen Vertrag über 80 € monatlich unterschreiben',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Stark gelöst! Durch die Aufteilung (35 € Tagesgeld-Puffer + 25 € Langfrist-Sparplan) baut Jonas seinen Notgroschen weiter aus und startet gleichzeitig seine Sparroutine.',
        explanationWrong:
          'Solange der Notgroschen noch wächst, sollte Jonas niemals seine gesamten 60 € an der Börse binden. Eine Teilung zwischen Tagesgeld und kleinem Sparplan hält ihn flexibel.',
      },
      {
        id: 'kindergeld-7-check2',
        type: 'question',
        kicker: 'Kurz-Check · Zeitpunkt',
        title: 'Wann läuft der Sparplan am besten?',
        question: 'Wann im Monat ist der sinnvollste Zeitpunkt für deinen Dauerauftrag oder Sparplan?',
        options: [
          'Direkt am Monatsanfang kurz nach Geldeingang.',
          'Nur einmal im Jahr an Silvester, falls Geld übrig ist.',
          'Immer erst am letzten Tag des Monats.',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Genau. Am Monatsanfang („Pay yourself first“) wird das Sparen zur festen Gewohnheit.',
        explanationWrong:
          'Am Monatsende ist das Geld oft schon nebenbei ausgegeben. Ein Auftrag direkt nach Geldeingang funktioniert viel zuverlässiger.',
      },
      {
        id: 'kindergeld-8-completion',
        type: 'completion',
        kicker: 'Modul 04 abgeschlossen',
        title: 'Kleine Beträge, große Routine!',
        body: 'Du weißt jetzt, wie du schon mit 15 € oder 25 € monatlich sinnvoll startest, ohne deinen Alltag einzuschränken.',
        summaryPoints: [
          'Alltagskosten und Notgroschen kommen immer zuerst.',
          'Schon ein kleiner Teilbetrag (z. B. 25 € / Monat) hat über viele Jahre große Wirkung.',
          'Automatische Abbuchung am Monatsanfang schafft mühelose Gewohnheit.',
        ],
        depotBridge: {
          label: 'Im Zinseszins-Rechner testen',
          description: 'Spiele verschiedene Monatsraten zwischen 15 € und 50 € im Rechner durch.',
          to: '/rechner',
        },
      },
    ],
    sections: [
      {
        heading: '1. Erst das Monatsbudget prüfen, dann sparen',
        paragraphs: [
          'Investiere niemals dein gesamtes verfügbares Geld und niemals das komplette Kindergeld (Richtwert: 255 € pro Monat, Stand 2025/2026).',
          'Trenne dein Geld in Alltagskonto (Girokonto), Rücklage (Tagesgeld) und langfristigen Zukunfts-Sparplan.',
        ],
      },
      {
        heading: '2. Regelmäßigkeit schlägt Startsumme',
        paragraphs: [
          'Wer am Monatsanfang automatisch 15 € oder 25 € zur Seite legt, baut ohne Stress eine feste Routine auf.',
        ],
      },
    ],
    practicalExample: {
      title: 'Praxisbeispiel: Jonas (18) teilt 60 € Überschuss auf',
      scenario:
        'Jonas hat nach Fixkosten und Freizeit monatlich 60 € übrig.',
      takeaway:
        '35 € wandern aufs Tagesgeldkonto für Urlaub & Notgroschen, 25 € in einen langfristigen ETF-Sparplan.',
    },
    interactiveType: 'small-amounts',
    merkeSummary: [
      'Erst laufende Lebenshaltungskosten und Notgroschen sichern – erst danach langfristig investieren.',
      'Kindergeld dient primär dem Alltag; schon ein kleiner Teilbetrag (z. B. 25 €) wirkt langfristig stark.',
      'Ein guter Sparplan lässt sich jederzeit reduzieren oder pausieren.',
    ],
    quiz: [
      {
        id: 'kindergeld-q1',
        question: 'Warum sollte man niemals sein gesamtes übriges Monatsgeld oder das komplette Kindergeld in Aktien/ETFs stecken?',
        options: [
          'Weil Banken nur maximal 50 € pro Monat annehmen dürfen.',
          'Weil laufende Alltagskosten und ein sicherer Notgroschen Vorrang haben, damit man bei spontanen Ausgaben nicht im Minus verkaufen muss.',
          'Weil kleine Beträge an der Börse mehr Rendite bringen als große.',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Richtig! Alltagskosten und eine sichere Rücklage stehen immer an erster Stelle.',
        explanationWrong:
          'Ohne Rücklage fehlt dir schon bei der nächsten unerwarteten Ausgabe das Bargeld.',
      },
      {
        id: 'kindergeld-q2',
        question: 'Wann ist im Monat der beste Zeitpunkt, um einen festen Sparbetrag zur Seite zu legen?',
        options: [
          'Gleich am Monatsanfang direkt nach Geldeingang per Dauerauftrag oder Sparplan.',
          'Nur einmal im Jahr an Silvester, falls zufällig etwas übrig geblieben ist.',
          'Immer erst am letzten Tag des Monats um 23 Uhr.',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Genau! Nach dem Prinzip „Bezahle dich selbst zuerst“ geht der Sparbetrag direkt am Monatsanfang weg.',
        explanationWrong:
          'Ein automatischer Auftrag am Monatsanfang schafft verlässliche Gewohnheit.',
      },
    ],
    nextRoute: '/altersvorsorgedepot',
  },
  {
    id: 'altersvorsorgedepot',
    route: '/altersvorsorgedepot',
    order: 5,
    isCoreTopic: true,
    categoryLabel: 'Modul 05 · Weitblick',
    title: 'Altersvorsorge & langer Horizont',
    shortTitle: 'Altersvorsorge',
    subtitle: 'Gesetzliche vs. private Vorsorge, Flexibilität und geplante Gesetze.',
    oneLineDescription: 'Gesetzliche Rente, private Vorsorge und warum Flexibilität zählt.',
    readingMinutes: 5,
    hook: 'Warum lohnt sich ein kurzer Blick auf die Rente schon mit 18?',
    intro:
      'Mit 16 bis 20 Jahren wirkt die Rente weit weg. Doch bei 45+ Jahren Zeithorizont arbeitet die Zeit so stark für dich wie nie wieder – wenn du teure, unflexible Verträge vermeidest.',
    steps: [
      {
        id: 'altersvorsorge-1-intro',
        type: 'intro',
        kicker: 'Modul 05 · Altersvorsorge',
        title: 'Weitblick ohne Knebelvertrag',
        hook: '45 Jahre Zeit sind dein größter Vorteil – aber nur, wenn du jung genug Geld für Ausbildung, Umzug und Leben flexibel hältst.',
        body: 'Lerne in wenigen Schritten, wie die gesetzliche Rente funktioniert, worin sich flexibles Sparen von gesperrten Verträgen unterscheidet und was beim „Altersvorsorgedepot“ wirklich gilt.',
        visual: 'time-horizon',
        ctaLabel: 'Lektion starten',
      },
      {
        id: 'altersvorsorge-2-umlage',
        type: 'explanation',
        kicker: 'Konzept 1 · Das Grundsystem',
        title: 'Gesetzliche Rente: Das Umlageverfahren',
        body: 'In Deutschland werden deine späteren Rentenbeiträge nicht auf einem eigenen Konto angespart, sondern direkt an die heutigen Rentner ausgezahlt (Umlageverfahren). Weil es künftig mehr Rentner im Verhältnis zu jüngeren Beitragszahlern gibt, entsteht eine Versorgungslücke.',
        highlightPoint: 'Die gesetzliche Rente bleibt die wichtige Basis – reicht allein aber später meist nicht für den gewohnten Lebensstandard.',
        visual: 'pension-balance',
        moreInfo: {
          title: 'Die 3 Säulen der Altersvorsorge',
          points: [
            '1. Säule: Gesetzliche Rentenversicherung (Pflichtbeiträge aus dem Bruttolohn).',
            '2. Säule: Betriebliche Altersvorsorge (über den Arbeitgeber).',
            '3. Säule: Private Vorsorge (eigenes Depot oder geförderte Verträge).',
          ],
          sourceNote: 'Quelle: Deutsche Rentenversicherung (ihre-vorsorge.de)',
        },
      },
      {
        id: 'altersvorsorge-3-check1',
        type: 'question',
        kicker: 'Verständnis-Check · Rentensystem',
        title: 'Umlage vs. eigenes Kapital',
        question: 'Was ist der Kernunterschied zwischen der gesetzlichen Rente und privater Vorsorge?',
        options: [
          'Bei der gesetzlichen Rente finanzieren heutige Beitragszahler direkt die heutigen Rentner (Umlageverfahren); privat baust du eigenes Kapital auf.',
          'Die gesetzliche Rente legt alle Beiträge in Einzelaktien an.',
          'Private Vorsorge ist unter 30 Jahren verboten.',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Richtig. Die gesetzliche Rente nutzt das Umlageverfahren, während du privat einen eigenen Kapitalstock aufbaust.',
        explanationWrong:
          'Merke dir: Die gesetzliche Rente zahlt laufende Beiträge direkt an aktuelle Ruheständler aus (Umlageverfahren).',
      },
      {
        id: 'altersvorsorge-4-compare-flex',
        type: 'comparison',
        kicker: 'Konzept 2 · Zwei Wege',
        title: 'Flexibles Depot vs. gebundener Rentenvertrag',
        body: 'Wenn du privat vorsorgst, solltest du mit 18 Jahren besonders auf Kosten und Verfügbarkeit achten:',
        leftCard: {
          label: 'Eigenes Wertpapierdepot (z. B. ETF-Sparplan)',
          title: 'Flexibel & günstig',
          badge: 'Hohe Freiheit',
          tone: 'accent',
          points: [
            'Sehr geringe laufende Kosten (ca. 0,1–0,3 % p.a.)',
            'Sparrate jederzeit pausierbar oder anpassbar',
            'Kapital ist bei Bedarf vor dem Rentenalter verfügbar',
          ],
        },
        rightCard: {
          label: 'Spezieller Altersvorsorge-Vertrag',
          title: 'Fest gebunden bis 62–67 J.',
          badge: 'Lange Sperrfrist',
          tone: 'warning',
          points: [
            'Oft hohe Abschluss- und Verwaltungskosten in den ersten Jahren',
            'Geld ist meist bis zum Renteneintritt fest eingeschlossen',
            'Vorzeitige Kündigung oft nur mit Verlusten möglich',
          ],
        },
        takeaway: 'Solange Ausbildung, Studium und Lebensplanung noch offen sind, ist Flexibilität meist wichtiger als ein starrer 45-Jahre-Vertrag.',
      },
      {
        id: 'altersvorsorge-5-interactive',
        type: 'interactive',
        kicker: 'Konzept 3 · Zeithorizont bis 67',
        title: 'Was ein früher Start mit kleinen Beträgen bewirkt',
        body: 'Schiebe das Startalter zwischen 18 und 40 Jahren hin und her und beobachte den Zeitvorteil bis zum 67. Lebensjahr:',
        widget: 'retirement-slider',
      },
      {
        id: 'altersvorsorge-6-status-warning',
        type: 'explanation',
        kicker: 'Konzept 4 · Gesetzesstatus (Stand: 2025/2026)',
        title: 'Geplante Reformen sind noch keine gültigen Gesetze',
        body: 'In der Politik wurde ein staatlich gefördertes „Altersvorsorgedepot“ diskutiert, um günstiges Fondssparen fürs Alter zu fördern. Wichtig: Dieses Konzept ist bislang ein politisches Vorhaben und noch NICHT als Gesetz in Kraft.',
        highlightPoint: 'Unterschreibe niemals Verträge, die mit noch nicht beschlossenen Gesetzen werben.',
        visual: 'cost-warning',
        moreInfo: {
          title: 'Wie erkenne ich den echten Gesetzesstand?',
          points: [
            'Politische Vorschläge ändern sich im Gesetzgebungsverfahren häufig oder werden verschoben.',
            'Prüfe vor jeder Vertragsentscheidung bei der Verbraucherzentrale oder dem Bundesfinanzministerium, welche Regeln tatsächlich beschlossen und aktiv sind.',
          ],
        },
      },
      {
        id: 'altersvorsorge-7-scenario-tarek',
        type: 'scenario',
        kicker: 'Praxis-Entscheidung · Tarek (19)',
        title: 'Verkaufsgespräch zum Ausbildungsstart',
        personTag: 'Tarek · 19 Jahre · 1. Ausbildungsjahr',
        situation: 'Ein Finanzverkäufer rät Tarek zu einem 48 Jahre lang fest gesperrten Rentenvertrag mit hohen Abschlussgebühren. Tarek weiß aber noch nicht, ob er nach der Ausbildung studieren oder in eine andere Stadt ziehen möchte.',
        contextFacts: [
          { label: 'Alter', value: '19 Jahre' },
          { label: 'Vertragsbindung', value: '48 Jahre gesperrt' },
        ],
        question: 'Wie sollte Tarek reagieren?',
        options: [
          'Nicht sofort unterschreiben: Zuerst unabhängige Infos prüfen, Arbeitgeber-VL nutzen und einen flexiblen, kostengünstigen Sparplan wählen',
          'Sofort unterschreiben, weil man sich mit 19 für 48 Jahre festlegen muss',
          'Sein gesamtes Ausbildungsgehalt in den gesperrten Vertrag einzahlen',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Richtig entschieden! Mit 19 braucht Tarek Flexibilität für Studium oder Umzug. Hohe Abschlusskosten und 48 Jahre Kündigungssperre passen nicht zu seiner Lebensphase.',
        explanationWrong:
          'Vorsicht: Ein 48 Jahre gesperrter Vertrag mit hohen Abschlusskosten nimmt Tarek jede Flexibilität für Studium oder Umzug.',
      },
      {
        id: 'altersvorsorge-8-completion',
        type: 'completion',
        kicker: 'Modul 05 abgeschlossen',
        title: 'Weitblick mit klarem Kopf!',
        body: 'Du verstehst jetzt das Rentensystem und weißt, warum niedrige Kosten und Flexibilität in jungen Jahren entscheidend sind.',
        summaryPoints: [
          'Die gesetzliche Rente arbeitet im Umlageverfahren und bildet die Basis.',
          'Spezielle Rentenverträge binden Geld oft bis 62–67 Jahre – prüfe Kosten und Flexibilität.',
          'Geplante Konzepte (wie das diskutierte Altersvorsorgedepot, Stand 2025/2026) sind noch nicht in Kraft.',
        ],
      },
    ],
    sections: [
      {
        heading: '1. Gesetzliche Rente vs. private Vorsorge',
        paragraphs: [
          'Die gesetzliche Rentenversicherung funktioniert nach dem Umlageverfahren: Heutige Beitragszahler finanzieren heutige Ruheständler.',
          'Bei der privaten Vorsorge baust du eigenes Kapital auf – entweder flexibel im eigenen Depot oder über fest gebundene Verträge.',
        ],
      },
      {
        heading: '2. Geplante Programme vs. geltendes Recht',
        paragraphs: [
          'Das politisch diskutierte „Altersvorsorgedepot“ (Stand: 2025/2026) ist bislang ein Konzept und noch nicht als aktives Gesetz in Kraft.',
        ],
      },
    ],
    practicalExample: {
      title: 'Praxisbeispiel: Flexibilität mit 19 Jahren bewahren',
      scenario:
        'Tarek (19) soll einen 48 Jahre gesperrten Rentenvertrag mit hohen Abschlusskosten unterschreiben.',
      takeaway:
        'Er nutzt stattdessen die VL seines Arbeitgebers und einen flexiblen, kostengünstigen Sparplan ohne jahrzehntelange Sperre.',
    },
    interactiveType: 'retirement-horizon',
    merkeSummary: [
      'Die gesetzliche Rente bildet die Basis, deckt aber später meist nicht das volle Einkommen ab.',
      'Kapital in Altersvorsorge-Verträgen ist oft über Jahrzehnte gebunden – halte dir jung genug flexibles Geld frei.',
      'Geplante politische Konzepte (wie das Altersvorsorgedepot) sind noch keine beschlossenen Gesetze.',
    ],
    quiz: [
      {
        id: 'altersvorsorge-q1',
        question: 'Was ist der Kernunterschied zwischen der gesetzlichen Rente und privater kapitalgedeckter Vorsorge?',
        options: [
          'Bei der gesetzlichen Rente werden heutige Beiträge direkt an heutige Rentner ausgezahlt (Umlageverfahren); bei privater Vorsorge baust du eigenes Kapital auf.',
          'Die gesetzliche Rente legt alle Beiträge zu 100 % in Kryptowährungen an.',
          'Private Vorsorge ist in Deutschland gesetzlich verboten.',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Richtig! Die gesetzliche Rente nutzt das Umlageverfahren, während du privat eigenes Kapital aufbaust.',
        explanationWrong:
          'Die gesetzliche Rente arbeitet im Umlageverfahren, während private Vorsorge eigenes Kapital anspart.',
      },
      {
        id: 'altersvorsorge-q2',
        question: 'Worauf solltest du als 18-Jähriger besonders achten, bevor du Geld in einen fest gebundenen Altersvorsorge-Vertrag steckst?',
        options: [
          'Nur auf die Farbe des Firmenlogos.',
          'Auf laufende Kosten, Abschlussgebühren und darauf, dass fest gebundenes Geld oft erst ab dem Rentenalter verfügbar ist.',
          'Darauf, dass man den Vertrag jede Woche kostenlos kündigen kann.',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Sehr gut! Hohe Kosten schmälern den Zinseszins massiv, und eine feste Sperre passt nicht zu jedem Lebensplan.',
        explanationWrong:
          'Prüfe immer zuerst Kosten und Flexibilität.',
      },
      {
        id: 'altersvorsorge-q3',
        question: 'Wie solltest du mit Berichten über geplante staatliche Vorsorgeprogramme (z. B. Altersvorsorgedepot) umgehen?',
        options: [
          'Sofort Verträge unterschreiben, die mit noch nicht beschlossenen Gesetzen werben.',
          'Klar zwischen bereits gültigen Gesetzen und bloßen politischen Planungen unterscheiden und offizielle Quellen prüfen.',
          'Grundsätzlich gar nichts mehr über Finanzen lesen.',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Genau richtig! Entscheide immer auf Basis geltender Regeln.',
        explanationWrong:
          'Geplante Programme sind noch nicht in Kraft. Prüfe immer den tatsächlichen Gesetzesstand.',
      },
    ],
    nextRoute: '/staat',
  },
  {
    id: 'staat',
    route: '/staat',
    order: 6,
    isCoreTopic: true,
    categoryLabel: 'Modul 06 · Förderung & Regeln',
    title: 'Hilfe vom Staat verstehen',
    shortTitle: 'Staatliche Hilfe',
    subtitle: 'Welche Förderungen heute aktiv sind, was nur geplant ist und worauf du achten musst.',
    oneLineDescription: 'VL, Sparzulage und aktive Regeln von geplanten Ideen unterscheiden.',
    readingMinutes: 5,
    hook: 'Welche Zuschüsse vom Chef und vom Staat kannst du heute wirklich nutzen?',
    intro:
      'Für Auszubildende und Berufseinsteiger gibt es echte Zuschüsse. Gleichzeitig kursieren im Netz viele Gerüchte über angeblich „geschenktes Geld“. Hier lernst du den Fakten-Check.',
    steps: [
      {
        id: 'staat-1-intro',
        type: 'intro',
        kicker: 'Modul 06 · Staatliche Hilfe',
        title: 'Zuschüsse nutzen – Gebührenfallen meiden',
        hook: 'Manche Förderungen bringen dir in der Ausbildung hunderte Euro extra – andere existieren bisher nur auf dem Papier.',
        body: 'In dieser Einheit trennst du aktive Programme sauber von politischen Planungen und lernst, worauf es bei den Vertragsbedingungen ankommt.',
        visual: 'state-check',
        ctaLabel: 'Lektion starten',
      },
      {
        id: 'staat-2-vl',
        type: 'explanation',
        kicker: 'Konzept 1 · Berufsstart & Ausbildung',
        title: 'Vermögenswirksame Leistungen (VL) & Sparzulage',
        body: 'Viele Ausbildungsbetriebe und Arbeitgeber zahlen monatlich zwischen 6,65 € und 40 € zusätzlich zum Lohn in einen VL-Sparvertrag. Liegt dein Einkommen innerhalb der gesetzlichen Grenzen (Stand: 2025/2026), legt der Staat über die Steuererklärung noch die Arbeitnehmersparzulage obendrauf.',
        highlightPoint: 'Ein Blick in deinen Ausbildungsvertrag oder eine kurze Frage in der Personalabteilung genügt.',
        moreInfo: {
          title: 'Wie läuft ein VL-Vertrag ab?',
          points: [
            'Typische Laufzeit: 6 Jahre einzahlen plus bis zu 1 Jahr Ruhezeit (insgesamt ca. 7 Jahre).',
            'Gefördert werden u. a. breit gestreute VL-Aktienfondssparpläne und Bausparverträge.',
            'Die Arbeitnehmersparzulage beantragst du über deine jährliche Einkommensteuererklärung.',
          ],
          sourceNote: 'Quelle: Verbraucherzentrale / Bundesfinanzministerium (Stand: 2025/2026)',
        },
      },
      {
        id: 'staat-3-check1',
        type: 'question',
        kicker: 'Verständnis-Check · VL',
        title: 'Was steckt hinter VL?',
        question: 'Was sind „Vermögenswirksame Leistungen“ (VL)?',
        options: [
          'Ein freiwilliger oder tariflicher Zuschuss vom Arbeitgeber, der direkt in einen geeigneten Sparvertrag fließt.',
          'Ein Kredit vom Finanzamt mit 10 % Zinsen.',
          'Eine automatische Bar-Auszahlung an alle Schüler ab 16 Jahren.',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Richtig. Viele Arbeitgeber zahlen schon in der Ausbildung monatlich VL dazu – nachfragen lohnt sich fast immer.',
        explanationWrong:
          'VL sind ein freiwilliger oder tariflicher Geldzuschuss deines Arbeitgebers in einen Sparvertrag.',
      },
      {
        id: 'staat-4-interactive',
        type: 'interactive',
        kicker: 'Konzept 2 · Status-Überblick (Stand: 2025/2026)',
        title: 'Aktiv oder nur geplant? Prüfe die 5 Programme',
        body: 'Filtere die Programme nach ihrem aktuellen Gesetzesstatus und prüfe, für wen sie gelten:',
        widget: 'state-status-checker',
      },
      {
        id: 'staat-5-kostenfalle',
        type: 'comparison',
        kicker: 'Konzept 3 · Kritischer Blick',
        title: 'Förderung ersetzt keinen Kosten-Check',
        body: 'Auch Wohnungsbauprämie (inkl. U25-Sonderregel ab 16 J.) und Riester-Zulagen sind aktive Regeln. Aber eine Zulage macht einen teuren Vertrag nicht automatisch gut:',
        leftCard: {
          label: 'Günstiger Fördervertrag',
          title: 'Zuschuss wirkt voll mit',
          badge: 'Sinnvoll',
          tone: 'accent',
          points: [
            'Niedrige Abschluss- und Verwaltungskosten',
            'Arbeitgeber-VL + staatliche Zulage erhöhen dein Kapital',
            'Vertragsbedingungen passen zu deinem Zeithorizont',
          ],
        },
        rightCard: {
          label: 'Überteuerter Vertrag',
          title: 'Gebühren fressen Prämie auf',
          badge: 'Vorsicht Kostenfalle',
          tone: 'warning',
          points: [
            'Hohe Abschlussgebühren und laufende Kosten',
            'Kaum Zinsen oder unflexible jahrzehntelange Bindung',
            'Trotz staatlicher Prämie bleibt am Ende weniger übrig',
          ],
        },
        takeaway: 'Prüfe immer zuerst die Gesamtkosten und Bedingungen – unterschreibe nie blind wegen des Worts „Staatliche Prämie“.',
      },
      {
        id: 'staat-6-scenario-mia',
        type: 'scenario',
        kicker: 'Praxis-Entscheidung · Mia (17)',
        title: '26 € monatlich vom Ausbildungsbetrieb',
        personTag: 'Mia · 17 Jahre · 1. Lehrjahr',
        situation: 'Mia entdeckt in ihrem Ausbildungsvertrag, dass ihr Betrieb 26 € monatlich an Vermögenswirksamen Leistungen (VL) zahlt, sobald sie einen passenden Vertrag vorlegt.',
        contextFacts: [
          { label: 'VL vom Betrieb', value: '26 € / Monat' },
          { label: 'Über 6 Jahre', value: '1.872 € Zuschuss' },
        ],
        question: 'Was ist Mias klügster nächster Schritt?',
        options: [
          'Bei der Personalabteilung nachfragen, über die Verbraucherzentrale kostengünstige VL-Verträge vergleichen und den Zuschuss mitnehmen',
          'Nichts tun, weil 26 € im Monat keinen Unterschied machen',
          'Auf die noch nicht beschlossene Frühstart-Rente warten',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Richtig! 26 € monatlich vom Arbeitgeber summieren sich über 6 Einzahlungsjahre auf 1.872 € extra – plus mögliche Arbeitnehmersparzulage.',
        explanationWrong:
          'Lass dir den Arbeitgeber-Zuschuss nicht entgehen: Über 6 Jahre sind 26 € im Monat fast 1.900 € geschenktes Startkapital.',
      },
      {
        id: 'staat-7-check2',
        type: 'question',
        kicker: 'Wissens-Check · Status & Kosten',
        title: 'Geplante Programme richtig einordnen',
        question: 'Welcher Status gilt (Stand: 2025/2026) für Konzepte wie die „Frühstart-Rente“ oder das „Altersvorsorgedepot“?',
        options: [
          'Sie sind bereits seit Jahren für jeden automatisch aktiv.',
          'Es sind politische Vorschläge bzw. geplante Vorhaben, die noch nicht als Gesetz in Kraft sind.',
          'Jeder 16-Jährige erhält dadurch sofort 500 € aufs Girokonto.',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Exakt! Beide Konzepte sind politische Vorhaben in der Diskussion und noch keine aktiven Förderprogramme.',
        explanationWrong:
          'Wichtig: Frühstart-Rente und Altersvorsorgedepot sind bisher politische Vorschläge (Stand: 2025/2026) und noch nicht in Kraft.',
      },
      {
        id: 'staat-8-completion',
        type: 'completion',
        kicker: 'Modul 06 abgeschlossen',
        title: 'Alle 6 Kernmodule geschafft!',
        body: 'Du kannst jetzt aktive Förderungen nutzen, Kostenfallen erkennen und geplante Gesetze souverän einordnen.',
        summaryPoints: [
          'Aktiv (Stand 2025/2026): VL vom Arbeitgeber, Arbeitnehmersparzulage, Wohnungsbauprämie (inkl. U25-Regel) und Riester.',
          'Nur geplant (Stand 2025/2026): Frühstart-Rente und gefördertes Altersvorsorgedepot sind noch nicht in Kraft.',
          'Prüfe bei jedem Fördervertrag immer zuerst die Gesamtkosten und Haltefristen.',
        ],
        depotBridge: {
          label: 'Im Übungsdepot ausprobieren',
          description: 'Wende dein Wissen aus allen 6 Kernmodulen jetzt risikofrei im virtuellen Übungsdepot an.',
          to: '/depot',
        },
      },
    ],
    sections: [
      {
        heading: '1. Aktive Förderungen: VL & Arbeitnehmersparzulage',
        paragraphs: [
          'Viele Betriebe zahlen monatlich Vermögenswirksame Leistungen (VL) zusätzlich zum Lohn. Innerhalb der Einkommensgrenzen (Stand: 2025/2026) gibt es dazu die staatliche Arbeitnehmersparzulage.',
          'Auch Wohnungsbauprämie (inkl. U25-Sonderregel) und Riester-Zulagen sind aktive Regelungen, müssen aber immer auf ihre Vertragskosten geprüft werden.',
        ],
      },
      {
        heading: '2. Geplante Programme vs. geltendes Recht',
        paragraphs: [
          '„Frühstart-Rente“ und „Altersvorsorgedepot“ sind politische Konzepte (Stand: 2025/2026) und derzeit noch nicht als aktive Programme nutzbar.',
        ],
      },
    ],
    practicalExample: {
      title: 'Praxisbeispiel: Mia (17) sichert sich 26 € VL monatlich',
      scenario:
        'Mias Ausbildungsbetrieb zahlt 26 € monatlich an Vermögenswirksamen Leistungen (VL).',
      takeaway:
        'Über 6 Jahre sichert sich Mia so über 1.800 € Arbeitgeber-Zuschuss plus staatliche Arbeitnehmersparzulage.',
    },
    interactiveType: 'state-support',
    merkeSummary: [
      'Unterscheide strikt zwischen bereits aktiven Förderungen (VL, Arbeitnehmersparzulage) und geplanten Ideen (Frühstart-Rente).',
      'Jede staatliche Förderung ist an persönliche Voraussetzungen, Einkommensgrenzen und Haltefristen geknüpft.',
      'Prüfe immer zuerst die Gesamtkosten eines Vertrags.',
    ],
    quiz: [
      {
        id: 'staat-q1',
        question: 'Was sind „Vermögenswirksame Leistungen“ (VL)?',
        options: [
          'Ein freiwilliger oder tariflicher Geldzuschuss vom Arbeitgeber, der direkt in einen Sparvertrag fließt.',
          'Ein Kredit vom Finanzamt, den man mit 10 % Zinsen zurückzahlen muss.',
          'Ein Gewinnspiel der Zentralbank für alle unter 18 Jahren.',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Richtig! Viele Arbeitgeber zahlen schon in der Ausbildung monatlich VL dazu.',
        explanationWrong:
          'VL sind zusätzliche Leistungen deines Arbeitgebers in einen Sparvertrag.',
      },
      {
        id: 'staat-q2',
        question: 'Welcher Status gilt (Stand: 2025/2026) für Konzepte wie die „Frühstart-Rente“ oder das „Altersvorsorgedepot“?',
        options: [
          'Sie sind bereits seit 2010 für jeden automatisch aktiv.',
          'Es handelt sich um politische Vorschläge bzw. geplante Vorhaben, die noch nicht als Gesetz in Kraft sind.',
          'Jeder 16-Jährige bekommt dadurch automatisch 500 € bar ausgezahlt.',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Exakt! Es sind politische Vorhaben in der Diskussion.',
        explanationWrong:
          'Frühstart-Rente und Altersvorsorgedepot sind bisher politische Vorschläge (Stand: 2025/2026).',
      },
      {
        id: 'staat-q3',
        question: 'Warum sollte man einen Sparvertrag niemals allein wegen einer staatlichen Zulage unterschreiben?',
        options: [
          'Weil hohe Abschluss- und laufende Vertragskosten den Vorteil der Zulage wieder auffressen können.',
          'Weil staatliche Zulagen immer verboten sind.',
          'Weil man Zulagen nur bekommt, wenn man den Vertrag nie liest.',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Genau so ist es! Ein guter Vertrag muss kostengünstig sein.',
        explanationWrong:
          'Hohe Gebühren können teurer sein als die staatliche Förderung.',
      },
    ],
    nextRoute: '/taschengeld',
  },
  {
    id: 'taschengeld',
    route: '/taschengeld',
    order: 7,
    isCoreTopic: false,
    categoryLabel: 'Praxis-Modul · Budget-Werkzeug',
    title: 'Budget & Taschengeld planen',
    shortTitle: 'Budget & Taschengeld',
    subtitle: 'Einnahmen und Ausgaben gegenüberstellen und deinen echten Spielraum finden.',
    oneLineDescription: 'Monatliche Einnahmen, Ausgaben und freien Puffer berechnen.',
    readingMinutes: 4,
    hook: 'Wie viel Geld bleibt dir am Monatsende wirklich übrig?',
    intro:
      'Ein klarer Kassensturz dauert keine fünf Minuten: Stell deine monatlichen Einnahmen und Ausgaben nebeneinander und finde heraus, wie viel Puffer wirklich frei ist.',
    steps: [
      {
        id: 'taschengeld-1-intro',
        type: 'intro',
        kicker: 'Praxis-Modul · Budget & Taschengeld',
        title: 'Dein monatlicher Kassensturz',
        hook: 'Kleine Abos und Snacks summieren sich oft unbemerkt auf 50 € bis 100 € im Monat.',
        body: 'In diesem Praxis-Modul prüfst du deine Einnahmen und Ausgaben und lernst eine mögliche Lernaufteilung für deinen Überschuss kennen.',
        visual: 'budget-balance',
        ctaLabel: 'Praxis-Modul starten',
      },
      {
        id: 'taschengeld-2-abocheck',
        type: 'explanation',
        kicker: 'Konzept 1 · Überblick gewinnen',
        title: 'Wohin fließt dein Geld jeden Monat?',
        body: 'Stell einmal im Monat deine sicheren Einnahmen (Taschengeld, Nebenjob, Ausbildungsvergütung) deinen festen und variablen Ausgaben gegenüber. Oft verstecken sich in ungenutzten Streaming- oder Gaming-Abos schon 15 € bis 25 € pro Monat.',
        highlightPoint: 'Amir (17) kündigt zwei ungenutzte Abos für 20 € / Monat – und hat sofort Geld für seinen Sparplan frei.',
        visual: 'abo-check',
        moreInfo: {
          title: 'Die 50-30-20-Orientierung (eine mögliche Lernaufteilung)',
          points: [
            'Viele junge Erwachsene nutzen als grobe Idee: ca. 50 % Fixkosten, 30 % Freizeit & Wünsche, 20 % Rücklagen & Sparen.',
            'Wohnst du noch zu Hause oder hast du ein anderes Einkommen, sieht deine Aufteilung natürlich anders aus – es gibt keine starre Pflichtformel.',
          ],
        },
      },
      {
        id: 'taschengeld-3-interactive',
        type: 'interactive',
        kicker: 'Konzept 2 · Interaktiver Budget-Planer',
        title: 'Trag deine Einnahmen und Ausgaben ein',
        body: 'Passe die Beispielwerte an deine Situation an oder füge eigene Kategorien hinzu:',
        widget: 'budget-mini',
      },
      {
        id: 'taschengeld-4-check1',
        type: 'question',
        kicker: 'Verständnis-Check · Defizit',
        title: 'Wenn Ausgaben höher sind als Einnahmen',
        question: 'Deine monatlichen Einnahmen liegen bei 180 €, deine Ausgaben bei 195 €. Was ist jetzt der richtige Schritt?',
        options: [
          'Zuerst die laufenden Ausgaben prüfen und senken, bis wieder ein Überschuss bleibt.',
          'Trotzdem sofort einen Aktien-Sparplan über 50 € starten.',
          'Einen Konsumkredit aufnehmen, um weiterzusparen.',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Richtig. Solange du monatlich mehr ausgibst als du einnimmst, hat der Ausgleich deines Budgets oberste Priorität.',
        explanationWrong:
          'Bei einem Minus im Monatsbudget darfst du kein Geld langfristig binden oder Schulden machen – zuerst müssen die Ausgaben angepasst werden.',
      },
      {
        id: 'taschengeld-5-check2',
        type: 'question',
        kicker: 'Verständnis-Check · Überschuss aufteilen',
        title: '50 € übrig – wie vorgehen?',
        question: 'Du hast nach allen Ausgaben 50 € im Monat übrig, besitzt aber noch keinen Notgroschen. Was ist sinnvoll?',
        options: [
          'Zuerst den Notgroschen auf dem Tagesgeld aufbauen (oder sinnvoll aufteilen, z. B. 35 € Tagesgeld-Puffer und 15 € Lern-Sparplan).',
          'Die vollen 50 € in ein hochspekulatives Krypto-Projekt stecken.',
          'Alles sofort für Konsum auf Raten ausgeben.',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Perfekt! Ein sicherer Puffer auf dem Tagesgeldkonto schützt dich vor ungeplanten Ausgaben.',
        explanationWrong:
          'Ohne Notgroschen solltest du zuerst deine Sicherheitsreserve auf dem Tagesgeldkonto aufbauen.',
      },
      {
        id: 'taschengeld-6-completion',
        type: 'completion',
        kicker: 'Praxis-Modul abgeschlossen',
        title: 'Dein Budget-Kompass steht!',
        body: 'Du weißt jetzt, wie du Einnahmen und Ausgaben im Blick behältst und deinen Überschuss überlegt aufteilst.',
        summaryPoints: [
          'Ein ehrlicher Kassensturz schützt davor, mehr Geld zu verplanen, als monatlich hereinkommt.',
          'Teile deinen Überschuss immer zwischen kurzfristiger Reserve (Tagesgeld) und langfristigem Sparziel auf.',
        ],
        depotBridge: {
          label: 'Zum großen Budget- & Zinseszins-Rechner',
          description: 'Nutze jederzeit den Rechner, um Budget und langfristiges Wachstum gemeinsam durchzuspielen.',
          to: '/rechner',
        },
      },
    ],
    sections: [
      {
        heading: '1. Wohin fließt dein Geld jeden Monat?',
        paragraphs: [
          'Kleine Alltagsausgaben wie Snacks, In-App-Käufe oder Abos summieren sich schnell auf 50 € bis 100 € im Monat.',
          'Stell alle festen Einnahmen und Ausgaben nebeneinander, um deinen echten monatlichen Spielraum zu sehen.',
        ],
      },
      {
        heading: '2. Eine mögliche Lernaufteilung',
        paragraphs: [
          'Teile deinen monatlichen Überschuss zwischen kurzfristigem Sicherheitspuffer (Tagesgeld) und langfristigem Sparplan auf – passend zu deiner Lebenssituation.',
        ],
      },
    ],
    practicalExample: {
      title: 'Praxisbeispiel: Der Abo-Check bringt 20 € pro Monat',
      scenario:
        'Amir (17) stellt fest, dass er zwei ungenutzte Abos für zusammen 20 € im Monat bezahlt.',
      takeaway:
        'Er kündigt beide Abos und leitet die 20 € monatlich in seinen Sparplan um.',
    },
    interactiveType: 'budget-planner',
    merkeSummary: [
      'Ein ehrlicher Kassensturz schützt davor, mehr Geld zu verplanen, als monatlich hereinkommt.',
      'Teile deinen monatlichen Überschuss zwischen kurzfristiger Reserve (Tagesgeld) und langfristigem Sparziel auf.',
    ],
    quiz: [
      {
        id: 'taschengeld-q1',
        question: 'Deine monatlichen Einnahmen liegen bei 180 €, deine Ausgaben bei 195 €. Was ist jetzt der richtige Schritt?',
        options: [
          'Trotzdem einen Aktien-Sparplan über 50 € starten.',
          'Zuerst die laufenden Ausgaben prüfen und kürzen, bis die Einnahmen wieder höher sind als die Ausgaben.',
          'Einen Ratenkredit für Konsumausgaben aufnehmen.',
        ],
        correctIndex: 1,
        explanationCorrect:
          'Richtig! Solange du jeden Monat mehr ausgibst als du einnimmst, hat das Ausgleichen deines Budgets oberste Priorität.',
        explanationWrong:
          'Wenn die Ausgaben höher sind als die Einnahmen, müssen zuerst die Ausgaben angepasst werden.',
      },
      {
        id: 'taschengeld-q2',
        question: 'Du hast nach allen Ausgaben 50 € im Monat übrig, besitzt aber noch keinen Notgroschen. Wie gehst du sinnvoll vor?',
        options: [
          'Zuerst den Notgroschen auf dem Tagesgeldkonto aufbauen (oder den Betrag aufteilen: z. B. 35 € Notgroschen, 15 € Lern-Sparplan).',
          'Die vollen 50 € in ein hochspekulatives Krypto-Projekt stecken.',
          'Das Geld komplett auf dem unverzinsten Girokonto vergessen.',
        ],
        correctIndex: 0,
        explanationCorrect:
          'Perfekt! Ein sicherer Puffer auf dem Tagesgeldkonto gibt dir Rückhalt für unvorhergesehene Kosten.',
        explanationWrong:
          'Ohne Notgroschen solltest du zuerst deine Sicherheitsreserve auf dem Tagesgeldkonto aufbauen.',
      },
    ],
  },
];

export type Lesson = LessonModule;
export type InteractiveWidgetKind = InteractiveStepWidget;

export const CORE_LESSONS = LESSONS.filter((lesson) => lesson.isCoreTopic);
export const BONUS_LESSON = LESSONS.find((lesson) => !lesson.isCoreTopic)!;
export const BONUS_LESSONS = LESSONS.filter((lesson) => !lesson.isCoreTopic);

export function getLessonById(id: string): LessonModule | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

export function getLessonByRoute(routePath: string): LessonModule | undefined {
  return LESSONS.find((lesson) => lesson.route === routePath);
}

export function getNextLesson(lessonId: string): LessonModule | null {
  const current = getLessonById(lessonId);
  if (!current || !current.nextRoute) return null;
  return getLessonByRoute(current.nextRoute) ?? null;
}


export const DAILY_QUESTIONS: DailyQuestionItem[] = [
  {
    id: 'dq-inflation-100',
    topicId: 'grundlagen',
    topicLabel: 'Grundlagen',
    question:
      'Auf deinem Girokonto liegen 100 € unverzinst. Die Inflation beträgt 2 % pro Jahr. Was passiert nach 10 Jahren?',
    options: [
      'Auf dem Konto stehen weiterhin 100 €, aber die Kaufkraft entspricht nur noch etwa 82 €.',
      'Auf dem Konto stehen nach 10 Jahren nur noch 82 €.',
      'Die Kaufkraft steigt automatisch auf 120 €.',
    ],
    correctIndex: 0,
    explanation:
      'Der Euro-Betrag auf dem Konto bleibt bei 100 €, aber weil Preise über 10 Jahre steigen, kannst du dir davon real nur noch so viel kaufen wie heute für rund 82 €.',
  },
  {
    id: 'dq-zinseszins-start',
    topicId: 'zinseszins',
    topicLabel: 'Zinseszins',
    question:
      'Warum hat jemand, der mit 17 Jahren 30 € monatlich anlegt, mit 50 oft deutlich mehr Kapital als jemand, der erst mit 30 Jahren 50 € monatlich startet?',
    options: [
      'Weil Jüngere an der Börse höhere Zinsen geschenkt bekommen.',
      'Weil die Erträge 13 Jahre länger Zeit haben, selbst wieder neue Erträge (Zinseszins) zu erwirtschaften.',
      'Weil Banken ab 30 Jahren keine Sparpläne mehr erlauben.',
    ],
    correctIndex: 1,
    explanation:
      'Beim Zinseszins arbeitet die Zeit exponentiell: Die zusätzlichen 13 Jahre sorgen dafür, dass bereits angesammelte Erträge immer kräftiger mitwachsen.',
  },
  {
    id: 'dq-notgroschen',
    topicId: 'anlageklassen',
    topicLabel: 'Anlageklassen',
    question:
      'Welche Anlageform eignet sich am besten für deinen kurzfristigen Notgroschen (z. B. 1.000 € Sicherheitsreserve)?',
    options: [
      'Ein Tagesgeldkonto mit täglicher Verfügbarkeit und Einlagensicherung.',
      'Eine einzelne Aktie eines bekannten Smartphone-Herstellers.',
      'Ein geschlossener Vertrag mit 7 Jahren Kündigungsfrist.',
    ],
    correctIndex: 0,
    explanation:
      'Dein Notgroschen muss jederzeit verfügbar sein und darf nicht im Wert schwanken – genau dafür ist ein Tagesgeldkonto da.',
  },
  {
    id: 'dq-staat-status',
    topicId: 'staat',
    topicLabel: 'Staatliche Hilfe',
    question:
      'Welche dieser Förderungen ist (Stand: 2025/2026) bereits ein aktives Gesetz, das viele Auszubildende direkt nutzen können?',
    options: [
      'Vermögenswirksame Leistungen (VL) vom Arbeitgeber plus Arbeitnehmersparzulage.',
      'Die staatliche Frühstart-Rente für alle Schüler.',
      'Ein steuerfreies Krypto-Startguthaben vom Finanzamt.',
    ],
    correctIndex: 0,
    explanation:
      'Vermögenswirksame Leistungen (VL) und die Arbeitnehmersparzulage sind bestehende Regelungen. Die Frühstart-Rente ist dagegen bislang nur ein politisches Vorhaben.',
  },
];
