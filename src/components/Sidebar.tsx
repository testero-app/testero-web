import { ProgressBar } from './ui';
import styles from './Sidebar.module.css';

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
    onSubmit,
}: SidebarProps) {
    const pct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

    return (
        <aside className={styles.sidebar}>
            {/* Progress */}
            <div>
                <div className={styles.progressBlock}>
                    <div>
                        <div className={styles.progressNum}>
                            {answeredCount}<span className={styles.progressTotal}> / {totalQuestions}</span>
                        </div>
                        <div className={styles.progressLabel}>Risposte date</div>
                    </div>
                    <span className={styles.progressPct}>{pct}%</span>
                </div>
                <ProgressBar value={pct} />
            </div>

            {/* Grid */}
            <div className={styles.gridSection}>
                <div className={styles.gridLabel}>
                    <span>Domande</span>
                    <span>{totalQuestions}</span>
                </div>
                <div className={styles.grid}>
                    {Array.from({ length: totalQuestions }, (_, i) => {
                        let cellClass = styles.cell;
                        if (i === currentIndex) cellClass += ` ${styles.cellCurrent}`;
                        else if (answeredSet.has(i)) cellClass += ` ${styles.cellAnswered}`;
                        return (
                            <div key={i} className={cellClass} onClick={() => onGoTo(i)}>
                                {i + 1}
                            </div>
                        );
                    })}
                </div>
                <div className={styles.legend}>
                    <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.legendCurrent}`} />Corrente</span>
                    <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.legendAnswered}`} />Risposta</span>
                    <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.legendEmpty}`} />Vuota</span>
                </div>
            </div>

            {/* Nav */}
            <div className={styles.navRow}>
                <span
                    className={styles.navLink}
                    style={{ color: currentIndex === 0 ? '#b0bcc8' : '#0e7c7b', cursor: currentIndex === 0 ? 'default' : 'pointer' }}
                    onClick={currentIndex === 0 ? undefined : onPrev}
                >
                    &larr; Precedente
                </span>
                <span
                    className={styles.navLink}
                    style={{ color: currentIndex === totalQuestions - 1 ? '#b0bcc8' : '#0e7c7b', cursor: currentIndex === totalQuestions - 1 ? 'default' : 'pointer' }}
                    onClick={currentIndex === totalQuestions - 1 ? undefined : onNext}
                >
                    Successiva &rarr;
                </span>
            </div>

            {/* Submit */}
            <div className={styles.submitBlock}>
                <button className="ts-btn ts-btn--dark ts-btn--block" onClick={onSubmit}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.6"><path d="M5 12l5 5L20 6" /></svg>
                    Consegna test
                </button>
            </div>
        </aside>
    );
}
