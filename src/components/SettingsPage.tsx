import { useState, useEffect, useCallback } from 'react';
import { changePassword, fetchNotificationPreferences, updateNotificationPreferences } from '../lib/api';
import styles from './ProfilePage.module.css';

interface SettingsPageProps {
    token?: string;
}

function checkStrength(pwd: string) {
    const has8 = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNum = /[0-9]/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
    const score = [has8, hasUpper, hasNum, hasSymbol].filter(Boolean).length;
    return { has8, hasUpper, hasNum, hasSymbol, score };
}

const EyeIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa6b2" strokeWidth="2">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const CheckIcon = ({ color = '#0e7c7b', size = 13, strokeWidth = 3 }: { color?: string; size?: number; strokeWidth?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
        <path d="M5 12l5 5L20 6" />
    </svg>
);

const CircleIcon = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9aa6b2" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
    </svg>
);

export default function SettingsPage({ token }: SettingsPageProps) {
    // Password state
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    // Notification preferences
    const [notifResults, setNotifResults] = useState(true);
    const [notifReminder, setNotifReminder] = useState(true);
    const [notifProduct, setNotifProduct] = useState(false);

    useEffect(() => {
        if (!token) return;
        fetchNotificationPreferences(token)
            .then((prefs: { type: string; enabled: boolean }[]) => {
                for (const p of prefs) {
                    if (p.type === 'EXAM_RESULT') setNotifResults(p.enabled);
                    if (p.type === 'DEADLINE_REMINDER') setNotifReminder(p.enabled);
                    if (p.type === 'PRODUCT_NEWS') setNotifProduct(p.enabled);
                }
            })
            .catch(() => {});
    }, [token]);

    const saveNotification = useCallback((type: string, enabled: boolean) => {
        if (!token) return;
        updateNotificationPreferences([{ type, enabled }], token).catch(() => {});
    }, [token]);

    const strength = checkStrength(newPwd);
    const pwdMatch = newPwd.length > 0 && newPwd === confirmPwd;

    const handlePasswordSubmit = async () => {
        if (!token || !currentPwd || !newPwd || !confirmPwd) return;
        if (newPwd !== confirmPwd) {
            setPwdMsg({ type: 'err', text: 'Le password non coincidono.' });
            return;
        }
        if (strength.score < 3) {
            setPwdMsg({ type: 'err', text: 'La password non soddisfa i requisiti.' });
            return;
        }
        setPwdLoading(true);
        setPwdMsg(null);
        try {
            await changePassword(currentPwd, newPwd, confirmPwd, token);
            setPwdMsg({ type: 'ok', text: 'Password aggiornata con successo.' });
            setCurrentPwd('');
            setNewPwd('');
            setConfirmPwd('');
        } catch (e: unknown) {
            setPwdMsg({ type: 'err', text: e instanceof Error ? e.message : 'Errore.' });
        } finally {
            setPwdLoading(false);
        }
    };

    const requirements = [
        { ok: strength.has8, label: 'Almeno 8 caratteri' },
        { ok: strength.hasUpper, label: 'Una maiuscola' },
        { ok: strength.hasNum, label: 'Un numero' },
        { ok: strength.hasSymbol, label: 'Un simbolo' },
    ];

    const notifications = [
        { title: 'Esito delle verifiche via email', desc: 'Ricevi un riepilogo quando una verifica viene corretta.', on: notifResults, toggle: () => { setNotifResults(v => !v); saveNotification('EXAM_RESULT', !notifResults); } },
        { title: 'Promemoria verifiche in scadenza', desc: 'Un avviso il giorno prima della scadenza.', on: notifReminder, toggle: () => { setNotifReminder(v => !v); saveNotification('DEADLINE_REMINDER', !notifReminder); } },
        { title: 'Novità di prodotto', desc: 'Occasionali aggiornamenti su Testero.', on: notifProduct, toggle: () => { setNotifProduct(v => !v); saveNotification('PRODUCT_NEWS', !notifProduct); } },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.cardStack}>
                    {/* Sicurezza */}
                    <div className={styles.contentCard}>
                        <div className={styles.cardTitle}>Sicurezza</div>
                        <div className={styles.cardDescription}>Aggiorna la password che usi per accedere.</div>

                        {pwdMsg && (
                            <div className={pwdMsg.type === 'ok' ? styles.pwdMsgOk : styles.pwdMsgErr}>
                                {pwdMsg.text}
                            </div>
                        )}

                        <div className={styles.fieldGroup}>
                            <div className={styles.label}>Password attuale</div>
                            <div className={styles.field}>
                                <input
                                    className={styles.fieldInput}
                                    type={showCurrent ? 'text' : 'password'}
                                    value={currentPwd}
                                    onChange={e => setCurrentPwd(e.target.value)}
                                />
                                <button className={styles.eyeBtn} onClick={() => setShowCurrent(!showCurrent)}>
                                    {EyeIcon}
                                </button>
                            </div>
                        </div>

                        <div className={styles.fieldGroupTight}>
                            <div className={styles.label}>Nuova password</div>
                            <div className={newPwd ? styles.fieldFocus : styles.field}>
                                <input
                                    className={styles.fieldInput}
                                    type={showNew ? 'text' : 'password'}
                                    value={newPwd}
                                    onChange={e => setNewPwd(e.target.value)}
                                />
                                <button className={styles.eyeBtn} onClick={() => setShowNew(!showNew)}>
                                    {EyeIcon}
                                </button>
                            </div>
                        </div>

                        <div className={styles.strengthMeter}>
                            {[0, 1, 2, 3].map(i => (
                                <i key={i} className={i < strength.score ? styles.strengthBarActive : styles.strengthBar} />
                            ))}
                        </div>
                        <div className={styles.requirements}>
                            {requirements.map(r => (
                                <span key={r.label} className={r.ok ? styles.requirementMet : styles.requirement}>
                                    {r.ok ? <CheckIcon /> : CircleIcon}
                                    {r.label}
                                </span>
                            ))}
                        </div>

                        <div className={styles.fieldGroup}>
                            <div className={styles.label}>Conferma nuova password</div>
                            <div className={styles.field}>
                                <input
                                    className={styles.fieldInput}
                                    type="password"
                                    value={confirmPwd}
                                    onChange={e => setConfirmPwd(e.target.value)}
                                />
                                {pwdMatch && <CheckIcon color="#14b8a6" size={15} />}
                            </div>
                        </div>

                        <button className={styles.btnTeal} onClick={handlePasswordSubmit} disabled={pwdLoading}>
                            {pwdLoading ? 'Aggiornamento...' : 'Aggiorna password'}
                        </button>
                    </div>

                    {/* Notifiche */}
                    <div className={styles.contentCard}>
                        <div className={styles.cardTitle}>Notifiche</div>

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
