/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CORE_LESSONS, LESSONS, type Lesson } from './lessons';
import {
  dismissOnboardingState,
  getLessonResumeInfo,
  getRecommendedLessonForState,
  type LearningProgressState,
  type LessonResumeInfo,
  loadProgress,
  markLessonCompletedState,
  markLessonOpenedState,
  recordQuizResultState,
  recordStepAnswerState,
  resetProgressStorage,
  saveLessonStepState,
  saveProgress,
} from './storage';

export interface ProgressStats {
  completedCoreCount: number;
  totalCoreCount: number;
  completedTotalCount: number;
  totalLessonsCount: number;
  percentCoreComplete: number;
  recommendedLesson: Lesson;
  recommendedResumeInfo: LessonResumeInfo;
  hasAnyActivity: boolean;
}

interface ProgressContextValue extends ProgressStats {
  state: LearningProgressState;
  markLessonOpened: (lessonId: string) => void;
  markLessonCompleted: (lessonId: string) => void;
  recordQuizResult: (lessonId: string, score: number, total: number) => void;
  saveLessonStep: (lessonId: string, stepIndex: number, completedStepId?: string) => void;
  recordStepAnswer: (
    lessonId: string,
    stepId: string,
    selectedIndex: number,
    isCorrect: boolean,
  ) => void;
  dismissOnboarding: () => void;
  getLessonProgress: (lessonOrId: Lesson | string) => LessonResumeInfo;
  resetAllProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function computeProgressStats(state: LearningProgressState): ProgressStats {
  const completedSet = new Set(state.completedLessons);
  const completedCoreCount = CORE_LESSONS.filter((lesson) => completedSet.has(lesson.id)).length;
  const totalCoreCount = CORE_LESSONS.length;
  const completedTotalCount = LESSONS.filter((lesson) => completedSet.has(lesson.id)).length;
  const totalLessonsCount = LESSONS.length;
  const percentCoreComplete = Math.round((completedCoreCount / totalCoreCount) * 100);
  const recommendedLesson = getRecommendedLessonForState(state);
  const recommendedResumeInfo = getLessonResumeInfo(state, recommendedLesson);
  const hasAnyActivity =
    state.openedLessons.length > 0 ||
    state.completedLessons.length > 0 ||
    Object.keys(state.lessonStepIndex).length > 0;

  return {
    completedCoreCount,
    totalCoreCount,
    completedTotalCount,
    totalLessonsCount,
    percentCoreComplete,
    recommendedLesson,
    recommendedResumeInfo,
    hasAnyActivity,
  };
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LearningProgressState>(() => loadProgress());

  const markLessonOpened = useCallback((lessonId: string) => {
    setState((prev) => {
      const next = markLessonOpenedState(prev, lessonId);
      saveProgress(next);
      return next;
    });
  }, []);

  const markLessonCompleted = useCallback((lessonId: string) => {
    setState((prev) => {
      const next = markLessonCompletedState(prev, lessonId);
      saveProgress(next);
      return next;
    });
  }, []);

  const recordQuizResult = useCallback((lessonId: string, score: number, total: number) => {
    setState((prev) => {
      const next = recordQuizResultState(prev, lessonId, score, total);
      saveProgress(next);
      return next;
    });
  }, []);

  const saveLessonStep = useCallback(
    (lessonId: string, stepIndex: number, completedStepId?: string) => {
      setState((prev) => {
        const next = saveLessonStepState(prev, lessonId, stepIndex, completedStepId);
        saveProgress(next);
        return next;
      });
    },
    [],
  );

  const recordStepAnswer = useCallback(
    (lessonId: string, stepId: string, selectedIndex: number, isCorrect: boolean) => {
      setState((prev) => {
        const next = recordStepAnswerState(prev, lessonId, stepId, selectedIndex, isCorrect);
        saveProgress(next);
        return next;
      });
    },
    [],
  );

  const dismissOnboarding = useCallback(() => {
    setState((prev) => {
      const next = dismissOnboardingState(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  const getLessonProgress = useCallback(
    (lessonOrId: Lesson | string) => getLessonResumeInfo(state, lessonOrId),
    [state],
  );

  const resetAllProgress = useCallback(() => {
    const fresh = resetProgressStorage();
    setState(fresh);
  }, []);

  const stats = useMemo(() => computeProgressStats(state), [state]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      ...stats,
      markLessonOpened,
      markLessonCompleted,
      recordQuizResult,
      saveLessonStep,
      recordStepAnswer,
      dismissOnboarding,
      getLessonProgress,
      resetAllProgress,
    }),
    [
      state,
      stats,
      markLessonOpened,
      markLessonCompleted,
      recordQuizResult,
      saveLessonStep,
      recordStepAnswer,
      dismissOnboarding,
      getLessonProgress,
      resetAllProgress,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return ctx;
}
