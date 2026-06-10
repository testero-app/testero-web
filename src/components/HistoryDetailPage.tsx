import { useEffect, useState } from 'react';
import { TSubmissionSummary } from '../context/AssessmentContext';

interface HistoryDetailPageProps {
    submission: TSubmissionSummary;
    onBack: () => void;
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

export default function HistoryDetailPage({ submission, onBack }: HistoryDetailPageProps) {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const total = submission.total_questions;
    const correct = submission.correct_count;
    const wrong = submission.wrong_count;
    const unanswered = submission.unanswered_count;
    const pctCorrect = total > 0 ? Math.round((correct / total) * 100) : 0;
    const pctWrong = total > 0 ? Math.round((wrong / total) * 100) : 0;
    const pctUnanswered = total > 0 ? 100 - pctCorrect - pctWrong : 0;

    return (
        <div className="recap-page visible">
            <button className="detail-back" onClick={onBack}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 12L6 8l4-4"/>
                </svg>
                Torna ai risultati
            </button>

            <div className="detail-header">
                <h1 className="detail-title">{submission.assessment_title}</h1>
                <span className="detail-date">{formatFullDate(submission.submitted_at)}</span>
            </div>

            <div className="results-summary">
                <div className="results-stats">
                    <div className="results-stat results-stat-correct">
                        <span className="results-stat-num">{correct}</span>
                        <span className="results-stat-label">Corrette</span>
                        <span className="results-stat-pct">{pctCorrect}%</span>
                    </div>
                    <div className="results-stat results-stat-wrong">
                        <span className="results-stat-num">{wrong}</span>
                        <span className="results-stat-label">Sbagliate</span>
                        <span className="results-stat-pct">{pctWrong}%</span>
                    </div>
                    <div className="results-stat results-stat-unanswered">
                        <span className="results-stat-num">{unanswered}</span>
                        <span className="results-stat-label">Non date</span>
                        <span className="results-stat-pct">{pctUnanswered}%</span>
                    </div>
                </div>
                <div className="results-bar">
                    {pctCorrect > 0 && (
                        <div className="results-bar-segment results-bar-correct" style={{ width: `${pctCorrect}%` }} />
                    )}
                    {pctWrong > 0 && (
                        <div className="results-bar-segment results-bar-wrong" style={{ width: `${pctWrong}%` }} />
                    )}
                    {pctUnanswered > 0 && (
                        <div className="results-bar-segment results-bar-unanswered" style={{ width: `${pctUnanswered}%` }} />
                    )}
                </div>
                <p className="results-score-line">
                    {correct} / {total} domande a risposta multipla
                </p>
                {submission.started_at && (
                    <p className="results-time">
                        Completato in {formatDuration(submission.started_at, submission.submitted_at)}
                    </p>
                )}
            </div>

            <div className="recap-actions">
                <button
                    className="btn-final-submit"
                    onClick={onBack}
                    style={{ background: 'var(--accent)' }}
                >
                    Torna ai risultati
                </button>
            </div>
        </div>
    );
}
