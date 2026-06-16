import { ReactNode } from 'react';
import styles from './PageShell.module.css';

interface PageShellProps {
    children: ReactNode;
    maxWidth?: 'narrow' | 'default' | 'wide';
    className?: string;
}

export default function PageShell({ children, maxWidth = 'default', className }: PageShellProps) {
    const contentClasses = [
        styles.content,
        maxWidth !== 'default' && styles[maxWidth],
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={styles.shell}>
            <div className={contentClasses}>{children}</div>
        </div>
    );
}
