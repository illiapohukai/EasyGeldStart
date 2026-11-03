export interface YearlyCompoundRow {
  year: number;
  paid: number;
  total: number;
  growth: number;
}

export interface CompoundCalculatorInput {
  initialAmount: number;
  monthlyContribution: number;
  annualRatePercent: number;
  years: number;
}

export interface CompoundCalculatorResult {
  input: CompoundCalculatorInput;
  totalContributions: number;
  estimatedFinalValue: number;
  estimatedGrowth: number;
  contributionSharePercent: number;
  growthSharePercent: number;
  yearlyRows: YearlyCompoundRow[];
  summarySentence: string;
}

export interface ValidationIssue {
  field: keyof CompoundCalculatorInput;
  message: string;
}

export const CALCULATOR_LIMITS = {
  initialAmount: { min: 0, max: 100000 },
  monthlyContribution: { min: 0, max: 5000 },
  annualRatePercent: { min: 0, max: 15 },
  years: { min: 1, max: 50 },
} as const;

/**
 * Preserved original compound-interest formula from the archive (`src/routes/zinseszins.tsx`),
 * extended with an optional `initialAmount` parameter (defaults to 0 for backward compatibility).
 */
export function calc(
  monthly: number,
  rate: number,
  years: number,
  initialAmount = 0,
): YearlyCompoundRow[] {
  const safeMonthly = Number.isFinite(monthly) ? Math.max(0, monthly) : 0;
  const safeRate = Number.isFinite(rate) ? Math.max(0, rate) : 0;
  const safeYears = Number.isFinite(years) ? Math.max(1, Math.min(50, Math.round(years))) : 1;
  const safeInitial = Number.isFinite(initialAmount) ? Math.max(0, initialAmount) : 0;

  const rows: YearlyCompoundRow[] = [];
  let total = safeInitial;
  const monthlyFactor = 1 + safeRate / 100 / 12;

  for (let y = 1; y <= safeYears; y++) {
    for (let m = 0; m < 12; m++) {
      total = (total + safeMonthly) * monthlyFactor;
    }
    const paid = safeInitial + safeMonthly * 12 * y;
    const growth = Math.max(0, total - paid);
    rows.push({
      year: y,
      paid: Math.round(paid * 100) / 100,
      total: Math.round(total * 100) / 100,
      growth: Math.round(growth * 100) / 100,
    });
  }

  return rows;
}

export function sanitizeCalculatorInput(
  raw: Partial<Record<keyof CompoundCalculatorInput, unknown>>,
): CompoundCalculatorInput {
  const parseClamped = (
    val: unknown,
    fallback: number,
    min: number,
    max: number,
    integer = false,
  ): number => {
    const num = typeof val === 'number' ? val : Number(val);
    if (!Number.isFinite(num)) return fallback;
    const clamped = Math.min(max, Math.max(min, num));
    return integer ? Math.round(clamped) : Math.round(clamped * 100) / 100;
  };

  return {
    initialAmount: parseClamped(
      raw.initialAmount,
      0,
      CALCULATOR_LIMITS.initialAmount.min,
      CALCULATOR_LIMITS.initialAmount.max,
    ),
    monthlyContribution: parseClamped(
      raw.monthlyContribution,
      50,
      CALCULATOR_LIMITS.monthlyContribution.min,
      CALCULATOR_LIMITS.monthlyContribution.max,
    ),
    annualRatePercent: parseClamped(
      raw.annualRatePercent,
      6,
      CALCULATOR_LIMITS.annualRatePercent.min,
      CALCULATOR_LIMITS.annualRatePercent.max,
    ),
    years: parseClamped(
      raw.years,
      20,
      CALCULATOR_LIMITS.years.min,
      CALCULATOR_LIMITS.years.max,
      true,
    ),
  };
}

export function validateCalculatorInput(
  raw: Partial<Record<keyof CompoundCalculatorInput, number | string>>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const checkField = (
    field: keyof CompoundCalculatorInput,
    label: string,
    min: number,
    max: number,
    unit: string,
  ) => {
    const rawValue = raw[field];
    const num = typeof rawValue === 'number' ? rawValue : Number(rawValue);
    if (rawValue === '' || rawValue === undefined || Number.isNaN(num)) {
      issues.push({ field, message: `Bitte gib für „${label}“ eine gültige Zahl ein.` });
      return;
    }
    if (num < min) {
      issues.push({
        field,
        message: `${label} darf nicht kleiner als ${min} ${unit} sein (keine negativen Werte).`,
      });
    } else if (num > max) {
      issues.push({
        field,
        message: `${label} ist für dieses Rechenmodell auf maximal ${max.toLocaleString('de-DE')} ${unit} begrenzt.`,
      });
    }
  };

  checkField(
    'initialAmount',
    'Startbetrag',
    CALCULATOR_LIMITS.initialAmount.min,
    CALCULATOR_LIMITS.initialAmount.max,
    '€',
  );
  checkField(
    'monthlyContribution',
    'Monatliche Sparrate',
    CALCULATOR_LIMITS.monthlyContribution.min,
    CALCULATOR_LIMITS.monthlyContribution.max,
    '€',
  );
  checkField(
    'annualRatePercent',
    'Jährliche Renditeannahme',
    CALCULATOR_LIMITS.annualRatePercent.min,
    CALCULATOR_LIMITS.annualRatePercent.max,
    '%',
  );
  checkField(
    'years',
    'Anlagedauer',
    CALCULATOR_LIMITS.years.min,
    CALCULATOR_LIMITS.years.max,
    'Jahre',
  );

  return issues;
}

export function formatEuro(amount: number, fractionDigits = 0): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return safe.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatPercent(value: number, fractionDigits = 1): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe.toLocaleString('de-DE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })} %`;
}

export function buildCalculatorSummarySentence(
  input: CompoundCalculatorInput,
  totalContributions: number,
  estimatedFinalValue: number,
  estimatedGrowth: number,
): string {
  if (totalContributions === 0) {
    return 'Du zahlst 0 € ein. Erhöhe die monatliche Sparrate oder den Startbetrag, um den Zinseszins zu sehen.';
  }

  if (input.annualRatePercent === 0) {
    return `Du zahlst insgesamt ${formatEuro(totalContributions)} ein. Bei 0 % Rendite entsteht kein zusätzlicher Ertrag (Endwert: ${formatEuro(estimatedFinalValue)}).`;
  }

  return `Du zahlst insgesamt ${formatEuro(totalContributions)} ein. Bei dieser unverbindlichen Annahme (${formatPercent(input.annualRatePercent, 1)} p.a.) entstehen rechnerisch ${formatEuro(estimatedGrowth)} zusätzlicher Ertrag (Endwert: rund ${formatEuro(estimatedFinalValue)}).`;
}

export function calculateCompoundInterest(
  rawInput: Partial<CompoundCalculatorInput>,
): CompoundCalculatorResult {
  const input = sanitizeCalculatorInput(rawInput);
  const yearlyRows = calc(
    input.monthlyContribution,
    input.annualRatePercent,
    input.years,
    input.initialAmount,
  );
  const lastRow = yearlyRows[yearlyRows.length - 1] ?? {
    year: input.years,
    paid: input.initialAmount,
    total: input.initialAmount,
    growth: 0,
  };

  const totalContributions = Math.round(lastRow.paid);
  const estimatedFinalValue = Math.round(lastRow.total);
  const estimatedGrowth = Math.max(0, estimatedFinalValue - totalContributions);

  const contributionSharePercent =
    estimatedFinalValue > 0
      ? Math.min(100, Math.max(0, Math.round((totalContributions / estimatedFinalValue) * 100)))
      : 100;
  const growthSharePercent =
    estimatedFinalValue > 0 ? Math.max(0, 100 - contributionSharePercent) : 0;

  const summarySentence = buildCalculatorSummarySentence(
    input,
    totalContributions,
    estimatedFinalValue,
    estimatedGrowth,
  );

  return {
    input,
    totalContributions,
    estimatedFinalValue,
    estimatedGrowth,
    contributionSharePercent,
    growthSharePercent,
    yearlyRows,
    summarySentence,
  };
}

export interface PurchasingPowerResult {
  nominalAmount: number;
  inflationRatePercent: number;
  years: number;
  realPurchasingPower: number;
  lostPurchasingPower: number;
  retainedPercent: number;
}

export function calculatePurchasingPower(
  amount: number,
  inflationRatePercent: number,
  years: number,
): PurchasingPowerResult {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  const safeRate = Number.isFinite(inflationRatePercent)
    ? Math.min(20, Math.max(0, inflationRatePercent))
    : 2;
  const safeYears = Number.isFinite(years) ? Math.min(50, Math.max(1, Math.round(years))) : 10;

  const realPurchasingPower = safeAmount / Math.pow(1 + safeRate / 100, safeYears);
  const roundedReal = Math.round(realPurchasingPower * 100) / 100;
  const lostPurchasingPower = Math.max(0, Math.round((safeAmount - roundedReal) * 100) / 100);
  const retainedPercent = safeAmount > 0 ? Math.round((roundedReal / safeAmount) * 100) : 100;

  return {
    nominalAmount: safeAmount,
    inflationRatePercent: safeRate,
    years: safeYears,
    realPurchasingPower: roundedReal,
    lostPurchasingPower,
    retainedPercent,
  };
}

export interface BudgetRow {
  id: string;
  name: string;
  value: number;
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  remaining: number;
  recommendedEmergencyReserveMonthly: number;
  recommendedLongTermMonthly: number;
}

export function calculateBudgetSummary(
  incomes: BudgetRow[],
  expenses: BudgetRow[],
): BudgetSummary {
  const sumRows = (rows: BudgetRow[]) =>
    rows.reduce((acc, row) => {
      const val = Number.isFinite(row.value) ? Math.max(0, row.value) : 0;
      return acc + val;
    }, 0);

  const totalIncome = Math.round(sumRows(incomes));
  const totalExpenses = Math.round(sumRows(expenses));
  const remaining = totalIncome - totalExpenses;

  const positiveRemaining = Math.max(0, remaining);
  // Conservative educational rule of thumb: never invest everything left over;
  // keep at least half for short-term buffer/emergency reserve first.
  const recommendedEmergencyReserveMonthly = Math.round(positiveRemaining * 0.5);
  const recommendedLongTermMonthly = Math.floor((positiveRemaining * 0.5) / 5) * 5;

  return {
    totalIncome,
    totalExpenses,
    remaining,
    recommendedEmergencyReserveMonthly,
    recommendedLongTermMonthly,
  };
}

export function formatEuroExact(amount: number): string {
  return formatEuro(amount, 2);
}

export function calculateInflationPurchasingPower(
  amount: number,
  inflationRatePercent: number,
  years: number,
): number {
  return calculatePurchasingPower(amount, inflationRatePercent, years).realPurchasingPower;
}

export function calculateBudgetSplit(
  monthlyIncome: number,
  needsPercent = 50,
  wantsPercent = 30,
  savingsPercent = 20,
) {
  const safeIncome = Number.isFinite(monthlyIncome) ? Math.max(0, monthlyIncome) : 0;
  return {
    needsAmount: Math.round(((safeIncome * needsPercent) / 100) * 100) / 100,
    wantsAmount: Math.round(((safeIncome * wantsPercent) / 100) * 100) / 100,
    savingsAmount: Math.round(((safeIncome * savingsPercent) / 100) * 100) / 100,
  };
}

export const CALCULATOR_PRESETS: Array<{
  id: string;
  label: string;
  description: string;
  input: CompoundCalculatorInput;
}> = [
  {
    id: 'starter-25',
    label: 'Kleiner Start (25 € / Monat · 18 Jahre)',
    description: 'Typischer Sparplan ab Jugend- oder Ausbildungszeit bei 6 % p. a.',
    input: {
      initialAmount: 0,
      monthlyContribution: 25,
      annualRatePercent: 6,
      years: 18,
    },
  },
  {
    id: 'azubi-50',
    label: 'Azubi-Routine (50 € / Monat · 25 Jahre)',
    description: 'Regelmäßiger Vermögensaufbau mit kleinem Startpolster (500 €)',
    input: {
      initialAmount: 500,
      monthlyContribution: 50,
      annualRatePercent: 6,
      years: 25,
    },
  },
  {
    id: 'longterm-100',
    label: 'Langfrist-Horizont (100 € / Monat · 35 Jahre)',
    description: 'Zeigt den starken Zinseszins-Hebel über mehrere Jahrzehnte',
    input: {
      initialAmount: 1000,
      monthlyContribution: 100,
      annualRatePercent: 6,
      years: 35,
    },
  },
];

