// ─── Domain types ─────────────────────────────────────────────────────────────
// Shared shapes exchanged with the backend. Kept out of the context module so
// that `lib/api` can depend on them without importing from a React component.

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
};

export type TUser = {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    class_name: string;
    email?: string;
};

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
};

export type TSubmissionResult = {
    id: string;
    user_id: string;
    assessment_id: string;
    started_at: string | null;
    submitted_at: string;
    answers: TAnswerResult[];
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

export type TSubmissionSummary = {
    id: string;
    assessment_id: string;
    assessment_title: string;
    started_at: string | null;
    submitted_at: string;
    score: number | null;
    total_questions: number;
    correct_count: number;
    wrong_count: number;
    unanswered_count: number;
};
