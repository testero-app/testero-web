import { useState, useEffect, useCallback } from 'react';
import { fetchNotificationCount } from '../../lib/api';
import NavSidebar, { type NavPage } from './NavSidebar';
import ShellTopBar from './ShellTopBar';
import styles from './AppShell.module.css';

interface AppShellProps {
    activePage: NavPage;
    userName: string;
    userClass?: string;
    token: string;
    onNavigate: (page: string) => void;
    onLogout: () => void;
    children: React.ReactNode;
}

const PAGE_META: Record<string, { title: string; subtitle: string; icon: React.ReactNode }> = {
    allenamento: {
        title: 'Allenamento',
        subtitle: 'Pratica libera per argomento',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
            </svg>
        ),
    },
    competenze: {
        title: 'Competenze',
        subtitle: 'La tua padronanza per argomento',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="12" width="4" height="9" rx="1" /><rect x="10" y="7" width="4" height="14" rx="1" /><rect x="17" y="3" width="4" height="18" rx="1" />
            </svg>
        ),
    },
    certificazioni: {
        title: 'Certificazioni',
        subtitle: 'Verifiche esterne della scuola',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
        ),
    },
    risultati: {
        title: 'I miei risultati',
        subtitle: 'Storico di verifiche e allenamento',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 7h10M7 12h10M7 17h6" />
            </svg>
        ),
    },
    profilo: {
        title: 'Profilo',
        subtitle: 'I tuoi dati personali',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
    impostazioni: {
        title: 'Impostazioni',
        subtitle: 'Sicurezza, password e notifiche',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
            </svg>
        ),
    },
};

export default function AppShell({
    activePage, userName, userClass, token, onNavigate, onLogout, children,
}: AppShellProps) {
    const meta = PAGE_META[activePage] ?? PAGE_META.allenamento;
    const [notificationCount, setNotificationCount] = useState(0);

    const refreshNotificationCount = useCallback(async () => {
        try {
            const data = await fetchNotificationCount(token);
            setNotificationCount(data.count ?? 0);
        } catch {
            setNotificationCount(0);
        }
    }, [token]);

    useEffect(() => {
        let cancelled = false;
        fetchNotificationCount(token)
            .then((data) => { if (!cancelled) setNotificationCount(data.count ?? 0); })
            .catch(() => { if (!cancelled) setNotificationCount(0); });
        return () => { cancelled = true; };
    }, [token, activePage]);

    return (
        <div className={styles.shell}>
            <NavSidebar activePage={activePage} onNavigate={onNavigate} />
            <div className={styles.main}>
                <ShellTopBar
                    pageIcon={meta.icon}
                    pageTitle={meta.title}
                    pageSubtitle={meta.subtitle}
                    userName={userName}
                    userClass={userClass}
                    token={token}
                    notificationCount={notificationCount}
                    onNotificationCountChange={refreshNotificationCount}
                    onProfile={() => onNavigate('profilo')}
                    onSettings={() => onNavigate('impostazioni')}
                    onLogout={onLogout}
                />
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}
