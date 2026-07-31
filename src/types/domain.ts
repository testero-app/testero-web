// ─── Domain types ─────────────────────────────────────────────────────────────
// Shapes exchanged with the backend, kept out of the context module so that
// `lib/api` can depend on them without importing from a React component.
//
// These are still hand-written. Every field below was verified against the
// backend OpenAPI spec (`/api/v3/api-docs`), but nothing keeps them in sync
// automatically — see #134, which is blocked on the spec emitting `required`
// metadata for response DTOs.

export type TOption = {
    id: string;
    text: string;
    isFallback?: boolean;
};

export type TQuestion = {
    id: string;
    type: string;
    text: string;
    code?: string;
    options?: TOption[];
    points?: number;
    subjects?: { id: string; label: string }[];
};

export type TScoringRules = {
    pointsPerCorrect: number;
    pointsPerWrong: number;
    pointsPerUnanswered: number;
};

export type TAssessmentConfig = {
    assessmentId: string;
    title: string;
    availableFrom: string | null;
    availableUntil: string | null;
    timerMinutes: number;
    questionsPerAssessment: number;
    scoring: TScoringRules;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    maxAttempts: number | null;
    subjects?: { id: string; label: string }[];
};

export type TAssessmentListItem = {
    id: string;
    title: string;
    availableFrom: string | null;
    availableUntil: string | null;
    timerMinutes: number;
    questionsPerAssessment: number;
    difficulty?: string;
    type?: string;
    status?: string;
    score?: number | null;
    subjects?: { id: string; label: string }[];
};

export type TUser = {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    class_name: string;
    email?: string;
    role?: string;
    language?: string;
};

/**
 * Frontend-only shape: how an in-progress answer is held in component state
 * before being mapped onto the backend's answer payload. The backend has no
 * equivalent DTO.
 */
export type TAnswer = {
    selectedIds?: string[];
    motivation?: string;
    text?: string;
};

export type TAnswerResult = {
    question_snapshot_id: string;
    type: string;
    is_correct: boolean | null;
    correct_option_snapshot_ids: string[];
    points_awarded: number | null;
};

/** Mirrors the backend `SubmissionFeedbackResponse.SubjectScore`. */
export type TSubjectScore = {
    subject_id: string;
    label: string;
    points_earned: number;
    points_available: number;
};

/** Mirrors the backend `SubmissionFeedbackResponse`. */
export type TSubmissionResult = {
    id: string;
    user_id: string;
    assessment_snapshot_id: string;
    started_at: string | null;
    submitted_at: string;
    score: number | null;
    max_score?: number | null;
    passed?: boolean | null;
    passing_score?: number | null;
    answers: TAnswerResult[];
    subject_scores?: TSubjectScore[];
};

export type TReviewOption = {
    id: string;
    text: string;
    position: number;
    is_correct: boolean;
};

export type TReviewQuestion = {
    id: string;
    type: string;
    text: string;
    code: string | null;
    explanation: string | null;
    position: number;
    is_correct: boolean | null;
    selected_option_ids: string[];
    answer_text: string;
    motivation: string;
    options: TReviewOption[];
    subjects?: { id: string; label: string }[];
};

export type TSubmissionReview = {
    id: string;
    assessment_title: string;
    started_at: string | null;
    submitted_at: string;
    score: number | null;
    questions: TReviewQuestion[];
};

/** Mirrors the backend `SubmissionSummary` (an item of the history list). */
export type TSubmissionSummary = {
    id: string;
    assessment_snapshot_id: string;
    assessment_title: string;
    type?: string;
    started_at: string | null;
    submitted_at: string;
    score: number | null;
    max_score?: number | null;
    passed?: boolean | null;
    total_questions: number;
    correct_count: number;
    wrong_count: number;
    unanswered_count: number;
    subject_scores?: TSubjectScore[];
};
