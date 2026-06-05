'use client';

import { createContext, useCallback, useContext, useReducer } from "react";
import { generateEncryptedZip } from "../lib/generateZip";
import { login as apiLogin, fetchAvailableTests, fetchTestConfig, fetchTestQuestions, createSubmission, recordTestStart } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

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
};

export type TTestConfig = {
    testId: string;
    title: string;
    date: string;
    timerMinutes: number;
    totalPool: number;
    questionsPerTest: number;
    scoring: TScoringRules;
};

export type TTestListItem = {
    id: string;
    title: string;
    date: string;
    timerMinutes: number;
    questionsPerTest: number;
};

export type TUser = {
    id: string;
    name: string;
    username: string;
    class_name: string;
};

export type TAnswer = {
    selectedIds?: string[];
    motivation?: string;
    text?: string;
};

export type TZipInfo = {
    zipName: string;
    fileName: string;
    mdFileName: string;
};

export type TAnswerResult = {
    question_id: string;
    type: string;
    is_correct: boolean | null;
    correct_option_ids: string[];
};

export type TSubmissionResult = {
    id: string;
    user_id: string;
    test_id: string;
    started_at: string | null;
    submitted_at: string;
    answers: TAnswerResult[];
};

// ─── State & Reducer ──────────────────────────────────────────────────────────

type TState = {
    // Auth
    token: string | null;
    user: TUser | null;
    // Test selection
    availableTests: TTestListItem[];
    // Active test
    testConfig: TTestConfig | null;
    startedAt: string | null;
    shuffledQuestions: TQuestion[];
    shuffledOptions: TOption[][];
    currentIndex: number;
    answers: Record<string, TAnswer>;
    timerExpired: boolean;
    zipInfo: TZipInfo | null;
    submissionResult: TSubmissionResult | null;
    // UI
    loading: boolean;
    error: string | null;
};

type TAction =
    | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: TUser } }
    | { type: 'LOGOUT' }
    | { type: 'SET_AVAILABLE_TESTS'; payload: TTestListItem[] }
    | { type: 'SET_TEST_CONFIG'; payload: TTestConfig }
    | { type: 'SET_STARTED_AT'; payload: string }
    | { type: 'SET_QUESTIONS'; payload: { questions: TQuestion[]; options: TOption[][] } }
    | { type: 'SET_ANSWER'; payload: { questionId: string; answer: TAnswer } }
    | { type: 'GO_TO_QUESTION'; payload: number }
    | { type: 'SET_TIMER_EXPIRED' }
    | { type: 'SET_ZIP_INFO'; payload: TZipInfo }
    | { type: 'SET_SUBMISSION_RESULT'; payload: TSubmissionResult }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'RESET_TEST' };

const initialState: TState = {
    token: null,
    user: null,
    availableTests: [],
    testConfig: null,
    startedAt: null,
    shuffledQuestions: [],
    shuffledOptions: [],
    currentIndex: 0,
    answers: {},
    timerExpired: false,
    zipInfo: null,
    submissionResult: null,
    loading: false,
    error: null,
};

function reducer(state: TState, action: TAction): TState {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return { ...state, token: action.payload.token, user: action.payload.user, error: null };
        case 'LOGOUT':
            return { ...initialState };
        case 'SET_AVAILABLE_TESTS':
            return { ...state, availableTests: action.payload };
        case 'SET_TEST_CONFIG':
            return { ...state, testConfig: action.payload };
        case 'SET_STARTED_AT':
            return { ...state, startedAt: action.payload };
        case 'SET_QUESTIONS':
            return {
                ...state,
                shuffledQuestions: action.payload.questions,
                shuffledOptions: action.payload.options,
                currentIndex: 0,
                answers: {},
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
        case 'SET_ZIP_INFO':
            return { ...state, zipInfo: action.payload };
        case 'SET_SUBMISSION_RESULT':
            return { ...state, submissionResult: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'RESET_TEST':
            return {
                ...state,
                testConfig: null,
                startedAt: null,
                shuffledQuestions: [],
                shuffledOptions: [],
                currentIndex: 0,
                answers: {},
                timerExpired: false,
                zipInfo: null,
                submissionResult: null,
            };
        default:
            return state;
    }
}

// ─── Context ──────────────────────────────────────────────────────────────────

export interface TestContextType {
    // State
    token: string | null;
    user: TUser | null;
    availableTests: TTestListItem[];
    testConfig: TTestConfig | null;
    shuffledQuestions: TQuestion[];
    shuffledOptions: TOption[][];
    currentIndex: number;
    answers: Record<string, TAnswer>;
    timerExpired: boolean;
    zipInfo: TZipInfo | null;
    submissionResult: TSubmissionResult | null;
    loading: boolean;
    error: string | null;
    // Actions
    doLogin: (username: string, password: string) => Promise<void>;
    doLogout: () => void;
    loadAvailableTests: () => Promise<void>;
    selectTest: (testId: string) => Promise<void>;
    setAnswer: (questionId: string, answer: TAnswer) => void;
    goToQuestion: (index: number) => void;
    setTimerExpired: () => void;
    doSubmit: () => Promise<TZipInfo>;
    resetTest: () => void;
}

const TestContext = createContext<TestContextType | null>(null);

export const useTest = () => {
    const context = useContext(TestContext);
    if (!context)
        throw new Error("useTest must be used within a TestProvider");
    return context;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

interface TestProviderProps {
    children: React.ReactNode;
}

export const TestProvider = ({ children }: TestProviderProps) => {
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

    const loadAvailableTests = useCallback(async () => {
        if (!state.token) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const tests = await fetchAvailableTests(state.token);
            dispatch({ type: 'SET_AVAILABLE_TESTS', payload: tests });
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [state.token]);

    const selectTest = useCallback(async (testId: string) => {
        if (!state.token) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        try {
            // Fire-and-forget: track test start anonymously
            recordTestStart(testId, state.token).catch(() => {});

            dispatch({ type: 'SET_STARTED_AT', payload: new Date().toISOString() });

            const config = await fetchTestConfig(testId, state.token);
            dispatch({ type: 'SET_TEST_CONFIG', payload: config });

            const data = await fetchTestQuestions(testId, state.token);
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

    const goToQuestion = useCallback((index: number) => {
        dispatch({ type: 'GO_TO_QUESTION', payload: index });
    }, []);

    const setTimerExpired = useCallback(() => {
        dispatch({ type: 'SET_TIMER_EXPIRED' });
    }, []);

    const doSubmit = useCallback(async (): Promise<TZipInfo> => {
        if (!state.token || !state.user || !state.testConfig) {
            throw new Error("Missing auth or test data");
        }

        const submissionResult = await createSubmission(
            state.testConfig.testId,
            state.shuffledQuestions,
            state.answers,
            state.token,
            state.startedAt
        );
        dispatch({ type: 'SET_SUBMISSION_RESULT', payload: submissionResult });

        const zipInfo = await generateEncryptedZip(
            state.user.name,
            state.shuffledQuestions,
            state.answers,
            state.testConfig.testId,
            state.testConfig.title
        ) as TZipInfo;
        dispatch({ type: 'SET_ZIP_INFO', payload: zipInfo });
        return zipInfo;
    }, [state.token, state.user, state.shuffledQuestions, state.answers, state.testConfig]);

    const resetTest = useCallback(() => {
        dispatch({ type: 'RESET_TEST' });
    }, []);

    return (
        <TestContext.Provider value={{
            ...state,
            doLogin,
            doLogout,
            loadAvailableTests,
            selectTest,
            setAnswer,
            goToQuestion,
            setTimerExpired,
            doSubmit,
            resetTest,
        }}>
            {children}
        </TestContext.Provider>
    );
};

export default TestContext;
