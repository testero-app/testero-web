import { useState, type ReactNode } from 'react';
import styles from './StudentHub.module.css';

type TabId = 'allenamento' | 'certificazioni' | 'risultati';

interface StudentHubProps {
    activeTab?: TabId;
    title: string;
    subtitle: string | ReactNode;
    subtitleIcon?: ReactNode;
    tabs: { id: TabId; label: string; icon?: ReactNode }[];
    children: ReactNode;
    onTabChange: (tab: TabId) => void;
}

export default function StudentHub({
    activeTab = 'allenamento',
    title,
    subtitle,
    subtitleIcon,
    tabs,
    children,
    onTabChange,
}: StudentHubProps) {
    return (
        <div className={styles.body}>
            <div className={styles.inner}>
                <div className={styles.title}>{title}</div>
                <div className={styles.subtitle}>
                    {subtitleIcon}
                    {subtitle}
                </div>

                <div className={styles.tabs}>
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
                            onClick={() => onTabChange(t.id)}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className={styles.tabContent} key={activeTab}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export type { TabId };
