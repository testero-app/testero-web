// ─── Domain types ─────────────────────────────────────────────────────────────
// Shapes exchanged with the backend, kept out of the context module so that
// `lib/api` can depend on them without importing from a React component.
//
// These are aliases onto `api-generated.ts`, which is generated from the backend's
// OpenAPI spec (`npm run sync:openapi && npm run generate:api-types`). Do not restate
// a backend field here: a DTO change must reach this file through regeneration, not
// through someone remembering to mirror it — see #134.

import type { components } from './api-generated';

export type ApiSchemas = components['schemas'];

export type TOption = ApiSchemas['OptionDto'];

export type TQuestion = ApiSchemas['QuestionDto'];

export type TScoringRules = ApiSchemas['ScoringRules'];

export type TAssessmentConfig = ApiSchemas['AssessmentConfigResponse'];

export type TAssessmentListItem = ApiSchemas['AssessmentListItem'];

/**
 * The logged-in user. Login returns the core identity; `GET /users/me` adds the
 * profile fields, so those are optional on the shape held in context.
 */
export type TUser = ApiSchemas['UserInfo'] & Partial<ApiSchemas['UserProfileResponse']>;

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

export type TAnswerResult = ApiSchemas['AnswerResult'];

export type TSubjectScore = ApiSchemas['SubjectScore'];

export type TSubmissionResult = ApiSchemas['SubmissionFeedbackResponse'];

export type TReviewOption = ApiSchemas['ReviewOption'];

export type TReviewQuestion = ApiSchemas['ReviewQuestion'];

export type TSubmissionReview = ApiSchemas['SubmissionReviewResponse'];

/** An item of the submission history list. */
export type TSubmissionSummary = ApiSchemas['SubmissionSummary'];
