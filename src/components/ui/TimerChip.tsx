import styles from './TimerChip.module.css';

type TimerTier = 'normal' | 'warning' | 'critical';

interface TimerChipProps {
    display: string;
    remainingSeconds: number;
    className?: string;
}

function getTier(seconds: number): TimerTier {
    if (seconds <= 60) return 'critical';
    if (seconds <= 300) return 'warning';
    return 'normal';
}

export default function TimerChip({ display, remainingSeconds, className }: TimerChipProps) {
    const tier = getTier(remainingSeconds);
    const classes = [styles.chip, styles[tier], className].filter(Boolean).join(' ');

    return (
        <div className={classes} aria-label={`Tempo rimanente: ${display}`}>
            <svg className={styles.icon} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5.5V8.5L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M6.5 2.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>{display}</span>
        </div>
    );
}
