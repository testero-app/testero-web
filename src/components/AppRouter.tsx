'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AssessmentProvider, useAssessment, TQuestion, TOption } from '../context/AssessmentContext';
import { isQuestionAnswered, DEFAULT_TIMER_MINUTES } from '../lib/questionUtils';
import { useTimer } from '../hooks/useTimer';

import LoginPage from './LoginPage';
import AssessmentSelectionPage from './AssessmentSelectionPage';
import AssessmentHeader from './AssessmentHeader';
import AssessmentPage from './AssessmentPage';
import RecapPage from './RecapPage';
import ResultsPage from './ResultsPage';
import StartModal from './StartModal';
import SubmitModal from './SubmitModal';
import FinalModal from './FinalModal';

// ─── Login View ──────────────────────────────────────────────────────────────

function LoginView() {
    const { doLogin, loading, error } = useAssessment();
    const navigate = useNavigate();

    const handleLogin = useCallback(async (username: string, password: string) => {
        try {
            await doLogin(username, password);
            navigate('/select-assessment');
        } catch {
            // error is already in state
        }
    }, [doLogin, navigate]);

    return <LoginPage onLogin={handleLogin} loading={loading} error={error} />;
}

// ─── Assessment Selection View ──────────────────────────────────────────────

function AssessmentSelectionView() {
    const { user, availableAssessments, loading, loadAvailableAssessments, selectAssessment, doLogout } = useAssessment();
    const navigate = useNavigate();
    const [showStartModal, setShowStartModal] = useState(false);
    const [pendingAssessmentId, setPendingAssessmentId] = useState<string | null>(null);

    const handleSelectAssessment = useCallback((assessmentId: string) => {
        setPendingAssessmentId(assessmentId);
        setShowStartModal(true);
    }, []);

    const handleStartConfirm = useCallback(async () => {
        if (!pendingAssessmentId) return;
        setShowStartModal(false);
        try {
            await selectAssessment(pendingAssessmentId);
            navigate('/assessment');
        } catch {
            // error in state
        }
    }, [pendingAssessmentId, selectAssessment, navigate]);

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
            <AssessmentSelectionPage
                user={user}
                assessments={availableAssessments}
                loading={loading}
                onLoadAssessments={loadAvailableAssessments}
                onSelectAssessment={handleSelectAssessment}
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

// ─── Assessment View ─────────────────────────────────────────────────────────

function AssessmentView() {
    const {
        user, assessmentConfig, shuffledQuestions, shuffledOptions,
        currentIndex, answers, timerExpired,
        setAnswer, goToQuestion, setTimerExpired, doSubmit,
    } = useAssessment();
    const navigate = useNavigate();
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showFinalModal, setShowFinalModal] = useState(false);

    const onTimerExpire = useCallback(() => {
        setTimerExpired();
        navigate('/recap');
    }, [setTimerExpired, navigate]);

    const timer = useTimer(assessmentConfig?.timerMinutes ?? DEFAULT_TIMER_MINUTES, onTimerExpire);

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
            alert('Errore durante la generazione del file. Riprova.\n\n' + (err as Error).message);
        }
    }, [doSubmit, timer, navigate]);

    return (
        <>
            <AssessmentHeader
                studentName={user?.name ?? ''}
                timerDisplay={timer.display}
                timerWarning={timer.warning}
            />
            <AssessmentPage
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
    } = useAssessment();
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
                onBackToTest={() => navigate('/assessment')}
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
        submissionResult, zipInfo, doSubmit, resetAssessment,
    } = useAssessment();
    const navigate = useNavigate();

    const handleRedownload = async () => {
        try {
            await doSubmit();
        } catch {
            alert('Errore durante il download. Riprova.');
        }
    };

    const handleBackToAssessments = () => {
        resetAssessment();
        navigate('/select-assessment');
    };

    if (!submissionResult) {
        navigate('/select-assessment');
        return null;
    }

    return (
        <ResultsPage
            shuffledQuestions={shuffledQuestions}
            shuffledOptions={shuffledOptions}
            answers={answers}
            answerResults={submissionResult.answers}
            onBackToTests={handleBackToAssessments}
            onRedownload={handleRedownload}
            zipName={zipInfo?.zipName}
        />
    );
}

// isQuestionAnswered is imported from ../lib/questionUtils

// ─── App Router ───────────────────────────────────────────────────────────────

export default function AppRouter() {
    return (
        <AssessmentProvider>
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<LoginView />} />
                    <Route path="/select-assessment" element={<AssessmentSelectionView />} />
                    <Route path="/assessment" element={<AssessmentView />} />
                    <Route path="/recap" element={<RecapView />} />
                    <Route path="/results" element={<ResultsView />} />
                </Routes>
            </MemoryRouter>
        </AssessmentProvider>
    );
}
