import { useState } from 'react';
import { TUser } from '../context/AssessmentContext';
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

export default function ProfilePage({ user }: ProfilePageProps) {
    const initials = getInitials(user.name);
    const firstName = user.name.split(' ')[0] || '';
    const lastName = user.name.split(' ').slice(1).join(' ') || '';

    const [editFirstName, setEditFirstName] = useState(firstName);
    const [editLastName, setEditLastName] = useState(lastName);
    const [editEmail, setEditEmail] = useState('');
    const [emailFocused, setEmailFocused] = useState(false);

    const handlePersonalDataReset = () => {
        setEditFirstName(firstName);
        setEditLastName(lastName);
        setEditEmail('');
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
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

                    {/* ── RIGHT: Dati personali ────────────────────────────── */}
                    <div className={styles.cardStack}>
                        <div className={styles.contentCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardTitle}>Dati personali</span>
                                <span className={styles.hintBadge}>
                                    {LockIcon}
                                    Alcuni campi li gestisce la scuola
                                </span>
                            </div>

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

                            <div className={styles.fieldGroup}>
                                <div className={styles.label}>Email</div>
                                <div className={emailFocused ? styles.fieldFocus : styles.field}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ts-text-faint)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="M22 4l-10 8L2 4" />
                                    </svg>
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
                    </div>
                </div>
            </div>
        </div>
    );
}
