import { useTranslations } from 'use-intl';
import TesteroLogo from '../ui/TesteroLogo';
import styles from './NavSidebar.module.css';

export type NavPage = 'training' | 'progress' | 'verifiche' | 'certifications' | 'profile' | 'settings';

interface NavItem {
    id: string;
    labelKey: string;
    icon: React.ReactNode;
    badge?: number;
}

interface NavSidebarProps {
    activePage: NavPage;
    onNavigate: (page: string) => void;
    /** Drawer state. Only has an effect below the tablet breakpoint (1024px). */
    open?: boolean;
    onClose?: () => void;
    /** Badge count for the verifiche nav item. */
    verificheBadge?: number;
}

const STUDIO_ITEMS: NavItem[] = [
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
        id: 'progress',
        labelKey: 'progress',
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="12" width="4" height="9" rx="1" />
                <rect x="10" y="7" width="4" height="14" rx="1" />
                <rect x="17" y="3" width="4" height="18" rx="1" />
            </svg>
        ),
    },
];

const CLASSE_ITEMS: NavItem[] = [
    {
        id: 'verifiche',
        labelKey: 'verifiche',
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="m9 14 2 2 4-4" />
            </svg>
        ),
    },
    {
        id: 'certifications',
        labelKey: 'certifications',
        icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9.5V13l2.5 1.5" />
                <path d="M9 2h6" />
            </svg>
        ),
    },
];

function NavItemList({
    items,
    activePage,
    onNavigate,
    verificheBadge,
}: {
    items: NavItem[];
    activePage: string;
    onNavigate: (page: string) => void;
    verificheBadge?: number;
}) {
    const t = useTranslations('nav');

    return (
        <ul className={styles.navList}>
            {items.map((item) => {
                const isActive = activePage === item.id;
                const badgeValue = item.id === 'verifiche' ? verificheBadge : undefined;
                return (
                    <li key={item.id}>
                        <button
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                            onClick={() => onNavigate(item.id)}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span className={styles.navLabel}>{t(item.labelKey)}</span>
                            {badgeValue != null && badgeValue > 0 && (
                                <span className={styles.badge}>{badgeValue}</span>
                            )}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

export default function NavSidebar({ activePage, onNavigate, open = false, onClose, verificheBadge }: NavSidebarProps) {
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
            <NavItemList
                items={STUDIO_ITEMS}
                activePage={activePage}
                onNavigate={handleNavigate}
            />

            <div className={styles.sectionLabel}>{t('sectionClasse')}</div>
            <NavItemList
                items={CLASSE_ITEMS}
                activePage={activePage}
                onNavigate={handleNavigate}
                verificheBadge={verificheBadge}
            />
        </nav>
    );
}
