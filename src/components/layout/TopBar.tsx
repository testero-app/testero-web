import TesteroLogo from '../ui/TesteroLogo';
import styles from './TopBar.module.css';

interface TopBarProps {
    userName?: string;
    userClass?: string;
    onLogout?: () => void;
    onProfile?: () => void;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return parts[0][0] + parts[parts.length - 1][0];
    return name.slice(0, 2).toUpperCase();
}

export default function TopBar({ userName, userClass, onLogout, onProfile }: TopBarProps) {
    return (
        <header className={styles.topBar}>
            <div className={styles.brand}>
                <TesteroLogo size={28} />
                <span className={styles.brandText}>Testero</span>
            </div>

            <div className={styles.right}>
                {userName && (
                    <div
                        className={styles.userPill}
                        onClick={onProfile}
                        role="button"
                        tabIndex={0}
                    >
                        <span className={styles.avatar}>{getInitials(userName)}</span>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{userName}</span>
                            {userClass && <span className={styles.userClass}>{userClass}</span>}
                        </div>
                        <svg className={styles.chevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </div>
                )}

                {onLogout && (
                    <button className={styles.logoutBtn} onClick={onLogout}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cfe0e8" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <path d="M16 17l5-5-5-5" />
                            <path d="M21 12H9" />
                        </svg>
                        Esci
                    </button>
                )}
            </div>
        </header>
    );
}
