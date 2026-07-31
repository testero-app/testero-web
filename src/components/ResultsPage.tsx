import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { TSubjectScore } from '../types/domain';
import styles from './ResultsPage.module.css';

/**
 * Everything shown on this page comes from the backend: score, maxScore and
 * passed are the authoritative values it computed for the submission. The page
 * only formats them — it never re-derives a score or a pass threshold.
 */
export interface ResultsSummary {
    score: number;
    maxScore: number;
    correctCount: number;
    totalQuestions: number;
    passed: boolean;
    duration: string;
    subjectScores?: TSubjectScore[];
}

interface ResultsPageProps {
    summary: ResultsSummary;
    assessmentTitle?: string;
    onBackToAssessments: () => void;
    onReviewErrors?: () => void;
}

/* ── Logo SVG (same mark used in TopBar) ─────────────────────────── */

const LogoMark = (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="11" fill="#fff" />
        <path d="M17 17 L11 24 L17 31" stroke="#14b8a6" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M31 17 L37 24 L31 31" stroke="#14b8a6" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.5 24.5 L23 27 L28 20" stroke="#102a43" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* ── Donut chart ─────────────────────────────────────────────────── */

function Donut({ score, maxScore }: { score: number; maxScore: number }) {
    const r = 62;
    const circumference = 2 * Math.PI * r;
    const pct = maxScore > 0 ? score / maxScore : 0;
    const arc = pct * circumference;

    return (
        <div className={styles.donutWrap}>
            <svg width="150" height="150" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r={r} fill="none" stroke="#e6eef0" strokeWidth="14" />
                <circle cx="75" cy="75" r={r} fill="none" stroke="#14b8a6" strokeWidth="14"
                    strokeLinecap="round" strokeDasharray={`${arc} ${circumference}`}
                    transform="rotate(-90 75 75)" />
            </svg>
            <div className={styles.donutCenter}>
                <span className={styles.donutScore}>{score}</span>
                <span className={styles.donutMax}>/ {maxScore} pt</span>
            </div>
        </div>
    );
}

/* ── Topic card ──────────────────────────────────────────────────── */

function TopicCard({ name, earned, available }: { name: string; earned: number; available: number }) {
    const pct = available > 0 ? Math.round((earned / available) * 100) : 0;
    const isWeak = pct < 60;

    return (
        <div className={isWeak ? styles.topicCardWeak : styles.topicCard}>
            <div className={styles.topicHeader}>
                <span className={isWeak ? styles.topicNameWeak : styles.topicName}>{name}</span>
                <span className={isWeak ? styles.topicPointsWeak : styles.topicPoints}>
                    {earned}<span className={isWeak ? styles.topicPointsSuffixWeak : styles.topicPointsSuffix}>/{available} pt</span>
                </span>
            </div>
            <div className={isWeak ? styles.progressTrackWeak : styles.progressTrack}>
                <span className={isWeak ? styles.progressFillWeak : styles.progressFill} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

/* ── Main component ──────────────────────────────────────────────── */

export default function ResultsPage({
    summary,
    assessmentTitle,
    onBackToAssessments,
    onReviewErrors,
}: ResultsPageProps) {
    const t = useTranslations('results');
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const {
        score,
        maxScore,
        correctCount,
        totalQuestions: totalQ,
        passed,
        duration,
        subjectScores,
    } = summary;

    return (
        <div className={styles.page}>
            {/* ── Header ──────────────────────────────────────────── */}
            <header className={styles.header}>
                <div className={styles.brand}>
                    {LogoMark}
                    <span className={styles.brandText}>Testero</span>
                </div>
                <button className={styles.backBtn} onClick={onBackToAssessments}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    I miei risultati
                </button>
            </header>

            {/* ── Body grid ───────────────────────────────────────── */}
            <div className={styles.body}>

                {/* LEFT: Summary card */}
                <div className={styles.leftPanel}>
                    <Donut score={Math.round(score)} maxScore={maxScore} />

                    {/* Pass/fail badge */}
                    <div className={passed ? styles.badgePass : styles.badgeFail}>
                        {passed ? (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0e7c7b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12l5 5L20 6" />
                            </svg>
                        ) : (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c0353a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        )}
                        {passed ? t('passed') : t('notPassed')}
                    </div>

                    {/* Stats row */}
                    <div className={styles.statsRow}>
                        <div>
                            <div className={styles.statValue}>{correctCount}/{totalQ}</div>
                            <div className={styles.statLabel}>{t('statQuestions')}</div>
                        </div>
                        <div>
                            <div className={styles.statValueTeal}>{Math.round(score)}</div>
                            <div className={styles.statLabel}>{t('statPoints')}</div>
                        </div>
                        <div>
                            <div className={styles.statValue}>{duration}</div>
                            <div className={styles.statLabel}>{t('statTime')}</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Per-topic detail */}
                <div className={styles.rightPanel}>
                    <div className={styles.title}>
                        {assessmentTitle || t('title')}
                    </div>

                    <div className={styles.eyebrowRow}>
                        <span className={styles.eyebrow}>{t('bySubject')}</span>
                        <span className={styles.eyebrowHint}>{t('pointsHint')}</span>
                    </div>

                    {/* Topic grid */}
                    <div className={styles.topicGrid}>
                        {subjectScores && subjectScores.length > 0 ? (
                            subjectScores.map(s => (
                                <TopicCard key={s.subject_id} name={s.label} earned={s.points_earned} available={s.points_available} />
                            ))
                        ) : (
                            /* Fallback: single topic from all questions */
                            <TopicCard name="Generale" earned={Math.round(score)} available={maxScore} />
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className={styles.actions}>
                        <button className={styles.btnReview} onClick={onReviewErrors}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-7 3.3" /><path d="M3 4v4h4" />
                            </svg>
                            Rivedi gli errori
                        </button>
                        <button className={styles.btnBack} onClick={onBackToAssessments}>
                            Torna all&apos;allenamento
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
