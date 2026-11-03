/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BookOpen,
  Calculator,
  Compass,
  LineChart,
  MoreHorizontal,
} from 'lucide-react';
import { getLessonByRoute } from '@/lib/lessons';
import { useProgress } from '@/lib/progress-context';
import { AppLink, useAppRouter } from '@/lib/router';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (path: string) => boolean;
}

const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    label: 'Start',
    to: '/',
    icon: Compass,
    match: (path) => path === '/',
  },
  {
    label: 'Lernen',
    to: '/lernen',
    icon: BookOpen,
    match: (path) => path === '/lernen' || Boolean(getLessonByRoute(path)),
  },
  {
    label: 'Depot',
    to: '/depot',
    icon: LineChart,
    match: (path) => path === '/depot',
  },
  {
    label: 'Mehr',
    to: '/mehr',
    icon: MoreHorizontal,
    match: (path) => path === '/mehr' || path === '/rechner',
  },
];

const DESKTOP_NAV_ITEMS: NavItem[] = [
  {
    label: 'Start',
    to: '/',
    icon: Compass,
    match: (path) => path === '/',
  },
  {
    label: 'Lernen',
    to: '/lernen',
    icon: BookOpen,
    match: (path) => path === '/lernen' || Boolean(getLessonByRoute(path)),
  },
  {
    label: 'Depot',
    to: '/depot',
    icon: LineChart,
    match: (path) => path === '/depot',
  },
  {
    label: 'Rechner',
    to: '/rechner',
    icon: Calculator,
    match: (path) => path === '/rechner',
  },
  {
    label: 'Mehr',
    to: '/mehr',
    icon: MoreHorizontal,
    match: (path) => path === '/mehr',
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { path } = useAppRouter();
  const { recommendedLesson, recommendedResumeInfo } = useProgress();
  const isLessonView = Boolean(getLessonByRoute(path));

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      {/* Clean Top Bar: Wordmark, primary nav links, 1 primary action */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <AppLink
            to="/"
            className="group flex items-center gap-2.5 focus:outline-none"
            aria-label="GeldStart Startseite"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-extrabold text-lg shadow-xs">
              G
            </span>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
                GeldStart
              </span>
              <span
                aria-hidden="true"
                className="hidden sm:inline-flex items-center gap-0.5 text-primary/70 font-mono text-xs"
              >
                ●━●━○
              </span>
            </div>
          </AppLink>

          {/* Desktop Navigation */}
          <nav
            aria-label="Hauptnavigation"
            className="hidden lg:flex items-center gap-1 rounded-2xl border border-border bg-secondary/60 p-1"
          >
            {DESKTOP_NAV_ITEMS.map((item) => {
              const active = item.match(path);
              const Icon = item.icon;
              return (
                <AppLink
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition-all ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-secondary-foreground hover:bg-card hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </AppLink>
              );
            })}
          </nav>

          {/* Single Primary Header Action */}
          <div className="flex items-center gap-2">
            {!isLessonView ? (
              <AppLink
                to={recommendedLesson.route}
                data-testid="header-continue-learning-btn"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs sm:text-sm font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>
                  {recommendedResumeInfo.isStarted && !recommendedResumeInfo.isCompleted
                    ? `${recommendedLesson.shortTitle} · Schritt ${recommendedResumeInfo.displayStepNumber}`
                    : `Weiter: ${recommendedLesson.shortTitle}`}
                </span>
              </AppLink>
            ) : (
              <AppLink
                to="/rechner"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs sm:text-sm font-bold text-foreground transition-colors hover:bg-secondary"
              >
                <Calculator className="h-3.5 w-3.5 text-primary" />
                <span>Rechner</span>
              </AppLink>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-5 pb-28 sm:px-6 lg:pb-12">
        {children}
      </main>

      {/* Compact Single-Line Educational Disclaimer Footer */}
      <footer className="border-t border-border bg-secondary/40 pb-24 lg:pb-6">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-2 px-4 py-4 sm:px-6 text-xs text-muted-foreground">
          <p className="font-medium text-center sm:text-left">
            Nur zu Bildungszwecken – keine Anlage-, Steuer- oder Rechtsberatung.
          </p>
          <div className="flex items-center gap-4">
            <AppLink to="/lernen" className="hover:text-foreground font-semibold">
              Lernpfad
            </AppLink>
            <AppLink to="/rechner" className="hover:text-foreground font-semibold">
              Rechner
            </AppLink>
            <AppLink to="/depot" className="hover:text-foreground font-semibold">
              Übungsdepot
            </AppLink>
            <AppLink to="/mehr" className="hover:text-foreground font-semibold">
              Hinweise & Einstellungen
            </AppLink>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (4 destinations: Start, Lernen, Depot, Mehr) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card/95 backdrop-blur-md lg:hidden pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 px-2 py-1.5">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const active = item.match(path);
            const Icon = item.icon;
            return (
              <AppLink
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-xs font-bold transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    active ? 'text-primary stroke-[2.4]' : 'stroke-[2]'
                  }`}
                />
                <span>{item.label}</span>
              </AppLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
