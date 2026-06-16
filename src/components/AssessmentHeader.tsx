import { useState, useRef, useEffect } from 'react';

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
    onGoTo?: (index: number) => void;
    onSubmit?: () => void;
}

const LogoMark = (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
        <path d="M17 17 L11 24 L17 31" stroke="#14b8a6" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M31 17 L37 24 L31 31" stroke="#14b8a6" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.5 24.5 L23 27 L28 20" stroke="#102a43" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const GridIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
);

export default function AssessmentHeader({
    assessmentTitle, timerDisplay, remainingSeconds,
    currentIndex = 0, totalQuestions = 0, answeredCount = 0,
    answeredSet, onGoTo, onSubmit,
}: AssessmentHeaderProps) {
    const [mapOpen, setMapOpen] = useState(false);
    const popRef = useRef<HTMLDivElement>(null);
    const pct = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

    const secs = remainingSeconds ?? 999;
    let timerBg = '#14b8a6';
    let timerColor = '#06302c';
    if (secs <= 60) { timerBg = '#e5484d'; timerColor = '#fff'; }
    else if (secs <= 300) { timerBg = '#f59e0b'; timerColor = '#3a2a00'; }

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
        <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#102a43' }}>
            {/* Inner bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 30px' }}>
                {/* Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <span style={{ width: 36, height: 36, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {LogoMark}
                        </span>
                        <b style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Testero</b>
                    </div>
                    <div style={{ width: 1, height: 22, background: '#2c4a64' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#9fc2cd' }}>{assessmentTitle || 'Verifica'}</span>
                </div>

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: '#9fc2cd' }}>
                        <b style={{ color: '#fff', fontWeight: 700 }}>{currentIndex + 1}</b> / {totalQuestions}
                    </span>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        background: timerBg, color: timerColor,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700, fontSize: 15, padding: '9px 15px', borderRadius: 11,
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={timerColor} strokeWidth="2.2">
                            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />
                        </svg>
                        {timerDisplay}
                    </span>

                    {/* Mappa domande button */}
                    <button
                        onClick={() => setMapOpen(!mapOpen)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 9,
                            background: '#16324a', border: '1px solid #2c4a64', color: '#fff',
                            fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14,
                            padding: '10px 16px', borderRadius: 11, cursor: 'pointer',
                        }}
                    >
                        {GridIcon}
                        Mappa
                    </button>

                    {/* Popover */}
                    {mapOpen && (
                        <div ref={popRef} style={{
                            position: 'absolute', top: 'calc(100% + 14px)', right: 0,
                            width: 430, background: '#fff', borderRadius: 20,
                            boxShadow: '0 24px 60px rgba(16,42,67,0.22)', padding: 24, zIndex: 300,
                        }}>
                            {/* Arrow */}
                            <div style={{
                                position: 'absolute', top: -9, right: 40,
                                width: 18, height: 18, background: '#fff',
                                transform: 'rotate(45deg)', borderRadius: 3,
                            }} />

                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
                                <b style={{ fontSize: 19, fontWeight: 800, color: '#102a43' }}>Mappa domande</b>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#8696a6' }}>
                                    {answeredCount}/{totalQuestions} date
                                </span>
                            </div>

                            {/* Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 9 }}>
                                {Array.from({ length: totalQuestions }, (_, i) => {
                                    let bg = '#fff'; let color = '#9aa6b2'; let border = '1.5px solid #e1e6ec';
                                    if (i === currentIndex) { bg = '#102a43'; color = '#fff'; border = '1.5px solid #102a43'; }
                                    else if (answeredSet?.has(i)) { bg = '#e6fcfa'; color = '#0e7c7b'; border = '1.5px solid #bfeee8'; }
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => { onGoTo?.(i); setMapOpen(false); }}
                                            style={{
                                                width: 52, height: 48, borderRadius: 11,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 16,
                                                background: bg, color, border, cursor: 'pointer',
                                            }}
                                        >
                                            {i + 1}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div style={{ display: 'flex', gap: 18, margin: '18px 0' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, color: '#334e68', fontWeight: 600 }}>
                                    <i style={{ width: 13, height: 13, borderRadius: '50%', background: '#102a43', display: 'inline-block' }} />Corrente
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, color: '#334e68', fontWeight: 600 }}>
                                    <i style={{ width: 13, height: 13, borderRadius: '50%', background: '#14b8a6', display: 'inline-block' }} />Risposta
                                </span>
                            </div>

                            {/* Consegna test */}
                            <button
                                onClick={() => { setMapOpen(false); onSubmit?.(); }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                                    width: '100%', background: '#102a43', color: '#fff', border: 'none',
                                    fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15,
                                    padding: 15, borderRadius: 13, cursor: 'pointer',
                                }}
                            >
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.6"><path d="M5 12l5 5L20 6" /></svg>
                                Consegna test
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress bar (4px) */}
            <div style={{ height: 4, background: '#1c3a54' }}>
                <div style={{ height: '100%', background: '#14b8a6', width: `${pct}%`, transition: 'width 0.3s' }} />
            </div>
        </div>
    );
}
