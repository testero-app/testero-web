import { useState } from 'react';
import { TUser } from '../context/AssessmentContext';
import { changePassword } from '../lib/api';
import TopBar from './layout/TopBar';

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

/* Toggle component */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
        <div onClick={onToggle} style={{
            width: 44, height: 25, borderRadius: 99, background: on ? '#14b8a6' : '#cdd6e0',
            position: 'relative', flexShrink: 0, cursor: 'pointer', transition: 'background 0.15s',
        }}>
            <i style={{
                position: 'absolute', top: 3, width: 19, height: 19, borderRadius: '50%',
                background: '#fff', left: on ? 22 : 3, transition: 'left 0.15s',
            }} />
        </div>
    );
}

/* Password strength */
function checkStrength(pwd: string) {
    const has8 = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNum = /[0-9]/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
    const score = [has8, hasUpper, hasNum, hasSymbol].filter(Boolean).length;
    return { has8, hasUpper, hasNum, hasSymbol, score };
}

export default function ProfilePage({ user, token, onBack, onLogout }: ProfilePageProps) {
    const initials = getInitials(user.name);

    // Password state
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
        if (newPwd !== confirmPwd) { setPwdMsg({ type: 'err', text: 'Le password non coincidono.' }); return; }
        if (strength.score < 3) { setPwdMsg({ type: 'err', text: 'La password non soddisfa i requisiti.' }); return; }
        setPwdLoading(true); setPwdMsg(null);
        try {
            await changePassword(currentPwd, newPwd, confirmPwd, token);
            setPwdMsg({ type: 'ok', text: 'Password aggiornata con successo.' });
            setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
        } catch (e: unknown) {
            setPwdMsg({ type: 'err', text: e instanceof Error ? e.message : 'Errore.' });
        } finally { setPwdLoading(false); }
    };

    const EyeIcon = (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa6b2" strokeWidth="2">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
        </svg>
    );

    const fieldBase: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #e1e6ec', borderRadius: 10, padding: '13px 14px', background: '#fff', fontSize: 14.5, color: '#102a43' };
    const fieldFocus: React.CSSProperties = { ...fieldBase, borderColor: '#14b8a6', boxShadow: '0 0 0 3px rgba(20,184,166,0.13)' };
    const fieldRo: React.CSSProperties = { ...fieldBase, background: '#f3f5f8', borderColor: '#e6ebf0', color: '#6b7a89' };
    const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9aa6b2', marginBottom: 7 };

    return (
        <div style={{ minHeight: '100vh', background: '#eef2f6' }}>
            <TopBar userName={user.name} onLogout={onLogout} onProfile={() => {}} />

            <div style={{ maxWidth: 1080, margin: '0 auto', padding: '34px 40px 60px' }}>
                {/* Back link */}
                <span onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#0e7c7b', marginBottom: 14, cursor: 'pointer' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0e7c7b" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" /></svg>
                    Verifiche
                </span>

                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: '#102a43' }}>Profilo</div>
                <div style={{ fontSize: 15, color: '#6b7a89', marginTop: 5, marginBottom: 28 }}>Gestisci i tuoi dati, la password e le notifiche.</div>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>

                    {/* LEFT: Identity card */}
                    <div style={{ background: '#fff', border: '1px solid #e1e6ec', borderRadius: 16, padding: '30px 26px', textAlign: 'center' }}>
                        <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#102a43', color: '#fff', fontWeight: 800, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>{initials}</div>
                        <div style={{ fontSize: 19, fontWeight: 800, color: '#102a43' }}>{user.name}</div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#0e7c7b', background: '#e6fcfa', padding: '5px 12px', borderRadius: 99, marginTop: 10 }}>Studente</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22, paddingTop: 20, borderTop: '1px solid #eef1f4', textAlign: 'left' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12.5, color: '#9aa6b2', fontWeight: 600 }}>Username</span>
                                <span style={{ fontSize: 13, color: '#102a43', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{user.username}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12.5, color: '#9aa6b2', fontWeight: 600 }}>Classe</span>
                                <span style={{ fontSize: 13, color: '#102a43', fontWeight: 700 }}>{user.class_name}</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Stack of cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* 1) DATI PERSONALI */}
                        <div style={{ background: '#fff', border: '1px solid #e1e6ec', borderRadius: 16, padding: '26px 28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <span style={{ fontSize: 17, fontWeight: 800, color: '#102a43' }}>Dati personali</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#6b7a89', background: '#f0f4f8', borderRadius: 8, padding: '6px 11px', fontWeight: 600 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7a89" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                                    Contattare il docente per la modifica
                                </span>
                            </div>
                            {/* Name row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                                <div><div style={labelStyle}>Nome</div><div style={fieldBase}><input value={user.name.split(' ')[0] || ''} readOnly style={{ border: 'none', outline: 'none', font: 'inherit', color: 'inherit', background: 'transparent', width: '100%' }} /></div></div>
                                <div><div style={labelStyle}>Cognome</div><div style={fieldBase}><input value={user.name.split(' ').slice(1).join(' ') || ''} readOnly style={{ border: 'none', outline: 'none', font: 'inherit', color: 'inherit', background: 'transparent', width: '100%' }} /></div></div>
                            </div>
                            {/* Username (read-only) */}
                            <div style={{ marginBottom: 18 }}>
                                <div style={labelStyle}>Username</div>
                                <div style={fieldRo}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b0bcc8" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                                    {user.username}
                                    <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9aa6b2', fontWeight: 600 }}>non modificabile</span>
                                </div>
                            </div>
                        </div>

                        {/* 2) SICUREZZA */}
                        <div style={{ background: '#fff', border: '1px solid #e1e6ec', borderRadius: 16, padding: '26px 28px' }}>
                            <div style={{ fontSize: 17, fontWeight: 800, color: '#102a43' }}>Sicurezza</div>
                            <div style={{ fontSize: 13.5, color: '#6b7a89', marginTop: 3, marginBottom: 20 }}>Aggiorna la password che usi per accedere.</div>

                            {pwdMsg && (
                                <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 600, background: pwdMsg.type === 'ok' ? '#e6fcfa' : '#fdeded', color: pwdMsg.type === 'ok' ? '#0e7c7b' : '#c0353a' }}>
                                    {pwdMsg.text}
                                </div>
                            )}

                            {/* Current password */}
                            <div style={{ marginBottom: 18 }}>
                                <div style={labelStyle}>Password attuale</div>
                                <div style={fieldBase}>
                                    <input type={showCurrent ? 'text' : 'password'} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
                                        style={{ border: 'none', outline: 'none', font: 'inherit', color: 'inherit', background: 'transparent', width: '100%' }} />
                                    <span onClick={() => setShowCurrent(!showCurrent)} style={{ marginLeft: 'auto', cursor: 'pointer', flexShrink: 0, display: 'flex' }}>{EyeIcon}</span>
                                </div>
                            </div>

                            {/* New password */}
                            <div style={{ marginBottom: 6 }}>
                                <div style={labelStyle}>Nuova password</div>
                                <div style={newPwd ? fieldFocus : fieldBase}>
                                    <input type={showNew ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)}
                                        style={{ border: 'none', outline: 'none', font: 'inherit', color: 'inherit', background: 'transparent', width: '100%' }} />
                                    <span onClick={() => setShowNew(!showNew)} style={{ marginLeft: 'auto', cursor: 'pointer', flexShrink: 0, display: 'flex' }}>{EyeIcon}</span>
                                </div>
                            </div>

                            {/* Strength meter */}
                            <div style={{ display: 'flex', gap: 5, margin: '10px 0 9px' }}>
                                {[0, 1, 2, 3].map(i => (
                                    <i key={i} style={{ flex: 1, height: 5, borderRadius: 99, background: i < strength.score ? '#14b8a6' : '#e1e6ec' }} />
                                ))}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 18 }}>
                                {[
                                    { ok: strength.has8, label: 'Almeno 8 caratteri' },
                                    { ok: strength.hasUpper, label: 'Una maiuscola' },
                                    { ok: strength.hasNum, label: 'Un numero' },
                                    { ok: strength.hasSymbol, label: 'Un simbolo' },
                                ].map(r => (
                                    <span key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: r.ok ? '#0e7c7b' : '#9aa6b2' }}>
                                        {r.ok ? (
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0e7c7b" strokeWidth="3"><path d="M5 12l5 5L20 6" /></svg>
                                        ) : (
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9aa6b2" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>
                                        )}
                                        {r.label}
                                    </span>
                                ))}
                            </div>

                            {/* Confirm password */}
                            <div style={{ marginBottom: 18 }}>
                                <div style={labelStyle}>Conferma nuova password</div>
                                <div style={fieldBase}>
                                    <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                                        style={{ border: 'none', outline: 'none', font: 'inherit', color: 'inherit', background: 'transparent', width: '100%' }} />
                                    {pwdMatch && (
                                        <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="3"><path d="M5 12l5 5L20 6" /></svg>
                                    )}
                                </div>
                            </div>

                            <button onClick={handlePasswordSubmit} disabled={pwdLoading} style={{
                                border: 'none', background: '#14b8a6', color: '#06302c',
                                fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 14,
                                padding: '13px 22px', borderRadius: 11, cursor: 'pointer',
                            }}>
                                {pwdLoading ? 'Aggiornamento...' : 'Aggiorna password'}
                            </button>
                        </div>

                        {/* 3) NOTIFICHE (disabled — coming soon) */}
                        <div style={{ background: '#fff', border: '1px solid #e1e6ec', borderRadius: 16, padding: '26px 28px', position: 'relative' }}>
                            <div style={{ fontSize: 17, fontWeight: 800, color: '#102a43', marginBottom: 4 }}>Notifiche</div>
                            <div style={{ fontSize: 12.5, color: '#9aa6b2', fontStyle: 'italic', marginBottom: 12 }}>Funzionalità in lavorazione</div>

                            <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
                            {[
                                { title: 'Esito delle verifiche via email', desc: 'Ricevi un riepilogo quando una verifica viene corretta.', on: false },
                                { title: 'Promemoria verifiche in scadenza', desc: 'Un avviso il giorno prima della scadenza.', on: false },
                                { title: 'Novità di prodotto', desc: 'Occasionali aggiornamenti su Testero.', on: false },
                            ].map((n, i, arr) => (
                                <div key={n.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '16px 0', borderBottom: i < arr.length - 1 ? '1px solid #eef1f4' : 'none' }}>
                                    <div>
                                        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#102a43' }}>{n.title}</div>
                                        <div style={{ fontSize: 12.5, color: '#6b7a89', marginTop: 2 }}>{n.desc}</div>
                                    </div>
                                    <Toggle on={n.on} onToggle={() => {}} />
                                </div>
                            ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
