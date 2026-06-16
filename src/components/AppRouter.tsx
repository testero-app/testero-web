'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AssessmentProvider, useAssessment, TQuestion, TOption, TSubmissionSummary } from '../context/AssessmentContext';
import { isQuestionAnswered, DEFAULT_TIMER_MINUTES } from '../lib/questionUtils';
import { useTimer } from '../hooks/useTimer';

import LoginPage from './LoginPage';
import AssessmentSelectionPage from './AssessmentSelectionPage';
import AssessmentHeader from './AssessmentHeader';
import AssessmentPage from './AssessmentPage';
import RecapPage from './RecapPage';
import ResultsPage from './ResultsPage';
import SubmissionHistoryPage from './SubmissionHistoryPage';
import HistoryDetailPage from './HistoryDetailPage';
import StartModal from './StartModal';
import SubmitModal from './SubmitModal';
import FinalModal from './FinalModal';
import AlertModal from './AlertModal';
import ProfilePage from './ProfilePage';
import ChangePasswordPage from './ChangePasswordPage';
import ErrorPage from './ErrorPage';

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
    const {
        user, token, availableAssessments, submissionHistory, loading,
        loadAvailableAssessments, loadSubmissionHistory,
        selectAssessment, doLogout,
    } = useAssessment();
    const navigate = useNavigate();
    const [showStartModal, setShowStartModal] = useState(false);
    const [pendingAssessmentId, setPendingAssessmentId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'assessments' | 'history'>('assessments');
    const [selectedSubmission, setSelectedSubmission] = useState<TSubmissionSummary | null>(null);

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

    const handleTabChange = useCallback((tab: 'assessments' | 'history') => {
        setActiveTab(tab);
        setSelectedSubmission(null);
        if (tab === 'history') {
            loadSubmissionHistory();
        }
    }, [loadSubmissionHistory]);

    const handleSelectSubmission = useCallback((submissionId: string) => {
        const sub = submissionHistory.find(s => s.id === submissionId);
        if (sub) setSelectedSubmission(sub);
    }, [submissionHistory]);

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user) {
        return null;
    }

    if (selectedSubmission) {
        return (
            <HistoryDetailPage
                submission={selectedSubmission}
                onBack={() => setSelectedSubmission(null)}
                token={token!}
            />
        );
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
                onProfile={() => navigate('/profile')}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                historyContent={
                    activeTab === 'history' ? (
                        <SubmissionHistoryPage
                            submissions={submissionHistory}
                            loading={loading}
                            onSelectSubmission={handleSelectSubmission}
                        />
                    ) : undefined
                }
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
    const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '' });

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
            setAlertModal({
                visible: true,
                title: 'Errore',
                message: 'Errore durante la generazione del file. Riprova.\n\n' + (err as Error).message,
            });
        }
    }, [doSubmit, timer, navigate]);

    return (
        <>
            <AssessmentHeader
                studentName={user?.name ?? ''}
                assessmentTitle={assessmentConfig?.title}
                timerDisplay={timer.display}
                timerWarning={timer.warning}
                remainingSeconds={timer.remainingSeconds}
                currentIndex={currentIndex}
                totalQuestions={shuffledQuestions.length}
                answeredCount={answeredCount}
                answeredSet={answeredSet}
                onGoTo={goToQuestion}
                onSubmit={() => setShowSubmitModal(true)}
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
            <AlertModal
                visible={alertModal.visible}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => setAlertModal({ visible: false, title: '', message: '' })}
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
    const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '' });

    const answeredCount = useMemo(() => {
        return shuffledQuestions.filter((q) => isQuestionAnswered(q, answers[q.id])).length;
    }, [shuffledQuestions, answers]);

    const handleFinalSubmit = useCallback(async () => {
        setShowFinalModal(false);
        try {
            await doSubmit();
            navigate('/results');
        } catch (err) {
            setAlertModal({
                visible: true,
                title: 'Errore',
                message: 'Errore durante la generazione del file. Riprova.\n\n' + (err as Error).message,
            });
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
                onBackToAssessment={() => navigate('/assessment')}
                onFinalSubmit={handleFinalSubmitClick}
            />
            <FinalModal
                visible={showFinalModal}
                onConfirm={handleFinalSubmit}
                onCancel={() => setShowFinalModal(false)}
            />
            <AlertModal
                visible={alertModal.visible}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => setAlertModal({ visible: false, title: '', message: '' })}
            />
        </>
    );
}

// ─── Results View ─────────────────────────────────────────────────────────────

function ResultsView() {
    const {
        shuffledQuestions, shuffledOptions, answers,
        submissionResult, zipInfo, doSubmit, resetAssessment,
        assessmentConfig,
    } = useAssessment();
    const navigate = useNavigate();
    const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '' });

    useEffect(() => {
        if (!submissionResult) {
            navigate('/select-assessment');
        }
    }, [submissionResult, navigate]);

    const handleRedownload = async () => {
        try {
            await doSubmit();
        } catch {
            setAlertModal({
                visible: true,
                title: 'Errore',
                message: 'Errore durante il download. Riprova.',
            });
        }
    };

    const handleBackToAssessments = () => {
        resetAssessment();
        navigate('/select-assessment');
    };

    if (!submissionResult) {
        return null;
    }

    return (
        <>
            <ResultsPage
                shuffledQuestions={shuffledQuestions}
                shuffledOptions={shuffledOptions}
                answers={answers}
                answerResults={submissionResult.answers}
                assessmentTitle={assessmentConfig?.title}
                onBackToAssessments={handleBackToAssessments}
                onRedownload={handleRedownload}
                zipName={zipInfo?.zipName}
            />
            <AlertModal
                visible={alertModal.visible}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => setAlertModal({ visible: false, title: '', message: '' })}
            />
        </>
    );
}

// ─── Profile View ────────────────────────────────────────────────────────────

function ProfileView() {
    const { user, token, doLogout } = useAssessment();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/');
    }, [user, navigate]);

    if (!user) return null;

    return (
        <ProfilePage
            user={user}
            token={token ?? undefined}
            onBack={() => navigate('/select-assessment')}
            onLogout={() => { doLogout(); navigate('/'); }}
        />
    );
}

// ─── Change Password View ────────────────────────────────────────────────────

function ChangePasswordView() {
    const { user, token, doLogout } = useAssessment();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/');
    }, [user, navigate]);

    if (!user || !token) return null;

    return (
        <ChangePasswordPage
            user={user}
            token={token}
            onBack={() => navigate('/profile')}
            onLogout={() => { doLogout(); navigate('/'); }}
        />
    );
}

// ─── Not Found View ──────────────────────────────────────────────────────────

function NotFoundView() {
    const navigate = useNavigate();
    return (
        <ErrorPage
            code="404"
            title="Pagina non trovata"
            message="La pagina che stai cercando non esiste."
            onAction={() => navigate('/')}
        />
    );
}

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
                    <Route path="/profile" element={<ProfileView />} />
                    <Route path="/change-password" element={<ChangePasswordView />} />
                    <Route path="*" element={<NotFoundView />} />
                </Routes>
            </MemoryRouter>
        </AssessmentProvider>
    );
}
