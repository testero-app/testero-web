import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './AccountMenu.module.css';

interface AccountMenuProps {
    userName: string;
    userClass?: string;
    onProfile: () => void;
    onSettings: () => void;
    onLogout: () => void;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return parts[0][0] + parts[parts.length - 1][0];
    return name.slice(0, 2);
}

export default function AccountMenu({ userName, userClass, onProfile, onSettings, onLogout }: AccountMenuProps) {
    const t = useTranslations('accountMenu');
    const [open, setOpen] = useState(false);
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

    return (
        <div className={styles.wrapper} ref={ref}>
            <button
                className={styles.trigger}
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-haspopup="true"
            >
                <span className={styles.triggerAvatar}>{getInitials(userName)}</span>
                <span className={styles.triggerInfo}>
                    <span className={styles.triggerName}>{userName}</span>
                    <span className={styles.triggerRole}>{t('student')}</span>
                </span>
                <svg
                    className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {open && (
                <div className={styles.dropdown} role="menu">
                    <div className={styles.header}>
                        <span className={styles.headerAvatar}>{getInitials(userName)}</span>
                        <div className={styles.headerInfo}>
                            <span className={styles.headerName}>{userName}</span>
                            {userClass && (
                                <span className={styles.headerMeta}>{userClass}</span>
                            )}
                        </div>
                    </div>

                    <div className={styles.divider} />

                    <button className={styles.menuItem} role="menuitem" onClick={() => { close(); onProfile(); }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ts-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>{t('profile')}</span>
                    </button>

                    <button className={styles.menuItem} role="menuitem" onClick={() => { close(); onSettings(); }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>{t('settings')}</span>
                    </button>

                    <div className={styles.divider} />

                    <button className={`${styles.menuItem} ${styles.menuItemDanger}`} role="menuitem" onClick={() => { close(); onLogout(); }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>{t('logout')}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
