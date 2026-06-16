import { useState, useRef, useEffect } from 'react';
import styles from './TopBar.module.css';

interface TopBarProps {
    userName?: string;
    onLogout?: () => void;
    onProfile?: () => void;
}

/* Logo SVG: quadrato bianco + brackets teal + checkmark navy (28px per la topbar) */
const LogoMark = (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="11" fill="#fff" />
        <path d="M17 17 L11 24 L17 31" stroke="#14b8a6" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M31 17 L37 24 L31 31" stroke="#14b8a6" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.5 24.5 L23 27 L28 20" stroke="#102a43" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return parts[0][0] + parts[parts.length - 1][0];
    return name.slice(0, 2).toUpperCase();
}

export default function TopBar({ userName, onLogout, onProfile }: TopBarProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const pillRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!dropdownOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [dropdownOpen]);

    return (
        <header className={styles.topBar}>
            <div className={styles.brand}>
                {LogoMark}
                <span className={styles.brandText}>Testero</span>
            </div>

            <div className={styles.right}>
                {userName && (
                    <div className={styles.userPill} ref={pillRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
                        <span className={styles.avatar}>{getInitials(userName)}</span>
                        <span className={styles.userName}>{userName}</span>
                        <svg className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" />
                        </svg>

                        {dropdownOpen && (
                            <div className={styles.dropdown}>
                                {onProfile && (
                                    <button className={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); setDropdownOpen(false); onProfile(); }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                        </svg>
                                        Profilo
                                    </button>
                                )}
                                {onLogout && (
                                    <button className={`${styles.dropdownItem} ${styles.dropdownDanger}`} onClick={(e) => { e.stopPropagation(); setDropdownOpen(false); onLogout(); }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        Esci
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
