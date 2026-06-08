'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { TestProvider, useTest, TQuestion, TOption } from '../context/TestContext';
import { useTimer } from '../hooks/useTimer';

import LoginPage from './LoginPage';
import TestSelectionPage from './TestSelectionPage';
import TestHeader from './TestHeader';
import TestPage from './TestPage';
import RecapPage from './RecapPage';
import ResultsPage from './ResultsPage';
import StartModal from './StartModal';
import SubmitModal from './SubmitModal';
import FinalModal from './FinalModal';

// ─── Login View ──────────────────────────────────────────────────────────────

function LoginView() {
    const { doLogin, loading, error } = useTest();
    const navigate = useNavigate();

    const handleLogin = useCallback(async (username: string, password: string) => {
        try {
            await doLogin(username, password);
            navigate('/select-test');
        } catch {
            // error is already in state
        }
    }, [doLogin, navigate]);

    return <LoginPage onLogin={handleLogin} loading={loading} error={error} />;
}

// ─── Test Selection View ─────────────────────────────────────────────────────

function TestSelectionView() {
    const { user, availableTests, loading, loadAvailableTests, selectTest, doLogout } = useTest();
    const navigate = useNavigate();
    const [showStartModal, setShowStartModal] = useState(false);
    const [pendingTestId, setPendingTestId] = useState<string | null>(null);

    const handleSelectTest = useCallback((testId: string) => {
        setPendingTestId(testId);
        setShowStartModal(true);
    }, []);

    const handleStartConfirm = useCallback(async () => {
        if (!pendingTestId) return;
        setShowStartModal(false);
        try {
            await selectTest(pendingTestId);
            navigate('/test');
        } catch {
            // error in state
        }
    }, [pendingTestId, selectTest, navigate]);

    const handleLogout = useCallback(() => {
        doLogout();
        navigate('/');
    }, [doLogout, navigate]);

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user) {
        return null;
    }

    return (
        <>
            <TestSelectionPage
                user={user}
                tests={availableTests}
                loading={loading}
                onLoadTests={loadAvailableTests}
                onSelectTest={handleSelectTest}
                onLogout={handleLogout}
            />
            <StartModal
                visible={showStartModal}
                onConfirm={handleStartConfirm}
                onCancel={() => setShowStartModal(false)}
            />
        </>
    );
}

// ─── Test View ────────────────────────────────────────────────────────────────

function TestView() {
    const {
        user, testConfig, shuffledQuestions, shuffledOptions,
        currentIndex, answers, timerExpired,
        setAnswer, goToQuestion, setTimerExpired, doSubmit,
    } = useTest();
    const navigate = useNavigate();
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showFinalModal, setShowFinalModal] = useState(false);

    const onTimerExpire = useCallback(() => {
        setTimerExpired();
        navigate('/recap');
    }, [setTimerExpired, navigate]);

    const timer = useTimer(testConfig?.timerMinutes ?? 60, onTimerExpire);

    useEffect(() => {
        timer.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
            if (e.key === 'ArrowLeft') goToQuestion(Math.max(0, currentIndex - 1));
            if (e.key === 'ArrowRight') goToQuestion(Math.min(shuffledQuestions.length - 1, currentIndex + 1));
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [currentIndex, shuffledQuestions.length, goToQuestion]);

    const { answeredSet, answeredCount } = useMemo(() => {
        const set = new Set<number>();
        shuffledQuestions.forEach((q, idx) => {
            if (isQuestionAnswered(q, answers[q.id])) set.add(idx);
        });
        return { answeredSet: set, answeredCount: set.size };
    }, [shuffledQuestions, answers]);

    const handleFinalSubmit = useCallback(async () => {
        setShowFinalModal(false);
        timer.stop();
        try {
            await doSubmit();
            navigate('/results');
        } catch (err) {
            console.error('doSubmit error:', err);
            alert('Errore durante la generazione del file. Riprova.\n\n' + (err as Error).message);
        }
    }, [doSubmit, timer, navigate]);

    return (
        <>
            <TestHeader
                studentName={user?.name ?? ''}
                timerDisplay={timer.display}
                timerWarning={timer.warning}
            />
            <TestPage
                shuffledQuestions={shuffledQuestions}
                shuffledOptions={shuffledOptions}
                currentIndex={currentIndex}
                answers={answers}
                answeredSet={answeredSet}
                answeredCount={answeredCount}
                onGoTo={goToQuestion}
                onPrev={() => goToQuestion(Math.max(0, currentIndex - 1))}
                onNext={() => goToQuestion(Math.min(shuffledQuestions.length - 1, currentIndex + 1))}
                onAnswer={setAnswer}
                onSubmit={() => setShowSubmitModal(true)}
            />
            <SubmitModal
                visible={showSubmitModal}
                onReview={() => { setShowSubmitModal(false); navigate('/recap'); }}
                onCancel={() => setShowSubmitModal(false)}
            />
            <FinalModal
                visible={showFinalModal}
                onConfirm={handleFinalSubmit}
                onCancel={() => setShowFinalModal(false)}
            />
        </>
    );
}

// ─── Recap View ───────────────────────────────────────────────────────────────

function RecapView() {
    const {
        shuffledQuestions, shuffledOptions, answers, timerExpired, doSubmit,
    } = useTest();
    const navigate = useNavigate();
    const [showFinalModal, setShowFinalModal] = useState(false);

    const answeredCount = useMemo(() => {
        return shuffledQuestions.filter((q) => isQuestionAnswered(q, answers[q.id])).length;
    }, [shuffledQuestions, answers]);

    const handleFinalSubmit = useCallback(async () => {
        setShowFinalModal(false);
        try {
            await doSubmit();
            navigate('/results');
        } catch (err) {
            console.error('doSubmit error:', err);
            alert('Errore durante la generazione del file. Riprova.\n\n' + (err as Error).message);
        }
    }, [doSubmit, navigate]);

    const handleFinalSubmitClick = useCallback(() => {
        if (timerExpired) {
            handleFinalSubmit();
        } else {
            setShowFinalModal(true);
        }
    }, [timerExpired, handleFinalSubmit]);

    return (
        <>
            <RecapPage
                shuffledQuestions={shuffledQuestions}
                shuffledOptions={shuffledOptions}
                answers={answers}
                answeredCount={answeredCount}
                totalQuestions={shuffledQuestions.length}
                timerExpired={timerExpired}
                onBackToTest={() => navigate('/test')}
                onFinalSubmit={handleFinalSubmitClick}
            />
            <FinalModal
                visible={showFinalModal}
                onConfirm={handleFinalSubmit}
                onCancel={() => setShowFinalModal(false)}
            />
        </>
    );
}

// ─── Results View ─────────────────────────────────────────────────────────────

function ResultsView() {
    const {
        shuffledQuestions, shuffledOptions, answers,
        submissionResult, zipInfo, doSubmit, resetTest,
    } = useTest();
    const navigate = useNavigate();

    const handleRedownload = async () => {
        try {
            await doSubmit();
        } catch {
            alert('Errore durante il download. Riprova.');
        }
    };

    const handleBackToTests = () => {
        resetTest();
        navigate('/select-test');
    };

    if (!submissionResult) {
        navigate('/select-test');
        return null;
    }

    return (
        <ResultsPage
            shuffledQuestions={shuffledQuestions}
            shuffledOptions={shuffledOptions}
            answers={answers}
            answerResults={submissionResult.answers}
            onBackToTests={handleBackToTests}
            onRedownload={handleRedownload}
            zipName={zipInfo?.zipName}
        />
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isQuestionAnswered(question: { type: string; options?: unknown[] }, answer: { selectedIds?: string[]; text?: string; motivation?: string } | undefined): boolean {
    if (question.type === 'open') return (answer?.text?.trim().length ?? 0) > 0;
    const selectedIds = answer?.selectedIds ?? [];
    if (selectedIds.length === 0) return false;
    const suffix = question.options?.length === 5 ? '_e' : '_d';
    const onlyNessuna = selectedIds.length === 1 && selectedIds[0].endsWith(suffix);
    if (onlyNessuna) return (answer?.motivation ?? '').trim().length > 0;
    return true;
}

// ─── App Router ───────────────────────────────────────────────────────────────

export default function AppRouter() {
    return (
        <TestProvider>
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<LoginView />} />
                    <Route path="/select-test" element={<TestSelectionView />} />
                    <Route path="/test" element={<TestView />} />
                    <Route path="/recap" element={<RecapView />} />
                    <Route path="/results" element={<ResultsView />} />
                </Routes>
            </MemoryRouter>
        </TestProvider>
    );
}
