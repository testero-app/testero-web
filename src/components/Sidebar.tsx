interface SidebarProps {
    totalQuestions: number;
    currentIndex: number;
    answeredSet: Set<number>;
    answeredCount: number;
    onGoTo: (index: number) => void;
    onPrev: () => void;
    onNext: () => void;
    onSubmit: () => void;
}

export default function Sidebar({
    totalQuestions,
    currentIndex,
    answeredSet,
    answeredCount,
    onGoTo,
    onPrev,
    onNext,
    onSubmit
}: SidebarProps) {
    const pct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    const remaining = totalQuestions - answeredCount;

    return (
        <aside className="t-sidebar">
            {/* Progress */}
            <div>
                <div className="t-progress-block">
                    <div>
                        <div className="t-progress-num">
                            {answeredCount}<span className="t-progress-total"> / {totalQuestions}</span>
                        </div>
                        <div className="t-progress-label" style={{ marginTop: 4 }}>Risposte date</div>
                    </div>
                    <div className="t-progress-label" style={{ textAlign: 'right' }}>{pct}%</div>
                </div>
                <div className="t-progress-bar">
                    <div className="t-progress-fill" style={{ width: `${pct}%` }}></div>
                </div>
            </div>

            {/* Grid */}
            <div className="t-grid-section">
                <div className="t-grid-label">
                    <span>Domande</span>
                    <span style={{ color: 'var(--ink-soft, #3a3c37)' }}>{totalQuestions}</span>
                </div>
                <div className="t-grid">
                    {Array.from({ length: totalQuestions }, (_, i) => {
                        let cls = 't-cell';
                        if (i === currentIndex) cls += ' current';
                        else if (answeredSet.has(i)) cls += ' answered';
                        return (
                            <div key={i} className={cls} onClick={() => onGoTo(i)}>
                                {i + 1}
                            </div>
                        );
                    })}
                </div>
                <div className="t-legend">
                    <span className="t-legend-item"><span className="t-lg t-lg-current"></span>Corrente</span>
                    <span className="t-legend-item"><span className="t-lg t-lg-answered"></span>Risposta</span>
                    <span className="t-legend-item"><span className="t-lg t-lg-empty"></span>Vuota</span>
                </div>
            </div>

            {/* Nav */}
            <div className="t-nav-row">
                <button className="t-nav-btn" disabled={currentIndex === 0} onClick={onPrev}>
                    <span className="t-arrow">&#8592;</span> Precedente
                </button>
                <button className="t-nav-btn" disabled={currentIndex === totalQuestions - 1} onClick={onNext}>
                    Successiva <span className="t-arrow">&#8594;</span>
                </button>
            </div>

            {/* Submit */}
            <div className="t-submit-block">
                <button className="t-submit" onClick={onSubmit}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 8l3.5 3.5L13 5"/></svg>
                    Consegna test
                </button>
            </div>
        </aside>
    );
}
