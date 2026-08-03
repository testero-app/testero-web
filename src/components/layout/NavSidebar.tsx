import { useTranslations } from 'use-intl';
import TesteroLogo from '../ui/TesteroLogo';
import styles from './NavSidebar.module.css';

export type NavPage = 'training' | 'competencies' | 'certifications' | 'results' | 'profile' | 'settings';

interface NavSidebarProps {
    activePage: NavPage;
    onNavigate: (page: string) => void;
    /** Drawer state. Only has an effect below the tablet breakpoint (1024px). */
    open?: boolean;
    onClose?: () => void;
}

const NAV_ITEMS: { id: string; labelKey: string; icon: React.ReactNode }[] = [
    {
        id: 'training',
        labelKey: 'training',
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
            </svg>
        ),
    },
    {
        id: 'competencies',
        labelKey: 'competencies',
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="12" width="4" height="9" rx="1" />
                <rect x="10" y="7" width="4" height="14" rx="1" />
                <rect x="17" y="3" width="4" height="18" rx="1" />
            </svg>
        ),
    },
    {
        id: 'certifications',
        labelKey: 'certifications',
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
        ),
    },
    {
        id: 'results',
        labelKey: 'results',
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M7 7h10M7 12h10M7 17h6" />
            </svg>
        ),
    },
];

export default function NavSidebar({ activePage, onNavigate, open = false, onClose }: NavSidebarProps) {
    const t = useTranslations('nav');
    // On tablet the sidebar is an overlay, so picking a destination must also
    // dismiss it — otherwise it stays on top of the page just navigated to.
    const handleNavigate = (page: string) => {
        onNavigate(page);
        onClose?.();
    };

    return (
        <nav className={`${styles.sidebar} ${open ? styles.open : ''}`}>
            <div className={styles.brand}>
                <TesteroLogo size={30} />
                <span className={styles.brandText}>Testero</span>
            </div>

            <div className={styles.sectionLabel}>{t('sectionStudy')}</div>

            <ul className={styles.navList}>
                {NAV_ITEMS.map((item) => {
                    const isActive = activePage === item.id;
                    return (
                        <li key={item.id}>
                            <button
                                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                                onClick={() => handleNavigate(item.id)}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                <span className={styles.navLabel}>{t(item.labelKey)}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
