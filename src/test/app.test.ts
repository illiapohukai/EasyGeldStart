/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calculateBudgetSplit,
  calculateCompoundInterest,
  calculateInflationPurchasingPower,
} from '../lib/calculator';
import {
  evaluatePortfolioValuation,
  executeVirtualBuy,
  executeVirtualSell,
  previewVirtualBuy,
} from '../lib/depot-calculations';
import {
  initializeVirtualPortfolio,
  STARTING_CASH_PRESETS,
  sanitizeDepotState,
} from '../lib/depot-storage';
import {
  BONUS_LESSONS,
  CORE_LESSONS,
  getLessonById,
  getLessonByRoute,
  getNextLesson,
  LESSONS,
} from '../lib/lessons';
import {
  DEMO_INSTRUMENTS,
  getDemoHistoricalSeries,
  getDemoQuote,
} from '../lib/market-demo-adapter';
import { computeProgressStats } from '../lib/progress-context';
import {
  createInitialProgressState,
  dismissOnboardingState,
  getLessonResumeInfo,
  markLessonCompletedState,
  markLessonOpenedState,
  recordQuizResultState,
  recordStepAnswerState,
  sanitizeProgressState,
  saveLessonStepState,
} from '../lib/storage';
import { resolveViteBasePath } from '../../vite.config';

describe('Compound Interest & Inflation Calculator (Pure Math)', () => {
  it('computes zero-return savings accurately without compounding errors', () => {
    const res = calculateCompoundInterest({
      initialAmount: 500,
      monthlyContribution: 50,
      years: 10,
      annualRatePercent: 0,
    });

    assert.equal(res.totalContributions, 500 + 50 * 120);
    assert.equal(res.estimatedFinalValue, 6500);
    assert.equal(res.estimatedGrowth, 0);
    assert.equal(res.yearlyRows.length, 10);
  });

  it('computes positive compound growth with monthly contributions', () => {
    const res = calculateCompoundInterest({
      initialAmount: 0,
      monthlyContribution: 50,
      years: 18,
      annualRatePercent: 6,
    });

    assert.equal(res.totalContributions, 10800);
    assert.ok(res.estimatedFinalValue > 18500 && res.estimatedFinalValue < 20000);
    assert.ok(res.estimatedGrowth > 7500);
    assert.equal(
      Math.round((res.totalContributions + res.estimatedGrowth) * 100),
      Math.round(res.estimatedFinalValue * 100),
    );
  });

  it('clamps negative or out-of-range inputs safely', () => {
    const res = calculateCompoundInterest({
      initialAmount: -1000,
      monthlyContribution: -50,
      years: 0,
      annualRatePercent: -5,
    });

    assert.equal(res.totalContributions, 0);
    assert.equal(res.estimatedFinalValue, 0);
    assert.equal(res.yearlyRows.length, 1);
  });

  it('computes purchasing power erosion under inflation', () => {
    const powerAfter10Years = calculateInflationPurchasingPower(1000, 3, 10);
    assert.ok(powerAfter10Years > 735 && powerAfter10Years < 750);
  });

  it('generates a concise 2-sentence German summary sentence', () => {
    const res = calculateCompoundInterest({
      initialAmount: 100,
      monthlyContribution: 25,
      years: 10,
      annualRatePercent: 5,
    });
    assert.ok(res.summarySentence.includes('Du zahlst insgesamt'));
    assert.ok(res.summarySentence.includes('unverbindlichen Annahme'));
  });

  it('calculates 50/30/20 budget splits accurately', () => {
    const split = calculateBudgetSplit(400, 50, 30, 20);
    assert.equal(split.needsAmount, 200);
    assert.equal(split.wantsAmount, 120);
    assert.equal(split.savingsAmount, 80);
  });
});

describe('Step-Based Lesson Architecture & Micro-Learning Content', () => {
  it('exposes 6 core modules in order 1..6 and 1 bonus module', () => {
    assert.equal(CORE_LESSONS.length, 6);
    assert.equal(BONUS_LESSONS.length, 1);
    assert.equal(LESSONS.length, 7);
    assert.deepEqual(
      CORE_LESSONS.map((l) => l.order),
      [1, 2, 3, 4, 5, 6],
    );
  });

  it('ensures every lesson has a valid step sequence ending with a completion step', () => {
    for (const lesson of LESSONS) {
      assert.ok(
        lesson.steps.length >= 6 && lesson.steps.length <= 10,
        `Lesson ${lesson.id} should have 6-10 steps, got ${lesson.steps.length}`,
      );
      assert.equal(lesson.steps[0]?.type, 'intro');
      assert.equal(lesson.steps[lesson.steps.length - 1]?.type, 'completion');

      const hasInteractiveOrChoice = lesson.steps.some(
        (s) =>
          s.type === 'question' ||
          s.type === 'scenario' ||
          s.type === 'visual_choice' ||
          s.type === 'interactive',
      );
      assert.ok(hasInteractiveOrChoice, `Lesson ${lesson.id} must have interactive/question steps`);
    }
  });

  it('resolves routes and next-lesson pointers accurately', () => {
    const first = getLessonByRoute('/grundlagen');
    assert.ok(first);
    assert.equal(first.id, 'grundlagen');

    const second = getNextLesson('grundlagen');
    assert.ok(second);
    assert.equal(second.id, 'zinseszins');

    const bonus = getNextLesson('staat');
    assert.ok(bonus);
    assert.equal(bonus.id, 'taschengeld');

    const afterBonus = getNextLesson('taschengeld');
    assert.equal(afterBonus, null);
    assert.equal(getLessonById('unknown-id'), undefined);
  });
});

describe('Step-Level Learning Progress State & v1->v2 Migration', () => {
  it('tracks opened, step index, step answers, and completed lessons immutably', () => {
    let state = createInitialProgressState();
    assert.equal(state.onboardingDismissed, false);

    state = markLessonOpenedState(state, 'grundlagen');
    assert.deepEqual(state.openedLessons, ['grundlagen']);
    assert.equal(state.lastVisitedLessonId, 'grundlagen');
    assert.equal(state.onboardingDismissed, true);

    // Save step 3 (0-based index 3 -> "Schritt 4 von 9")
    state = saveLessonStepState(state, 'grundlagen', 3, 'grundlagen-3-check1');
    const resumeInfo = getLessonResumeInfo(state, 'grundlagen');
    assert.equal(resumeInfo.currentStepIndex, 3);
    assert.equal(resumeInfo.displayStepNumber, 4);
    assert.equal(resumeInfo.totalSteps, 9);
    assert.equal(resumeInfo.resumeLabel, 'Grundlagen fortsetzen · Schritt 4 von 9');

    // Answer a step question incorrectly then correctly
    state = recordStepAnswerState(state, 'grundlagen', 'grundlagen-3-check1', 0, false);
    assert.equal(state.stepAnswers['grundlagen:grundlagen-3-check1']?.isCorrect, false);
    assert.equal(state.stepAnswers['grundlagen:grundlagen-3-check1']?.attempts, 1);

    state = recordStepAnswerState(state, 'grundlagen', 'grundlagen-3-check1', 1, true);
    assert.equal(state.stepAnswers['grundlagen:grundlagen-3-check1']?.isCorrect, true);
    assert.equal(state.stepAnswers['grundlagen:grundlagen-3-check1']?.attempts, 2);

    // Complete lesson
    state = markLessonCompletedState(state, 'grundlagen');
    assert.ok(state.completedLessons.includes('grundlagen'));

    const stats = computeProgressStats(state);
    assert.equal(stats.completedCoreCount, 1);
    assert.equal(stats.totalCoreCount, 6);
    assert.equal(stats.recommendedLesson.id, 'zinseszins');
  });

  it('migrates v1 progress state cleanly to v2 without losing completed modules', () => {
    const v1Raw = {
      version: 1,
      openedLessons: ['grundlagen', 'zinseszins'],
      completedLessons: ['grundlagen'],
      quizScores: {
        grundlagen: { score: 3, total: 3, updatedAt: '2026-01-01T00:00:00Z' },
      },
      lastVisitedLessonId: 'zinseszins',
    };

    const migrated = sanitizeProgressState(v1Raw);
    assert.equal(migrated.version, 2);
    assert.deepEqual(migrated.completedLessons, ['grundlagen']);
    assert.equal(migrated.completedSteps.grundlagen?.length, 9);
    assert.equal(migrated.onboardingDismissed, true);

    const stats = computeProgressStats(migrated);
    assert.equal(stats.recommendedLesson.id, 'zinseszins');
  });

  it('sanitizes malformed storage payloads without throwing', () => {
    const sanitized = sanitizeProgressState({
      openedLessons: ['grundlagen', 'fake-module', 123],
      completedLessons: ['zinseszins'],
      lessonStepIndex: { grundlagen: 999, zinseszins: -5 },
      quizScores: {
        zinseszins: { score: 99, total: 3, updatedAt: '2025-01-01' },
      },
      lastVisitedLessonId: 'non-existent',
    });

    assert.deepEqual(sanitized.openedLessons, ['grundlagen']);
    assert.deepEqual(sanitized.completedLessons, ['zinseszins']);
    assert.equal(sanitized.lessonStepIndex.grundlagen, 8);
    assert.equal(sanitized.lessonStepIndex.zinseszins, 0);
    assert.equal(sanitized.quizScores.zinseszins?.score, 3);
    assert.equal(sanitized.lastVisitedLessonId, null);
  });

  it('supports legacy recordQuizResultState and dismissOnboardingState', () => {
    let state = createInitialProgressState();
    state = dismissOnboardingState(state);
    assert.equal(state.onboardingDismissed, true);
    state = recordQuizResultState(state, 'anlageklassen', 2, 3);
    assert.ok(state.completedLessons.includes('anlageklassen'));
    assert.equal(state.quizScores.anlageklassen?.score, 2);
  });
});

describe('Virtual Practice Depot & Market Demo Adapter', () => {
  it('provides curated educational instruments with German explanations and demo quotes', () => {
    assert.ok(DEMO_INSTRUMENTS.length >= 8);
    const worldEtf = DEMO_INSTRUMENTS.find((i) => i.symbol === 'EUNL.DE');
    assert.ok(worldEtf);
    assert.equal(worldEtf.assetType, 'ETF');

    const quote = getDemoQuote('EUNL.DE');
    assert.ok(quote);
    assert.ok(quote.price > 0);
    assert.equal(quote.isDemo, true);

    const series1Y = getDemoHistoricalSeries('EUNL.DE', '1Y');
    assert.ok(series1Y);
    assert.ok(series1Y.points.length >= 6);
  });

  it('executes virtual buy and sell transactions and updates average buy price & P/L', () => {
    const initial = initializeVirtualPortfolio({ startingCashEur: 10000 });
    assert.equal(initial.cashEur, 10000);

    const worldEtf = DEMO_INSTRUMENTS.find((i) => i.symbol === 'EUNL.DE')!;
    const quote1 = {
      ...getDemoQuote('EUNL.DE')!,
      price: 100,
    };

    const buy1 = executeVirtualBuy({
      portfolio: initial,
      instrument: worldEtf,
      quote: quote1,
      input: { mode: 'amount_eur', value: 2000 },
    });

    assert.equal(buy1.portfolio.cashEur, 8000);
    assert.equal(buy1.portfolio.positions.length, 1);
    assert.equal(buy1.portfolio.positions[0]?.quantity, 20);
    assert.equal(buy1.portfolio.positions[0]?.averagePurchasePriceEur, 100);

    const quote2 = {
      ...quote1,
      price: 120,
    };

    const buy2 = executeVirtualBuy({
      portfolio: buy1.portfolio,
      instrument: worldEtf,
      quote: quote2,
      input: { mode: 'amount_eur', value: 1200 },
    });

    assert.equal(buy2.portfolio.cashEur, 6800);
    assert.equal(buy2.portfolio.positions[0]?.quantity, 30);
    assert.equal(buy2.portfolio.positions[0]?.investedCostBasisEur, 3200);

    const quote3 = {
      ...quote1,
      price: 130,
    };
    const portfolioAt130 = {
      ...buy2.portfolio,
      lastKnownQuotes: {
        'EUNL.DE': quote3,
      },
    };

    const valuation = evaluatePortfolioValuation(portfolioAt130);
    assert.equal(valuation.positionsMarketValueEur, 3900);
    assert.equal(valuation.totalPortfolioValueEur, 10700);
    assert.equal(valuation.unrealizedGainLossEur, 700);

    const sellRes = executeVirtualSell({
      portfolio: portfolioAt130,
      symbol: 'EUNL.DE',
      quantityToSell: 10,
      quote: quote3,
    });

    assert.equal(sellRes.portfolio.cashEur, 8100);
    assert.equal(sellRes.portfolio.positions[0]?.quantity, 20);
  });

  it('prevents buying more than available virtual cash and sanitizes depot storage', () => {
    const initial = initializeVirtualPortfolio({ startingCashEur: 5000 });
    const worldEtf = DEMO_INSTRUMENTS.find((i) => i.symbol === 'EUNL.DE')!;
    const quote = getDemoQuote('EUNL.DE')!;

    const preview = previewVirtualBuy({
      portfolio: initial,
      instrument: worldEtf,
      quote,
      input: { mode: 'amount_eur', value: 25000 },
    });

    assert.equal(preview.valid, false);
    assert.equal(preview.errorCode, 'INSUFFICIENT_CASH');

    const sanitized = sanitizeDepotState({
      isInitialized: true,
      startingCashEur: 10000,
      cashEur: -500,
      positions: [],
    });

    assert.equal(sanitized.cashEur, 10000);
    assert.equal(STARTING_CASH_PRESETS.length, 4);
  });

  it('verifies learning progress reset and depot reset operate on completely independent states', () => {
    let progress = createInitialProgressState();
    progress = markLessonCompletedState(progress, 'grundlagen');

    const depot = initializeVirtualPortfolio({ startingCashEur: 10000 });
    const worldEtf = DEMO_INSTRUMENTS.find((i) => i.symbol === 'EUNL.DE')!;
    const quote = { ...getDemoQuote('EUNL.DE')!, price: 100 };

    const afterBuy = executeVirtualBuy({
      portfolio: depot,
      instrument: worldEtf,
      quote,
      input: { mode: 'amount_eur', value: 1500 },
    }).portfolio;

    const resetProgress = createInitialProgressState();
    assert.equal(resetProgress.completedLessons.length, 0);
    assert.equal(afterBuy.positions.length, 1);
    assert.equal(afterBuy.cashEur, 8500);
  });
});

describe('GitHub Pages Base Path Resolution', () => {
  it('normalizes root and repository subpaths accurately', () => {
    const origViteBase = process.env.VITE_BASE_PATH;
    const origGhActions = process.env.GITHUB_ACTIONS;
    const origGhRepo = process.env.GITHUB_REPOSITORY;

    try {
      delete process.env.VITE_BASE_PATH;
      delete process.env.GITHUB_ACTIONS;
      delete process.env.GITHUB_REPOSITORY;
      assert.equal(resolveViteBasePath(), '/');

      process.env.VITE_BASE_PATH = 'GeldStart';
      assert.equal(resolveViteBasePath(), '/GeldStart/');

      process.env.VITE_BASE_PATH = '/GeldStart/';
      assert.equal(resolveViteBasePath(), '/GeldStart/');

      delete process.env.VITE_BASE_PATH;
      process.env.GITHUB_ACTIONS = 'true';
      process.env.GITHUB_REPOSITORY = 'owner/GeldStart';
      assert.equal(resolveViteBasePath(), '/GeldStart/');
    } finally {
      if (origViteBase === undefined) delete process.env.VITE_BASE_PATH;
      else process.env.VITE_BASE_PATH = origViteBase;
      if (origGhActions === undefined) delete process.env.GITHUB_ACTIONS;
      else process.env.GITHUB_ACTIONS = origGhActions;
      if (origGhRepo === undefined) delete process.env.GITHUB_REPOSITORY;
      else process.env.GITHUB_REPOSITORY = origGhRepo;
    }
  });
});
