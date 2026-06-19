import { useState } from 'react';
import { type TSubmissionSummary } from '../context/AssessmentContext';
import styles from './RisultatiTab.module.css';

type FilterType = 'tutti' | 'certificazioni' | 'allenamento';

function getAbbrev(title: string): string {
    const words = title.split(/[\s\-]+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return title.substring(0, 2).toUpperCase();
}

// TODO: API should return assessment type (certification vs training).
// For now, guess from title: if it contains "Certification" or "Exam" → certification.
function guessType(title: string): 'certificazione' | 'allenamento' {
    const lower = title.toLowerCase();
    if (lower.includes('certif') || lower.includes('exam') || lower.includes('simulation')) {
        return 'certificazione';
    }
    return 'allenamento';
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatDuration(startedAt: string | null, submittedAt: string): string {
    if (!startedAt) return '';
    const ms = new Date(submittedAt).getTime() - new Date(startedAt).getTime();
    return `${Math.round(ms / 60000)} min`;
}

interface RisultatiTabProps {
    submissions: TSubmissionSummary[];
    loading: boolean;
    onSelectSubmission: (submissionId: string) => void;
}

export default function RisultatiTab({ submissions, loading, onSelectSubmission }: RisultatiTabProps) {
    const [filter, setFilter] = useState<FilterType>('tutti');

    const certCount = submissions.filter((s) => guessType(s.assessment_title) === 'certificazione').length;
    const trainCount = submissions.filter((s) => guessType(s.assessment_title) === 'allenamento').length;

    const filtered = filter === 'tutti'
        ? submissions
        : submissions.filter((s) => {
            const type = guessType(s.assessment_title);
            return filter === 'certificazioni' ? type === 'certificazione' : type === 'allenamento';
        });

    if (loading) {
        return (
            <div className={styles.list}>
                <div className={styles.skeleton} />
                <div className={styles.skeleton} />
            </div>
        );
    }

    const filters: { id: FilterType; label: string; count: number }[] = [
        { id: 'tutti', label: 'Tutti', count: submissions.length },
        { id: 'certificazioni', label: 'Certificazioni', count: certCount },
        { id: 'allenamento', label: 'Allenamento', count: trainCount },
    ];

    return (
        <>
            <div className={styles.filters}>
                <span className={styles.filterLabel}>Filtra</span>
                {filters.map((f) => (
                    <button
                        key={f.id}
                        className={`${styles.filterPill} ${filter === f.id ? styles.filterPillActive : ''}`}
                        onClick={() => setFilter(f.id)}
                    >
                        {f.label} <span className={styles.filterCount}>{f.count}</span>
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className={styles.empty}>Nessun risultato disponibile.</div>
            ) : (
                <div className={styles.list}>
                    {filtered.map((s) => {
                        const passed = s.total_questions > 0 && s.correct_count / s.total_questions >= 0.6;
                        const pct = s.total_questions > 0 ? Math.round((s.correct_count / s.total_questions) * 100) : 0;
                        const type = guessType(s.assessment_title);

                        return (
                            <div
                                key={s.id}
                                className={`${styles.row} ${passed ? styles.rowPass : styles.rowFail}`}
                                onClick={() => onSelectSubmission(s.id)}
                                role="button"
                                tabIndex={0}
                            >
                                <div className={styles.rowIcon}>{getAbbrev(s.assessment_title)}</div>
                                <div className={styles.rowBody}>
                                    <div className={styles.rowTitleLine}>
                                        <span className={styles.rowTitle}>{s.assessment_title}</span>
                                        <span className={styles.typeTag}>
                                            {type === 'certificazione' ? 'Certificazione' : 'Allenamento'}
                                        </span>
                                    </div>
                                    <div className={styles.progressRow}>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={`${styles.progressFill} ${passed ? styles.progressFillPass : styles.progressFillFail}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className={styles.rowMeta}>
                                            {s.correct_count}/{s.total_questions}
                                            {s.submitted_at ? ` · ${formatDate(s.submitted_at)}` : ''}
                                            {s.started_at ? ` · ${formatDuration(s.started_at, s.submitted_at)}` : ''}
                                        </span>
                                    </div>
                                </div>
                                <span className={`${styles.badge} ${passed ? styles.badgePass : styles.badgeFail}`}>
                                    {passed ? 'Superato' : 'Non superato'}
                                </span>
                                <span className={styles.chevron}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 6l6 6-6 6" />
                                    </svg>
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
