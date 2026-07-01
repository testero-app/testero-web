import AccountMenu from './AccountMenu';
import styles from './ShellTopBar.module.css';

interface ShellTopBarProps {
    pageIcon: React.ReactNode;
    pageTitle: string;
    pageSubtitle: string;
    userName: string;
    userClass?: string;
    onProfile: () => void;
    onSettings: () => void;
    onLogout: () => void;
}

export default function ShellTopBar({
    pageIcon, pageTitle, pageSubtitle,
    userName, userClass, onProfile, onSettings, onLogout,
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
