import { useState } from 'react';
import { type TSubmissionSummary } from '../context/AssessmentContext';
import styles from './RisultatiTab.module.css';

type FilterType = 'tutti' | 'certificazioni' | 'allenamento';

function getAbbrev(title: string): string {
    const words = title.split(/[\s\-]+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return title.substring(0, 2).toUpperCase();
}

// Maps the backend AssessmentType onto the two categories this tab filters by.
// The enum is TRAINING | EXAM | CERT_SIMULATION, plus "CERTIFICATION" which the
// server substitutes when a snapshot's type is null. Only TRAINING is
// "allenamento"; EXAM and CERT_SIMULATION are both formal, graded assessments
// and belong under certifications. Negating TRAINING (rather than listing the
// certification values) keeps any future non-training type on the safe side.
function categoryOf(type: string | undefined): 'certificazione' | 'allenamento' {
    return type === 'TRAINING' ? 'allenamento' : 'certificazione';
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

    const certCount = submissions.filter((s) => categoryOf(s.type) === 'certificazione').length;
    const trainCount = submissions.filter((s) => categoryOf(s.type) === 'allenamento').length;

    const filtered = filter === 'tutti'
        ? submissions
        : submissions.filter((s) => {
            const category = categoryOf(s.type);
            return filter === 'certificazioni' ? category === 'certificazione' : category === 'allenamento';
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
                        const category = categoryOf(s.type);

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
                                            {category === 'certificazione' ? 'Certificazione' : 'Allenamento'}
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
