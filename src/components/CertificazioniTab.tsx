import { useTranslations } from 'use-intl';
import { type TAssessmentListItem } from '../context/AssessmentContext';
import styles from './CertificazioniTab.module.css';

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

interface CertificazioniTabProps {
    assessments: TAssessmentListItem[];
    loading: boolean;
    onStart: (assessmentId: string) => void;
}

export default function CertificazioniTab({ assessments, loading, onStart }: CertificazioniTabProps) {
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
            <div className={styles.banner}>
                <span className={styles.bannerIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                    </svg>
                </span>
                <span className={styles.bannerText}>
                    {t.rich('banner', { strong: (c) => <strong>{c}</strong> })}
                </span>
            </div>

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
                            <button className={styles.avviaBtn} onClick={() => onStart(a.id)}>
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
