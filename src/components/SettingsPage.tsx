import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { fetchNotificationPreferences, updateNotificationPreferences, updateLanguage } from '../lib/api';
import SegmentedControl from './ui/SegmentedControl';
import styles from './ProfilePage.module.css';

interface SettingsPageProps {
    token?: string;
}

/** These toggles govern email delivery; in-app notifications are always on. */
const EMAIL_CHANNEL = 'EMAIL';

/**
 * Persists the language, syncs the cookie the layout reads, then refreshes the server
 * components so the new locale takes effect. Uses router.refresh() rather than a full page
 * reload so the in-memory session (token) survives — a reload would log the user out.
 */
function setLanguage(lang: 'it' | 'en', token: string | undefined, refresh: () => void) {
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; samesite=lax`;
    if (token) updateLanguage(lang, token).catch(() => {});
    refresh();
}

export default function SettingsPage({ token }: SettingsPageProps) {
    const t = useTranslations('settings');
    const locale = useLocale();
    const router = useRouter();

    // Email notification preferences. The backend keys a preference by (event, channel) and
    // defaults every EMAIL channel to off, which is the state shown until the fetch lands.
    const [notifResults, setNotifResults] = useState(false);
    const [notifReminder, setNotifReminder] = useState(false);

    useEffect(() => {
        if (!token) return;
        fetchNotificationPreferences(token)
            .then((prefs) => {
                for (const p of prefs.filter((pref) => pref.channel === EMAIL_CHANNEL)) {
                    if (p.event === 'EXAM_RESULT') setNotifResults(p.enabled);
                    if (p.event === 'DEADLINE_REMINDER') setNotifReminder(p.enabled);
                }
            })
            .catch(() => {});
    }, [token]);

    const saveNotification = useCallback((event: string, enabled: boolean) => {
        if (!token) return;
        updateNotificationPreferences(
            [{ event, channel: EMAIL_CHANNEL, enabled }],
            token,
        ).catch(() => {});
    }, [token]);

    const notifications = [
        { title: t('notifResultsTitle'), desc: t('notifResultsDesc'), on: notifResults, toggle: () => { setNotifResults(v => !v); saveNotification('EXAM_RESULT', !notifResults); } },
        { title: t('notifReminderTitle'), desc: t('notifReminderDesc'), on: notifReminder, toggle: () => { setNotifReminder(v => !v); saveNotification('DEADLINE_REMINDER', !notifReminder); } },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.cardStack}>
                    {/* Lingua */}
                    <div className={styles.contentCard}>
                        <div className={styles.cardTitle}>{t('languageTitle')}</div>
                        <div className={styles.cardDescription}>{t('languageDescription')}</div>
                        <SegmentedControl
                            options={[
                                { value: 'it', label: t('languageItalian') },
                                { value: 'en', label: t('languageEnglish') },
                            ]}
                            value={locale}
                            onChange={(v) => setLanguage(v as 'it' | 'en', token, () => router.refresh())}
                        />
                    </div>

                    {/* Notifiche */}
                    <div className={styles.contentCard}>
                        <div className={styles.cardTitle}>{t('notificationsTitle')}</div>

                        {notifications.map(n => (
                            <div key={n.title} className={styles.notifRow}>
                                <div>
                                    <div className={styles.notifTitle}>{n.title}</div>
                                    <div className={styles.notifDesc}>{n.desc}</div>
                                </div>
                                <button
                                    className={n.on ? styles.toggleOn : styles.toggle}
                                    onClick={n.toggle}
                                    aria-label={`Toggle ${n.title}`}
                                >
                                    <i className={n.on ? styles.toggleKnobOn : styles.toggleKnob} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
