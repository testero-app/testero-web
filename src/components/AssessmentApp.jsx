'use client';

import { useReducer, useCallback, useEffect, useMemo } from 'react';
import { fetchAssessmentConfig, fetchAssessmentQuestions } from '../lib/api';
import { generateEncryptedZip } from '../lib/generateZip';
import { isQuestionAnswered, DEFAULT_TIMER_MINUTES } from '../lib/questionUtils';
import { useTimer } from '../hooks/useTimer';


import LandingPage from './LandingPage';
import AssessmentHeader from './AssessmentHeader';
import AssessmentPage from './AssessmentPage';
import RecapPage from './RecapPage';
import StartModal from './StartModal';
import SubmitModal from './SubmitModal';
import FinalModal from './FinalModal';
import AlertModal from './AlertModal';


const initialState = {
    phase: 'landing',
    studentName: '',
    selectedSubject: null,
    subjects: [],
    assessmentConfig: null,
    loading: false,
    error: null,
    shuffledQuestions: [],
    shuffledOptions: [],
    currentIndex: 0,
    answers: {},
    timerExpired: false,
    modals: { start: false, submit: false, final: false },
    alertModal: { visible: false, title: '', message: '' },

};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_SUBJECTS':
            return { ...state, subjects: action.payload };
        case 'SET_ASSESSMENT_CONFIG':
            return { ...state, assessmentConfig: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_NAME':
            return { ...state, studentName: action.payload };
        case 'SET_SUBJECT':
            return { ...state, selectedSubject: action.payload, assessmentConfig: null };
        case 'SHOW_MODAL':
            return { ...state, modals: { ...state.modals, [action.payload]: true } };
        case 'HIDE_MODAL':
            return { ...state, modals: { ...state.modals, [action.payload]: false } };
        case 'START_ASSESSMENT':
            return {
                ...state,
                phase: 'assessment',
                shuffledQuestions: action.payload.questions,
                shuffledOptions: action.payload.options,
                currentIndex: 0,
                loading: false,
                modals: { start: false, submit: false, final: false },
            };
        case 'GO_TO_QUESTION':
            return { ...state, currentIndex: action.payload };
        case 'SET_ANSWER':
            return {
                ...state,
                answers: { ...state.answers, [action.payload.questionId]: action.payload.answer },
            };
        case 'SHOW_RECAP':
            return { ...state, phase: 'recap', modals: { start: false, submit: false, final: false } };
        case 'BACK_TO_ASSESSMENT':
            return { ...state, phase: 'assessment' };
        case 'SUBMITTED':
            return { ...state, phase: 'submitted', zipInfo: action.payload };
        case 'TIMER_EXPIRED':
            return { ...state, timerExpired: true, modals: { start: false, submit: false, final: false } };
        case 'SHOW_ALERT':
            return { ...state, alertModal: { visible: true, title: action.payload.title, message: action.payload.message } };
        case 'HIDE_ALERT':
            return { ...state, alertModal: { visible: false, title: '', message: '' } };
        default:
            return state;
    }
}

// isQuestionAnswered is imported from ../lib/questionUtils

export default function AssessmentApp() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const onTimerExpire = useCallback(() => {
        dispatch({ type: 'TIMER_EXPIRED' });
        if (state.phase === 'assessment') {
            dispatch({ type: 'SHOW_RECAP' });
        }
    }, [state.phase]);

    const timer = useTimer(state.assessmentConfig?.timerMinutes || DEFAULT_TIMER_MINUTES, onTimerExpire);

    // Load subjects on mount
    useEffect(() => {
        let cancelled = false;
        dispatch({ type: 'SET_LOADING', payload: true });
        fetchSubjects()
            .then(subjects => {
                if (!cancelled) {
                    dispatch({ type: 'SET_SUBJECTS', payload: subjects });
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            })
            .catch(err => {
                if (!cancelled) {
                    dispatch({ type: 'SET_ERROR', payload: err.message });
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            });
        return () => { cancelled = true; };
    }, []);

    // Load assessment config when subject changes
    useEffect(() => {
        if (!state.selectedSubject) return;
        let cancelled = false;
        dispatch({ type: 'SET_LOADING', payload: true });
        fetchAssessmentConfig(state.selectedSubject.id)
            .then(config => {
                if (!cancelled) {
                    dispatch({ type: 'SET_ASSESSMENT_CONFIG', payload: config });
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            })
            .catch(err => {
                if (!cancelled) {
                    dispatch({ type: 'SET_ERROR', payload: err.message });
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            });
        return () => { cancelled = true; };
    }, [state.selectedSubject]);

    // Keyboard navigation
    useEffect(() => {
        if (state.phase !== 'assessment') return;

        const handler = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'ArrowLeft') dispatch({ type: 'GO_TO_QUESTION', payload: Math.max(0, state.currentIndex - 1) });
            if (e.key === 'ArrowRight') dispatch({ type: 'GO_TO_QUESTION', payload: Math.min(state.shuffledQuestions.length - 1, state.currentIndex + 1) });
        };

        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [state.phase, state.currentIndex, state.shuffledQuestions.length]);

    // Compute answered set
    const { answeredSet, answeredCount } = useMemo(() => {
        const set = new Set();
        state.shuffledQuestions.forEach((q, idx) => {
            if (isQuestionAnswered(q, state.answers[q.id])) {
                set.add(idx);
            }
        });
        return { answeredSet: set, answeredCount: set.size };
    }, [state.shuffledQuestions, state.answers]);

    const handleStartClick = () => {
        dispatch({ type: 'SHOW_MODAL', payload: 'start' });
    };

    const handleStartConfirm = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const data = await fetchAssessmentQuestions(state.selectedSubject.id);
            const questions = data.questions;
            const options = questions.map(q =>
                q.type === 'multiple' && q.options ? q.options : []
            );

            dispatch({ type: 'START_ASSESSMENT', payload: { questions, options } });
            timer.start();
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err.message });
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleAnswer = useCallback((questionId, answer) => {
        dispatch({ type: 'SET_ANSWER', payload: { questionId, answer } });
    }, []);

    const handleGoTo = useCallback((index) => {
        dispatch({ type: 'GO_TO_QUESTION', payload: index });
    }, []);

    const handleSubmitClick = () => {
        dispatch({ type: 'SHOW_MODAL', payload: 'submit' });
    };

    const handleReview = () => {
        dispatch({ type: 'SHOW_RECAP' });
    };

    const handleBackToAssessment = () => {
        dispatch({ type: 'BACK_TO_ASSESSMENT' });
    };

    const handleFinalSubmitClick = () => {
        if (state.timerExpired) {
            doFinalSubmit();
        } else {
            dispatch({ type: 'SHOW_MODAL', payload: 'final' });
        }
    };

    const doFinalSubmit = async () => {
        dispatch({ type: 'HIDE_MODAL', payload: 'final' });
        timer.stop();

        try {
            const zipInfo = await generateEncryptedZip(
                state.studentName.trim().toUpperCase(),
                state.shuffledQuestions,
                state.answers,
                state.assessmentConfig.assessmentId,
                state.assessmentConfig.title
            );
            dispatch({ type: 'SUBMITTED', payload: zipInfo });
            dispatch({
                type: 'SHOW_ALERT',
                payload: {
                    title: 'Test consegnato',
                    message: `File scaricato: ${zipInfo.zipName}\n(contiene ${zipInfo.fileName} e ${zipInfo.mdFileName})\n\nConsegna questo file al docente.`,
                },
            });
        } catch {
            dispatch({
                type: 'SHOW_ALERT',
                payload: { title: 'Errore', message: 'Errore durante la generazione del file. Riprova.' },
            });
        }
    };

    const handleRedownload = async () => {
        try {
            await generateEncryptedZip(
                state.studentName.trim().toUpperCase(),
                state.shuffledQuestions,
                state.answers,
                state.assessmentConfig.assessmentId,
                state.assessmentConfig.title
            );
        } catch {
            dispatch({
                type: 'SHOW_ALERT',
                payload: { title: 'Errore', message: 'Errore durante il download. Riprova.' },
            });
        }
    };

    if (state.phase === 'submitted') {
        return (
            <>
                <div className="landing-page">
                    <div className="landing-card">
                        <h1 className="landing-welcome">Test consegnato</h1>
                        <p className="landing-motto">Il test è stato consegnato con successo.</p>
                        <p style={{ margin: '1rem 0' }}>
                            File: <strong>{state.zipInfo.zipName}</strong>
                        </p>
                        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                            Se il download non è andato a buon fine, puoi riscaricare il file.
                        </p>
                        <button className="btn-start" onClick={handleRedownload}>
                            Scarica di nuovo
                        </button>
                    </div>
                </div>
                <AlertModal
                    visible={state.alertModal.visible}
                    title={state.alertModal.title}
                    message={state.alertModal.message}
                    onClose={() => dispatch({ type: 'HIDE_ALERT' })}
                />
            </>
        );
    }

    if (state.phase === 'landing') {
        return (
            <>
                <LandingPage
                    subjects={state.subjects}
                    selectedSubject={state.selectedSubject}
                    assessmentConfig={state.assessmentConfig}
                    onSubjectChange={(subject) => dispatch({ type: 'SET_SUBJECT', payload: subject })}
                    studentName={state.studentName}
                    onNameChange={(name) => dispatch({ type: 'SET_NAME', payload: name })}
                    onStart={handleStartClick}
                    loading={state.loading}
                    error={state.error}
                />
                <StartModal
                    visible={state.modals.start}
                    onConfirm={handleStartConfirm}
                    onCancel={() => dispatch({ type: 'HIDE_MODAL', payload: 'start' })}
                />
                <AlertModal
                    visible={state.alertModal.visible}
                    title={state.alertModal.title}
                    message={state.alertModal.message}
                    onClose={() => dispatch({ type: 'HIDE_ALERT' })}
                />
            </>
        );
    }

    if (state.phase === 'recap') {
        return (
            <>
                <RecapPage
                    shuffledQuestions={state.shuffledQuestions}
                    shuffledOptions={state.shuffledOptions}
                    answers={state.answers}
                    answeredCount={answeredCount}
                    totalQuestions={state.shuffledQuestions.length}
                    timerExpired={state.timerExpired}
                    onBackToAssessment={handleBackToAssessment}
                    onFinalSubmit={handleFinalSubmitClick}
                />
                <FinalModal
                    visible={state.modals.final}
                    onConfirm={doFinalSubmit}
                    onCancel={() => dispatch({ type: 'HIDE_MODAL', payload: 'final' })}
                />
                <AlertModal
                    visible={state.alertModal.visible}
                    title={state.alertModal.title}
                    message={state.alertModal.message}
                    onClose={() => dispatch({ type: 'HIDE_ALERT' })}
                />
            </>
        );
    }

    // phase === 'assessment'
    return (
        <>
            <AssessmentHeader
                studentName={state.studentName.trim().toUpperCase()}
                timerDisplay={timer.display}
                timerWarning={timer.warning}
            />
            <AssessmentPage
                shuffledQuestions={state.shuffledQuestions}
                shuffledOptions={state.shuffledOptions}
                currentIndex={state.currentIndex}
                answers={state.answers}
                answeredSet={answeredSet}
                answeredCount={answeredCount}
                onGoTo={handleGoTo}
                onPrev={() => handleGoTo(Math.max(0, state.currentIndex - 1))}
                onNext={() => handleGoTo(Math.min(state.shuffledQuestions.length - 1, state.currentIndex + 1))}
                onAnswer={handleAnswer}
                onSubmit={handleSubmitClick}
            />
            <SubmitModal
                visible={state.modals.submit}
                onReview={handleReview}
                onCancel={() => dispatch({ type: 'HIDE_MODAL', payload: 'submit' })}
            />
            <FinalModal
                visible={state.modals.final}
                onConfirm={doFinalSubmit}
                onCancel={() => dispatch({ type: 'HIDE_MODAL', payload: 'final' })}
            />
            <AlertModal
                visible={state.alertModal.visible}
                title={state.alertModal.title}
                message={state.alertModal.message}
                onClose={() => dispatch({ type: 'HIDE_ALERT' })}
            />
        </>
    );
}
