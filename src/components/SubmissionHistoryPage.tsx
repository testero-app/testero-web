import { TSubmissionSummary } from '../context/AssessmentContext';
import { Badge, Skeleton } from './ui';
import styles from './SubmissionHistoryPage.module.css';

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

function getAbbrev(title: string): string {
    const words = title.split(/[\s—–-]+/).filter(w => w.length > 1);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return title.slice(0, 2).toUpperCase();
}

export default function SubmissionHistoryPage({
    submissions,
    loading,
    onSelectSubmission,
}: SubmissionHistoryPageProps) {
    if (loading) {
        return (
            <div className={styles.list}>
                {[1, 2].map((i) => (
                    <div key={i} className={styles.loadingRow}>
                        <Skeleton width={46} height={46} variant="rect" />
                        <div style={{ flex: 1 }}>
                            <Skeleton width="50%" height={16} variant="text" />
                            <div style={{ marginTop: 6 }}><Skeleton width="30%" height={12} variant="text" /></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className={styles.empty}>
                <div className={styles.emptyIcon}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M11 7v4l2.5 2.5" />
                    </svg>
                </div>
                <h2 className={styles.emptyTitle}>Nessun risultato</h2>
                <p className={styles.emptyText}>
                    Non hai ancora completato nessuna verifica. I risultati appariranno qui dopo il primo test.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {submissions.map(sub => {
                const pass = sub.total_questions > 0
                    && (sub.correct_count / sub.total_questions) >= 0.6;

                return (
                    <button
                        key={sub.id}
                        className={`${styles.row} ${pass ? styles.rowPass : styles.rowFail}`}
                        onClick={() => onSelectSubmission(sub.id)}
                    >
                        <div className={`${styles.rowIcon} ${pass ? styles.rowIconPass : styles.rowIconFail}`}>
                            {getAbbrev(sub.assessment_title)}
                        </div>
                        <div className={styles.rowBody}>
                            <div className={styles.rowTitle}>{sub.assessment_title}</div>
                            <div className={styles.rowMeta}>
                                <Badge variant={pass ? 'superato' : 'nonSuperato'}>
                                    {pass ? 'Superato' : 'Non superato'}
                                </Badge>
                                <span className={styles.metaSep}>&middot;</span>
                                <span>{sub.correct_count}/{sub.total_questions} corrette</span>
                                {sub.started_at && (
                                    <>
                                        <span className={styles.metaSep}>&middot;</span>
                                        <span>{formatDuration(sub.started_at, sub.submitted_at)}</span>
                                    </>
                                )}
                                <span className={styles.metaSep}>&middot;</span>
                                <span>{formatDate(sub.submitted_at)}</span>
                            </div>
                        </div>
                        <svg className={styles.chevron} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
}
