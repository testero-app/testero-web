'use client';

import { useState, useMemo } from 'react';
import type { TSubmissionReview, TReviewQuestion } from '../context/AssessmentContext';
import TesteroLogo from './ui/TesteroLogo';
import styles from './RipassoPage.module.css';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

interface RipassoPageProps {
    review: TSubmissionReview;
    onBackToReport: () => void;
}

/**
 * RipassoPage — full-page review of submitted answers.
 * Replaces the old HistoryDetailPage for post-submission review.
 */
export default function RipassoPage({ review, onBackToReport }: RipassoPageProps) {
    const [showOnlyWrong, setShowOnlyWrong] = useState(false);

    const wrongQuestions = useMemo(
        () => review.questions.filter((q) => q.is_correct === false),
        [review.questions],
    );

    const displayedQuestions: TReviewQuestion[] = showOnlyWrong
        ? wrongQuestions
        : review.questions;

    const totalCount = review.questions.length;
    const wrongCount = wrongQuestions.length;

    return (
        <div>
            {/* ── Header (navy bar) ──────────────────────────────────── */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <TesteroLogo size={28} />
                    <span className={styles.brandText}>Testero</span>
                    <span className={styles.separator} />
                    <span className={styles.breadcrumb}>
                        {review.assessment_title} &middot; Ripasso
                    </span>
                </div>

                <button className={styles.backBtn} onClick={onBackToReport}>
                    &lt; Torna al report
                </button>
            </header>

            {/* ── Title bar ──────────────────────────────────────────── */}
            <div className={styles.titleBar}>
                <h1 className={styles.titleText}>Riepilogo risposte</h1>

                <div className={styles.toggle}>
                    <button
                        className={`${styles.toggleBtn} ${!showOnlyWrong ? styles.toggleBtnActive : ''}`}
                        onClick={() => setShowOnlyWrong(false)}
                    >
                        Tutte &middot; {totalCount}
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${showOnlyWrong ? styles.toggleBtnDanger : ''}`}
                        onClick={() => setShowOnlyWrong(true)}
                    >
                        Solo errate &middot; {wrongCount}
                    </button>
                </div>
            </div>

            {/* ── Question cards ─────────────────────────────────────── */}
            <div className={styles.questionsList}>
                {displayedQuestions.length === 0 && (
                    <div className={styles.emptyState}>
                        Nessuna risposta errata — ottimo lavoro!
                    </div>
                )}

                {displayedQuestions.map((q, idx) => (
                    <QuestionCard
                        key={q.id}
                        question={q}
                        displayIndex={showOnlyWrong ? idx : q.position - 1}
                    />
                ))}
            </div>
        </div>
    );
}

/* ── Single question card ────────────────────────────────────────────── */

interface QuestionCardProps {
    question: TReviewQuestion;
    displayIndex: number;
}

function QuestionCard({ question, displayIndex }: QuestionCardProps) {
    const isCorrect = question.is_correct === true;
    const isWrong = question.is_correct === false;
    const isUnanswered = question.is_correct === null;

    const selectedSet = new Set(question.selected_option_ids ?? []);
    const correctSet = new Set(
        question.options.filter((o) => o.is_correct).map((o) => o.id),
    );

    // Derive a topic label from the question position (fallback)
    const topicLabel = question.type === 'open' ? 'BONUS' : `Q${displayIndex + 1}`;

    // Status badge
    let statusClass = styles.statusUnanswered;
    let statusText = 'Non data';
    if (isCorrect) {
        statusClass = styles.statusCorrect;
        statusText = 'Corretta';
    } else if (isWrong) {
        statusClass = styles.statusWrong;
        statusText = 'Errata';
    }

    // Number badge
    const numberBadgeClass = `${styles.numberBadge} ${
        isCorrect ? styles.numberBadgeCorrect : styles.numberBadgeWrong
    }`;

    return (
        <div className={styles.card}>
            {/* Card header */}
            <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                    <span className={numberBadgeClass}>{displayIndex + 1}</span>
                    <span className={styles.cardLabel}>
                        DOMANDA {displayIndex + 1} &middot; {topicLabel}
                    </span>
                </div>
                <span className={`${styles.statusBadge} ${statusClass}`}>
                    {statusText}
                </span>
            </div>

            {/* Card body */}
            <div className={styles.cardBody}>
                <div className={styles.questionText}>{question.text}</div>

                {question.code && (
                    <div className={styles.codeSnippet}>
                        <pre>
                            <code>{question.code}</code>
                        </pre>
                    </div>
                )}

                {/* Multiple-choice options */}
                {question.type === 'multiple' && (
                    <div className={styles.options}>
                        {question.options.map((opt, idx) => {
                            const isSelected = selectedSet.has(opt.id);
                            const isCorrectOpt = correctSet.has(opt.id);

                            let optionClass = styles.option;
                            let tag: { text: string; cls: string } | null = null;

                            if (isCorrectOpt) {
                                optionClass += ` ${styles.optionCorrectAnswer}`;
                                tag = { text: 'Risposta corretta', cls: styles.tagCorrect };
                            } else if (isSelected && !isCorrectOpt) {
                                optionClass += ` ${styles.optionWrongAnswer}`;
                                tag = { text: 'La tua risposta', cls: styles.tagWrong };
                            }

                            // Heuristic: treat option text as code if it looks like code
                            const looksLikeCode =
                                /[{}();=<>]/.test(opt.text) || /^[a-z_]+\(/.test(opt.text);

                            return (
                                <div key={opt.id} className={optionClass}>
                                    <span className={styles.optionLetter}>
                                        {LETTERS[idx]}
                                    </span>
                                    <span
                                        className={`${styles.optionText} ${
                                            looksLikeCode ? styles.optionTextCode : ''
                                        }`}
                                    >
                                        {opt.text}
                                    </span>
                                    {tag && (
                                        <span
                                            className={`${styles.optionTag} ${tag.cls}`}
                                        >
                                            {tag.text}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Open-question answer */}
                {question.type === 'open' && (
                    <div
                        className={`${styles.openAnswer} ${
                            !question.answer_text?.trim() ? styles.openAnswerEmpty : ''
                        }`}
                    >
                        {question.answer_text?.trim() || 'Nessuna risposta'}
                    </div>
                )}

                {/* Explanation ("Perché") box */}
                <ExplanationBox question={question} />
            </div>
        </div>
    );
}

/* ── Explanation box ─────────────────────────────────────────────────── */

interface ExplanationBoxProps {
    question: TReviewQuestion;
}

function ExplanationBox({ question }: ExplanationBoxProps) {
    const explanation =
        question.explanation?.trim() ||
        question.motivation?.trim() ||
        null;

    if (!explanation) return null;

    return (
        <div className={styles.explanation}>
            <div className={styles.explanationTitle}>Perché</div>
            <div className={styles.explanationText}>{explanation}</div>
        </div>
    );
}
