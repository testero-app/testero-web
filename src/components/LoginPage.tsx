import { useState, useRef, useEffect } from 'react';
import styles from './LoginPage.module.css';

interface LoginPageProps {
    onLogin: (username: string, password: string) => Promise<void>;
    loading: boolean;
    error: string | null;
}

/* Logo SVG: rect bianco + code brackets teal + checkmark navy */
const LogoSvg = (
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#fff" />
        <path d="M17 17 L11 24 L17 31" stroke="#14b8a6" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M31 17 L37 24 L31 31" stroke="#14b8a6" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.5 24.5 L23 27 L28 20" stroke="#102a43" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default function LoginPage({ onLogin, loading, error }: LoginPageProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [usernameFocused, setUsernameFocused] = useState(false);
    const usernameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        usernameRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) return;
        onLogin(username.trim().toLowerCase(), password);
    };

    return (
        <div className={styles.page}>

            {/* ============ BRAND (46% sinistra) ============ */}
            <div className={styles.brand}>
                {/* Logo IN ALTO */}
                <div className={styles.brandLogo}>
                    {LogoSvg}
                    <span className={styles.brandLogoText}>Testero</span>
                </div>

                {/* Headline IN BASSO (margin-top: auto) */}
                <div className={styles.brandBottom}>
                    <div className={styles.brandHeadline}>Challenge<br />your knowledge.</div>
                    <div className={styles.brandSub}>
                        Accedi per sostenere le tue verifiche di certificazione in Python, JavaScript, Java e altro. Tempo reale, correzione immediata.
                    </div>
                    <div className={styles.brandChips}>
                        <span className={styles.chip}>certificazioni</span>
                        <span className={styles.chip}>simulazioni</span>
                        <span className={styles.chip}>esiti per argomento</span>
                    </div>
                </div>
            </div>

            {/* ============ FORM (54% destra) ============ */}
            <div className={styles.formPanel}>
              <div className={styles.formInner} style={{ width: 400, maxWidth: '100%' }}>
              <form onSubmit={handleSubmit}>
                    <div className={styles.formTitle}>Accedi al tuo account</div>
                    <div className={styles.formSub}>Usa le credenziali fornite dalla tua scuola.</div>

                    {error && (
                        <div className={styles.alert}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                                <circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><circle cx="12" cy="16.4" r="0.6" fill="currentColor" />
                            </svg>
                            Credenziali non valide
                        </div>
                    )}

                    {/* USERNAME — teal focus se valido, rosso se errore */}
                    <div className={styles.formLabel}>Username</div>
                    <div className={`${styles.field} ${error ? styles.fieldError : (usernameFocused || username ? styles.fieldFocus : '')}`}>
                        <span className={styles.fieldIcon}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={error ? '#e5484d' : (usernameFocused || username ? '#0e7c7b' : '#9aa6b2')} strokeWidth="2">
                                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                            </svg>
                        </span>
                        <input
                            ref={usernameRef}
                            type="text"
                            placeholder="mario.rossi"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onFocus={() => setUsernameFocused(true)}
                            onBlur={() => setUsernameFocused(false)}
                            disabled={loading}
                        />
                        {usernameFocused && <span className={styles.caret} />}
                    </div>

                    {/* PASSWORD — fondo #f8fafc + toggle occhio */}
                    <div className={styles.formLabel}>Password</div>
                    <div className={`${styles.field} ${error ? styles.fieldError : styles.fieldSubtle} ${styles.fieldLast}`}>
                        <span className={styles.fieldIcon}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={error ? '#e5484d' : '#9aa6b2'} strokeWidth="2">
                                <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
                            </svg>
                        </span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className={styles.toggleBtn}
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                            aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9aa6b2" strokeWidth="2">
                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    </div>

                    {/* CTA — teal PIENO #14b8a6, testo #06302c, weight 800 */}
                    <button
                        className={`${styles.submitBtn} ${loading ? styles.submitLoading : ''}`}
                        type="submit"
                        disabled={loading || !username.trim() || !password.trim()}
                    >
                        {loading ? 'Accesso...' : 'Accedi'}
                        {!loading && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06302c" strokeWidth="2.6">
                                <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                        )}
                    </button>

                    {/* Nota primo accesso — riquadro PIENO #f0f4f8, NO bordo */}
                    <div className={styles.infoBox}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7a89" strokeWidth="2" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><circle cx="12" cy="16.4" r="0.6" fill="#6b7a89" />
                        </svg>
                        <span className={styles.infoText}>
                            Al primo accesso il sistema può impiegare 1–2 minuti per avviarsi.
                        </span>
                    </div>

                    {/* Footer */}
                    <div className={styles.footer}>
                        <a
                            className={styles.footerLink}
                            href="https://docs.google.com/forms/d/e/1FAIpQLSe3e6fdcS4Kx20cidFclc8XzIhiNQ9YKPxciLwp1CCWW2zf3Q/viewform"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Lascia un feedback
                        </a>
                        <span className={styles.footerDot} />
                        <span className={styles.footerMuted}>Serve aiuto?</span>
                    </div>
                </form>
              </div>
            </div>

        </div>
    );
}
