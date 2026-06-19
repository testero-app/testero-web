import { useState } from 'react';
import { TUser } from '../context/AssessmentContext';
import { changePassword } from '../lib/api';
import styles from './ProfilePage.module.css';

interface ProfilePageProps {
    user: TUser;
    token?: string;
    onBack: () => void;
    onLogout: () => void;
    onChangePassword?: () => void;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return parts[0][0] + parts[parts.length - 1][0];
    return name.slice(0, 2).toUpperCase();
}

/* Password strength checker */
function checkStrength(pwd: string) {
    const has8 = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNum = /[0-9]/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
    const score = [has8, hasUpper, hasNum, hasSymbol].filter(Boolean).length;
    return { has8, hasUpper, hasNum, hasSymbol, score };
}

/* Reusable icons */
const BackArrowIcon = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const LockIcon = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
);

const LockIconSmall = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b0bcc8" strokeWidth="2">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
);

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

export default function ProfilePage({ user, token, onBack, onLogout }: ProfilePageProps) {
    const initials = getInitials(user.name);
    const firstName = user.name.split(' ')[0] || '';
    const lastName = user.name.split(' ').slice(1).join(' ') || '';

    // Personal data form state
    const [editFirstName, setEditFirstName] = useState(firstName);
    const [editLastName, setEditLastName] = useState(lastName);
    const [editEmail, setEditEmail] = useState('');
    const [emailFocused, setEmailFocused] = useState(false);

    // Password state
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    // Notification toggles (local state only)
    // TODO: implement notification preferences API
    const [notifResults, setNotifResults] = useState(true);
    const [notifReminder, setNotifReminder] = useState(true);
    const [notifProduct, setNotifProduct] = useState(false);

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

    const handlePersonalDataReset = () => {
        setEditFirstName(firstName);
        setEditLastName(lastName);
        setEditEmail('');
    };

    const requirements = [
        { ok: strength.has8, label: 'Almeno 8 caratteri' },
        { ok: strength.hasUpper, label: 'Una maiuscola' },
        { ok: strength.hasNum, label: 'Un numero' },
        { ok: strength.hasSymbol, label: 'Un simbolo' },
    ];

    const notifications = [
        { title: 'Esito delle verifiche via email', desc: 'Ricevi un riepilogo quando una verifica viene corretta.', on: notifResults, toggle: () => setNotifResults(v => !v) },
        { title: 'Promemoria verifiche in scadenza', desc: 'Un avviso il giorno prima della scadenza.', on: notifReminder, toggle: () => setNotifReminder(v => !v) },
        { title: 'Novità di prodotto', desc: 'Occasionali aggiornamenti su Testero.', on: notifProduct, toggle: () => setNotifProduct(v => !v) },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Back link */}
                <button className={styles.backLink} onClick={onBack}>
                    {BackArrowIcon}
                    Allenamento
                </button>

                <div className={styles.title}>Profilo</div>
                <div className={styles.subtitle}>Gestisci i tuoi dati, la password e le notifiche.</div>

                <div className={styles.grid}>
                    {/* ── LEFT: Identity card ──────────────────────────────── */}
                    <div className={styles.identityCard}>
                        <div className={styles.avatar}>{initials}</div>
                        <div className={styles.userName}>{user.name}</div>
                        <div className={styles.roleBadge}>Studente</div>

                        <div className={styles.metaSection}>
                            <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>Matricola</span>
                                <span className={styles.metaValueMono}>{user.username}</span>
                            </div>
                            <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>Scuola</span>
                                <span className={styles.metaValue}>—</span>
                            </div>
                            <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>Classe</span>
                                <span className={styles.metaValue}>{user.class_name}</span>
                            </div>
                            <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>Iscritto dal</span>
                                <span className={styles.metaValue}>—</span>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Card stack ─────────────────────────────────── */}
                    <div className={styles.cardStack}>

                        {/* 1) Dati personali */}
                        <div className={styles.contentCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardTitle}>Dati personali</span>
                                <span className={styles.hintBadge}>
                                    {LockIcon}
                                    Alcuni campi li gestisce la scuola
                                </span>
                            </div>

                            {/* Nome + Cognome */}
                            <div className={styles.fieldRow}>
                                <div>
                                    <div className={styles.label}>Nome</div>
                                    <div className={styles.field}>
                                        <input
                                            className={styles.fieldInput}
                                            value={editFirstName}
                                            onChange={e => setEditFirstName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className={styles.label}>Cognome</div>
                                    <div className={styles.field}>
                                        <input
                                            className={styles.fieldInput}
                                            value={editLastName}
                                            onChange={e => setEditLastName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className={styles.fieldGroup}>
                                <div className={styles.label}>Email</div>
                                <div className={emailFocused ? styles.fieldFocus : styles.field}>
                                    <input
                                        className={styles.fieldInput}
                                        type="email"
                                        placeholder="email@esempio.it"
                                        value={editEmail}
                                        onChange={e => setEditEmail(e.target.value)}
                                        onFocus={() => setEmailFocused(true)}
                                        onBlur={() => setEmailFocused(false)}
                                    />
                                </div>
                            </div>

                            {/* Username (read-only) */}
                            <div>
                                <div className={styles.label}>Username</div>
                                <div className={styles.fieldReadonly}>
                                    {LockIconSmall}
                                    {user.username}
                                    <span className={styles.readonlyTag}>non modificabile</span>
                                </div>
                            </div>

                            <div className={styles.buttonRow}>
                                <button className={styles.btnPrimary}>Salva modifiche</button>
                                <button className={styles.btnGhost} onClick={handlePersonalDataReset}>Annulla</button>
                            </div>
                        </div>

                        {/* 2) Sicurezza */}
                        <div className={styles.contentCard}>
                            <div className={styles.cardTitle}>Sicurezza</div>
                            <div className={styles.cardDescription}>Aggiorna la password che usi per accedere.</div>

                            {pwdMsg && (
                                <div className={pwdMsg.type === 'ok' ? styles.pwdMsgOk : styles.pwdMsgErr}>
                                    {pwdMsg.text}
                                </div>
                            )}

                            {/* Current password */}
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

                            {/* New password */}
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

                            {/* Strength meter */}
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

                            {/* Confirm password */}
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

                        {/* 3) Notifiche */}
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
        </div>
    );
}
