import { useMemo } from 'react';
import { useTranslations, useLocale } from 'use-intl';
import { type TAssessmentListItem } from '../context/AssessmentContext';
import styles from './VerifichePage.module.css';

function getAbbrev(title: string): string {
    const words = title.split(/[\s-]+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return title.substring(0, 2).toUpperCase();
}

function formatDateShort(iso: string, locale: string): string {
    return new Date(iso).toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

interface VerifichePageProps {
    token: string;
    assessments: TAssessmentListItem[];
    loading: boolean;
    onStart: (assessmentId: string) => void;
}

export default function VerifichePage({ assessments, loading, onStart }: VerifichePageProps) {
    const t = useTranslations('verifiche');
    const locale = useLocale();
    const now = useMemo(() => new Date(), []);

    const examAssessments = useMemo(
        () => assessments.filter((a) => a.type === 'EXAM'),
        [assessments],
    );

    const { daSvolgere, programmate } = useMemo(() => {
        const todo: TAssessmentListItem[] = [];
        const scheduled: TAssessmentListItem[] = [];

        for (const a of examAssessments) {
            if (a.availableFrom && new Date(a.availableFrom) > now) {
                scheduled.push(a);
            } else {
                // Available now (no availableFrom or in the past)
                // Only include if deadline hasn't passed
                if (!a.availableUntil || new Date(a.availableUntil) > now) {
                    todo.push(a);
                }
            }
        }
        return { daSvolgere: todo, programmate: scheduled };
    }, [examAssessments, now]);

    function deadlineLabel(a: TAssessmentListItem): string {
        if (!a.availableUntil) return '';
        const deadline = new Date(a.availableUntil);
        const diffMs = deadline.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return t('expiresToday');
        return t('expiresIn', { days: diffDays, date: formatDateShort(a.availableUntil, locale) });
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.skeleton} />
                <div className={styles.skeleton} style={{ marginTop: 12 }} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <p className={styles.subtitle}>{t('subtitle')}</p>

            {/* Warning banner */}
            <div className={styles.banner}>
                <span className={styles.bannerIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                    </svg>
                </span>
                <span className={styles.bannerText}>
                    {t.rich('banner', { strong: (c) => <strong>{c}</strong> })}
                </span>
            </div>

            {examAssessments.length === 0 ? (
                <div className={styles.empty}>{t('empty')}</div>
            ) : (
                <>
                    {/* Da svolgere */}
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>
                            {t('daSvolgere')}
                            <span className={styles.sectionCount}>({daSvolgere.length})</span>
                        </h3>
                        <button className={styles.pastLink}>{t('pastLink')}</button>
                    </div>

                    {daSvolgere.length === 0 ? (
                        <div className={styles.empty}>{t('empty')}</div>
                    ) : (
                        <div className={styles.cardList}>
                            {daSvolgere.map((a) => (
                                <div key={a.id} className={styles.card}>
                                    <div className={styles.cardIcon}>{getAbbrev(a.title)}</div>
                                    <div className={styles.cardBody}>
                                        <div className={styles.cardTitle}>{a.title}</div>
                                        <div className={styles.cardMeta}>
                                            {a.questionsPerAssessment} domande &middot; {a.timerMinutes} min &middot; {t('attempt')}
                                            {a.availableUntil && <> &middot; {deadlineLabel(a)}</>}
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

                    {/* Programmate */}
                    {programmate.length > 0 && (
                        <>
                            <div className={styles.sectionHeader}>
                                <h3 className={styles.sectionTitle}>
                                    {t('programmate')}
                                    <span className={styles.sectionCount}>({programmate.length})</span>
                                </h3>
                            </div>
                            <div className={styles.cardList}>
                                {programmate.map((a) => (
                                    <div key={a.id} className={styles.cardDimmed}>
                                        <div className={styles.cardIcon}>{getAbbrev(a.title)}</div>
                                        <div className={styles.cardBody}>
                                            <div className={styles.cardTitle}>{a.title}</div>
                                            <div className={styles.cardMeta}>
                                                {a.questionsPerAssessment} domande &middot; {a.timerMinutes} min
                                                {a.availableFrom && <> &middot; {t('opensOn', { date: formatDateShort(a.availableFrom, locale) })}</>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
