import { useTranslations } from 'use-intl';
import { type TAssessmentListItem } from '../context/AssessmentContext';
import styles from './CertificationsTab.module.css';

function getAbbrev(title: string): string {
    const words = title.split(/[\s-]+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return title.substring(0, 2).toUpperCase();
}

function formatDifficulty(difficulty?: string | null): string {
    if (!difficulty) return 'base';
    switch (difficulty.toUpperCase()) {
        case 'BEGINNER': return 'base';
        case 'INTERMEDIATE': return 'intermedio';
        case 'ADVANCED': return 'avanzato';
        case 'EXPERT': return 'esperto';
        default: return difficulty.toLowerCase();
    }
}

interface CertificationsTabProps {
    assessments: TAssessmentListItem[];
    loading: boolean;
    onStart: (assessmentId: string) => void;
}

export default function CertificationsTab({ assessments, loading, onStart }: CertificationsTabProps) {
    const t = useTranslations('certifications');
    if (loading) {
        return (
            <div className={styles.list}>
                <div className={styles.skeleton} />
                <div className={styles.skeleton} />
            </div>
        );
    }

    return (
        <>
            <p className={styles.subtitle}>{t('subtitle')}</p>

            {assessments.length === 0 ? (
                <div className={styles.empty}>{t('empty')}</div>
            ) : (
                <div className={styles.list}>
                    {assessments.map((a) => (
                        <div key={a.id} className={styles.row}>
                            <div className={styles.rowIcon}>{getAbbrev(a.title)}</div>
                            <div className={styles.rowBody}>
                                <div className={styles.rowTitle}>{a.title}</div>
                                <div className={styles.rowMeta}>
                                    {a.questionsPerAssessment} domande · {a.timerMinutes} min · livello {formatDifficulty(a.difficulty)}
                                </div>
                            </div>
                            <button className={styles.startBtn} onClick={() => onStart(a.id)}>
                                Avvia
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#06302c" strokeWidth="2.6">
                                    <path d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
