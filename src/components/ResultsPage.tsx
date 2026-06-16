import { useEffect } from 'react';
import { TQuestion, TOption, TAnswer, TAnswerResult } from '../context/AssessmentContext';
import TopBar from './layout/TopBar';

interface ResultsPageProps {
    shuffledQuestions: TQuestion[];
    shuffledOptions: TOption[][];
    answers: Record<string, TAnswer>;
    answerResults: TAnswerResult[];
    assessmentTitle?: string;
    onBackToAssessments: () => void;
    onRedownload: () => void;
    zipName?: string;
}

/* Donut SVG */
function Donut({ score, maxScore }: { score: number; maxScore: number }) {
    const r = 62;
    const circumference = 2 * Math.PI * r;
    const pct = maxScore > 0 ? score / maxScore : 0;
    const arc = pct * circumference;

    return (
        <div style={{ position: 'relative', width: 150, height: 150, marginBottom: 20 }}>
            <svg width="150" height="150" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r={r} fill="none" stroke="#e6eef0" strokeWidth="14" />
                <circle cx="75" cy="75" r={r} fill="none" stroke="#14b8a6" strokeWidth="14"
                    strokeLinecap="round" strokeDasharray={`${arc} ${circumference}`}
                    transform="rotate(-90 75 75)" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', color: '#102a43', lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: 12.5, color: '#8696a6', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>/ {maxScore} pt</span>
            </div>
        </div>
    );
}

/* Topic card */
function TopicCard({ name, earned, available }: { name: string; earned: number; available: number }) {
    const pct = available > 0 ? Math.round((earned / available) * 100) : 0;
    const isWeak = pct < 60;

    return (
        <div style={{
            border: `1px solid ${isWeak ? '#f6dfc4' : '#eef1f4'}`,
            borderRadius: 11, padding: '14px 15px',
            background: isWeak ? '#fffaf2' : '#fff',
        }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 11, gap: 8 }}>
                <span style={{ fontSize: 13.5, color: isWeak ? '#9a5a08' : '#334e68', fontWeight: isWeak ? 700 : 600 }}>{name}</span>
                <span style={{ fontSize: 12.5, fontFamily: "'JetBrains Mono', monospace", color: isWeak ? '#c47308' : '#0e7c7b', fontWeight: 700 }}>
                    {earned}<span style={{ color: isWeak ? '#d9b07a' : '#b3c0cc' }}>/{available} pt</span>
                </span>
            </div>
            <div style={{ height: 6, background: isWeak ? '#f3e4cf' : '#eef1f4', borderRadius: 99 }}>
                <span style={{ display: 'block', height: 6, borderRadius: 99, background: isWeak ? '#f59e0b' : '#14b8a6', width: `${pct}%` }} />
            </div>
        </div>
    );
}

export default function ResultsPage({
    shuffledQuestions,
    answers,
    answerResults,
    assessmentTitle,
    onBackToAssessments,
    onRedownload,
}: ResultsPageProps) {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const resultMap = new Map(answerResults.map(r => [r.question_snapshot_id, r]));

    // Stats
    const mcQuestions = shuffledQuestions.filter(q => q.type === 'multiple');
    const correctCount = mcQuestions.filter(q => resultMap.get(q.id)?.is_correct === true).length;
    const totalQ = mcQuestions.length;

    // Points: use points_awarded if available, else 1pt per correct
    const score = answerResults.reduce((sum, r) => {
        const pts = (r as Record<string, unknown>).points_awarded;
        if (typeof pts === 'number') return sum + pts;
        return sum + (r.is_correct ? 1 : 0);
    }, 0);
    const maxScore = totalQ; // simplified — ideally from BE max_score

    // Subject scores from BE (if available)
    const subjectScores = ((answerResults as unknown as Record<string, unknown>[])?.[0] as Record<string, unknown>)?.subject_scores as
        { subject_id: string; label: string; points_earned: number; points_available: number }[] | undefined;

    // Duration
    const startedAt = (answerResults as unknown as Record<string, unknown>)?.started_at as string | undefined;
    const submittedAt = (answerResults as unknown as Record<string, unknown>)?.submitted_at as string | undefined;
    let duration = '--:--';
    if (startedAt && submittedAt) {
        const diff = Math.round((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 1000);
        const m = Math.floor(diff / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        duration = `${m}:${s}`;
    }

    const passed = correctCount / totalQ >= 0.6;

    return (
        <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
            <TopBar userName="" onLogout={onBackToAssessments} />

            <div style={{ padding: 30, display: 'grid', gridTemplateColumns: '348px 1fr', gap: 20, maxWidth: 1280, margin: '0 auto' }}>

                {/* LEFT: Summary */}
                <div style={{ background: '#fff', border: '1px solid #e1e6ec', borderRadius: 14, padding: '30px 28px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Donut score={Math.round(score)} maxScore={maxScore} />

                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: passed ? '#e6fcfa' : '#fdeded',
                        color: passed ? '#0e7c7b' : '#c0353a',
                        fontWeight: 800, fontSize: 15, padding: '10px 20px', borderRadius: 99,
                    }}>
                        {passed ? (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0e7c7b" strokeWidth="3"><path d="M5 12l5 5L20 6" /></svg>
                        ) : (
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c0353a" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        )}
                        {passed ? 'Superato' : 'Non superato'}
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 26, marginTop: 26, paddingTop: 24, borderTop: '1px solid #eef1f4', width: '100%', justifyContent: 'center' }}>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#102a43' }}>{correctCount}/{totalQ}</div>
                            <div style={{ fontSize: 11, color: '#9aa6b2', fontWeight: 600 }}>Domande</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#0e7c7b' }}>{Math.round(score)}</div>
                            <div style={{ fontSize: 11, color: '#9aa6b2', fontWeight: 600 }}>Punti</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#102a43' }}>{duration}</div>
                            <div style={{ fontSize: 11, color: '#9aa6b2', fontWeight: 600 }}>Tempo</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Per-topic detail */}
                <div style={{ background: '#fff', border: '1px solid #e1e6ec', borderRadius: 14, padding: '28px 30px' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#102a43', marginBottom: 22 }}>
                        {assessmentTitle || 'Risultati del test'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#9aa6b2' }}>Per argomento</span>
                        <span style={{ fontSize: 11.5, color: '#8696a6' }}>punti ottenuti / disponibili</span>
                    </div>

                    {/* Topic grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 26 }}>
                        {subjectScores && subjectScores.length > 0 ? (
                            subjectScores.map(s => (
                                <TopicCard key={s.subject_id} name={s.label} earned={s.points_earned} available={s.points_available} />
                            ))
                        ) : (
                            /* Fallback: single topic from all questions */
                            <TopicCard name="Generale" earned={Math.round(score)} available={maxScore} />
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 11 }}>
                        <button
                            onClick={onRedownload}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: '#102a43', color: '#fff', border: 'none',
                                fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14,
                                padding: '13px 22px', borderRadius: 11, cursor: 'pointer',
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.4">
                                <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-7 3.3" /><path d="M3 4v4h4" />
                            </svg>
                            Rivedi gli errori
                        </button>
                        <button
                            onClick={onBackToAssessments}
                            style={{
                                background: '#fff', color: '#0e7c7b',
                                border: '1.5px solid #14b8a6',
                                fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14,
                                padding: '12px 22px', borderRadius: 11, cursor: 'pointer',
                            }}
                        >
                            Torna alle verifiche
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
