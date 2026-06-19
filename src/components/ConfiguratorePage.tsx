import { useState } from 'react';
import TesteroLogo from './ui/TesteroLogo';
import styles from './ConfiguratorePage.module.css';

// TODO: entire page backed by mock data.
// Needs GET /api/topics/{id}/chapters and POST /api/training/start endpoints

interface ChapterItem {
    id: string;
    name: string;
    base: number;
    inter: number;
    avanz: number;
}

// TODO: replace with API call when GET /api/topics/{id}/chapters is available
const MOCK_CHAPTERS: ChapterItem[] = [
    { id: 'ch1', name: 'Variabili e tipi', base: 8, inter: 5, avanz: 1 },
    { id: 'ch2', name: 'Cicli e condizioni', base: 7, inter: 4, avanz: 2 },
    { id: 'ch3', name: 'Operatori ed espressioni', base: 5, inter: 3, avanz: 1 },
    { id: 'ch4', name: 'Stringhe e formattazione', base: 4, inter: 4, avanz: 2 },
];

type Difficulty = 'base' | 'intermedio' | 'avanzato' | 'mista';

interface ConfiguratorePageProps {
    topicName: string;
    onBack: () => void;
    onStart: () => void;
}

export default function ConfiguratorePage({ topicName, onBack, onStart }: ConfiguratorePageProps) {
    const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set(['ch1', 'ch2']));
    const [difficulty, setDifficulty] = useState<Difficulty>('base');
    const [questionCount, setQuestionCount] = useState(15);
    const [timerEnabled, setTimerEnabled] = useState(true);

    const allSelected = selectedChapters.size === MOCK_CHAPTERS.length;

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
            setSelectedChapters(new Set(MOCK_CHAPTERS.map((c) => c.id)));
        }
    }

    // TODO: compute from actual chapter question pool
    const availableCount = selectedChapters.size * 8;
    const estimatedMinutes = Math.ceil(questionCount * 1.5);

    return (
        <div className={styles.page}>
            {/* ── Header ───────────────────────────────────────── */}
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

            {/* ── Body ─────────────────────────────────────────── */}
            <div className={styles.body}>
                {/* Left: Chapters */}
                <div>
                    <div className={styles.chaptersHeader}>
                        <span className={styles.chaptersTitle}>Capitoli</span>
                        <button className={styles.selectAll} onClick={toggleAll}>
                            {allSelected ? 'Deseleziona tutti' : 'Seleziona tutti'}
                        </button>
                    </div>

                    <div className={styles.chapterList}>
                        {MOCK_CHAPTERS.map((ch) => {
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
                                    <span className={styles.chapterName}>{ch.name}</span>
                                    <div className={styles.chapterLevels}>
                                        <span className={`${styles.levelChip} ${styles.levelBase}`}>{ch.base}</span>
                                        <span className={`${styles.levelChip} ${styles.levelInter}`}>{ch.inter}</span>
                                        <span className={`${styles.levelChip} ${styles.levelAvanz}`}>{ch.avanz}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Session config */}
                <div className={styles.sessionCard}>
                    <div className={styles.sessionTitle}>La tua sessione</div>

                    {/* Difficulty */}
                    <div className={styles.sectionLabel}>Difficoltà</div>
                    <div className={styles.diffGrid}>
                        {(['base', 'intermedio', 'avanzato', 'mista'] as Difficulty[]).map((d) => (
                            <button
                                key={d}
                                className={`${styles.diffBtn} ${difficulty === d ? styles.diffBtnActive : ''}`}
                                onClick={() => setDifficulty(d)}
                            >
                                {d.charAt(0).toUpperCase() + d.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Question count */}
                    <div className={styles.sectionLabel}>Numero di domande</div>
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
                            onClick={() => setQuestionCount((c) => Math.min(50, c + 5))}
                        >
                            +
                        </button>
                    </div>
                    <div className={styles.stepNote}>
                        {availableCount} disponibili nei {selectedChapters.size} capitoli scelti (livello {difficulty})
                    </div>

                    {/* Timer */}
                    <div className={styles.timerRow}>
                        <span className={styles.timerIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 7v5l3.5 2" />
                            </svg>
                        </span>
                        <div className={styles.timerInfo}>
                            <div className={styles.timerLabel}>Timer</div>
                            <div className={styles.timerMeta}>~{estimatedMinutes} min · 1:30 a domanda</div>
                        </div>
                        <button
                            className={`${styles.toggle} ${timerEnabled ? styles.toggleOn : ''}`}
                            onClick={() => setTimerEnabled(!timerEnabled)}
                        >
                            <span className={styles.toggleKnob} />
                        </button>
                    </div>

                    {/* Start */}
                    <button
                        className={styles.startBtn}
                        onClick={onStart}
                        disabled={selectedChapters.size === 0}
                    >
                        Avvia allenamento
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06302c" strokeWidth="2.6">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
