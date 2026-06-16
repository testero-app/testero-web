import { useEffect, ReactNode } from 'react';
import { TAssessmentListItem, TUser } from '../context/AssessmentContext';
import TopBar from './layout/TopBar';
import { SegmentedControl, Badge, Skeleton } from './ui';
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

function getStatusBadge(assessment: TAssessmentListItem) {
    const status = assessment.status;
    if (status === 'IN_PROGRESS') return <Badge variant="inCorso">In corso</Badge>;
    if (status === 'SUBMITTED') return <Badge variant="completato">Completato</Badge>;
    return <Badge variant="avvia">Avvia</Badge>;
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

    const tabOptions = [
        { value: 'assessments', label: 'Verifiche' },
        { value: 'history', label: 'I miei risultati' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--m-bg)' }}>
            <TopBar userName={user.name} onLogout={onLogout} onProfile={onProfile} />

            <main className={styles.main}>
                <div className={styles.pageHead}>
                    <h1 className={styles.heading}>
                        {activeTab === 'assessments' ? 'Le tue verifiche' : 'I miei risultati'}
                    </h1>
                    <p className={styles.desc}>
                        {activeTab === 'assessments'
                            ? 'Seleziona il test che vuoi sostenere. Il tempo parte al primo click.'
                            : 'Rivedi i risultati delle verifiche che hai completato.'}
                    </p>
                </div>

                {onTabChange && (
                    <div className={styles.tabs}>
                        <SegmentedControl
                            options={tabOptions}
                            value={activeTab}
                            onChange={(v) => onTabChange(v as 'assessments' | 'history')}
                        />
                    </div>
                )}

                {activeTab === 'history' && historyContent}

                {activeTab === 'assessments' && loading && (
                    <div className={styles.grid}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={styles.card} style={{ cursor: 'default' }}>
                                <Skeleton width="60%" height={16} variant="text" />
                                <div style={{ marginTop: 12 }}><Skeleton width="40%" height={12} variant="text" /></div>
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
                    <div className={styles.grid}>
                        {assessments.map(assessment => (
                            <button
                                key={assessment.id}
                                className={styles.card}
                                onClick={() => onSelectAssessment(assessment.id)}
                            >
                                <div className={styles.cardTop}>
                                    <h3 className={styles.cardTitle}>{assessment.title}</h3>
                                    {getStatusBadge(assessment)}
                                </div>
                                <div className={styles.cardMeta}>
                                    <span>{assessment.questionsPerAssessment} domande</span>
                                    <span className={styles.metaSep}>&middot;</span>
                                    <span>{assessment.timerMinutes} min</span>
                                    <span style={{ marginLeft: 'auto' }}>
                                        <svg className={styles.cardArrow} width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 4l5 5-5 5" />
                                        </svg>
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
