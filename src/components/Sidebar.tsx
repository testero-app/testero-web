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
        <aside className="a-sidebar">
            {/* Progress */}
            <div>
                <div className="a-progress-block">
                    <div>
                        <div className="a-progress-num">
                            {answeredCount}<span className="a-progress-total"> / {totalQuestions}</span>
                        </div>
                        <div className="a-progress-label" style={{ marginTop: 4 }}>Risposte date</div>
                    </div>
                    <div className="a-progress-label" style={{ textAlign: 'right' }}>{pct}%</div>
                </div>
                <div className="a-progress-bar">
                    <div className="a-progress-fill" style={{ width: `${pct}%` }}></div>
                </div>
            </div>

            {/* Grid */}
            <div className="a-grid-section">
                <div className="a-grid-label">
                    <span>Domande</span>
                    <span style={{ color: 'var(--ink-soft, #3a3c37)' }}>{totalQuestions}</span>
                </div>
                <div className="a-grid">
                    {Array.from({ length: totalQuestions }, (_, i) => {
                        let cls = 'a-cell';
                        if (i === currentIndex) cls += ' current';
                        else if (answeredSet.has(i)) cls += ' answered';
                        return (
                            <div key={i} className={cls} onClick={() => onGoTo(i)}>
                                {i + 1}
                            </div>
                        );
                    })}
                </div>
                <div className="a-legend">
                    <span className="a-legend-item"><span className="a-lg a-lg-current"></span>Corrente</span>
                    <span className="a-legend-item"><span className="a-lg a-lg-answered"></span>Risposta</span>
                    <span className="a-legend-item"><span className="a-lg a-lg-empty"></span>Vuota</span>
                </div>
            </div>

            {/* Nav */}
            <div className="a-nav-row">
                <button className="a-nav-btn" disabled={currentIndex === 0} onClick={onPrev}>
                    <span className="a-arrow">&#8592;</span> Precedente
                </button>
                <button className="a-nav-btn" disabled={currentIndex === totalQuestions - 1} onClick={onNext}>
                    Successiva <span className="a-arrow">&#8594;</span>
                </button>
            </div>

            {/* Submit */}
            <div className="a-submit-block">
                <button className="a-submit" onClick={onSubmit}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 8l3.5 3.5L13 5"/></svg>
                    Consegna test
                </button>
            </div>
        </aside>
    );
}
