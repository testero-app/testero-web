import { ReactNode } from 'react';
import styles from './Badge.module.css';

type BadgeVariant = 'avvia' | 'inCorso' | 'completato' | 'nuovo' | 'scaduto' | 'superato' | 'nonSuperato';

interface BadgeProps {
    variant: BadgeVariant;
    children: ReactNode;
    className?: string;
}

export default function Badge({ variant, children, className }: BadgeProps) {
    const classes = [styles.badge, styles[variant], className].filter(Boolean).join(' ');
    return <span className={classes}>{children}</span>;
}
