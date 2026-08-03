import { useTranslations } from 'use-intl';
import { useEffect, useState } from 'react';
import { fetchTopics, type TTopic } from '../lib/api';
import styles from './TrainingTab.module.css';

interface TrainingTabProps {
    token: string;
    onStartTopic: (topicId: string) => void;
}

export default function TrainingTab({ token, onStartTopic }: TrainingTabProps) {
    const t = useTranslations('training');
    const [topics, setTopics] = useState<TTopic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopics(token)
            .then(setTopics)
            .catch(() => setTopics([]))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className={styles.grid}>
                <div className={styles.card} style={{ height: 180, opacity: 0.5 }} />
                <div className={styles.card} style={{ height: 180, opacity: 0.5 }} />
            </div>
        );
    }

    if (topics.length === 0) {
        return <div style={{ textAlign: 'center', padding: '48px 24px', color: '#8696a6' }}>{t('empty')}</div>;
    }

    return (
        <>
            <div className={styles.sectionLabel}>{t('topics')}</div>
            <div className={styles.grid}>
                {topics.map((topic) => {
                    const disabled = !topic.enabled || topic.total_questions === 0;
                    const baseCount = topic.chapters.reduce((s, c) => s + c.question_counts.base, 0);
                    const interCount = topic.chapters.reduce((s, c) => s + c.question_counts.intermediate, 0);
                    const avanzCount = topic.chapters.reduce((s, c) => s + c.question_counts.advanced, 0);

                    return (
                        <div
                            key={topic.id}
                            className={`${styles.card} ${disabled ? styles.cardDisabled : ''}`}
                        >
                            <div className={styles.cardHeader}>
                                <div className={`${styles.cardIcon} ${disabled ? styles.cardIconDisabled : ''}`}>
                                    {disabled ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="5" y="11" width="14" height="9" rx="2" />
                                            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                                        </svg>
                                    ) : (
                                        topic.abbreviation || topic.title.substring(0, 2).toUpperCase()
                                    )}
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.cardTitle}>{topic.title}</div>
                                    <div className={styles.cardDesc}>{topic.description}</div>
                                </div>
                            </div>

                            {!disabled && (
                                <div className={styles.levels}>
                                    <span className={`${styles.levelBadge} ${styles.levelBase}`}>
                                        Base {baseCount}
                                    </span>
                                    <span className={`${styles.levelBadge} ${styles.levelInter}`}>
                                        Inter {interCount}
                                    </span>
                                    <span className={`${styles.levelBadge} ${styles.levelAvanz}`}>
                                        Avanz {avanzCount}
                                    </span>
                                </div>
                            )}

                            <div className={styles.cardFooter}>
                                {disabled ? (
                                    <span className={styles.inPreparationLabel}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="5" y="11" width="14" height="9" rx="2" />
                                            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                                        </svg>
                                        In preparazione
                                    </span>
                                ) : (
                                    <>
                                        <span className={styles.cardMeta}>
                                            {topic.total_chapters} capitoli · {topic.total_questions} domande
                                        </span>
                                        <button
                                            className={styles.startBtn}
                                            onClick={() => onStartTopic(topic.id)}
                                        >
                                            Inizia
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                                                <path d="M5 12h14M13 6l6 6-6 6" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
