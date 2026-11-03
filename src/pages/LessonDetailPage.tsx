/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LessonPlayer } from '@/components/LessonPlayer';
import type { Lesson } from '@/lib/lessons';

export function LessonDetailPage({ lesson }: { lesson: Lesson }) {
  return (
    <ErrorBoundary sectionName={`Lernmodul: ${lesson.shortTitle}`}>
      <LessonPlayer lesson={lesson} />
    </ErrorBoundary>
  );
}
