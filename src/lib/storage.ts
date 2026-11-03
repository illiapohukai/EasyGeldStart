/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CORE_LESSONS, LESSONS, type Lesson } from './lessons';

const STORAGE_KEY = 'geldstart_progress_v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface QuizScoreRecord {
  score: number;
  total: number;
  updatedAt: string;
}

export interface StepAnswerRecord {
  selectedIndex: number;
  isCorrect: boolean;
  attempts: number;
  updatedAt: string;
}

export interface LearningProgressState {
  version: number;
  openedLessons: string[];
  completedLessons: string[];
  quizScores: Record<string, QuizScoreRecord>;
  lastVisitedLessonId: string | null;
  lessonStepIndex: Record<string, number>;
  completedSteps: Record<string, string[]>;
  stepAnswers: Record<string, StepAnswerRecord>;
  lessonCompletedAt: Record<string, string>;
  onboardingDismissed: boolean;
  lastActivityAt: string | null;
}

export interface LessonResumeInfo {
  lessonId: string;
  currentStepIndex: number;
  displayStepNumber: number;
  totalSteps: number;
  completedStepCount: number;
  isStarted: boolean;
  isCompleted: boolean;
  percentComplete: number;
  resumeLabel: string;
  shortStatusLabel: string;
}

export const INITIAL_PROGRESS_STATE: LearningProgressState = {
  version: 2,
  openedLessons: [],
  completedLessons: [],
  quizScores: {},
  lastVisitedLessonId: null,
  lessonStepIndex: {},
  completedSteps: {},
  stepAnswers: {},
  lessonCompletedAt: {},
  onboardingDismissed: false,
  lastActivityAt: null,
};

export function createInitialProgressState(): LearningProgressState {
  return {
    version: 2,
    openedLessons: [],
    completedLessons: [],
    quizScores: {},
    lastVisitedLessonId: null,
    lessonStepIndex: {},
    completedSteps: {},
    stepAnswers: {},
    lessonCompletedAt: {},
    onboardingDismissed: false,
    lastActivityAt: null,
  };
}

const VALID_LESSON_IDS = new Set<string>(LESSONS.map((lesson) => lesson.id));
const LESSON_MAP = new Map<string, Lesson>(LESSONS.map((lesson) => [lesson.id, lesson]));

function clampStepIndex(lessonId: string, rawIndex: unknown): number {
  const lesson = LESSON_MAP.get(lessonId);
  const maxIndex = lesson && lesson.steps.length > 0 ? lesson.steps.length - 1 : 0;
  if (typeof rawIndex !== 'number' || !Number.isFinite(rawIndex)) {
    return 0;
  }
  return Math.max(0, Math.min(maxIndex, Math.floor(rawIndex)));
}

export function sanitizeProgressState(raw: unknown): LearningProgressState {
  if (!raw || typeof raw !== 'object') {
    return createInitialProgressState();
  }

  const parsed = raw as Partial<LearningProgressState>;
  const openedLessons = Array.isArray(parsed.openedLessons)
    ? Array.from(
        new Set(
          parsed.openedLessons.filter(
            (id): id is string => typeof id === 'string' && VALID_LESSON_IDS.has(id),
          ),
        ),
      )
    : [];

  const completedLessons = Array.isArray(parsed.completedLessons)
    ? Array.from(
        new Set(
          parsed.completedLessons.filter(
            (id): id is string => typeof id === 'string' && VALID_LESSON_IDS.has(id),
          ),
        ),
      )
    : [];

  const quizScores: Record<string, QuizScoreRecord> = {};
  if (parsed.quizScores && typeof parsed.quizScores === 'object') {
    for (const [key, val] of Object.entries(parsed.quizScores)) {
      if (
        VALID_LESSON_IDS.has(key) &&
        val &&
        typeof val === 'object' &&
        typeof (val as QuizScoreRecord).score === 'number' &&
        typeof (val as QuizScoreRecord).total === 'number' &&
        Number.isFinite((val as QuizScoreRecord).score) &&
        Number.isFinite((val as QuizScoreRecord).total) &&
        (val as QuizScoreRecord).total > 0
      ) {
        const record = val as QuizScoreRecord;
        quizScores[key] = {
          score: Math.max(0, Math.min(record.total, Math.round(record.score))),
          total: Math.max(1, Math.round(record.total)),
          updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : '',
        };
      }
    }
  }

  const lessonStepIndex: Record<string, number> = {};
  if (parsed.lessonStepIndex && typeof parsed.lessonStepIndex === 'object') {
    for (const [lessonId, idx] of Object.entries(parsed.lessonStepIndex)) {
      if (VALID_LESSON_IDS.has(lessonId)) {
        lessonStepIndex[lessonId] = clampStepIndex(lessonId, idx);
      }
    }
  }

  const completedSteps: Record<string, string[]> = {};
  if (parsed.completedSteps && typeof parsed.completedSteps === 'object') {
    for (const [lessonId, stepIds] of Object.entries(parsed.completedSteps)) {
      const lesson = LESSON_MAP.get(lessonId);
      if (lesson && Array.isArray(stepIds)) {
        const validStepSet = new Set(lesson.steps.map((s) => s.id));
        completedSteps[lessonId] = Array.from(
          new Set(
            stepIds.filter(
              (stepId): stepId is string => typeof stepId === 'string' && validStepSet.has(stepId),
            ),
          ),
        );
      }
    }
  }

  // Backward-compatible migration: if a lesson was already completed in v1, ensure all steps are marked completed
  for (const completedId of completedLessons) {
    const lesson = LESSON_MAP.get(completedId);
    if (lesson && (!completedSteps[completedId] || completedSteps[completedId].length === 0)) {
      completedSteps[completedId] = lesson.steps.map((s) => s.id);
    }
  }

  const stepAnswers: Record<string, StepAnswerRecord> = {};
  if (parsed.stepAnswers && typeof parsed.stepAnswers === 'object') {
    for (const [stepKey, record] of Object.entries(parsed.stepAnswers)) {
      if (
        record &&
        typeof record === 'object' &&
        typeof (record as StepAnswerRecord).selectedIndex === 'number' &&
        typeof (record as StepAnswerRecord).isCorrect === 'boolean'
      ) {
        const typed = record as StepAnswerRecord;
        stepAnswers[stepKey] = {
          selectedIndex: Math.max(0, Math.floor(typed.selectedIndex)),
          isCorrect: Boolean(typed.isCorrect),
          attempts:
            typeof typed.attempts === 'number' && Number.isFinite(typed.attempts)
              ? Math.max(1, Math.floor(typed.attempts))
              : 1,
          updatedAt: typeof typed.updatedAt === 'string' ? typed.updatedAt : '',
        };
      }
    }
  }

  const lessonCompletedAt: Record<string, string> = {};
  if (parsed.lessonCompletedAt && typeof parsed.lessonCompletedAt === 'object') {
    for (const [lessonId, ts] of Object.entries(parsed.lessonCompletedAt)) {
      if (VALID_LESSON_IDS.has(lessonId) && typeof ts === 'string') {
        lessonCompletedAt[lessonId] = ts;
      }
    }
  }

  const lastVisitedLessonId =
    typeof parsed.lastVisitedLessonId === 'string' && VALID_LESSON_IDS.has(parsed.lastVisitedLessonId)
      ? parsed.lastVisitedLessonId
      : null;

  const onboardingDismissed =
    typeof parsed.onboardingDismissed === 'boolean'
      ? parsed.onboardingDismissed
      : openedLessons.length > 0 || completedLessons.length > 0;

  const lastActivityAt =
    typeof parsed.lastActivityAt === 'string' ? parsed.lastActivityAt : null;

  return {
    version: 2,
    openedLessons,
    completedLessons,
    quizScores,
    lastVisitedLessonId,
    lessonStepIndex,
    completedSteps,
    stepAnswers,
    lessonCompletedAt,
    onboardingDismissed,
    lastActivityAt,
  };
}

export function loadProgress(): LearningProgressState {
  if (typeof window === 'undefined') {
    return createInitialProgressState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgressState();
    return sanitizeProgressState(JSON.parse(raw));
  } catch {
    return createInitialProgressState();
  }
}

export function saveProgress(state: LearningProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or private mode issues
  }
}

export function resetProgressStorage(): LearningProgressState {
  const initial = createInitialProgressState();
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
  return initial;
}

export function markLessonOpenedState(
  state: LearningProgressState,
  lessonId: string,
): LearningProgressState {
  if (!VALID_LESSON_IDS.has(lessonId)) return state;
  const openedLessons = state.openedLessons.includes(lessonId)
    ? state.openedLessons
    : [...state.openedLessons, lessonId];
  const currentStep = state.lessonStepIndex[lessonId] ?? 0;
  return {
    ...state,
    openedLessons,
    lastVisitedLessonId: lessonId,
    lessonStepIndex: {
      ...state.lessonStepIndex,
      [lessonId]: clampStepIndex(lessonId, currentStep),
    },
    onboardingDismissed: true,
    lastActivityAt: new Date().toISOString(),
  };
}

export function saveLessonStepState(
  state: LearningProgressState,
  lessonId: string,
  stepIndex: number,
  completedStepId?: string,
): LearningProgressState {
  if (!VALID_LESSON_IDS.has(lessonId)) return state;
  const lesson = LESSON_MAP.get(lessonId);
  if (!lesson) return state;

  const clampedIndex = clampStepIndex(lessonId, stepIndex);
  const openedLessons = state.openedLessons.includes(lessonId)
    ? state.openedLessons
    : [...state.openedLessons, lessonId];

  const existingCompletedSteps = state.completedSteps[lessonId] ?? [];
  const validStepIds = new Set(lesson.steps.map((s) => s.id));
  const nextCompletedSteps =
    completedStepId &&
    validStepIds.has(completedStepId) &&
    !existingCompletedSteps.includes(completedStepId)
      ? [...existingCompletedSteps, completedStepId]
      : existingCompletedSteps;

  return {
    ...state,
    openedLessons,
    lastVisitedLessonId: lessonId,
    lessonStepIndex: {
      ...state.lessonStepIndex,
      [lessonId]: clampedIndex,
    },
    completedSteps: {
      ...state.completedSteps,
      [lessonId]: nextCompletedSteps,
    },
    onboardingDismissed: true,
    lastActivityAt: new Date().toISOString(),
  };
}

export function recordStepAnswerState(
  state: LearningProgressState,
  lessonId: string,
  stepId: string,
  selectedIndex: number,
  isCorrect: boolean,
): LearningProgressState {
  if (!VALID_LESSON_IDS.has(lessonId)) return state;
  const lesson = LESSON_MAP.get(lessonId);
  if (!lesson) return state;

  const key = `${lessonId}:${stepId}`;
  const previous = state.stepAnswers[key];
  const now = new Date().toISOString();

  const updatedStepAnswers: Record<string, StepAnswerRecord> = {
    ...state.stepAnswers,
    [key]: {
      selectedIndex: Math.max(0, Math.floor(selectedIndex)),
      isCorrect,
      attempts: (previous?.attempts ?? 0) + 1,
      updatedAt: now,
    },
  };

  // Also keep quizScores updated based on question/scenario/visual_choice steps
  const evaluableSteps = lesson.steps.filter(
    (s) => s.type === 'question' || s.type === 'scenario' || s.type === 'visual_choice',
  );
  const totalQuestions = Math.max(1, evaluableSteps.length);
  const correctCount = evaluableSteps.filter(
    (s) => updatedStepAnswers[`${lessonId}:${s.id}`]?.isCorrect,
  ).length;

  return {
    ...state,
    stepAnswers: updatedStepAnswers,
    quizScores: {
      ...state.quizScores,
      [lessonId]: {
        score: correctCount,
        total: totalQuestions,
        updatedAt: now,
      },
    },
    lastActivityAt: now,
  };
}

export function markLessonCompletedState(
  state: LearningProgressState,
  lessonId: string,
): LearningProgressState {
  if (!VALID_LESSON_IDS.has(lessonId)) return state;
  const lesson = LESSON_MAP.get(lessonId);
  const openedLessons = state.openedLessons.includes(lessonId)
    ? state.openedLessons
    : [...state.openedLessons, lessonId];
  const completedLessons = state.completedLessons.includes(lessonId)
    ? state.completedLessons
    : [...state.completedLessons, lessonId];
  const now = new Date().toISOString();
  const allStepIds = lesson ? lesson.steps.map((s) => s.id) : [];
  const lastStepIndex = lesson && lesson.steps.length > 0 ? lesson.steps.length - 1 : 0;

  return {
    ...state,
    openedLessons,
    completedLessons,
    lastVisitedLessonId: lessonId,
    lessonStepIndex: {
      ...state.lessonStepIndex,
      [lessonId]: lastStepIndex,
    },
    completedSteps: {
      ...state.completedSteps,
      [lessonId]: allStepIds,
    },
    lessonCompletedAt: {
      ...state.lessonCompletedAt,
      [lessonId]: state.lessonCompletedAt[lessonId] || now,
    },
    onboardingDismissed: true,
    lastActivityAt: now,
  };
}

export function recordQuizResultState(
  state: LearningProgressState,
  lessonId: string,
  score: number,
  total: number,
): LearningProgressState {
  if (!VALID_LESSON_IDS.has(lessonId) || total <= 0) return state;
  const normalizedScore = Math.max(0, Math.min(total, Math.round(score)));
  const openedLessons = state.openedLessons.includes(lessonId)
    ? state.openedLessons
    : [...state.openedLessons, lessonId];
  const completedLessons = state.completedLessons.includes(lessonId)
    ? state.completedLessons
    : [...state.completedLessons, lessonId];
  const now = new Date().toISOString();
  const lesson = LESSON_MAP.get(lessonId);
  const allStepIds = lesson ? lesson.steps.map((s) => s.id) : [];

  return {
    ...state,
    openedLessons,
    completedLessons,
    lastVisitedLessonId: lessonId,
    completedSteps: {
      ...state.completedSteps,
      [lessonId]: allStepIds,
    },
    lessonCompletedAt: {
      ...state.lessonCompletedAt,
      [lessonId]: state.lessonCompletedAt[lessonId] || now,
    },
    quizScores: {
      ...state.quizScores,
      [lessonId]: {
        score: normalizedScore,
        total: Math.round(total),
        updatedAt: now,
      },
    },
    onboardingDismissed: true,
    lastActivityAt: now,
  };
}

export function dismissOnboardingState(state: LearningProgressState): LearningProgressState {
  if (state.onboardingDismissed) return state;
  return {
    ...state,
    onboardingDismissed: true,
  };
}

export function getLessonResumeInfo(
  state: LearningProgressState,
  lessonOrId: Lesson | string,
): LessonResumeInfo {
  const lesson =
    typeof lessonOrId === 'string' ? LESSON_MAP.get(lessonOrId) : lessonOrId;
  if (!lesson) {
    return {
      lessonId: typeof lessonOrId === 'string' ? lessonOrId : '',
      currentStepIndex: 0,
      displayStepNumber: 1,
      totalSteps: 1,
      completedStepCount: 0,
      isStarted: false,
      isCompleted: false,
      percentComplete: 0,
      resumeLabel: 'Modul starten',
      shortStatusLabel: 'Neu',
    };
  }

  const totalSteps = Math.max(1, lesson.steps.length);
  const isCompleted = state.completedLessons.includes(lesson.id);
  const rawStepIndex = state.lessonStepIndex[lesson.id] ?? 0;
  const currentStepIndex = clampStepIndex(lesson.id, rawStepIndex);
  const completedStepCount = isCompleted
    ? totalSteps
    : Math.min(totalSteps, (state.completedSteps[lesson.id] ?? []).length);
  const isOpened = state.openedLessons.includes(lesson.id);
  const isStarted = isCompleted || isOpened || currentStepIndex > 0 || completedStepCount > 0;
  const displayStepNumber = isCompleted ? totalSteps : Math.min(totalSteps, currentStepIndex + 1);
  const percentComplete = isCompleted
    ? 100
    : isStarted
      ? Math.max(8, Math.round((Math.max(completedStepCount, currentStepIndex) / totalSteps) * 100))
      : 0;

  let resumeLabel = `${lesson.shortTitle} starten · ${totalSteps} Schritte`;
  let shortStatusLabel = 'Bereit';

  if (isCompleted) {
    resumeLabel = `${lesson.shortTitle} wiederholen · Abgeschlossen`;
    shortStatusLabel = 'Abgeschlossen';
  } else if (isStarted) {
    resumeLabel = `${lesson.shortTitle} fortsetzen · Schritt ${displayStepNumber} von ${totalSteps}`;
    shortStatusLabel = `Schritt ${displayStepNumber} von ${totalSteps}`;
  }

  return {
    lessonId: lesson.id,
    currentStepIndex,
    displayStepNumber,
    totalSteps,
    completedStepCount,
    isStarted,
    isCompleted,
    percentComplete,
    resumeLabel,
    shortStatusLabel,
  };
}

export function getRecommendedLessonForState(state: LearningProgressState): Lesson {
  // 1. If the user was actively in an incomplete lesson, resume that exact lesson
  if (
    state.lastVisitedLessonId &&
    !state.completedLessons.includes(state.lastVisitedLessonId)
  ) {
    const activeLesson = LESSONS.find((l) => l.id === state.lastVisitedLessonId);
    if (activeLesson) return activeLesson;
  }

  // 2. Otherwise pick the first incomplete core lesson in order (01 -> 06)
  const nextCore = CORE_LESSONS.find((l) => !state.completedLessons.includes(l.id));
  if (nextCore) return nextCore;

  // 3. Otherwise pick any incomplete bonus lesson
  const nextAny = LESSONS.find((l) => !state.completedLessons.includes(l.id));
  return nextAny ?? CORE_LESSONS[0]!;
}
