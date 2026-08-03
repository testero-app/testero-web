import { useTranslations } from 'use-intl';
import { useState, useRef, useEffect } from 'react';
import TesteroLogo from './ui/TesteroLogo';
import styles from './AssessmentHeader.module.css';

interface AssessmentHeaderProps {
    studentName: string;
    assessmentTitle?: string;
    timerDisplay: string;
    timerWarning: boolean;
    remainingSeconds?: number;
    currentIndex?: number;
    totalQuestions?: number;
    answeredCount?: number;
    answeredSet?: Set<number>;
    flagged?: Record<string, boolean>;
    questionIds?: string[];
    onGoTo?: (index: number) => void;
    onSubmit?: () => void;
}

export default function AssessmentHeader({
    assessmentTitle, timerDisplay, remainingSeconds,
    currentIndex = 0, totalQuestions = 0, answeredCount = 0,
    answeredSet, flagged = {}, questionIds = [],
    onGoTo, onSubmit,
}: AssessmentHeaderProps) {
    const t = useTranslations('assessment');
    const [mapOpen, setMapOpen] = useState(false);
    const popRef = useRef<HTMLDivElement>(null);
    const pct = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

    const secs = remainingSeconds ?? 999;
    let timerClass = styles.timer;
    if (secs <= 60) timerClass += ` ${styles.timerDanger}`;
    else if (secs <= 300) timerClass += ` ${styles.timerWarning}`;

    // Close popover on outside click
    useEffect(() => {
        if (!mapOpen) return;
        const handler = (e: MouseEvent) => {
            if (popRef.current && !popRef.current.contains(e.target as Node)) setMapOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [mapOpen]);

    return (
        <div className={styles.header}>
            {/* Inner bar */}
            <div className={styles.inner}>
                {/* Left */}
                <div className={styles.left}>
                    <div className={styles.brand}>
                        <span className={styles.brandMark}>
                            <TesteroLogo size={22} />
                        </span>
                        <b className={styles.brandName}>Testero</b>
                    </div>
                    <div className={styles.sep} />
                    <span className={styles.crumb}>{assessmentTitle || t('crumbDefault')}</span>
                </div>

                {/* Right */}
                <div className={styles.right}>
                    <span className={styles.counter}>
                        <b>{currentIndex + 1}</b> / {totalQuestions}
                    </span>
                    <span className={timerClass}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />
                        </svg>
                        {timerDisplay}
                    </span>

                    {/* Question map button */}
                    <button className={styles.mapBtn} onClick={() => setMapOpen(!mapOpen)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                        Mappa domande
                    </button>

                    {/* Popover */}
                    {mapOpen && (
                        <div ref={popRef} className={styles.pop}>
                            <div className={styles.popArrow} />

                            <div className={styles.popHead}>
                                <b>{t('mapQuestions')}</b>
                                <span>{answeredCount}/{totalQuestions} date</span>
                            </div>

                            <div className={styles.popGrid}>
                                {Array.from({ length: totalQuestions }, (_, i) => {
                                    const qId = questionIds[i];
                                    const isCurrent = i === currentIndex;
                                    const isFlagged = qId ? !!flagged[qId] : false;
                                    const isAnswered = answeredSet?.has(i) ?? false;

                                    let chipClass = styles.qchip;
                                    if (isCurrent) chipClass += ` ${styles.qchipCur}`;
                                    else if (isFlagged) chipClass += ` ${styles.qchipRev}`;
                                    else if (isAnswered) chipClass += ` ${styles.qchipAns}`;

                                    return (
                                        <div
                                            key={i}
                                            className={chipClass}
                                            onClick={() => { onGoTo?.(i); setMapOpen(false); }}
                                        >
                                            {i + 1}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={styles.popLegend}>
                                <span><i style={{ background: '#102a43' }} />{t('legendCurrent')}</span>
                                <span><i style={{ background: '#14b8a6' }} />{t('legendAnswered')}</span>
                                <span><i style={{ background: '#f59e0b' }} />{t('legendFlagged')}</span>
                            </div>

                            <button
                                className={styles.popSubmitBtn}
                                onClick={() => { setMapOpen(false); onSubmit?.(); }}
                            >
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.6">
                                    <path d="M5 12l5 5L20 6" />
                                </svg>
                                Consegna test
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress bar (4px) */}
            <div className={styles.progress}>
                <div className={styles.progressFill} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
