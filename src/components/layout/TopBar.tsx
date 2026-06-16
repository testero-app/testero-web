import { useState, useRef, useEffect, ReactNode } from 'react';
import { Avatar } from '../ui';
import styles from './TopBar.module.css';

interface TopBarProps {
    userName?: string;
    onLogout?: () => void;
    onProfile?: () => void;
    rightContent?: ReactNode;
}

export default function TopBar({ userName, onLogout, onProfile, rightContent }: TopBarProps) {
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
                <span className={styles.logo}>&lt;/&gt;</span>
                <span>Testero</span>
            </div>

            <div className={styles.right}>
                {rightContent}

                {userName && (
                    <div className={styles.userPill} ref={pillRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
                        <Avatar name={userName} size="sm" />
                        <span className={styles.userName}>{userName}</span>
                        <svg className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`} viewBox="0 0 12 12" fill="none">
                            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                        {dropdownOpen && (
                            <div className={styles.dropdown}>
                                {onProfile && (
                                    <button className={styles.dropdownItem} onClick={(e) => { e.stopPropagation(); setDropdownOpen(false); onProfile(); }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        Profilo
                                    </button>
                                )}
                                {onLogout && (
                                    <button className={`${styles.dropdownItem} ${styles.dropdownDanger}`} onClick={(e) => { e.stopPropagation(); setDropdownOpen(false); onLogout(); }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
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
