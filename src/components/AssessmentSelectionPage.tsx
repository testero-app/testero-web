import { useEffect } from 'react';
import { TAssessmentListItem, TUser } from '../context/AssessmentContext';

interface AssessmentSelectionPageProps {
    user: TUser;
    assessments: TAssessmentListItem[];
    loading: boolean;
    onLoadAssessments: () => Promise<void>;
    onSelectAssessment: (assessmentId: string) => void;
    onLogout: () => void;
}

function getAssessmentAbbrev(title: string): string {
    const words = title.split(/\s+/).filter(w => w.length > 3);
    if (words.length === 0) return title.slice(0, 2).toUpperCase();
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[words.length - 2][0] + words[words.length - 1][0]).toUpperCase();
}

export default function AssessmentSelectionPage({ user, assessments, loading, onLoadAssessments, onSelectAssessment, onLogout }: AssessmentSelectionPageProps) {
    useEffect(() => {
        if (assessments.length === 0) {
            onLoadAssessments();
        }
    }, [assessments.length, onLoadAssessments]);

    return (
        <div className="sel-page">
            <nav className="sel-nav">
                <div className="sel-brand">
                    <span className="sel-brand-dot"></span>
                    <span>TESTERO</span>
                </div>
                <div className="sel-user">
                    <div className="sel-user-info">
                        <span className="sel-user-name">{user.name}</span>
                        <span className="sel-user-class">{user.class_name}</span>
                    </div>
                    <button className="sel-logout" onClick={onLogout}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 11.5L13.5 8L10 4.5"/>
                            <path d="M13 8H6"/>
                            <path d="M6 2.5H3.5C2.95 2.5 2.5 2.95 2.5 3.5v9c0 .55.45 1 1 1H6"/>
                        </svg>
                        Esci
                    </button>
                </div>
            </nav>

            <main className="sel-main">
                <div className="sel-page-head">
                    <h1 className="sel-heading">Scegli una verifica</h1>
                    <p className="sel-desc">Seleziona il test che vuoi sostenere. Il tempo parte al primo click.</p>
                </div>

                {loading && <p className="sel-empty-text">Caricamento...</p>}

                {!loading && assessments.length === 0 && (
                    <div className="sel-empty">
                        <div className="sel-empty-icon">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="4" y="4" width="14" height="16" rx="2"/>
                                <path d="M8 9h6M8 13h6M8 17h3"/>
                            </svg>
                        </div>
                        <h2>Nessun test al momento</h2>
                        <p>Il tuo docente non ha ancora pubblicato verifiche per la tua classe.<br/>Torna più tardi.</p>
                    </div>
                )}

                {!loading && assessments.length > 0 && (
                    <div className="sel-assessments">
                        {assessments.map(assessment => (
                            <button
                                key={assessment.id}
                                className="sel-assessment-card"
                                onClick={() => onSelectAssessment(assessment.id)}
                            >
                                <div className="sel-assessment-body">
                                    <h3 className="sel-assessment-title">{assessment.title}</h3>
                                    <div className="sel-assessment-meta">
                                        {assessment.questionsPerTest} domande<span className="sel-sep">&middot;</span>{assessment.timerMinutes} min
                                    </div>
                                </div>
                                <svg className="sel-assessment-arrow" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 4l5 5-5 5"/>
                                </svg>
                            </button>
                        ))}
                    </div>
                )}
            </main>

        </div>
    );
}
