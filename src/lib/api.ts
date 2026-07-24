import type {
    TAnswer,
    TAssessmentConfig,
    TAssessmentListItem,
    TQuestion,
    TSubmissionResult,
    TSubmissionReview,
    TSubmissionSummary,
    TUser,
} from '../types/domain';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/** Shape of the error bodies returned by the backend. */
type TErrorBody = {
    detail?: string;
    message?: string;
};

export type TLoginResponse = {
    token: string;
    user: TUser;
};

export type TStartAssessmentResponse = {
    submission_id: string;
};

/** Mirrors the backend `AssessmentQuestionsResponse`. */
export type TAssessmentQuestionsResponse = {
    assessmentId: string;
    title: string;
    availableFrom: string | null;
    availableUntil: string | null;
    timerMinutes: number;
    totalQuestions: number;
    questions: TQuestion[];
};

export type TSavedAnswer = {
    question_snapshot_id: string;
    type: string;
    text: string;
    motivation: string;
    selected_option_ids: string[];
    flagged: boolean;
};

export type TChapter = {
    id: string;
    label: string;
    question_counts: { base: number; intermediate: number; advanced: number };
};

export type TTopic = {
    id: string;
    abbreviation: string;
    title: string;
    description: string;
    enabled: boolean;
    chapters: TChapter[];
    total_chapters: number;
    total_questions: number;
};

export type TTopicChapters = {
    chapters: TChapter[];
    total_chapters: number;
};

export type TTrainingRequest = {
    topic_id: string;
    chapter_ids: string[];
    difficulty: string;
    question_count: number;
    timer_enabled: boolean;
};

export type TTrainingResponse = {
    assessment_snapshot_id: string;
};

export type TNotificationPreference = {
    type: string;
    enabled: boolean;
};

export type TNotification = {
    id: string;
    title: string;
    message: string;
    created_at: string;
};

export type TSubjectMastery = {
    id: string;
    label: string;
    mastery: number;
};

export type TTopicMastery = {
    id: string;
    title: string;
    mastery: number;
    children: TTopicMastery[];
    subjects: TSubjectMastery[];
};

function authHeaders(token: string): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}

/** Reads the error body of a failed response and throws with the best message available. */
async function throwFromResponse(res: Response, fallback: string): Promise<never> {
    const body: TErrorBody = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.message || fallback);
}

export async function login(username: string, password: string): Promise<TLoginResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            signal: controller.signal,
        });
        if (!res.ok) {
            const body: TErrorBody = await res.json().catch(() => ({}));
            throw new Error(body.detail || `Login failed: ${res.status}`);
        }
        return res.json();
    } catch (err) {
        // `fetch` aborts with a DOMException, which does not reliably satisfy
        // `instanceof Error` across runtimes — match on the name instead.
        if ((err as { name?: string } | null)?.name === 'AbortError') {
            throw new Error('Il server non risponde. Riprova tra qualche secondo.');
        }
        throw err;
    } finally {
        clearTimeout(timeout);
    }
}

export async function fetchAvailableAssessments(token: string): Promise<TAssessmentListItem[]> {
    const res = await fetch(`${API_BASE}/api/assessments`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        await throwFromResponse(res, `Failed to fetch assessments: ${res.status}`);
    }
    const data: { assessments: TAssessmentListItem[] } = await res.json();
    return data.assessments;
}

export async function fetchAssessmentConfig(assessmentId: string, token: string): Promise<TAssessmentConfig> {
    const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/config`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        await throwFromResponse(res, `Failed to fetch assessment config: ${res.status}`);
    }
    return res.json();
}

export async function fetchAssessmentQuestions(
    assessmentId: string,
    token: string,
): Promise<TAssessmentQuestionsResponse> {
    const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/questions`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        await throwFromResponse(res, `Failed to fetch assessment questions: ${res.status}`);
    }
    return res.json();
}

export async function startAssessment(assessmentId: string, token: string): Promise<TStartAssessmentResponse> {
    const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/start`, {
        method: 'POST',
        headers: authHeaders(token),
    });
    if (!res.ok) {
        await throwFromResponse(res, `Failed to start assessment: ${res.status}`);
    }
    return res.json();
}

export async function fetchSubmissionHistory(token: string): Promise<TSubmissionSummary[]> {
    const res = await fetch(`${API_BASE}/api/submissions/mine`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        await throwFromResponse(res, `Failed to fetch submission history: ${res.status}`);
    }
    const data: { submissions: TSubmissionSummary[] } = await res.json();
    return data.submissions;
}

export async function submitAssessment(
    submissionId: string,
    questions: TQuestion[],
    answers: Record<string, TAnswer | undefined>,
    token: string,
): Promise<TSubmissionResult> {
    const mappedAnswers = questions.map(q => {
        const answer = answers[q.id] || {};
        return {
            question_id: q.id,
            type: q.type,
            text: answer.text,
            motivation: answer.motivation,
            selected_option_ids: answer.selectedIds || [],
        };
    });

    const res = await fetch(`${API_BASE}/api/submissions/${submissionId}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ answers: mappedAnswers }),
    });
    if (!res.ok) {
        await throwFromResponse(res, `Failed to submit assessment: ${res.status}`);
    }
    return res.json();
}

export function saveAnswer(
    submissionId: string,
    questionSnapshotId: string,
    answer: TAnswer & { type?: string; flagged?: boolean },
    token: string,
): void {
    fetch(`${API_BASE}/api/submissions/${submissionId}/answers/${questionSnapshotId}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({
            type: answer.type || 'multiple',
            text: answer.text || '',
            motivation: answer.motivation || '',
            selected_option_ids: answer.selectedIds || [],
            flagged: answer.flagged ?? false,
        }),
    }).catch(() => {
        // Fire-and-forget: silently ignore errors
    });
}

export async function fetchSavedAnswers(submissionId: string, token: string): Promise<TSavedAnswer[]> {
    const res = await fetch(`${API_BASE}/api/submissions/${submissionId}/answers`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        await throwFromResponse(res, `Failed to fetch saved answers: ${res.status}`);
    }
    return res.json();
}

export async function fetchUserProfile(token: string): Promise<TUser> {
    const res = await fetch(`${API_BASE}/api/users/me`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        await throwFromResponse(res, `Failed to fetch profile: ${res.status}`);
    }
    return res.json();
}

export async function changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
    token: string,
): Promise<void> {
    const res = await fetch(`${API_BASE}/api/users/me/password`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
        }),
    });
    if (!res.ok) {
        await throwFromResponse(res, `Failed to change password: ${res.status}`);
    }
}

export async function fetchTopics(token: string): Promise<TTopic[]> {
    const res = await fetch(`${API_BASE}/api/topics`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        await throwFromResponse(res, 'Failed to fetch topics');
    }
    const data: { topics: TTopic[] } = await res.json();
    return data.topics;
}

export async function fetchTopicChapters(topicId: string, token: string): Promise<TTopicChapters> {
    const res = await fetch(`${API_BASE}/api/topics/${topicId}/chapters`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        await throwFromResponse(res, 'Failed to fetch topic chapters');
    }
    return res.json();
}

export async function startTrainingSession(request: TTrainingRequest, token: string): Promise<TTrainingResponse> {
    const res = await fetch(`${API_BASE}/api/training/start`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(request),
    });
    if (!res.ok) {
        await throwFromResponse(res, 'Failed to start training session');
    }
    return res.json();
}

export async function fetchNotificationPreferences(token: string): Promise<TNotificationPreference[]> {
    const res = await fetch(`${API_BASE}/api/users/me/notifications`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        await throwFromResponse(res, 'Failed to fetch notification preferences');
    }
    return res.json();
}

export async function updateNotificationPreferences(
    preferences: TNotificationPreference[],
    token: string,
): Promise<TNotificationPreference[]> {
    const res = await fetch(`${API_BASE}/api/users/me/notifications`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ preferences }),
    });
    if (!res.ok) {
        await throwFromResponse(res, 'Failed to update notification preferences');
    }
    return res.json();
}

export async function fetchSubmissionFeedback(submissionId: string, token: string): Promise<TSubmissionResult> {
    const res = await fetch(`${API_BASE}/api/submissions/${submissionId}`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        await throwFromResponse(res, 'Failed to fetch submission feedback');
    }
    return res.json();
}

export async function updateProfile(email: string, token: string): Promise<TUser> {
    const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ email }),
    });
    if (!res.ok) {
        await throwFromResponse(res, `Failed to update profile: ${res.status}`);
    }
    return res.json();
}

/** Persists the user's interface language. The PUT is field-wise, so email is untouched. */
export async function updateLanguage(language: 'it' | 'en', token: string): Promise<TUser> {
    const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ language }),
    });
    if (!res.ok) {
        await throwFromResponse(res, `Failed to update language: ${res.status}`);
    }
    return res.json();
}

export async function fetchNotificationCount(token: string): Promise<{ count: number }> {
    const res = await fetch(`${API_BASE}/api/notifications/count`, {
        headers: authHeaders(token),
    });
    if (!res.ok) return { count: 0 };
    return res.json();
}

export async function fetchUnreadNotifications(token: string): Promise<TNotification[]> {
    const res = await fetch(`${API_BASE}/api/notifications/unread`, {
        headers: authHeaders(token),
    });
    if (!res.ok) return [];
    return res.json();
}

export async function markNotificationAsRead(id: string, token: string): Promise<void> {
    await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: authHeaders(token),
    });
}

export async function markAllNotificationsAsRead(token: string): Promise<void> {
    await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: 'PUT',
        headers: authHeaders(token),
    });
}

export async function fetchSubmissionReview(submissionId: string, token: string): Promise<TSubmissionReview> {
    const res = await fetch(`${API_BASE}/api/submissions/${submissionId}/review`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        await throwFromResponse(res, 'Failed to fetch submission review');
    }
    return res.json();
}

export async function fetchCompetencies(token: string): Promise<{ topics: TTopicMastery[] }> {
    const res = await fetch(`${API_BASE}/api/competencies`, {
        headers: authHeaders(token),
    });
    if (!res.ok) return { topics: [] };
    return res.json();
}
