import { useTranslations, useLocale } from 'next-intl';
import { useState, useRef, useEffect, useCallback } from 'react';
import { fetchUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../lib/api';
import styles from './NotificationPanel.module.css';

interface Notification {
    id: string;
    title: string;
    message: string;
    created_at: string;
}

interface NotificationPanelProps {
    token: string;
    count: number;
    onCountChange: () => void;
}

function formatTime(iso: string, t: (k: string, v?: Record<string, string | number | Date>) => string, locale: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return t('now');
    if (diffMin < 60) return t('minAgo', { n: diffMin });
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return t('hoursAgo', { n: diffH });
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return t('yesterday');
    if (diffD < 7) return t('daysAgo', { n: diffD });
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'it-IT', { day: 'numeric', month: 'short' });
}

export default function NotificationPanel({ token, count, onCountChange }: NotificationPanelProps) {
    const t = useTranslations('notifications');
    const locale = useLocale();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) close();
        };
        const keyHandler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        document.addEventListener('mousedown', handler);
        document.addEventListener('keydown', keyHandler);
        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('keydown', keyHandler);
        };
    }, [open, close]);

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchUnreadNotifications(token);
            setNotifications(Array.isArray(data) ? data : []);
        } catch {
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const handleToggle = useCallback(() => {
        setOpen((prev) => {
            if (!prev) loadNotifications();
            return !prev;
        });
    }, [loadNotifications]);

    const handleMarkOne = useCallback(async (id: string) => {
        await markNotificationAsRead(id, token);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        onCountChange();
    }, [token, onCountChange]);

    const handleMarkAll = useCallback(async () => {
        await markAllNotificationsAsRead(token);
        setNotifications([]);
        onCountChange();
    }, [token, onCountChange]);

    return (
        <div className={styles.wrapper} ref={ref}>
            <button
                className={styles.trigger}
                onClick={handleToggle}
                aria-expanded={open}
                aria-haspopup="true"
                aria-label={t('title')}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {count > 0 && <span className={styles.badge}>{count > 99 ? '99+' : count}</span>}
            </button>

            {open && (
                <div className={styles.dropdown} role="menu">
                    <div className={styles.header}>
                        <span className={styles.headerTitle}>{t('title')}</span>
                    </div>

                    <div className={styles.list}>
                        {loading && notifications.length === 0 && (
                            <div className={styles.empty}>{t('loading')}</div>
                        )}
                        {!loading && notifications.length === 0 && (
                            <div className={styles.empty}>{t('empty')}</div>
                        )}
                        {notifications.map((n) => (
                            <button
                                key={n.id}
                                className={styles.item}
                                role="menuitem"
                                onClick={() => handleMarkOne(n.id)}
                            >
                                <span className={styles.itemTitle}>{n.title}</span>
                                <span className={styles.itemMessage}>{n.message}</span>
                                <span className={styles.itemTime}>{formatTime(n.created_at, t, locale)}</span>
                            </button>
                        ))}
                    </div>

                    {notifications.length > 0 && (
                        <div className={styles.footer}>
                            <button className={styles.markAllBtn} onClick={handleMarkAll}>
                                Segna tutte come lette
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
