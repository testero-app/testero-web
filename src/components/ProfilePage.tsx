import { TUser } from '../context/AssessmentContext';
import TopBar from './layout/TopBar';
import { Button, Avatar } from './ui';
import styles from './ProfilePage.module.css';

interface ProfilePageProps {
    user: TUser;
    onBack: () => void;
    onLogout: () => void;
    onChangePassword: () => void;
}

export default function ProfilePage({ user, onBack, onLogout, onChangePassword }: ProfilePageProps) {
    return (
        <div className={styles.page}>
            <TopBar userName={user.name} onLogout={onLogout} />
            <div className={styles.content}>
                <h1 className={styles.heading}>Profilo</h1>

                <div className={styles.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--m-space-4)', marginBottom: 'var(--m-space-5)' }}>
                        <Avatar name={user.name} size="md" />
                        <div>
                            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--m-text-heading)' }}>{user.name}</div>
                            <div style={{ fontSize: 13, color: 'var(--m-text-secondary)' }}>{user.class_name}</div>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <span className={styles.fieldLabel}>Username</span>
                        <span className={styles.fieldValue}>{user.username}</span>
                    </div>

                    <div className={styles.field}>
                        <span className={styles.fieldLabel}>Classe</span>
                        <span className={styles.fieldValue}>{user.class_name}</span>
                    </div>
                </div>

                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Sicurezza</h3>
                    <Button variant="secondary" onClick={onChangePassword}>Cambia password</Button>
                </div>

                <div className={styles.actions}>
                    <Button variant="ghost" onClick={onBack}>&larr; Torna alle verifiche</Button>
                </div>
            </div>
        </div>
    );
}
