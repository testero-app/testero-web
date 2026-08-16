import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'use-intl';
import { fetchNotificationPreferences, updateNotificationPreferences, updateLanguage } from '../lib/api';
import { useLocaleSwitch } from '../i18n/LocaleProvider';
import type { Locale } from '../i18n/messages';
import styles from './ProfilePage.module.css';

interface SettingsPageProps {
    token?: string;
}

/** These toggles govern email delivery; in-app notifications are always on. */
const EMAIL_CHANNEL = 'EMAIL';

export default function SettingsPage({ token }: SettingsPageProps) {
    const t = useTranslations('settings');
    const locale = useLocale();
    const { setLocale } = useLocaleSwitch();

    /**
     * Switches the interface language and persists it on the user's profile. The provider owns
     * the cookie and the <html lang>; the re-render is plain React state, so there is no page
     * reload to lose the in-memory session over.
     */
    const setLanguage = useCallback((lang: Locale) => {
        setLocale(lang);
        if (token) updateLanguage(lang, token).catch(() => {});
    }, [setLocale, token]);

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
                        <select
                            className={styles.langSelect}
                            value={locale}
                            onChange={(e) => setLanguage(e.target.value as Locale)}
                        >
                            <option value="it">{t('languageItalian')}</option>
                            <option value="en">{t('languageEnglish')}</option>
                        </select>
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
