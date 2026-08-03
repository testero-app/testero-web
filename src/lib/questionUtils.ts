import { TQuestion } from '../context/AssessmentContext';

// ── Constants ────────────────────────────────────────────────────────────────

/** Number of options that indicates the fallback suffix is '_e' (5 options → A-E). */
export const FIVE_OPTION_COUNT = 5;

/** Suffix for the fallback ("Nessuna") option when there are 5 options. */
export const FALLBACK_SUFFIX_E = '_e';

/** Suffix for the fallback ("Nessuna") option when there are 4 options. */
export const FALLBACK_SUFFIX_D = '_d';

/** Default timer duration in minutes when not specified by the assessment. */
export const DEFAULT_TIMER_MINUTES = 60;

// ── Utility functions ────────────────────────────────────────────────────────

/**
 * Checks whether the only selected option is the fallback ("Nessuna delle precedenti").
 * Uses the option count to determine the expected fallback suffix.
 */
export function isOnlyFallbackSelected(question: TQuestion, selectedIds: string[]): boolean {
    if (!question || selectedIds.length !== 1) return false;

    const suffix = (question.options?.length ?? 0) === FIVE_OPTION_COUNT
        ? FALLBACK_SUFFIX_E
        : FALLBACK_SUFFIX_D;

    return selectedIds[0].endsWith(suffix);
}

/**
 * Determines if a question has been answered.
 * - Open questions: requires non-empty text.
 * - MC questions: requires at least one selected option.
 *   If only the fallback option is selected, requires non-empty motivation.
 */
export function isQuestionAnswered(
    // `options` is null for open questions, which is how the backend sends them.
    question: { type: string; options?: unknown[] | null },
    answer: { selectedIds?: string[]; text?: string; motivation?: string } | undefined,
): boolean {
    if (question.type === 'open') {
        return (answer?.text?.trim().length ?? 0) > 0;
    }
    const selectedIds = answer?.selectedIds ?? [];
    if (selectedIds.length === 0) return false;

    const suffix = (question.options?.length ?? 0) === FIVE_OPTION_COUNT
        ? FALLBACK_SUFFIX_E
        : FALLBACK_SUFFIX_D;
    const onlyFallback = selectedIds.length === 1 && selectedIds[0].endsWith(suffix);

    if (onlyFallback) {
        return (answer?.motivation ?? '').trim().length > 0;
    }
    return true;
}
