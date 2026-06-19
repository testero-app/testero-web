'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AssessmentProvider, useAssessment, TSubmissionSummary } from '../context/AssessmentContext';
import { isQuestionAnswered, DEFAULT_TIMER_MINUTES } from '../lib/questionUtils';
import { useTimer } from '../hooks/useTimer';
import { fetchSubmissionFeedback, fetchSubmissionReview } from '../lib/api';

import LoginPage from './LoginPage';
import TopBar from './layout/TopBar';
import StudentHub, { type TabId } from './StudentHub';
import AllenamentoTab from './AllenamentoTab';
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
import ErrorPage from './ErrorPage';

// ─── Login View ──────────────────────────────────────────────────────────────

function LoginView() {
    const { doLogin, loading, error } = useAssessment();
    const navigate = useNavigate();

    const handleLogin = useCallback(async (username: string, password: string) => {
        try {
            await doLogin(username, password);
            navigate('/home');
        } catch {
            // error is already in state
        }
    }, [doLogin, navigate]);

    return <LoginPage onLogin={handleLogin} loading={loading} error={error} />;
}

// ─── Home View (3-tab hub: Allenamento, Certificazioni, Risultati) ───────────

function HomeView() {
    const {
        user, token, availableAssessments, submissionHistory, loading,
        loadAvailableAssessments, loadSubmissionHistory,
        selectAssessment, doLogout,
    } = useAssessment();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>('allenamento');
    const [showStartModal, setShowStartModal] = useState(false);
    const [pendingAssessmentId, setPendingAssessmentId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        loadAvailableAssessments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleTabChange = useCallback((tab: TabId) => {
        setActiveTab(tab);
        if (tab === 'certificazioni') loadAvailableAssessments();
        if (tab === 'risultati') loadSubmissionHistory();
    }, [loadAvailableAssessments, loadSubmissionHistory]);

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

    const handleLogout = useCallback(() => {
        doLogout();
        navigate('/');
    }, [doLogout, navigate]);

    const handleSelectSubmission = useCallback(async (submissionId: string) => {
        if (!token) return;
        try {
            const feedback = await fetchSubmissionFeedback(submissionId, token);
            navigate('/results', { state: { feedback } });
        } catch {
            // fallback: navigate without data
            navigate('/results');
        }
    }, [token, navigate]);

    if (!user) return null;

    // Tab config
    const tabTitles: Record<TabId, { title: string; subtitle: string }> = {
        allenamento: {
            title: 'Allenati per argomento',
            subtitle: 'Nessun timer, nessun esito. Scegli un argomento, costruisci la sessione e fai pratica mirata.',
        },
        certificazioni: {
            title: 'Certificazione esterna della scuola',
            subtitle: 'Verifiche di certificazione predisposte dalla tua scuola. Esame a tempo: parte al primo click.',
        },
        risultati: {
            title: 'I miei risultati',
            subtitle: 'Certificazioni e allenamento in un unico posto. Tocca una riga per il dettaglio.',
        },
    };

    const tabs: { id: TabId; label: string; icon?: React.ReactNode }[] = [
        {
            id: 'allenamento',
            label: 'Allenamento',
            icon: activeTab === 'allenamento' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
            ) : undefined,
        },
        { id: 'certificazioni', label: 'Certificazioni' },
        { id: 'risultati', label: 'I miei risultati' },
    ];

    const subtitleIcon = activeTab === 'certificazioni' ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9a6a08" strokeWidth="2">
            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />
        </svg>
    ) : undefined;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--ts-app-bg)' }}>
            <TopBar
                userName={user.name}
                userClass={user.class_name}
                onLogout={handleLogout}
                onProfile={() => navigate('/profile')}
            />
            <StudentHub
                activeTab={activeTab}
                title={tabTitles[activeTab].title}
                subtitle={tabTitles[activeTab].subtitle}
                subtitleIcon={subtitleIcon}
                tabs={tabs}
                onTabChange={handleTabChange}
            >
                {activeTab === 'allenamento' && (
                    <AllenamentoTab
                        onStartTopic={(topicId) => navigate('/configuratore', { state: { topicId } })}
                    />
                )}
                {activeTab === 'certificazioni' && (
                    <CertificazioniTab
                        assessments={availableAssessments}
                        loading={loading}
                        onStart={handleStartCert}
                    />
                )}
                {activeTab === 'risultati' && (
                    <RisultatiTab
                        submissions={submissionHistory}
                        loading={loading}
                        onSelectSubmission={handleSelectSubmission}
                    />
                )}
            </StudentHub>
            <StartModal
                visible={showStartModal}
                onConfirm={handleStartConfirm}
                onCancel={() => setShowStartModal(false)}
            />
        </div>
    );
}

// ─── Configuratore View ────────────────────────────────────────────────────

function ConfiguratoreView() {
    const { user } = useAssessment();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/');
    }, [user, navigate]);

    if (!user) return null;

    // TODO: get topicId from location state and load real topic data
    return (
        <ConfiguratorePage
            topicName="Fondamenti Python I"
            onBack={() => navigate('/home')}
            onStart={() => {
                // TODO: start training session via POST /api/training/start, then navigate to /assessment
                alert('Funzionalità in sviluppo.\n\nL\'endpoint POST /api/training/start non è ancora disponibile. Una volta implementato, questa azione avvierà la sessione di allenamento.');
            }}
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
    const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '' });

    useEffect(() => {
        if (!submissionResult) {
            navigate('/home');
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
        navigate('/home');
    };

    const handleReviewErrors = useCallback(async () => {
        if (!submissionResult || !token) return;
        try {
            const review = await fetchSubmissionReview(submissionResult.id, token);
            navigate('/ripasso', { state: { review } });
        } catch {
            setAlertModal({
                visible: true,
                title: 'Errore',
                message: 'Impossibile caricare il ripasso. Riprova.',
            });
        }
    }, [submissionResult, token, navigate]);

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
                onReviewErrors={handleReviewErrors}
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

// ─── Ripasso View ────────────────────────────────────────────────────────────

function RipassoView() {
    const { user } = useAssessment();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate('/');
    }, [user, navigate]);

    // TODO: get review from location state or load from API
    // For now, show placeholder if no review data available
    return (
        <RipassoPage
            review={{
                id: '',
                assessment_title: 'Verifica',
                started_at: null,
                submitted_at: new Date().toISOString(),
                score: null,
                questions: [],
            }}
            onBackToReport={() => navigate('/results')}
        />
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
        <>
            <TopBar
                userName={user.name}
                userClass={user.class_name}
                onLogout={() => { doLogout(); navigate('/'); }}
                onProfile={() => {}}
            />
            <ProfilePage
                user={user}
                token={token ?? undefined}
                onBack={() => navigate('/home')}
                onLogout={() => { doLogout(); navigate('/'); }}
            />
        </>
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
                    <Route path="/home" element={<HomeView />} />
                    <Route path="/configuratore" element={<ConfiguratoreView />} />
                    <Route path="/assessment" element={<AssessmentView />} />
                    <Route path="/recap" element={<RecapView />} />
                    <Route path="/results" element={<ResultsView />} />
                    <Route path="/ripasso" element={<RipassoView />} />
                    <Route path="/profile" element={<ProfileView />} />
                    <Route path="*" element={<NotFoundView />} />
                </Routes>
            </MemoryRouter>
        </AssessmentProvider>
    );
}
