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

export async function fetchAvailableTests(token) {
    const res = await fetch(`${API_BASE}/api/tests`, {
        headers: authHeaders(token),
    });
    if (!res.ok) throw new Error(`Failed to fetch tests: ${res.status}`);
    const data = await res.json();
    return data.tests;
}

export async function fetchTestConfig(testId, token) {
    const res = await fetch(`${API_BASE}/api/tests/${testId}/config`, {
        headers: authHeaders(token),
    });
    if (!res.ok) throw new Error(`Failed to fetch test config: ${res.status}`);
    return res.json();
}

export async function fetchTestQuestions(testId, token) {
    const res = await fetch(`${API_BASE}/api/tests/${testId}/questions`, {
        headers: authHeaders(token),
    });
    if (!res.ok) throw new Error(`Failed to fetch test questions: ${res.status}`);
    return res.json();
}

export async function recordTestStart(testId, token) {
    await fetch(`${API_BASE}/api/tests/${testId}/start`, {
        method: 'POST',
        headers: authHeaders(token),
    });
}

export async function createSubmission(testId, questions, answers, token) {
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

    const res = await fetch(`${API_BASE}/api/submissions`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ test_id: testId, answers: mappedAnswers }),
    });
    if (!res.ok) throw new Error(`Failed to create submission: ${res.status}`);
    return res.json();
}
