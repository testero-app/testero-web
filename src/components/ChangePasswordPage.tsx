import { useState } from 'react';
import { TUser } from '../context/AssessmentContext';
import { changePassword } from '../lib/api';
import TopBar from './layout/TopBar';
import { Button, Input } from './ui';
import styles from './ChangePasswordPage.module.css';

interface ChangePasswordPageProps {
    user: TUser;
    token: string;
    onBack: () => void;
    onLogout: () => void;
}

export default function ChangePasswordPage({ user, token, onBack, onLogout }: ChangePasswordPageProps) {
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPwd !== confirmPwd) {
            setError('Le password non coincidono.');
            return;
        }
        if (newPwd.length < 8) {
            setError('La password deve avere almeno 8 caratteri.');
            return;
        }

        setLoading(true);
        try {
            await changePassword(currentPwd, newPwd, confirmPwd, token);
            setSuccess(true);
            setCurrentPwd('');
            setNewPwd('');
            setConfirmPwd('');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Errore durante il cambio password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <TopBar userName={user.name} onLogout={onLogout} />
            <div className={styles.content}>
                <h1 className={styles.heading}>Cambia password</h1>
                <p className={styles.subtitle}>Aggiorna la password del tuo account.</p>

                <div className={styles.card}>
                    {success && (
                        <div className={styles.successBox}>Password aggiornata con successo.</div>
                    )}
                    {error && <div className={styles.errorBox}>{error}</div>}

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <Input
                            label="Password attuale"
                            type="password"
                            value={currentPwd}
                            onChange={(e) => setCurrentPwd(e.target.value)}
                            disabled={loading}
                            autoComplete="current-password"
                        />
                        <Input
                            label="Nuova password"
                            type="password"
                            value={newPwd}
                            onChange={(e) => setNewPwd(e.target.value)}
                            disabled={loading}
                            autoComplete="new-password"
                        />
                        <Input
                            label="Conferma nuova password"
                            type="password"
                            value={confirmPwd}
                            onChange={(e) => setConfirmPwd(e.target.value)}
                            disabled={loading}
                            autoComplete="new-password"
                        />
                        <Button variant="accent" type="submit" fullWidth loading={loading}
                            disabled={!currentPwd || !newPwd || !confirmPwd}>
                            Aggiorna password
                        </Button>
                    </form>
                </div>

                <div className={styles.actions}>
                    <Button variant="ghost" onClick={onBack}>&larr; Torna al profilo</Button>
                </div>
            </div>
        </div>
    );
}
