import { Button, ProgressBar } from './ui';
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
                <Button variant="ghost" size="sm" disabled={currentIndex === 0} onClick={onPrev}>
                    &larr; Precedente
                </Button>
                <Button variant="ghost" size="sm" disabled={currentIndex === totalQuestions - 1} onClick={onNext}>
                    Successiva &rarr;
                </Button>
            </div>

            {/* Submit */}
            <div className={styles.submitBlock}>
                <Button variant="primary" fullWidth onClick={onSubmit}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 8l3.5 3.5L13 5" /></svg>
                    Consegna test
                </Button>
            </div>
        </aside>
    );
}
