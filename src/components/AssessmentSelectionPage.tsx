import { useEffect, ReactNode } from 'react';
import { TAssessmentListItem, TUser } from '../context/AssessmentContext';
import TopBar from './layout/TopBar';
import { Badge, Skeleton } from './ui';
import styles from './AssessmentSelectionPage.module.css';

interface AssessmentSelectionPageProps {
    user: TUser;
    assessments: TAssessmentListItem[];
    loading: boolean;
    onLoadAssessments: () => Promise<void>;
    onSelectAssessment: (assessmentId: string) => void;
    onLogout: () => void;
    onProfile?: () => void;
    activeTab?: 'assessments' | 'history';
    onTabChange?: (tab: 'assessments' | 'history') => void;
    historyContent?: ReactNode;
}

function getAbbrev(title: string): string {
    const words = title.split(/[\s—–-]+/).filter(w => w.length > 1);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return title.slice(0, 2).toUpperCase();
}

function getStatusBadge(assessment: TAssessmentListItem) {
    if (assessment.status === 'IN_PROGRESS') return <Badge variant="inCorso">In corso</Badge>;
    if (assessment.status === 'SUBMITTED') return <Badge variant="completato">Completato</Badge>;
    return <Badge variant="nuovo">Nuovo</Badge>;
}

function getActionButton(assessment: TAssessmentListItem, onClick: () => void) {
    if (assessment.status === 'SUBMITTED') {
        return (
            <button className="ts-btn ts-btn--secondary" onClick={onClick}>Riprova</button>
        );
    }
    if (assessment.status === 'IN_PROGRESS') {
        return (
            <button className="ts-btn ts-btn--primary" onClick={onClick}>
                Continua
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#06302c" strokeWidth="2.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
        );
    }
    return (
        <button className="ts-btn ts-btn--primary" onClick={onClick}>
            Avvia
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#06302c" strokeWidth="2.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
    );
}

export default function AssessmentSelectionPage({
    user, assessments, loading, onLoadAssessments, onSelectAssessment,
    onLogout, onProfile, activeTab = 'assessments', onTabChange, historyContent,
}: AssessmentSelectionPageProps) {
    useEffect(() => {
        if (assessments.length === 0) {
            onLoadAssessments();
        }
    }, [assessments.length, onLoadAssessments]);

    return (
        <div className={styles.page}>
            <TopBar userName={`${user.first_name} ${user.last_name}`} onLogout={onLogout} onProfile={onProfile} />

            <div className={styles.body}>
                <div className={styles.inner} style={{ maxWidth: 920, margin: '0 auto' }}>

                    <div className={styles.title}>
                        {activeTab === 'assessments' ? 'Le tue verifiche' : 'I miei risultati'}
                    </div>
                    <div className={styles.sub}>
                        {activeTab === 'assessments' && (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9a6a08" strokeWidth="2">
                                <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />
                            </svg>
                        )}
                        {activeTab === 'assessments'
                            ? 'Seleziona il test che vuoi sostenere. Il tempo parte al primo click.'
                            : 'Rivedi i risultati delle verifiche che hai completato.'}
                    </div>

                    {onTabChange && (
                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tabItem} ${activeTab === 'assessments' ? styles.tabActive : ''}`}
                                onClick={() => onTabChange('assessments')}
                            >
                                Verifiche
                            </button>
                            <button
                                className={`${styles.tabItem} ${activeTab === 'history' ? styles.tabActive : ''}`}
                                onClick={() => onTabChange('history')}
                            >
                                I miei risultati
                            </button>
                        </div>
                    )}

                    {activeTab === 'history' && historyContent}

                    {activeTab === 'assessments' && loading && (
                        <div className={styles.list}>
                            {[1, 2].map((i) => (
                                <div key={i} className={styles.loadingRow}>
                                    <Skeleton width={46} height={46} variant="rect" />
                                    <div style={{ flex: 1 }}>
                                        <Skeleton width="50%" height={16} variant="text" />
                                        <div style={{ marginTop: 6 }}><Skeleton width="30%" height={12} variant="text" /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'assessments' && !loading && assessments.length === 0 && (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="4" y="4" width="14" height="16" rx="2" />
                                    <path d="M8 9h6M8 13h6M8 17h3" />
                                </svg>
                            </div>
                            <h2 className={styles.emptyTitle}>Nessuna verifica assegnata</h2>
                            <p className={styles.emptyText}>
                                Il tuo docente non ha ancora pubblicato verifiche per la tua classe. Torna più tardi.
                            </p>
                        </div>
                    )}

                    {activeTab === 'assessments' && !loading && assessments.length > 0 && (
                        <div className={styles.list}>
                            {assessments.map(assessment => {
                                const isNew = assessment.status !== 'SUBMITTED' && assessment.status !== 'IN_PROGRESS';
                                const isCompleted = assessment.status === 'SUBMITTED';
                                return (
                                    <div
                                        key={assessment.id}
                                        className={`${styles.row} ${isNew ? styles.rowNew : ''}`}
                                    >
                                        <div className={`${styles.rowIcon} ${isCompleted ? styles.rowIconCompleted : ''}`}>
                                            {getAbbrev(assessment.title)}
                                        </div>
                                        <div className={styles.rowBody}>
                                            <div className={styles.rowTitle}>{assessment.title}</div>
                                            <div className={styles.rowMeta}>
                                                {assessment.questionsPerAssessment} domande &middot; {assessment.timerMinutes} min
                                            </div>
                                        </div>
                                        {getStatusBadge(assessment)}
                                        <div className={styles.rowAction}>
                                            {getActionButton(assessment, () => onSelectAssessment(assessment.id))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
