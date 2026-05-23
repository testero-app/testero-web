import { useState } from 'react';

interface LoginPageProps {
    onLogin: (username: string, password: string) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export default function LoginPage({ onLogin, loading, error }: LoginPageProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) return;
        onLogin(username.trim().toLowerCase(), password);
    };

    return (
        <div className="landing-page">
            <div className="landing-card">
                <h1 className="login-brand-name">Testero</h1>
                <p className="login-subtitle">Challenge your knowledge</p>

                <div className="login-divider">
                    <span className="login-divider-logo">
                        <span className="logo-circle"><span className="logo-dot"></span></span>
                    </span>
                </div>

                {error && (
                    <p style={{
                        color: '#b85450',
                        fontSize: '0.85rem',
                        marginBottom: '16px',
                        padding: '10px 14px',
                        background: 'rgba(184, 84, 80, 0.08)',
                        borderRadius: '6px',
                    }}>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="landing-input">
                        <div className="landing-input-wrapper">
                            <span className="landing-input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="username"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="landing-input">
                        <div className="landing-input-wrapper">
                            <span className="landing-input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                            </span>
                            <input
                                type="password"
                                placeholder="pwd"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        <button
                            className={`btn-start ${username.trim() && password.trim() ? 'btn-start-ready' : ''}`}
                            type="submit"
                            disabled={loading || !username.trim() || !password.trim()}
                        >
                            {loading ? 'Accesso...' : 'Accedi'}
                            {!loading && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"/>
                                </svg>
                            )}
                        </button>
                    </div>
                </form>
                <p style={{ fontSize: '0.7rem', color: '#9a9a9a', textAlign: 'center', marginTop: '20px' }}>
                    Al primo accesso il sistema potrebbe impiegare 1-2 minuti per avviarsi
                </p>
                <p style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '12px' }}>
                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSe3e6fdcS4Kx20cidFclc8XzIhiNQ9YKPxciLwp1CCWW2zf3Q/viewform" target="_blank" rel="noopener noreferrer" style={{ color: '#7a7a7a', textDecoration: 'underline' }}>
                        Lascia un feedback
                    </a>
                </p>
            </div>
        </div>
    );
}
