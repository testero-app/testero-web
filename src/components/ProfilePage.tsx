import { useTranslations } from 'use-intl';
import { useState } from 'react';
import { TUser } from '../context/AssessmentContext';
import { updateProfile, changePassword } from '../lib/api';
import styles from './ProfilePage.module.css';

interface ProfilePageProps {
    user: TUser;
    token?: string;
    onLogout: () => void;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return parts[0][0] + parts[parts.length - 1][0];
    return name.slice(0, 2).toUpperCase();
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

export default function ProfilePage({ user, token }: ProfilePageProps) {
    const t = useTranslations('profile');
    const fullName = `${user.first_name} ${user.last_name}`;
    const initials = getInitials(fullName);

    const [editEmail, setEditEmail] = useState(user.email || '');
    const [emailFocused, setEmailFocused] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handlePersonalDataReset = () => {
        setEditEmail(user.email || '');
        setSuccessMsg('');
        setErrorMsg('');
    };

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            await updateProfile(editEmail, token);
            setSuccessMsg(t('saved'));
        } catch (err) {
            setErrorMsg((err as Error).message || t('saveError'));
        } finally {
            setSaving(false);
        }
    };

    // ── Security (password change) ─────────────────────────────────────
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const strength = checkStrength(newPwd);
    const pwdMatch = newPwd.length > 0 && newPwd === confirmPwd;

    const handlePasswordSubmit = async () => {
        if (!token || !currentPwd || !newPwd || !confirmPwd) return;
        if (newPwd !== confirmPwd) {
            setPwdMsg({ type: 'err', text: t('passwordsDontMatch') });
            return;
        }
        if (strength.score < 3) {
            setPwdMsg({ type: 'err', text: t('passwordRequirements') });
            return;
        }
        setPwdLoading(true);
        setPwdMsg(null);
        try {
            await changePassword(currentPwd, newPwd, confirmPwd, token);
            setPwdMsg({ type: 'ok', text: t('passwordUpdated') });
            setCurrentPwd('');
            setNewPwd('');
            setConfirmPwd('');
        } catch (e: unknown) {
            setPwdMsg({ type: 'err', text: e instanceof Error ? e.message : t('genericError') });
        } finally {
            setPwdLoading(false);
        }
    };

    const requirements = [
        { ok: strength.has8, label: t('req8') },
        { ok: strength.hasUpper, label: t('reqUpper') },
        { ok: strength.hasNum, label: t('reqNum') },
        { ok: strength.hasSymbol, label: t('reqSymbol') },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* ── LEFT: Identity card ──────────────────────────────── */}
                    <div className={styles.identityCard}>
                        <div className={styles.avatar}>{initials}</div>
                        <div className={styles.userName}>{fullName}</div>
                        <div className={styles.roleBadge}>{t('student')}</div>

                        <div className={styles.metaSection}>
                            <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>{t('studentId')}</span>
                                <span className={styles.metaValueMono}>{user.username}</span>
                            </div>
                            <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>{t('school')}</span>
                                <span className={styles.metaValue}>—</span>
                            </div>
                            <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>{t('class')}</span>
                                <span className={styles.metaValue}>{user.class_name}</span>
                            </div>
                            <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>{t('enrolledSince')}</span>
                                <span className={styles.metaValue}>—</span>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Dati personali ────────────────────────────── */}
                    <div className={styles.cardStack}>
                        <div className={styles.contentCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardTitle}>{t('personalData')}</span>
                                <span className={styles.hintBadge}>
                                    {LockIcon}
                                    {t('fieldsManagedBySchool')}
                                </span>
                            </div>

                            <div className={styles.fieldRow}>
                                <div>
                                    <div className={styles.label}>{t('firstName')}</div>
                                    <div className={styles.fieldReadonly}>
                                        {LockIconSmall}
                                        {user.first_name}
                                        <span className={styles.readonlyTag}>{t('assignedBySchool')}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className={styles.label}>{t('lastName')}</div>
                                    <div className={styles.fieldReadonly}>
                                        {LockIconSmall}
                                        {user.last_name}
                                        <span className={styles.readonlyTag}>{t('assignedBySchool')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.fieldGroup}>
                                <div className={styles.label}>{t('email')}</div>
                                <div className={emailFocused ? styles.fieldFocus : styles.field}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ts-text-faint)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="M22 4l-10 8L2 4" />
                                    </svg>
                                    <input
                                        className={styles.fieldInput}
                                        type="email"
                                        placeholder={t('emailPlaceholder')}
                                        value={editEmail}
                                        onChange={e => setEditEmail(e.target.value)}
                                        onFocus={() => setEmailFocused(true)}
                                        onBlur={() => setEmailFocused(false)}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className={styles.label}>{t('username')}</div>
                                <div className={styles.fieldReadonly}>
                                    {LockIconSmall}
                                    {user.username}
                                    <span className={styles.readonlyTag}>{t('notEditable')}</span>
                                </div>
                            </div>

                            {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
                            {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

                            <div className={styles.buttonRow}>
                                <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
                                    {saving ? t('saving') : t('save')}
                                </button>
                                <button className={styles.btnGhost} onClick={handlePersonalDataReset}>{t('cancel')}</button>
                            </div>
                        </div>

                        {/* Sicurezza — cambio password */}
                        <div className={styles.contentCard}>
                            <div className={styles.cardTitle}>{t('securityTitle')}</div>
                            <div className={styles.cardDescription}>{t('securityDescription')}</div>

                            {pwdMsg && (
                                <div className={pwdMsg.type === 'ok' ? styles.pwdMsgOk : styles.pwdMsgErr}>
                                    {pwdMsg.text}
                                </div>
                            )}

                            <div className={styles.fieldGroup}>
                                <div className={styles.label}>{t('currentPassword')}</div>
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
                                <div className={styles.label}>{t('newPassword')}</div>
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
                                <div className={styles.label}>{t('confirmPassword')}</div>
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
                                {pwdLoading ? t('updatingPassword') : t('updatePassword')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
