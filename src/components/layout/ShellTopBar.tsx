import { useTranslations } from 'use-intl';
import AccountMenu from './AccountMenu';
import NotificationPanel from './NotificationPanel';
import styles from './ShellTopBar.module.css';

interface ShellTopBarProps {
    /** Opens the navigation drawer. The trigger is only visible below 1024px. */
    onMenuClick: () => void;
    sidebarOpen: boolean;
    pageIcon: React.ReactNode;
    pageTitle: string;
    pageSubtitle: string;
    userName: string;
    userClass?: string;
    token: string;
    notificationCount: number;
    onNotificationCountChange: () => void;
    onProfile: () => void;
    onSettings: () => void;
    onLogout: () => void;
}

export default function ShellTopBar({
    onMenuClick, sidebarOpen,
    pageIcon, pageTitle, pageSubtitle,
    userName, userClass, token, notificationCount, onNotificationCountChange,
    onProfile, onSettings, onLogout,
}: ShellTopBarProps) {
    const t = useTranslations('shell');
    return (
        <header className={styles.topbar}>
            <div className={styles.left}>
                <button
                    type="button"
                    className={styles.menuButton}
                    onClick={onMenuClick}
                    aria-label={t('menuLabel')}
                    aria-expanded={sidebarOpen}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div className={styles.iconTile}>{pageIcon}</div>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>{pageTitle}</h1>
                    <span className={styles.subtitle}>{pageSubtitle}</span>
                </div>
            </div>
            <div className={styles.right}>
                <NotificationPanel token={token} count={notificationCount} onCountChange={onNotificationCountChange} />
                <AccountMenu
                    userName={userName}
                    userClass={userClass}
                    onProfile={onProfile}
                    onSettings={onSettings}
                    onLogout={onLogout}
                />
            </div>
        </header>
    );
}
