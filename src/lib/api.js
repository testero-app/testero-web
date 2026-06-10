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
