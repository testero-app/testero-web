import { TimerChip } from './ui';
import styles from './AssessmentHeader.module.css';

interface AssessmentHeaderProps {
    studentName: string;
    timerDisplay: string;
    timerWarning: boolean;
    remainingSeconds?: number;
}

export default function AssessmentHeader({ studentName, timerDisplay, remainingSeconds }: AssessmentHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.brand}>
                <span className={styles.logo}>&lt;/&gt;</span>
                <span>Testero</span>
            </div>
            <div className={styles.right}>
                <span className={styles.userName}>{studentName}</span>
                <TimerChip
                    display={timerDisplay}
                    remainingSeconds={remainingSeconds ?? 999}
                />
            </div>
        </header>
    );
}
