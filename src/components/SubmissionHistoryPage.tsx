import { TSubmissionSummary } from '../context/AssessmentContext';

interface SubmissionHistoryPageProps {
    submissions: TSubmissionSummary[];
    loading: boolean;
    onSelectSubmission: (submissionId: string) => void;
}

function formatDate(isoDate: string): string {
    const d = new Date(isoDate);
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDuration(startedAt: string | null, submittedAt: string): string {
    if (!startedAt) return '';
    const start = new Date(startedAt).getTime();
    const end = new Date(submittedAt).getTime();
    const minutes = Math.round((end - start) / 60000);
    return `${minutes} min`;
}

export default function SubmissionHistoryPage({
    submissions,
    loading,
    onSelectSubmission,
}: SubmissionHistoryPageProps) {
    if (loading) {
        return <p className="sel-empty-text">Caricamento...</p>;
    }

    if (submissions.length === 0) {
        return (
            <div className="sel-empty">
                <div className="sel-empty-icon">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M11 7v4l2.5 2.5"/>
                    </svg>
                </div>
                <h2>Nessun risultato</h2>
                <p>Non hai ancora completato nessuna verifica.<br/>I risultati appariranno qui dopo il primo test.</p>
            </div>
        );
    }

    return (
        <div className="sel-assessments">
            {submissions.map(sub => {
                const pass = sub.total_questions > 0
                    && (sub.correct_count / sub.total_questions) >= 0.6;

                return (
                    <button
                        key={sub.id}
                        className="hist-card"
                        onClick={() => onSelectSubmission(sub.id)}
                    >
                        <div className={`hist-indicator ${pass ? 'hist-indicator--pass' : 'hist-indicator--fail'}`} />
                        <div className="hist-body">
                            <h3 className="hist-title">{sub.assessment_title}</h3>
                            <div className="hist-meta">
                                <span className={`hist-score ${pass ? 'hist-score--pass' : 'hist-score--fail'}`}>
                                    {sub.correct_count}/{sub.total_questions} corrette
                                </span>
                                {sub.started_at && (
                                    <>
                                        <span className="sel-sep">&middot;</span>
                                        <span>{formatDuration(sub.started_at, sub.submitted_at)}</span>
                                    </>
                                )}
                                <span className="sel-sep">&middot;</span>
                                <span>{formatDate(sub.submitted_at)}</span>
                            </div>
                        </div>
                        <svg className="hist-arrow" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 4l5 5-5 5"/>
                        </svg>
                    </button>
                );
            })}
        </div>
    );
}
