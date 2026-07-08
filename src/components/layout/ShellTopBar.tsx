import AccountMenu from './AccountMenu';
import NotificationPanel from './NotificationPanel';
import styles from './ShellTopBar.module.css';

interface ShellTopBarProps {
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
    pageIcon, pageTitle, pageSubtitle,
    userName, userClass, token, notificationCount, onNotificationCountChange,
    onProfile, onSettings, onLogout,
}: ShellTopBarProps) {
    return (
        <header className={styles.topbar}>
            <div className={styles.left}>
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
