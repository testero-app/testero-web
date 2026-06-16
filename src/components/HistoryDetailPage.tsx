import { useEffect, useState } from 'react';
import { TSubmissionSummary, TSubmissionReview } from '../context/AssessmentContext';
import { fetchSubmissionReview } from '../lib/api';
import ReviewQuestionCard from './ReviewQuestionCard';
import styles from './HistoryDetailPage.module.css';

interface HistoryDetailPageProps {
    submission: TSubmissionSummary;
    onBack: () => void;
    token: string;
}

function formatFullDate(isoDate: string): string {
    const d = new Date(isoDate);
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDuration(startedAt: string | null, submittedAt: string): string {
    if (!startedAt) return '';
    const start = new Date(startedAt).getTime();
    const end = new Date(submittedAt).getTime();
    const minutes = Math.round((end - start) / 60000);
    return `${minutes} minuti`;
}

export default function HistoryDetailPage({ submission, onBack, token }: HistoryDetailPageProps) {
    const [review, setReview] = useState<TSubmissionReview | null>(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    async function loadReview() {
        setReviewLoading(true);
        setReviewError(null);
        try {
            const data = await fetchSubmissionReview(submission.id, token);
            setReview(data);
        } catch (e: unknown) {
            setReviewError(e instanceof Error ? e.message : 'Errore nel caricamento');
        } finally {
            setReviewLoading(false);
        }
    }

    const total = submission.total_questions;
    const correct = submission.correct_count;
    const wrong = submission.wrong_count;
    const unanswered = submission.unanswered_count;
    const pctCorrect = total > 0 ? Math.round((correct / total) * 100) : 0;
    const pctWrong = total > 0 ? Math.round((wrong / total) * 100) : 0;
    const pctUnanswered = total > 0 ? 100 - pctCorrect - pctWrong : 0;

    return (
        <div className={styles.page}>
            <button className={styles.backBtn} onClick={onBack}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 12L6 8l4-4" />
                </svg>
                Torna ai risultati
            </button>

            <div className={styles.header}>
                <h1 className={styles.title}>{submission.assessment_title}</h1>
                <span className={styles.date}>{formatFullDate(submission.submitted_at)}</span>
            </div>

            <div className={styles.summary}>
                <div className={styles.stats}>
                    <div className={`${styles.stat} ${styles.statCorrect}`}>
                        <span className={styles.statNum}>{correct}</span>
                        <span className={styles.statLabel}>Corrette</span>
                    </div>
                    <div className={`${styles.stat} ${styles.statWrong}`}>
                        <span className={styles.statNum}>{wrong}</span>
                        <span className={styles.statLabel}>Sbagliate</span>
                    </div>
                    <div className={`${styles.stat} ${styles.statUnanswered}`}>
                        <span className={styles.statNum}>{unanswered}</span>
                        <span className={styles.statLabel}>Non date</span>
                    </div>
                </div>

                <div className={styles.bar}>
                    {pctCorrect > 0 && <div className={styles.barCorrect} style={{ width: `${pctCorrect}%` }} />}
                    {pctWrong > 0 && <div className={styles.barWrong} style={{ width: `${pctWrong}%` }} />}
                    {pctUnanswered > 0 && <div className={styles.barUnanswered} style={{ width: `${pctUnanswered}%` }} />}
                </div>
                <p className={styles.scoreLine}>{correct} / {total} domande a risposta multipla</p>

                {submission.started_at && (
                    <p className={styles.timeLine}>
                        Completato in {formatDuration(submission.started_at, submission.submitted_at)}
                    </p>
                )}
            </div>

            {!review && (
                <div className={styles.actions}>
                    <button className="ts-btn ts-btn--dark" onClick={loadReview} disabled={reviewLoading}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                        {reviewLoading ? 'Caricamento...' : 'Rivedi le risposte'}
                    </button>
                </div>
            )}

            {reviewError && <p className={styles.errorText}>{reviewError}</p>}

            {review && (
                <div>
                    {review.questions.map((q, idx) => (
                        <ReviewQuestionCard
                            key={q.id}
                            questionText={q.text}
                            questionCode={q.code}
                            questionType={q.type}
                            displayIndex={idx}
                            isCorrect={q.is_correct}
                            options={q.options.map(o => ({
                                id: o.id,
                                text: o.text,
                                isCorrect: o.is_correct,
                            }))}
                            selectedOptionIds={new Set(q.selected_option_ids)}
                            answerText={q.answer_text}
                            motivation={q.motivation}
                        />
                    ))}
                </div>
            )}

            <div className={styles.actions}>
                <button className="ts-btn ts-btn--secondary" onClick={onBack}>Torna ai risultati</button>
            </div>
        </div>
    );
}
