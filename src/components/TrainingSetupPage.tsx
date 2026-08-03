import { useTranslations } from 'use-intl';
import { useState, useEffect } from 'react';
import { fetchTopicChapters } from '../lib/api';
import TesteroLogo from './ui/TesteroLogo';
import styles from './TrainingSetupPage.module.css';

interface ChapterItem {
    id: string;
    label: string;
    question_counts: { base: number; intermediate: number; advanced: number };
}

type Difficulty = 'base' | 'intermedio' | 'avanzato' | 'mista';

interface TrainingSetupPageProps {
    topicId: string;
    topicName: string;
    token: string;
    onBack: () => void;
    onStart: (config: {
        topicId: string;
        chapterIds: string[];
        difficulty: string;
        questionCount: number;
        timerEnabled: boolean;
    }) => void | Promise<void>;
}

export default function TrainingSetupPage({ topicId, topicName, token, onBack, onStart }: TrainingSetupPageProps) {
    const t = useTranslations('trainingSetup');
    const [chapters, setChapters] = useState<ChapterItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
    const [difficulty, setDifficulty] = useState<Difficulty>('base');
    const [questionCount, setQuestionCount] = useState(15);
    const [timerEnabled, setTimerEnabled] = useState(true);

    useEffect(() => {
        fetchTopicChapters(topicId, token)
            .then((data) => {
                setChapters(data.chapters || []);
                // Select all chapters by default
                setSelectedChapters(new Set((data.chapters || []).map((c: ChapterItem) => c.id)));
            })
            .catch(() => setChapters([]))
            .finally(() => setLoading(false));
    }, [topicId, token]);

    const allSelected = chapters.length > 0 && selectedChapters.size === chapters.length;

    function toggleChapter(id: string) {
        setSelectedChapters((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleAll() {
        if (allSelected) {
            setSelectedChapters(new Set());
        } else {
            setSelectedChapters(new Set(chapters.map((c) => c.id)));
        }
    }

    // Compute available count from selected chapters and difficulty
    const availableCount = chapters
        .filter((c) => selectedChapters.has(c.id))
        .reduce((sum, c) => {
            if (difficulty === 'mista') return sum + c.question_counts.base + c.question_counts.intermediate + c.question_counts.advanced;
            if (difficulty === 'base') return sum + c.question_counts.base;
            if (difficulty === 'intermedio') return sum + c.question_counts.intermediate;
            return sum + c.question_counts.advanced;
        }, 0);

    const estimatedMinutes = Math.ceil(questionCount * 1.5);

    // Creating a training session copies every question into a snapshot, so the request can
    // take seconds on a remote database. Without this guard the button stayed live and each
    // further click created another session — and another submission — behind the first.
    const handleStart = async () => {
        if (starting) return;
        setStarting(true);
        try {
            await onStart({
                topicId,
                chapterIds: Array.from(selectedChapters),
                difficulty,
                questionCount,
                timerEnabled,
            });
        } finally {
            setStarting(false);
        }
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.brand}>
                        <TesteroLogo size={28} />
                        <span className={styles.brandName}>Testero</span>
                    </div>
                    <div className={styles.sep} />
                    <span className={styles.crumb}>
                        Allenamento
                        <span className={styles.crumbSep}>›</span>
                        <span className={styles.crumbCurrent}>{topicName}</span>
                    </span>
                </div>
                <button className={styles.backBtn} onClick={onBack}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    Indietro
                </button>
            </div>

            {/* Body */}
            <div className={styles.body}>
                {/* Left: Chapters */}
                <div>
                    <div className={styles.chaptersHeader}>
                        <span className={styles.chaptersTitle}>{t('chapters')}</span>
                        <button className={styles.selectAll} onClick={toggleAll}>
                            {allSelected ? t('deselectAll') : t('selectAll')}
                        </button>
                    </div>

                    {loading ? (
                        <div className={styles.chapterList}>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={styles.chapter} style={{ height: 56, opacity: 0.4 }} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.chapterList}>
                            {chapters.map((ch) => {
                                const selected = selectedChapters.has(ch.id);
                                return (
                                    <div
                                        key={ch.id}
                                        className={`${styles.chapter} ${selected ? styles.chapterSelected : ''}`}
                                        onClick={() => toggleChapter(ch.id)}
                                    >
                                        <div className={`${styles.chapterCheck} ${selected ? styles.chapterCheckActive : ''}`}>
                                            {selected && (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4">
                                                    <path d="M5 12l5 5L20 6" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={styles.chapterName}>{ch.label}</span>
                                        <div className={styles.chapterLevels}>
                                            <span className={`${styles.levelChip} ${styles.levelBase}`}>{ch.question_counts.base}</span>
                                            <span className={`${styles.levelChip} ${styles.levelInter}`}>{ch.question_counts.intermediate}</span>
                                            <span className={`${styles.levelChip} ${styles.levelAvanz}`}>{ch.question_counts.advanced}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right: Session config */}
                <div className={styles.sessionCard}>
                    <div className={styles.sessionTitle}>{t('sessionTitle')}</div>

                    <div className={styles.sectionLabel}>{t('difficultyLabel')}</div>
                    <div className={styles.diffGrid}>
                        {(['base', 'intermedio', 'avanzato', 'mista'] as Difficulty[]).map((d) => (
                            <button
                                key={d}
                                className={`${styles.diffBtn} ${difficulty === d ? styles.diffBtnActive : ''}`}
                                onClick={() => setDifficulty(d)}
                            >
                                {t(`difficulty.${d}`)}
                            </button>
                        ))}
                    </div>

                    <div className={styles.sectionLabel}>{t('questionCount')}</div>
                    <div className={styles.stepper}>
                        <button
                            className={styles.stepBtn}
                            onClick={() => setQuestionCount((c) => Math.max(5, c - 5))}
                        >
                            −
                        </button>
                        <div className={styles.stepValue}>{questionCount}</div>
                        <button
                            className={`${styles.stepBtn} ${styles.stepBtnPlus}`}
                            onClick={() => setQuestionCount((c) => Math.min(availableCount || 50, c + 5))}
                        >
                            +
                        </button>
                    </div>
                    <div className={styles.stepNote}>
                        {availableCount} disponibili nei {selectedChapters.size} capitoli scelti (livello {difficulty})
                    </div>

                    <div className={styles.timerRow}>
                        <span className={styles.timerIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 7v5l3.5 2" />
                            </svg>
                        </span>
                        <div className={styles.timerInfo}>
                            <div className={styles.timerLabel}>{t('timer')}</div>
                            <div className={styles.timerMeta}>{t('timerMeta', { min: estimatedMinutes })}</div>
                        </div>
                        <button
                            className={`${styles.toggle} ${timerEnabled ? styles.toggleOn : ''}`}
                            onClick={() => setTimerEnabled(!timerEnabled)}
                        >
                            <span className={styles.toggleKnob} />
                        </button>
                    </div>

                    <button
                        className={styles.startBtn}
                        onClick={handleStart}
                        disabled={starting || selectedChapters.size === 0 || availableCount === 0}
                        aria-busy={starting}
                    >
                        {starting ? t('startingTraining') : t('startTraining')}
                        {!starting && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06302c" strokeWidth="2.6">
                                <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
