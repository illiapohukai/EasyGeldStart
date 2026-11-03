/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check } from 'lucide-react';

export type PathNodeState = 'completed' | 'current' | 'upcoming';

interface LearningPathMotifProps {
  nodes: PathNodeState[];
  labels?: string[];
  activeIndex?: number;
  onSelectNode?: (index: number) => void;
  compact?: boolean;
  ariaLabel?: string;
}

/**
 * Signature GeldStart visual motif:
 * Connected step nodes (●━━━━●━━━━○) used across Start, Lernen, LessonPlayer, and Completion screens.
 */
export function LearningPathMotif({
  nodes,
  labels,
  onSelectNode,
  compact = false,
  ariaLabel = 'Lernpfad-Fortschritt',
}: LearningPathMotifProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex w-full min-w-0 items-center justify-between gap-0.5 sm:gap-1 overflow-hidden"
    >
      {nodes.map((state, index) => {
        const isLast = index === nodes.length - 1;
        const isConnectedFilled =
          state === 'completed' &&
          (nodes[index + 1] === 'completed' || nodes[index + 1] === 'current');

        const nodeContent = (
          <span
            className={`relative flex shrink-0 items-center justify-center rounded-full font-mono transition-all ${
              compact
                ? 'h-5 w-5 text-[11px]'
                : 'h-6 w-6 sm:h-7 sm:w-7 text-xs font-bold'
            } ${
              state === 'completed'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : state === 'current'
                  ? 'border-2 border-primary bg-accent text-accent-foreground ring-2 sm:ring-4 ring-accent/35 font-extrabold'
                  : 'border-2 border-border bg-card text-muted-foreground'
            }`}
          >
            {state === 'completed' ? (
              <Check className={compact ? 'h-3 w-3 stroke-[3]' : 'h-3.5 w-3.5 stroke-[3]'} />
            ) : (
              <span>{index + 1}</span>
            )}
          </span>
        );

        return (
          <div
            key={index}
            className={`flex min-w-0 items-center ${isLast ? 'shrink-0' : 'flex-1'}`}
          >
            {onSelectNode ? (
              <button
                type="button"
                onClick={() => onSelectNode(index)}
                title={labels?.[index] ?? `Schritt ${index + 1}`}
                aria-label={labels?.[index] ?? `Schritt ${index + 1}`}
                className="group inline-flex shrink-0 items-center focus:outline-none"
              >
                {nodeContent}
              </button>
            ) : (
              <div className="shrink-0" title={labels?.[index] ?? `Schritt ${index + 1}`}>
                {nodeContent}
              </div>
            )}

            {!isLast && (
              <div
                aria-hidden="true"
                className={`mx-0.5 sm:mx-1.5 h-[3px] min-w-[4px] flex-1 rounded-full transition-colors ${
                  isConnectedFilled ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
