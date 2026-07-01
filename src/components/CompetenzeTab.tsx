import { useState } from 'react';
import styles from './CompetenzeTab.module.css';

interface CompetenzeTabProps {
    token: string;
    onStartTraining: (topicId: string) => void;
}

// Mock data — will be replaced with real API data later
const MOCK_TOPICS = [
    {
        id: 'fp1',
        name: 'Fondamenti Python I',
        mastery: 78,
        chapters: [
            { name: 'Variabili e tipi', mastery: 92 },
            { name: 'Cicli e condizioni', mastery: 54 },
            { name: 'Operatori ed espressioni', mastery: 88 },
        ],
    },
    {
        id: 'fp2',
        name: 'Fondamenti Python II',
        mastery: 49,
        chapters: [],
    },
    {
        id: 'git',
        name: 'Git e GitHub',
        mastery: 71,
        chapters: [],
    },
];

function getBarColor(pct: number): string {
    if (pct >= 70) return 'var(--ts-teal)';
    if (pct >= 50) return 'var(--ts-warning)';
    return 'var(--ts-danger)';
}

export default function CompetenzeTab({ onStartTraining }: CompetenzeTabProps) {
    const [expandedId, setExpandedId] = useState<string | null>(MOCK_TOPICS[0]?.id ?? null);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Le tue competenze</h2>
            <p className={styles.subtitle}>
                Padronanza media per argomento, dal tuo storico. Espandi per i capitoli.
            </p>

            <div className={styles.card}>
                {MOCK_TOPICS.map((topic) => {
                    const isExpanded = expandedId === topic.id;
                    return (
                        <div key={topic.id} className={styles.topicRow}>
                            <button
                                className={styles.topicHeader}
                                onClick={() => setExpandedId(isExpanded ? null : topic.id)}
                                aria-expanded={isExpanded}
                            >
                                {topic.chapters.length > 0 && (
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
                                <span className={styles.topicName}>{topic.name}</span>
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

                            {isExpanded && topic.chapters.length > 0 && (
                                <div className={styles.chapters}>
                                    {topic.chapters.map((ch) => (
                                        <div key={ch.name} className={styles.chapterRow}>
                                            <span className={styles.chapterName}>{ch.name}</span>
                                            <div className={styles.chapterBarTrack}>
                                                <div
                                                    className={styles.barFill}
                                                    style={{
                                                        width: `${ch.mastery}%`,
                                                        background: getBarColor(ch.mastery),
                                                    }}
                                                />
                                            </div>
                                            <span
                                                className={styles.chapterPct}
                                                style={{ color: getBarColor(ch.mastery) }}
                                            >
                                                {ch.mastery}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                <button
                    className={styles.trainBtn}
                    onClick={() => onStartTraining(MOCK_TOPICS[0]?.id ?? '')}
                >
                    Allenati sui punti deboli
                </button>
            </div>
        </div>
    );
}
