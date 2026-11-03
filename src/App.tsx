/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DepotProvider } from '@/lib/depot-context';
import { getLessonByRoute } from '@/lib/lessons';
import { ProgressProvider } from '@/lib/progress-context';
import { AppLink, RouterProvider, useAppRouter } from '@/lib/router';
import { DepotPage } from '@/pages/DepotPage';
import { LernenPage } from '@/pages/LernenPage';
import { LessonDetailPage } from '@/pages/LessonDetailPage';
import { MehrPage } from '@/pages/MehrPage';
import { RechnerPage } from '@/pages/RechnerPage';
import { StartPage } from '@/pages/StartPage';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'GeldStart – Finanzbildung für junge Leute',
  '/lernen': 'Lernpfad & Module – GeldStart',
  '/depot': 'Virtuelles Übungsdepot – GeldStart',
  '/rechner': 'Zinseszins- & Budget-Rechner – GeldStart',
  '/mehr': 'Werkzeuge, Hinweise & Einstellungen – GeldStart',
};

function RouteContent() {
  const { path } = useAppRouter();
  const matchedLesson = getLessonByRoute(path);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (matchedLesson) {
      document.title = `${matchedLesson.title} – GeldStart`;
    } else if (ROUTE_TITLES[path]) {
      document.title = ROUTE_TITLES[path]!;
    } else {
      document.title = 'Seite nicht gefunden – GeldStart';
    }
  }, [path, matchedLesson]);

  if (path === '/') {
    return (
      <ErrorBoundary sectionName="Start">
        <StartPage />
      </ErrorBoundary>
    );
  }
  if (path === '/lernen') {
    return (
      <ErrorBoundary sectionName="Lernpfad">
        <LernenPage />
      </ErrorBoundary>
    );
  }
  if (path === '/depot') {
    return (
      <ErrorBoundary sectionName="Übungsdepot">
        <DepotPage />
      </ErrorBoundary>
    );
  }
  if (path === '/rechner') {
    return (
      <ErrorBoundary sectionName="Rechner">
        <RechnerPage />
      </ErrorBoundary>
    );
  }
  if (path === '/mehr') {
    return (
      <ErrorBoundary sectionName="Mehr & Einstellungen">
        <MehrPage />
      </ErrorBoundary>
    );
  }
  if (matchedLesson) {
    return <LessonDetailPage lesson={matchedLesson} />;
  }

  return (
    <div className="surface-card mx-auto max-w-lg p-8 text-center space-y-4 my-8">
      <p className="font-mono text-sm font-bold text-muted-foreground">404</p>
      <h1 className="text-2xl font-extrabold">Diese Seite wurde nicht gefunden</h1>
      <p className="text-base text-muted-foreground">
        Der aufgerufene Pfad existiert nicht. Kehre zur Startübersicht, zum Übungsdepot oder direkt zum Lernpfad zurück.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <AppLink
          to="/"
          className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          Zur Startseite
        </AppLink>
        <AppLink
          to="/lernen"
          className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-border bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground"
        >
          Zum Lernpfad
        </AppLink>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ProgressProvider>
        <DepotProvider>
          <RouterProvider>
            <AppShell>
              <RouteContent />
            </AppShell>
          </RouterProvider>
        </DepotProvider>
      </ProgressProvider>
    </ErrorBoundary>
  );
}
