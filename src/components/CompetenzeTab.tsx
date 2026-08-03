import { useTranslations } from 'use-intl';
import { useState, useEffect } from 'react';
import { fetchCompetencies } from '../lib/api';
import styles from './CompetenzeTab.module.css';

interface CompetenzeTabProps {
    token: string;
    onStartTraining: (topicId: string) => void;
}

interface SubjectMastery {
    id: string;
    label: string;
    mastery: number;
}

interface TopicMastery {
    id: string;
    title: string;
    mastery: number;
    children: TopicMastery[];
    subjects: SubjectMastery[];
}

function getBarColor(pct: number): string {
    if (pct >= 70) return 'var(--ts-teal)';
    if (pct >= 50) return 'var(--ts-warning)';
    return 'var(--ts-danger)';
}

function TopicNode({ topic, expandedIds, onToggle }: {
    topic: TopicMastery;
    expandedIds: Set<string>;
    onToggle: (id: string) => void;
}) {
    const isExpanded = expandedIds.has(topic.id);
    const hasContent = topic.subjects.length > 0 || topic.children.length > 0;

    return (
        <div className={styles.topicRow}>
            <button
                className={styles.topicHeader}
                onClick={() => onToggle(topic.id)}
                aria-expanded={isExpanded}
            >
                {hasContent && (
                    <svg
                        className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="9 6 15 12 9 18" />
                    </svg>
                )}
                <span className={styles.topicName}>{topic.title}</span>
                <span
                    className={styles.topicPct}
                    style={{ color: getBarColor(topic.mastery) }}
                >
                    {topic.mastery}%
                </span>
            </button>
            <div className={styles.barTrack}>
                <div
                    className={styles.barFill}
                    style={{
                        width: `${topic.mastery}%`,
                        background: getBarColor(topic.mastery),
                    }}
                />
            </div>

            {isExpanded && hasContent && (
                <div className={styles.chapters}>
                    {topic.children.map((child) => (
                        <TopicNode
                            key={child.id}
                            topic={child}
                            expandedIds={expandedIds}
                            onToggle={onToggle}
                        />
                    ))}
                    {topic.subjects.map((subject) => (
                        <div key={subject.id} className={styles.chapterRow}>
                            <span className={styles.chapterName}>{subject.label}</span>
                            <div className={styles.chapterBarTrack}>
                                <div
                                    className={styles.barFill}
                                    style={{
                                        width: `${subject.mastery}%`,
                                        background: getBarColor(subject.mastery),
                                    }}
                                />
                            </div>
                            <span
                                className={styles.chapterPct}
                                style={{ color: getBarColor(subject.mastery) }}
                            >
                                {subject.mastery}%
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CompetenzeTab({ token, onStartTraining }: CompetenzeTabProps) {
    const t = useTranslations('competencies');
    const [topics, setTopics] = useState<TopicMastery[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchCompetencies(token)
            .then((data: { topics: TopicMastery[] }) => {
                setTopics(data.topics || []);
                if (data.topics?.length > 0) {
                    setExpandedIds(new Set([data.topics[0].id]));
                }
            })
            .catch(() => setTopics([]))
            .finally(() => setLoading(false));
    }, [token]);

    const handleToggle = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>{t('title')}</h2>
                <p className={styles.subtitle}>{t('loading')}</p>
            </div>
        );
    }

    if (topics.length === 0) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>{t('title')}</h2>
                <p className={styles.subtitle}>
                    {t('empty')}
                </p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{t('title')}</h2>
            <p className={styles.subtitle}>
                Padronanza media per argomento, dal tuo storico di verifiche e simulazioni. Espandi per i dettagli.
            </p>

            <div className={styles.card}>
                {topics.map((topic) => (
                    <TopicNode
                        key={topic.id}
                        topic={topic}
                        expandedIds={expandedIds}
                        onToggle={handleToggle}
                    />
                ))}

                <button
                    className={styles.trainBtn}
                    onClick={() => onStartTraining(topics[0]?.id ?? '')}
                >
                    Allenati sui punti deboli
                </button>
            </div>
        </div>
    );
}
