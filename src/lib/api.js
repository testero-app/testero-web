const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function authHeaders(token) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}

export async function login(username, password) {
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
            const body = await res.json().catch(() => ({}));
            throw new Error(body.detail || `Login failed: ${res.status}`);
        }
        return res.json();
    } catch (err) {
        if (err.name === 'AbortError') {
            throw new Error('Il server non risponde. Riprova tra qualche secondo.');
        }
        throw err;
    } finally {
        clearTimeout(timeout);
    }
}

export async function fetchAvailableAssessments(token) {
    const res = await fetch(`${API_BASE}/api/assessments`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to fetch assessments: ${res.status}`);
    }
    const data = await res.json();
    return data.assessments;
}

export async function fetchAssessmentConfig(assessmentId, token) {
    const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/config`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to fetch assessment config: ${res.status}`);
    }
    return res.json();
}

export async function fetchAssessmentQuestions(assessmentId, token) {
    const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/questions`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to fetch assessment questions: ${res.status}`);
    }
    return res.json();
}

export async function startAssessment(assessmentId, token) {
    const res = await fetch(`${API_BASE}/api/assessments/${assessmentId}/start`, {
        method: 'POST',
        headers: authHeaders(token),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to start assessment: ${res.status}`);
    }
    return res.json();
}

export async function fetchSubmissionHistory(token) {
    const res = await fetch(`${API_BASE}/api/submissions/mine`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to fetch submission history: ${res.status}`);
    }
    const data = await res.json();
    return data.submissions;
}

export async function submitAssessment(submissionId, questions, answers, token) {
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
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to submit assessment: ${res.status}`);
    }
    return res.json();
}

export function saveAnswer(submissionId, questionSnapshotId, answer, token) {
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

export async function fetchSavedAnswers(submissionId, token) {
    const res = await fetch(`${API_BASE}/api/submissions/${submissionId}/answers`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to fetch saved answers: ${res.status}`);
    }
    return res.json();
}

export async function fetchUserProfile(token) {
    const res = await fetch(`${API_BASE}/api/users/me`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to fetch profile: ${res.status}`);
    }
    return res.json();
}

export async function changePassword(currentPassword, newPassword, confirmPassword, token) {
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
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to change password: ${res.status}`);
    }
}

export async function fetchTopics(token) {
    const res = await fetch(`${API_BASE}/api/topics`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch topics');
    }
    const data = await res.json();
    return data.topics;
}

export async function fetchTopicChapters(topicId, token) {
    const res = await fetch(`${API_BASE}/api/topics/${topicId}/chapters`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch topic chapters');
    }
    return res.json();
}

export async function startTrainingSession(request, token) {
    const res = await fetch(`${API_BASE}/api/training/start`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(request),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.message || 'Failed to start training session');
    }
    return res.json();
}

export async function fetchNotificationPreferences(token) {
    const res = await fetch(`${API_BASE}/api/users/me/notifications`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch notification preferences');
    }
    return res.json();
}

export async function updateNotificationPreferences(preferences, token) {
    const res = await fetch(`${API_BASE}/api/users/me/notifications`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ preferences }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update notification preferences');
    }
    return res.json();
}

export async function fetchSubmissionFeedback(submissionId, token) {
    const res = await fetch(`${API_BASE}/api/submissions/${submissionId}`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch submission feedback');
    }
    return res.json();
}

export async function fetchSubmissionReview(submissionId, token) {
    const res = await fetch(`${API_BASE}/api/submissions/${submissionId}/review`, {
        headers: authHeaders(token),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch submission review');
    }
    return res.json();
}
