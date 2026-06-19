import styles from './AllenamentoTab.module.css';

interface TopicItem {
    id: string;
    abbrev: string;
    title: string;
    description: string;
    baseCount: number;
    interCount: number;
    avanzCount: number;
    chapters: number;
    questions: number;
    disabled?: boolean;
}

// TODO: replace with API call when GET /api/topics endpoint is available
const MOCK_TOPICS: TopicItem[] = [
    {
        id: 'python-1',
        abbrev: 'Py',
        title: 'Fondamenti Python I',
        description: 'Variabili, tipi, operatori e controllo di flusso. Le basi del linguaggio.',
        baseCount: 24,
        interCount: 16,
        avanzCount: 6,
        chapters: 6,
        questions: 46,
    },
    {
        id: 'python-2',
        abbrev: 'Py',
        title: 'Fondamenti Python II',
        description: 'Funzioni, strutture dati, comprehension e gestione errori.',
        baseCount: 18,
        interCount: 22,
        avanzCount: 11,
        chapters: 7,
        questions: 51,
    },
    {
        id: 'git',
        abbrev: 'Gi',
        title: 'Git e GitHub',
        description: 'Versionamento, branch, merge, pull request e collaborazione.',
        baseCount: 12,
        interCount: 8,
        avanzCount: 4,
        chapters: 4,
        questions: 24,
    },
    {
        id: 'strutture-dati',
        abbrev: 'SD',
        title: 'Strutture dati & algoritmi',
        description: 'Array, liste, stack, code, alberi e complessità computazionale.',
        baseCount: 0,
        interCount: 0,
        avanzCount: 0,
        chapters: 0,
        questions: 0,
        disabled: true,
    },
];

interface AllenamentoTabProps {
    onStartTopic: (topicId: string) => void;
}

export default function AllenamentoTab({ onStartTopic }: AllenamentoTabProps) {
    return (
        <>
            <div className={styles.sectionLabel}>Argomenti</div>
            <div className={styles.grid}>
                {MOCK_TOPICS.map((topic) => (
                    <div
                        key={topic.id}
                        className={`${styles.card} ${topic.disabled ? styles.cardDisabled : ''}`}
                    >
                        <div className={styles.cardHeader}>
                            <div className={`${styles.cardIcon} ${topic.disabled ? styles.cardIconDisabled : ''}`}>
                                {topic.disabled ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="5" y="11" width="14" height="9" rx="2" />
                                        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                                    </svg>
                                ) : (
                                    topic.abbrev
                                )}
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.cardTitle}>{topic.title}</div>
                                <div className={styles.cardDesc}>{topic.description}</div>
                            </div>
                        </div>

                        {!topic.disabled && (
                            <div className={styles.levels}>
                                <span className={`${styles.levelBadge} ${styles.levelBase}`}>
                                    Base {topic.baseCount}
                                </span>
                                <span className={`${styles.levelBadge} ${styles.levelInter}`}>
                                    Inter {topic.interCount}
                                </span>
                                <span className={`${styles.levelBadge} ${styles.levelAvanz}`}>
                                    Avanz {topic.avanzCount}
                                </span>
                            </div>
                        )}

                        <div className={styles.cardFooter}>
                            {topic.disabled ? (
                                <span className={styles.prepLabel}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="5" y="11" width="14" height="9" rx="2" />
                                        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                                    </svg>
                                    In preparazione
                                </span>
                            ) : (
                                <>
                                    <span className={styles.cardMeta}>
                                        {topic.chapters} capitoli · {topic.questions} domande
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
                ))}
            </div>
        </>
    );
}
