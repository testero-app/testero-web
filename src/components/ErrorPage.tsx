import { Button } from './ui';
import styles from './ErrorPage.module.css';

interface ErrorPageProps {
    code?: string;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    refCode?: string;
}

export default function ErrorPage({ code, title, message, actionLabel = 'Torna alla home', onAction, refCode }: ErrorPageProps) {
    return (
        <div className={styles.page}>
            <div className={styles.card}>
                {code && <div className={styles.code}>{code}</div>}
                <div className={styles.icon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.message}>{message}</p>
                {onAction && <Button variant="accent" onClick={onAction}>{actionLabel}</Button>}
                {refCode && <p className={styles.refCode}>REF-{refCode}</p>}
            </div>
        </div>
    );
}
