'use client';

import { useReducer, useCallback, useEffect, useMemo } from 'react';
import { fetchSubjects, fetchTestConfig, fetchTestQuestions } from '../lib/api';
import { generateEncryptedZip } from '../lib/generateZip';
import { useTimer } from '../hooks/useTimer';


import LandingPage from './LandingPage';
import TestHeader from './TestHeader';
import TestPage from './TestPage';
import RecapPage from './RecapPage';
import StartModal from './StartModal';
import SubmitModal from './SubmitModal';
import FinalModal from './FinalModal';


const initialState = {
    phase: 'landing',
    studentName: '',
    selectedSubject: null,
    subjects: [],
    testConfig: null,
    loading: false,
    error: null,
    shuffledQuestions: [],
    shuffledOptions: [],
    currentIndex: 0,
    answers: {},
    timerExpired: false,
    modals: { start: false, submit: false, final: false },

};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_SUBJECTS':
            return { ...state, subjects: action.payload };
        case 'SET_TEST_CONFIG':
            return { ...state, testConfig: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_NAME':
            return { ...state, studentName: action.payload };
        case 'SET_SUBJECT':
            return { ...state, selectedSubject: action.payload, testConfig: null };
        case 'SHOW_MODAL':
            return { ...state, modals: { ...state.modals, [action.payload]: true } };
        case 'HIDE_MODAL':
            return { ...state, modals: { ...state.modals, [action.payload]: false } };
        case 'START_TEST':
            return {
                ...state,
                phase: 'test',
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
        case 'BACK_TO_TEST':
            return { ...state, phase: 'test' };
        case 'SUBMITTED':
            return { ...state, phase: 'submitted', zipInfo: action.payload };
        case 'TIMER_EXPIRED':
            return { ...state, timerExpired: true, modals: { start: false, submit: false, final: false } };
        default:
            return state;
    }
}

function isQuestionAnswered(question, answer) {

    if (question.type === 'open') {
        return answer?.text?.trim().length > 0;
    }
    const selectedIds = answer?.selectedIds || [];

    if (selectedIds.length === 0) return false;

    checkIfJavaOrPython()
}

function checkIfJavaOrPython() {

    if (question.options.length == 5) {
        onlyNessuna = selectedIds.length === 1 && selectedIds[0].endsWith("_e");

    } else {
        onlyNessuna = selectedIds.length === 1 && selectedIds[0].endsWith("_d");
    }
    if (onlyNessuna) {
        return (answer?.motivation || '').trim().length > 0;
    }
    return onlyNessuna;
}

export default function TestApp() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const onTimerExpire = useCallback(() => {
        dispatch({ type: 'TIMER_EXPIRED' });
        if (state.phase === 'test') {
            dispatch({ type: 'SHOW_RECAP' });
        }
    }, [state.phase]);

    const timer = useTimer(state.testConfig?.timerMinutes || 60, onTimerExpire);

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

    // Load test config when subject changes
    useEffect(() => {
        if (!state.selectedSubject) return;
        let cancelled = false;
        dispatch({ type: 'SET_LOADING', payload: true });
        fetchTestConfig(state.selectedSubject.id)
            .then(config => {
                if (!cancelled) {
                    dispatch({ type: 'SET_TEST_CONFIG', payload: config });
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
        if (state.phase !== 'test') return;

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
            const data = await fetchTestQuestions(state.selectedSubject.id);
            const questions = data.questions;
            const options = questions.map(q =>
                q.type === 'multiple' && q.options ? q.options : []
            );

            dispatch({ type: 'START_TEST', payload: { questions, options } });
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

    const handleBackToTest = () => {
        dispatch({ type: 'BACK_TO_TEST' });
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
                state.testConfig.testId,
                state.testConfig.title
            );
            alert(`Test consegnato!\n\nFile scaricato: ${zipInfo.zipName}\n(contiene ${zipInfo.fileName} e ${zipInfo.mdFileName})\n\nConsegna questo file al docente.`);
            dispatch({ type: 'SUBMITTED', payload: zipInfo });
        } catch (error) {
            console.error('Errore generazione ZIP:', error);
            alert('Errore durante la generazione del file. Riprova.');
        }
    };

    const handleRedownload = async () => {
        try {
            await generateEncryptedZip(
                state.studentName.trim().toUpperCase(),
                state.shuffledQuestions,
                state.answers,
                state.testConfig.testId,
                state.testConfig.title
            );
        } catch (error) {
            console.error('Errore ri-generazione ZIP:', error);
            alert('Errore durante il download. Riprova.');
        }
    };

    if (state.phase === 'submitted') {
        return (
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
        );
    }

    if (state.phase === 'landing') {
        return (
            <>
                <LandingPage
                    subjects={state.subjects}
                    selectedSubject={state.selectedSubject}
                    testConfig={state.testConfig}
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
                    onBackToTest={handleBackToTest}
                    onFinalSubmit={handleFinalSubmitClick}
                />
                <FinalModal
                    visible={state.modals.final}
                    onConfirm={doFinalSubmit}
                    onCancel={() => dispatch({ type: 'HIDE_MODAL', payload: 'final' })}
                />
            </>
        );
    }

    // phase === 'test'
    return (
        <>
            <TestHeader
                studentName={state.studentName.trim().toUpperCase()}
                timerDisplay={timer.display}
                timerWarning={timer.warning}
            />
            <TestPage
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
        </>
    );
}
