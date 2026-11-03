/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  sectionName?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message =
      error instanceof Error ? error.message : 'Unerwarteter Darstellungsfehler';
    return {
      hasError: true,
      errorMessage: message,
    };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo): void {
    console.error('[GeldStart ErrorBoundary]', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
    if (typeof window !== 'undefined') {
      const base = import.meta.env.BASE_URL || '/';
      window.location.assign(base);
    }
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        className="mx-auto my-8 max-w-xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5"
      >
        <div className="flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-warning/20 text-warning-foreground">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {this.props.sectionName
                ? `Bereich: ${this.props.sectionName}`
                : 'Sicherheits-Hinweis · GS-UI-01'}
            </p>
            <h2 className="text-xl font-extrabold text-foreground">
              Dieser Bereich konnte gerade nicht geladen werden
            </h2>
          </div>
        </div>

        <p className="text-base leading-relaxed text-muted-foreground">
          Deine gespeicherten Lernfortschritte und dein virtuelles Übungsdepot sind weiterhin lokal
          gesichert. Du kannst die Ansicht neu laden oder direkt zur Startseite zurückkehren.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4" />
            Erneut versuchen
          </button>
          <button
            type="button"
            onClick={this.handleGoHome}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-border bg-secondary px-5 py-3 text-base font-bold text-secondary-foreground transition-colors hover:bg-muted"
          >
            <Home className="h-4 w-4" />
            Zur Startseite
          </button>
        </div>
      </div>
    );
  }
}
