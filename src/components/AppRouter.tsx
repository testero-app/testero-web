import { useTranslations } from 'use-intl';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useNavigate, useLocation } from 'react-router';
import { AssessmentProvider, useAssessment, TSubmissionSummary, TSubmissionReview } from '../context/AssessmentContext';
import { isQuestionAnswered, DEFAULT_TIMER_MINUTES } from '../lib/questionUtils';
import { useTimer } from '../hooks/useTimer';
import { fetchSubmissionReview, startTrainingSession } from '../lib/api';

import type { ReactNode } from 'react';
import LoginPage from './LoginPage';
import AppShell from './layout/AppShell';
import TrainingTab from './TrainingTab';
import CompetenciesTab from './CompetenciesTab';
import CertificationsTab from './CertificationsTab';
import ResultsTab from './ResultsTab';
import TrainingSetupPage from './TrainingSetupPage';
import AssessmentHeader from './AssessmentHeader';
import AssessmentPage from './AssessmentPage';
import RecapPage from './RecapPage';
import ResultsPage, { ResultsSummary } from './ResultsPage';
import ReviewPage from './ReviewPage';
import StartModal from './StartModal';
import SubmitModal from './SubmitModal';
import FinalModal from './FinalModal';
import AlertModal from './AlertModal';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import ErrorPage from './ErrorPage';

// ─── Auth Guard ──────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: ReactNode }) {
    const { user } = useAssessment();
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

// ─── Login View ──────────────────────────────────────────────────────────────

function LoginView() {
    const { user, doLogin, loading, error } = useAssessment();
    const navigate = useNavigate();

    // Now that /login is a real URL, someone with a live session can land on it — send them on
    // rather than showing a form they do not need.
    useEffect(() => {
        if (user) navigate('/training', { replace: true });
    }, [user, navigate]);

    const handleLogin = useCallback(async (username: string, password: string) => {
        try {
            await doLogin(username, password);
            navigate('/training');
        } catch {
            // error is already in state
        }
    }, [doLogin, navigate]);

    return <LoginPage onLogin={handleLogin} loading={loading} error={error} />;
}

// ─── Training View ────────────────────────────────────────────────────────

function TrainingView() {
    const { user, token, doLogout } = useAssessment();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    if (!user || !token) return null;

    return (
        <AppShell
            activePage="training"
            userName={`${user.first_name} ${user.last_name}`}
            userClass={user.class_name}
            token={token}
            onNavigate={(page) => navigate(`/${page}`)}
            onLogout={() => { doLogout(); navigate('/login'); }}
        >
            <TrainingTab
                token={token}
                onStartTopic={(topicId) => navigate('/training/setup', { state: { topicId } })}
            />
        </AppShell>
    );
}

// ─── Competenze View ─────────────────────────────────────────────────────────

function CompetenciesView() {
    const { user, token, doLogout } = useAssessment();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    if (!user || !token) return null;

    return (
        <AppShell
            activePage="competencies"
            userName={`${user.first_name} ${user.last_name}`}
            userClass={user.class_name}
            token={token}
            onNavigate={(page) => navigate(`/${page}`)}
            onLogout={() => { doLogout(); navigate('/login'); }}
        >
            <CompetenciesTab
                token={token}
                onStartTraining={(topicId) => navigate('/training/setup', { state: { topicId } })}
            />
        </AppShell>
    );
}

// ─── Certificazioni View ────────────────────────────────────────────────────

function CertificationsView() {
    const {
        user, token, availableAssessments, loading,
        loadAvailableAssessments, selectAssessment, doLogout,
    } = useAssessment();
    const navigate = useNavigate();
    const [showStartModal, setShowStartModal] = useState(false);
    const [pendingAssessmentId, setPendingAssessmentId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        loadAvailableAssessments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleStartCert = useCallback((assessmentId: string) => {
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

    if (!user || !token) return null;

    return (
        <AppShell
            activePage="certifications"
            userName={`${user.first_name} ${user.last_name}`}
            userClass={user.class_name}
            token={token}
            onNavigate={(page) => navigate(`/${page}`)}
            onLogout={() => { doLogout(); navigate('/login'); }}
        >
            <CertificationsTab
                assessments={availableAssessments}
                loading={loading}
                onStart={handleStartCert}
            />
            <StartModal
                visible={showStartModal}
                onConfirm={handleStartConfirm}
                onCancel={() => setShowStartModal(false)}
            />
        </AppShell>
    );
}

// ─── Risultati Hub View ─────────────────────────────────────────────────────

function ResultsHubView() {
    const {
        user, token, submissionHistory, loading,
        loadSubmissionHistory, doLogout,
    } = useAssessment();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        loadSubmissionHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleSelectSubmission = useCallback((submissionId: string) => {
        const submission = submissionHistory.find(s => s.id === submissionId);
        if (submission) {
            navigate('/results/summary', { state: { historySubmission: submission } });
        }
    }, [submissionHistory, navigate]);

    if (!user || !token) return null;

    return (
        <AppShell
            activePage="results"
            userName={`${user.first_name} ${user.last_name}`}
            userClass={user.class_name}
            token={token}
            onNavigate={(page) => navigate(`/${page}`)}
            onLogout={() => { doLogout(); navigate('/login'); }}
        >
            <ResultsTab
                submissions={submissionHistory}
                loading={loading}
                onSelectSubmission={handleSelectSubmission}
            />
        </AppShell>
    );
}

// ─── Profile View ───────────────────────────────────────────────────────────

function ProfileView() {
    const { user, token, doLogout } = useAssessment();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    if (!user || !token) return null;

    return (
        <AppShell
            activePage="profile"
            userName={`${user.first_name} ${user.last_name}`}
            userClass={user.class_name}
            token={token}
            onNavigate={(page) => navigate(`/${page}`)}
            onLogout={() => { doLogout(); navigate('/login'); }}
        >
            <ProfilePage
                user={user}
                token={token ?? undefined}
                onLogout={() => { doLogout(); navigate('/login'); }}
            />
        </AppShell>
    );
}

// ─── Settings View ──────────────────────────────────────────────────────────

function SettingsView() {
    const { user, token, doLogout } = useAssessment();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    if (!user || !token) return null;

    return (
        <AppShell
            activePage="settings"
            userName={`${user.first_name} ${user.last_name}`}
            userClass={user.class_name}
            token={token}
            onNavigate={(page) => navigate(`/${page}`)}
            onLogout={() => { doLogout(); navigate('/login'); }}
        >
            <SettingsPage token={token ?? undefined} />
        </AppShell>
    );
}

// ─── Training Setup View ────────────────────────────────────────────────────

function TrainingSetupView() {
    const t = useTranslations('appRouter');
    const { user, token, selectTrainingSession } = useAssessment();
    const navigate = useNavigate();
    const location = useLocation();
    const topicId = (location.state as { topicId?: string })?.topicId || '';
    const topicName = (location.state as { topicName?: string })?.topicName || t('trainingFallback');

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    if (!user || !token) return null;

    const handleStart = async (config: {
        topicId: string;
        chapterIds: string[];
        difficulty: string;
        questionCount: number;
        timerEnabled: boolean;
    }) => {
        try {
            const result = await startTrainingSession({
                topic_id: config.topicId,
                chapter_ids: config.chapterIds,
                difficulty: config.difficulty,
                question_count: config.questionCount,
                timer_enabled: config.timerEnabled,
            }, token);
            await selectTrainingSession(result.submission_id);
            navigate('/assessment');
        } catch (err) {
            alert('Errore nell\'avvio dell\'allenamento: ' + (err as Error).message);
        }
    };

    return (
        <TrainingSetupPage
            topicId={topicId}
            topicName={topicName}
            token={token}
            onBack={() => navigate('/training')}
            onStart={handleStart}
        />
    );
}

// ─── Assessment View ─────────────────────────────────────────────────────────

function AssessmentView() {
    const t = useTranslations('appRouter');
    const {
        user, assessmentConfig, shuffledQuestions, shuffledOptions,
        currentIndex, answers, flagged,
        setAnswer, toggleFlag, goToQuestion, setTimerExpired, doSubmit,
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

    const questionIds = useMemo(() => shuffledQuestions.map(q => q.id), [shuffledQuestions]);

    const handleFinalSubmit = useCallback(async () => {
        setShowFinalModal(false);
        timer.stop();
        try {
            await doSubmit();
            navigate('/results/summary');
        } catch (err) {
            setAlertModal({
                visible: true,
                title: t('errorTitle'),
                message: t('fileGenError') + '\n\n' + (err as Error).message,
            });
        }
    }, [doSubmit, timer, navigate, t]);

    return (
        <>
            <AssessmentHeader
                studentName={user ? `${user.first_name} ${user.last_name}` : ''}
                assessmentTitle={assessmentConfig?.title}
                timerDisplay={timer.display}
                timerWarning={timer.warning}
                remainingSeconds={timer.remainingSeconds}
                currentIndex={currentIndex}
                totalQuestions={shuffledQuestions.length}
                answeredCount={answeredCount}
                answeredSet={answeredSet}
                flagged={flagged}
                questionIds={questionIds}
                onGoTo={goToQuestion}
                onSubmit={() => setShowSubmitModal(true)}
            />
            <AssessmentPage
                shuffledQuestions={shuffledQuestions}
                shuffledOptions={shuffledOptions}
                currentIndex={currentIndex}
                answers={answers}
                flagged={flagged}
                answeredSet={answeredSet}
                answeredCount={answeredCount}
                onGoTo={goToQuestion}
                onPrev={() => goToQuestion(Math.max(0, currentIndex - 1))}
                onNext={() => goToQuestion(Math.min(shuffledQuestions.length - 1, currentIndex + 1))}
                onAnswer={setAnswer}
                onToggleFlag={toggleFlag}
                onSubmit={() => setShowSubmitModal(true)}
            />
            <SubmitModal
                open={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                onConfirm={() => { setShowSubmitModal(false); handleFinalSubmit(); }}
                answeredCount={answeredCount}
                totalQuestions={shuffledQuestions.length}
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
    const t = useTranslations('appRouter');
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
            navigate('/results/summary');
        } catch (err) {
            setAlertModal({
                visible: true,
                title: t('errorTitle'),
                message: t('fileGenError') + '\n\n' + (err as Error).message,
            });
        }
    }, [doSubmit, navigate, t]);

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

/** mm:ss between two ISO timestamps, or a placeholder when either is missing. */
function formatDuration(startedAt?: string | null, submittedAt?: string | null): string {
    if (!startedAt || !submittedAt) return '--:--';
    const diff = Math.round(
        (new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 1000
    );
    const m = Math.floor(diff / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function ResultsView() {
    const t = useTranslations('appRouter');
    const {
        submissionResult, resetAssessment,
        assessmentConfig, token,
    } = useAssessment();
    const navigate = useNavigate();
    const location = useLocation();
    const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '' });

    const historySubmission = (location.state as { historySubmission?: TSubmissionSummary })?.historySubmission;
    const isHistoryMode = !submissionResult && !!historySubmission;

    useEffect(() => {
        if (!submissionResult && !historySubmission) {
            navigate('/training');
        }
    }, [submissionResult, historySubmission, navigate]);

    const handleBackToAssessments = () => {
        resetAssessment();
        navigate('/training');
    };

    const handleReviewErrors = useCallback(async () => {
        const submissionId = submissionResult?.id ?? historySubmission?.id;
        if (!submissionId || !token) return;
        try {
            const review = await fetchSubmissionReview(submissionId, token);
            navigate('/review', { state: { review } });
        } catch {
            setAlertModal({
                visible: true,
                title: t('errorTitle'),
                message: t('reviewLoadError'),
            });
        }
    }, [submissionResult, historySubmission, token, navigate, t]);

    if (!submissionResult && !historySubmission) {
        return null;
    }

    // Both branches read score, maxScore and passed straight from the backend:
    // it owns the scoring rules and the passing threshold of the assessment.
    const summary: ResultsSummary = isHistoryMode && historySubmission
        ? {
            score: historySubmission.score ?? 0,
            maxScore: historySubmission.max_score ?? 0,
            correctCount: historySubmission.correct_count,
            totalQuestions: historySubmission.total_questions,
            passed: historySubmission.passed ?? false,
            duration: formatDuration(historySubmission.started_at, historySubmission.submitted_at),
            subjectScores: historySubmission.subject_scores,
        }
        : {
            score: submissionResult?.score ?? 0,
            maxScore: submissionResult?.max_score ?? 0,
            correctCount: (submissionResult?.answers ?? [])
                .filter(a => a.is_correct === true).length,
            totalQuestions: (submissionResult?.answers ?? []).length,
            passed: submissionResult?.passed ?? false,
            duration: formatDuration(submissionResult?.started_at, submissionResult?.submitted_at),
            subjectScores: submissionResult?.subject_scores,
        };

    return (
        <>
            <ResultsPage
                summary={summary}
                assessmentTitle={isHistoryMode ? historySubmission?.assessment_title : assessmentConfig?.title}
                onBackToAssessments={handleBackToAssessments}
                onReviewErrors={handleReviewErrors}
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

// ─── Review View ────────────────────────────────────────────────────────────

function ReviewView() {
    const { user } = useAssessment();
    const navigate = useNavigate();
    const location = useLocation();

    const review = (location.state as { review?: TSubmissionReview })?.review;

    useEffect(() => {
        if (!user) navigate('/login');
        else if (!review) navigate('/training');
    }, [user, review, navigate]);

    if (!review) return null;

    return (
        <ReviewPage
            review={review}
            onBackToReport={() => navigate(-1)}
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
            onAction={() => navigate('/login')}
        />
    );
}

// ─── App Router ───────────────────────────────────────────────────────────────

export default function AppRouter() {
    return (
        <AssessmentProvider>
            <BrowserRouter>
                <Routes>
                    {/* The session lives in memory, so landing on any screen without one
                        bounces to the login — each view guards itself. */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<LoginView />} />
                    <Route path="/training" element={<RequireAuth><TrainingView /></RequireAuth>} />
                    <Route path="/competencies" element={<RequireAuth><CompetenciesView /></RequireAuth>} />
                    <Route path="/certifications" element={<RequireAuth><CertificationsView /></RequireAuth>} />
                    <Route path="/results" element={<RequireAuth><ResultsHubView /></RequireAuth>} />
                    <Route path="/profile" element={<RequireAuth><ProfileView /></RequireAuth>} />
                    <Route path="/settings" element={<RequireAuth><SettingsView /></RequireAuth>} />
                    <Route path="/training/setup" element={<RequireAuth><TrainingSetupView /></RequireAuth>} />
                    <Route path="/assessment" element={<RequireAuth><AssessmentView /></RequireAuth>} />
                    <Route path="/recap" element={<RequireAuth><RecapView /></RequireAuth>} />
                    <Route path="/results/summary" element={<RequireAuth><ResultsView /></RequireAuth>} />
                    <Route path="/review" element={<RequireAuth><ReviewView /></RequireAuth>} />
                    <Route path="*" element={<NotFoundView />} />
                </Routes>
            </BrowserRouter>
        </AssessmentProvider>
    );
}
