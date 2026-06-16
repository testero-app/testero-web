import styles from './ProgressBar.module.css';

interface ProgressBarProps {
    value: number;
    variant?: 'teal' | 'warning' | 'danger';
    className?: string;
}

export default function ProgressBar({ value, variant = 'teal', className }: ProgressBarProps) {
    const clamped = Math.max(0, Math.min(100, value));
    const classes = [styles.track, className].filter(Boolean).join(' ');

    return (
        <div className={classes} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
            <div
                className={`${styles.fill} ${styles[variant]}`}
                style={{ width: `${clamped}%` }}
            />
        </div>
    );
}
