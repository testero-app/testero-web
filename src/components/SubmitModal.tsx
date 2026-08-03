import { useTranslations } from 'use-intl';
import styles from './SubmitModal.module.css';

interface SubmitModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    answeredCount: number;
    totalQuestions: number;
}

export default function SubmitModal({
    open,
    onClose,
    onConfirm,
    answeredCount,
    totalQuestions,
}: SubmitModalProps) {
    const t = useTranslations('modals');
    if (!open) return null;

    const unansweredCount = totalQuestions - answeredCount;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                {/* Warning icon */}
                <div className={styles.iconWrap}>
                    <div className={styles.iconCircle}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                </div>

                {/* Title & subtitle */}
                <h2 className={styles.title}>{t('submitTitle')}</h2>
                <p className={styles.subtitle}>
                    Una volta consegnato non potrai più modificare le risposte.
                </p>

                {/* Stat boxes */}
                <div className={styles.statsRow}>
                    <div className={`${styles.statBox} ${styles.statBoxAnswered}`}>
                        <div className={`${styles.statNumber} ${styles.statNumberAnswered}`}>
                            {answeredCount}
                        </div>
                        <div className={styles.statLabel}>{t('answeredCount')}</div>
                    </div>
                    <div className={`${styles.statBox} ${styles.statBoxUnanswered}`}>
                        <div className={`${styles.statNumber} ${styles.statNumberUnanswered}`}>
                            {unansweredCount}
                        </div>
                        <div className={styles.statLabel}>{t('unansweredCount')}</div>
                    </div>
                </div>

                {/* Warning note */}
                <div className={styles.warningNote}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Le domande vuote risulteranno errate.
                </div>

                {/* Action buttons */}
                <div className={styles.actions}>
                    <button className={styles.btnContinue} onClick={onClose}>
                        Continua il test
                    </button>
                    <button className={styles.btnSubmit} onClick={onConfirm}>
                        Consegna definitivamente
                    </button>
                </div>
            </div>
        </div>
    );
}
