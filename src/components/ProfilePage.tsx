import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { TUser } from '../context/AssessmentContext';
import { updateProfile } from '../lib/api';
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
                                    Alcuni campi li gestisce la scuola
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
                    </div>
                </div>
            </div>
        </div>
    );
}
