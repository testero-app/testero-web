'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { MemoryRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AssessmentProvider, useAssessment, TSubmissionSummary, TSubmissionReview } from '../context/AssessmentContext';
import { isQuestionAnswered, DEFAULT_TIMER_MINUTES } from '../lib/questionUtils';
import { useTimer } from '../hooks/useTimer';
import { fetchSubmissionReview, startTrainingSession } from '../lib/api';

import LoginPage from './LoginPage';
import AppShell from './layout/AppShell';
import AllenamentoTab from './AllenamentoTab';
import CompetenzeTab from './CompetenzeTab';
import CertificazioniTab from './CertificazioniTab';
import RisultatiTab from './RisultatiTab';
import ConfiguratorePage from './ConfiguratorePage';
import AssessmentHeader from './AssessmentHeader';
import AssessmentPage from './AssessmentPage';
import RecapPage from './RecapPage';
import ResultsPage from './ResultsPage';
import RipassoPage from './RipassoPage';
import StartModal from './StartModal';
import SubmitModal from './SubmitModal';
import FinalModal from './FinalModal';
import AlertModal from './AlertModal';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import ErrorPage from './ErrorPage';

// ─── Login View ──────────────────────────────────────────────────────────────

function LoginView() {
    const { doLogin, loading, error } = useAssessment();
    const navigate = useNavigate();

    const handleLogin = useCallback(async (username: string, password: string) => {
        try {
            await doLogin(username, password);
            navigate('/allenamento');
        } catch {
            // error is already in state
        }
    }, [doLogin, navigate]);

    return <LoginPage onLogin={handleLogin} loading={loading} error={error} />;
}

// ─── Allenamento View ────────────────────────────────────────────────────────

function AllenamentoView() {
    const { user, token, doLogout } = useAssessment();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/');
    }, [user, navigate]);

    if (!user || !token) return null;

    return (
        <AppShell
            activePage="allenamento"
            userName={user.name}
            userClass={user.class_name}
            onNavigate={(page) => navigate(`/${page}`)}
            onLogout={() => { doLogout(); navigate('/'); }}
        >
            <AllenamentoTab
                token={token}
                onStartTopic={(topicId) => navigate('/configuratore', { state: { topicId } })}
            />
        </AppShell>
    );
}

// ─── Competenze View ─────────────────────────────────────────────────────────

function CompetenzeView() {
    const { user, token, doLogout } = useAssessment();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/');
    }, [user, navigate]);

    if (!user || !token) return null;

    return (
        <AppShell
            activePage="competenze"
            userName={user.name}
            userClass={user.class_name}
            onNavigate={(page) => navigate(`/${page}`)}
            onLogout={() => { doLogout(); navigate('/'); }}
        >
            <CompetenzeTab
                token={token}
                onStartTraining={(topicId) => navigate('/configuratore', { state: { topicId } })}
            />
        </AppShell>
    );
}

// ─── Certificazioni View ────────────────────────────────────────────────────

function CertificazioniView() {
    const {
        user, availableAssessments, loading,
        loadAvailableAssessments, selectAssessment, doLogout,
    } = useAssessment();
    const navigate = useNavigate();
    const [showStartModal, setShowStartModal] = useState(false);
    const [pendingAssessmentId, setPendingAssessmentId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) { navigate('/'); return; }
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

    if (!user) return null;

    return (
        <AppShell
            activePage="certificazioni"
            userName={user.name}
            userClass={user.class_name}
            onNavigate={(page) => navigate(`/${page}`)}
            onLogout={() => { doLogout(); navigate('/'); }}
        >
            <CertificazioniTab
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

function RisultatiHubView() {
    const {
        user, submissionHistory, loading,
        loadSubmissionHistory, doLogout,
    } = useAssessment();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        loadSubmissionHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleSelectSubmission = useCallback((submissionId: string) => {
        const submission = submissionHistory.find(s => s.id === submissionId);
        if (submission) {
            navigate('/results', { state: { historySubmission: submission } });
        }
    }, [submissionHistory, navigate]);

    if (!user) return null;

    return (
        <AppShell
            activePage="risultati"
            userName={user.name}
            userClass={user.class_name}
            onNavigate={(page) => navigate(`/${page}`)}
            onLogout={() => { doLogout(); navigate('/'); }}
        >
            <RisultatiTab
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
        if (!user) navigate('/');
    }, [user, navigate]);

    if (!user) return null;

    return (
        <AppShell
            activePage="profilo"
            userName={user.name}
            userClass={user.class_name}
            onNavigate={(page) => navigate(`/${page}`)}
            onLogout={() => { doLogout(); navigate('/'); }}
        >
            <ProfilePage
                user={user}
                token={token ?? undefined}
                onLogout={() => { doLogout(); navigate('/'); }}
            />
        </AppShell>
    );
}

// ─── Settings View ──────────────────────────────────────────────────────────

function SettingsView() {
    const { user, token, doLogout } = useAssessment();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/');
    }, [user, navigate]);

    if (!user) return null;

    return (
        <AppShell
            activePage="impostazioni"
            userName={user.name}
            userClass={user.class_name}
            onNavigate={(page) => navigate(`/${page}`)}
            onLogout={() => { doLogout(); navigate('/'); }}
        >
            <SettingsPage token={token ?? undefined} />
        </AppShell>
    );
}

// ─── Configuratore View ────────────────────────────────────────────────────

function ConfiguratoreView() {
    const { user, token, selectAssessment } = useAssessment();
    const navigate = useNavigate();
    const location = useLocation();
    const topicId = (location.state as { topicId?: string })?.topicId || '';
    const topicName = (location.state as { topicName?: string })?.topicName || 'Allenamento';

    useEffect(() => {
        if (!user) navigate('/');
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
            await selectAssessment(result.assessment_snapshot_id);
            navigate('/assessment');
        } catch (err) {
            alert('Errore nell\'avvio dell\'allenamento: ' + (err as Error).message);
        }
    };

    return (
        <ConfiguratorePage
            topicId={topicId}
            topicName={topicName}
            token={token}
            onBack={() => navigate('/allenamento')}
            onStart={handleStart}
        />
    );
}

// ─── Assessment View ─────────────────────────────────────────────────────────

function AssessmentView() {
    const {
        user, assessmentConfig, shuffledQuestions, shuffledOptions,
        currentIndex, answers, flagged, timerExpired,
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
        assessmentConfig, token,
    } = useAssessment();
    const navigate = useNavigate();
    const location = useLocation();
    const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '' });

    const historySubmission = (location.state as { historySubmission?: TSubmissionSummary })?.historySubmission;
    const isHistoryMode = !submissionResult && !!historySubmission;

    useEffect(() => {
        if (!submissionResult && !historySubmission) {
            navigate('/allenamento');
        }
    }, [submissionResult, historySubmission, navigate]);

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
        navigate('/allenamento');
    };

    const handleReviewErrors = useCallback(async () => {
        const submissionId = submissionResult?.id ?? historySubmission?.id;
        if (!submissionId || !token) return;
        try {
            const review = await fetchSubmissionReview(submissionId, token);
            navigate('/ripasso', { state: { review } });
        } catch {
            setAlertModal({
                visible: true,
                title: 'Errore',
                message: 'Impossibile caricare il ripasso. Riprova.',
            });
        }
    }, [submissionResult, historySubmission, token, navigate]);

    if (!submissionResult && !historySubmission) {
        return null;
    }

    const historySummary = isHistoryMode && historySubmission ? (() => {
        const total = historySubmission.total_questions;
        const correct = historySubmission.correct_count;
        const scoreVal = historySubmission.score ?? correct;
        const pctPassed = total > 0 ? correct / total >= 0.6 : false;

        let dur = '--:--';
        if (historySubmission.started_at && historySubmission.submitted_at) {
            const diff = Math.round(
                (new Date(historySubmission.submitted_at).getTime() -
                 new Date(historySubmission.started_at).getTime()) / 1000
            );
            const m = Math.floor(diff / 60).toString().padStart(2, '0');
            const s = (diff % 60).toString().padStart(2, '0');
            dur = `${m}:${s}`;
        }

        return {
            score: Math.round(scoreVal),
            maxScore: total,
            correctCount: correct,
            totalQuestions: total,
            passed: pctPassed,
            duration: dur,
        };
    })() : undefined;

    return (
        <>
            <ResultsPage
                shuffledQuestions={isHistoryMode ? undefined : shuffledQuestions}
                shuffledOptions={isHistoryMode ? undefined : shuffledOptions}
                answers={isHistoryMode ? undefined : answers}
                answerResults={isHistoryMode ? undefined : submissionResult?.answers}
                summary={historySummary}
                assessmentTitle={isHistoryMode ? historySubmission?.assessment_title : assessmentConfig?.title}
                onBackToAssessments={handleBackToAssessments}
                onRedownload={isHistoryMode ? undefined : handleRedownload}
                onReviewErrors={handleReviewErrors}
                zipName={isHistoryMode ? undefined : zipInfo?.zipName}
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

// ─── Ripasso View ────────────────────────────────────────────────────────────

function RipassoView() {
    const { user } = useAssessment();
    const navigate = useNavigate();
    const location = useLocation();

    const review = (location.state as { review?: TSubmissionReview })?.review;

    useEffect(() => {
        if (!user) navigate('/');
        else if (!review) navigate('/allenamento');
    }, [user, review, navigate]);

    if (!review) return null;

    return (
        <RipassoPage
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
                    <Route path="/allenamento" element={<AllenamentoView />} />
                    <Route path="/competenze" element={<CompetenzeView />} />
                    <Route path="/certificazioni" element={<CertificazioniView />} />
                    <Route path="/risultati" element={<RisultatiHubView />} />
                    <Route path="/profilo" element={<ProfileView />} />
                    <Route path="/impostazioni" element={<SettingsView />} />
                    <Route path="/configuratore" element={<ConfiguratoreView />} />
                    <Route path="/assessment" element={<AssessmentView />} />
                    <Route path="/recap" element={<RecapView />} />
                    <Route path="/results" element={<ResultsView />} />
                    <Route path="/ripasso" element={<RipassoView />} />
                    <Route path="*" element={<NotFoundView />} />
                </Routes>
            </MemoryRouter>
        </AssessmentProvider>
    );
}
