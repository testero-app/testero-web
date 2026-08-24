import { createContext, useCallback, useContext, useReducer } from "react";
import { login as apiLogin, fetchAvailableAssessments, fetchAssessmentConfig, fetchAssessmentQuestions, fetchSubmissionQuestions, startAssessment, submitAssessment, fetchSubmissionHistory, saveAnswer } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

// Domain shapes live in `types/domain` so that `lib/api` can use them without
// importing from a React component. Re-exported here to keep existing imports
// (`from "../context/AssessmentContext"`) working.
import type {
    TOption,
    TQuestion,
    TAssessmentConfig,
    TAssessmentListItem,
    TUser,
    TAnswer,
    TSubmissionResult,
    TSubmissionSummary,
} from "../types/domain";

export type {
    TOption,
    TQuestion,
    TScoringRules,
    TAssessmentConfig,
    TAssessmentListItem,
    TUser,
    TAnswer,
    TAnswerResult,
    TSubmissionResult,
    TReviewOption,
    TReviewQuestion,
    TSubmissionReview,
    TSubmissionSummary,
} from "../types/domain";

// ─── State & Reducer ──────────────────────────────────────────────────────────

type TState = {
    // Auth
    token: string | null;
    user: TUser | null;
    // Assessment selection
    availableAssessments: TAssessmentListItem[];
    // Active assessment
    assessmentConfig: TAssessmentConfig | null;
    submissionId: string | null;
    shuffledQuestions: TQuestion[];
    shuffledOptions: TOption[][];
    currentIndex: number;
    answers: Record<string, TAnswer>;
    flagged: Record<string, boolean>;
    timerExpired: boolean;
    submissionResult: TSubmissionResult | null;
    // History
    submissionHistory: TSubmissionSummary[];
    // UI
    loading: boolean;
    error: string | null;
};

type TAction =
    | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: TUser } }
    | { type: 'LOGOUT' }
    | { type: 'SET_AVAILABLE_ASSESSMENTS'; payload: TAssessmentListItem[] }
    | { type: 'SET_ASSESSMENT_CONFIG'; payload: TAssessmentConfig }
    | { type: 'SET_SUBMISSION_ID'; payload: string }
    | { type: 'SET_QUESTIONS'; payload: { questions: TQuestion[]; options: TOption[][] } }
    | { type: 'SET_ANSWER'; payload: { questionId: string; answer: TAnswer } }
    | { type: 'GO_TO_QUESTION'; payload: number }
    | { type: 'SET_TIMER_EXPIRED' }
    | { type: 'SET_SUBMISSION_RESULT'; payload: TSubmissionResult }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'RESET_ASSESSMENT' }
    | { type: 'SET_SUBMISSION_HISTORY'; payload: TSubmissionSummary[] }
    | { type: 'TOGGLE_FLAG'; payload: string };

function loadSession(): { token: string; user: TUser } | null {
    try {
        const token = localStorage.getItem('testero_token');
        const userJson = localStorage.getItem('testero_user');
        if (token && userJson) return { token, user: JSON.parse(userJson) };
    } catch { /* corrupted storage */ }
    return null;
}

function saveSession(token: string, user: TUser) {
    localStorage.setItem('testero_token', token);
    localStorage.setItem('testero_user', JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem('testero_token');
    localStorage.removeItem('testero_user');
}

const restored = loadSession();

const initialState: TState = {
    token: restored?.token ?? null,
    user: restored?.user ?? null,
    availableAssessments: [],
    assessmentConfig: null,
    submissionId: null,
    shuffledQuestions: [],
    shuffledOptions: [],
    currentIndex: 0,
    answers: {},
    flagged: {},
    timerExpired: false,
    submissionResult: null,
    submissionHistory: [],
    loading: false,
    error: null,
};

function reducer(state: TState, action: TAction): TState {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            saveSession(action.payload.token, action.payload.user);
            return { ...state, token: action.payload.token, user: action.payload.user, error: null };
        case 'LOGOUT':
            clearSession();
            return { ...initialState, token: null, user: null };
        case 'SET_AVAILABLE_ASSESSMENTS':
            return { ...state, availableAssessments: action.payload };
        case 'SET_ASSESSMENT_CONFIG':
            return { ...state, assessmentConfig: action.payload };
        case 'SET_SUBMISSION_ID':
            return { ...state, submissionId: action.payload };
        case 'SET_QUESTIONS':
            return {
                ...state,
                shuffledQuestions: action.payload.questions,
                shuffledOptions: action.payload.options,
                currentIndex: 0,
                answers: {},
                flagged: {},
                timerExpired: false,
            };
        case 'SET_ANSWER':
            return {
                ...state,
                answers: { ...state.answers, [action.payload.questionId]: action.payload.answer },
            };
        case 'GO_TO_QUESTION':
            return { ...state, currentIndex: action.payload };
        case 'SET_TIMER_EXPIRED':
            return { ...state, timerExpired: true };
        case 'SET_SUBMISSION_RESULT':
            return { ...state, submissionResult: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_SUBMISSION_HISTORY':
            return { ...state, submissionHistory: action.payload };
        case 'RESET_ASSESSMENT':
            return {
                ...state,
                assessmentConfig: null,
                submissionId: null,
                shuffledQuestions: [],
                shuffledOptions: [],
                currentIndex: 0,
                answers: {},
                flagged: {},
                timerExpired: false,
                submissionResult: null,
            };
        case 'TOGGLE_FLAG': {
            const qId = action.payload;
            const next = { ...state.flagged };
            if (next[qId]) {
                delete next[qId];
            } else {
                next[qId] = true;
            }
            return { ...state, flagged: next };
        }
        default:
            return state;
    }
}

// ─── Context ──────────────────────────────────────────────────────────────────

export interface AssessmentContextType {
    // State
    token: string | null;
    user: TUser | null;
    availableAssessments: TAssessmentListItem[];
    assessmentConfig: TAssessmentConfig | null;
    shuffledQuestions: TQuestion[];
    shuffledOptions: TOption[][];
    currentIndex: number;
    answers: Record<string, TAnswer>;
    flagged: Record<string, boolean>;
    timerExpired: boolean;
    submissionResult: TSubmissionResult | null;
    submissionHistory: TSubmissionSummary[];
    loading: boolean;
    error: string | null;
    // Actions
    doLogin: (username: string, password: string) => Promise<void>;
    doLogout: () => void;
    loadAvailableAssessments: () => Promise<void>;
    loadSubmissionHistory: () => Promise<void>;
    selectAssessment: (assessmentId: string) => Promise<void>;
    selectTrainingSession: (submissionId: string) => Promise<void>;
    setAnswer: (questionId: string, answer: TAnswer) => void;
    toggleFlag: (questionId: string) => void;
    goToQuestion: (index: number) => void;
    setTimerExpired: () => void;
    doSubmit: () => Promise<void>;
    resetAssessment: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | null>(null);

export const useAssessment = () => {
    const context = useContext(AssessmentContext);
    if (!context)
        throw new Error("useAssessment must be used within an AssessmentProvider");
    return context;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AssessmentProviderProps {
    children: React.ReactNode;
}

export const AssessmentProvider = ({ children }: AssessmentProviderProps) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const doLogin = useCallback(async (username: string, password: string) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        try {
            const { token, user } = await apiLogin(username, password);
            dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
            throw err;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);

    const doLogout = useCallback(() => {
        dispatch({ type: 'LOGOUT' });
    }, []);

    const loadAvailableAssessments = useCallback(async () => {
        if (!state.token) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const assessments = await fetchAvailableAssessments(state.token);
            dispatch({ type: 'SET_AVAILABLE_ASSESSMENTS', payload: assessments });
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.token]);

    const loadSubmissionHistory = useCallback(async () => {
        if (!state.token) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const submissions = await fetchSubmissionHistory(state.token);
            dispatch({ type: 'SET_SUBMISSION_HISTORY', payload: submissions });
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.token]);

    const selectAssessment = useCallback(async (assessmentId: string) => {
        if (!state.token) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        try {
            const { submission_id } = await startAssessment(assessmentId, state.token);
            dispatch({ type: 'SET_SUBMISSION_ID', payload: submission_id });

            const config = await fetchAssessmentConfig(assessmentId, state.token);
            dispatch({ type: 'SET_ASSESSMENT_CONFIG', payload: config });

            const data = await fetchAssessmentQuestions(assessmentId, state.token);
            const options = data.questions.map((q: TQuestion) =>
                q.type === 'multiple' && q.options ? q.options : []
            );
            dispatch({ type: 'SET_QUESTIONS', payload: { questions: data.questions, options } });
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
            throw err;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.token]);

    /**
     * Loads a free training session, which the backend has already created and drawn. It has
     * no assessment behind it, so the settings the app needs — title, timer — come from the
     * paper itself, and the scoring is the fixed one of practice: a point per correct answer.
     */
    const selectTrainingSession = useCallback(async (submissionId: string) => {
        if (!state.token) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        try {
            dispatch({ type: 'SET_SUBMISSION_ID', payload: submissionId });

            const data = await fetchSubmissionQuestions(submissionId, state.token);
            dispatch({
                type: 'SET_ASSESSMENT_CONFIG',
                payload: {
                    // A free session has no assessment: it is identified by itself.
                    assessmentId: data.assessmentId ?? submissionId,
                    title: data.title,
                    availableFrom: null,
                    availableUntil: null,
                    timerMinutes: data.timerMinutes,
                    questionsPerAssessment: data.totalQuestions,
                    scoring: { pointsPerCorrect: 1, pointsPerWrong: 0, pointsPerUnanswered: 0 },
                    shuffleQuestions: false,
                    shuffleOptions: false,
                    maxAttempts: null,
                    subjects: [],
                },
            });

            const options = data.questions.map((q: TQuestion) =>
                q.type === 'multiple' && q.options ? q.options : []
            );
            dispatch({ type: 'SET_QUESTIONS', payload: { questions: data.questions, options } });
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
            throw err;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.token]);

    const setAnswer = useCallback((questionId: string, answer: TAnswer) => {
        dispatch({ type: 'SET_ANSWER', payload: { questionId, answer } });
    }, []);

    const toggleFlag = useCallback((questionId: string) => {
        dispatch({ type: 'TOGGLE_FLAG', payload: questionId });
    }, []);

    const goToQuestion = useCallback((index: number) => {
        // Save the current question's answer before navigating
        if (state.submissionId && state.token && state.shuffledQuestions.length > 0) {
            const currentQuestion = state.shuffledQuestions[state.currentIndex];
            const currentAnswer = state.answers[currentQuestion.id] || {};
            saveAnswer(
                state.submissionId,
                currentQuestion.id,
                { ...currentAnswer, type: currentQuestion.type },
                state.token
            );
        }
        dispatch({ type: 'GO_TO_QUESTION', payload: index });
    }, [state.submissionId, state.token, state.shuffledQuestions, state.currentIndex, state.answers]);

    const setTimerExpired = useCallback(() => {
        dispatch({ type: 'SET_TIMER_EXPIRED' });
    }, []);

    const doSubmit = useCallback(async () => {
        if (!state.token || !state.user || !state.assessmentConfig || !state.submissionId) {
            throw new Error("Missing auth or assessment data");
        }

        const submissionResult = await submitAssessment(
            state.submissionId,
            state.shuffledQuestions,
            state.answers,
            state.token
        );
        dispatch({ type: 'SET_SUBMISSION_RESULT', payload: submissionResult });
    }, [state.token, state.user, state.shuffledQuestions, state.answers, state.assessmentConfig, state.submissionId]);

    const resetAssessment = useCallback(() => {
        dispatch({ type: 'RESET_ASSESSMENT' });
    }, []);

    return (
        <AssessmentContext.Provider value={{
            ...state,
            doLogin,
            doLogout,
            loadAvailableAssessments,
            loadSubmissionHistory,
            selectAssessment,
            selectTrainingSession,
            setAnswer,
            toggleFlag,
            goToQuestion,
            setTimerExpired,
            doSubmit,
            resetAssessment,
        }}>
            {children}
        </AssessmentContext.Provider>
    );
};

export default AssessmentContext;
