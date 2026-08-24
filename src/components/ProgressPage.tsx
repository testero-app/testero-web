import { useTranslations, useLocale } from 'use-intl';
import { useState } from 'react';
import { type TSubmissionSummary } from '../context/AssessmentContext';
import CompetenciesTab from './CompetenciesTab';
import styles from './ProgressPage.module.css';

type TabId = 'summary' | 'verifiche' | 'history';
type FilterType = 'all' | 'certifications' | 'training';
type VerificheFilter = 'all' | 'recover';

function categoryOf(type: string | undefined): 'certification' | 'training' | 'exam' {
    if (type === 'TRAINING') return 'training';
    if (type === 'EXAM') return 'exam';
    return 'certification';
}

function formatDate(iso: string, locale: string): string {
    return new Date(iso).toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

interface ProgressPageProps {
    token: string;
    submissions: TSubmissionSummary[];
    submissionsLoading: boolean;
    onSelectSubmission: (submissionId: string) => void;
    onStartTraining: (topicId: string) => void;
}

export default function ProgressPage({
    token,
    submissions,
    submissionsLoading,
    onSelectSubmission,
    onStartTraining,
}: ProgressPageProps) {
    const tp = useTranslations('progress');
    const tr = useTranslations('results');
    const locale = useLocale();
    const [activeTab, setActiveTab] = useState<TabId>('summary');
    const [filter, setFilter] = useState<FilterType>('all');
    const [verificheFilter, setVerificheFilter] = useState<VerificheFilter>('all');

    // Storico: exclude EXAM type
    const historySubmissions = submissions.filter((s) => categoryOf(s.type) !== 'exam');

    const certCount = historySubmissions.filter((s) => categoryOf(s.type) === 'certification').length;
    const trainCount = historySubmissions.filter((s) => categoryOf(s.type) === 'training').length;

    const filtered = filter === 'all'
        ? historySubmissions
        : historySubmissions.filter((s) => {
            const category = categoryOf(s.type);
            return filter === 'certifications' ? category === 'certification' : category === 'training';
        });

    // Verifiche tab: only EXAM submissions
    const examSubmissions = submissions.filter((s) => s.type === 'EXAM');
    const filteredExams = verificheFilter === 'all'
        ? examSubmissions
        : examSubmissions.filter((s) => {
            const passed = s.total_questions > 0
                && s.correct_count / s.total_questions >= 0.6;
            return !passed;
        });

    const filters: { id: FilterType; label: string; count: number }[] = [
        { id: 'all', label: tr('filterAll'), count: historySubmissions.length },
        { id: 'certifications', label: tr('filterCertifications'), count: certCount },
        { id: 'training', label: tr('filterTraining'), count: trainCount },
    ];

    return (
        <div className={styles.container}>
            {/* ── Tab bar ─────────────────────────────────────────── */}
            <div className={styles.tabBar}>
                <button
                    className={activeTab === 'summary' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('summary')}
                >
                    {tp('tabSummary')}
                </button>
                <button
                    className={activeTab === 'verifiche' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('verifiche')}
                >
                    {tp('tabVerifiche')}
                </button>
                <button
                    className={activeTab === 'history' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('history')}
                >
                    {tp('tabHistory')}
                </button>
            </div>

            {/* ── Summary ─────────────────────────────────────────── */}
            {activeTab === 'summary' && (
                <>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>{tp('competenciesTitle')}</h3>
                        <button
                            className={styles.weakLink}
                            onClick={() => onStartTraining('__weakest__')}
                        >
                            {tp('trainWeakLink')} &rarr;
                        </button>
                    </div>
                    <div className={styles.card}>
                        <CompetenciesTab token={token} onStartTraining={onStartTraining} />
                    </div>
                </>
            )}

            {/* ── Verifiche ──────────────────────────────────────── */}
            {activeTab === 'verifiche' && (
                <>
                    <div className={styles.verificheNote}>
                        <span>{tp('verificheNote')} </span>
                        <button
                            className={styles.verificheActiveLink}
                            onClick={() => {
                                // Navigate handled at parent level — but for now
                                // this is an in-page note, not a real navigation
                            }}
                        >
                            {tp('verificheActiveLink')}
                        </button>
                    </div>

                    <div className={styles.filters}>
                        <button
                            className={`${styles.filterPill} ${verificheFilter === 'all' ? styles.filterPillActive : ''}`}
                            onClick={() => setVerificheFilter('all')}
                        >
                            {tp('filterAll')}
                        </button>
                        <button
                            className={`${styles.filterPill} ${verificheFilter === 'recover' ? styles.filterPillActive : ''}`}
                            onClick={() => setVerificheFilter('recover')}
                        >
                            {tp('filterRecover')}
                        </button>
                    </div>

                    {submissionsLoading ? (
                        <div>
                            <div className={styles.skeleton} />
                            <div className={styles.skeleton} style={{ marginTop: 12 }} />
                        </div>
                    ) : filteredExams.length === 0 ? (
                        <div className={styles.empty}>{tr('empty')}</div>
                    ) : (
                        <div className={styles.verificheTable}>
                            <div className={styles.tableHeader}>
                                <div className={styles.tableHeaderCell}>{tp('colVerifica')}</div>
                                <div className={styles.tableHeaderCell}>{tp('colClasse')}</div>
                                <div className={styles.tableHeaderCell}>{tp('colScadenza')}</div>
                                <div className={styles.tableHeaderCell}>{tp('colPoints')}</div>
                                <div className={styles.tableHeaderCell}>{tp('colResult')}</div>
                            </div>

                            {filteredExams.map((s) => {
                                const passed = s.total_questions > 0
                                    && s.correct_count / s.total_questions >= 0.6;
                                const submitted = !!s.submitted_at;

                                let badgeClass: string;
                                let badgeLabel: string;
                                if (!submitted) {
                                    badgeClass = styles.badgeNotTaken;
                                    badgeLabel = tp('notTaken');
                                } else if (passed) {
                                    badgeClass = styles.badgePass;
                                    badgeLabel = tr('passed');
                                } else {
                                    badgeClass = styles.badgeFail;
                                    badgeLabel = tr('notPassed');
                                }

                                return (
                                    <div
                                        key={s.id}
                                        className={styles.tableRow}
                                        onClick={() => onSelectSubmission(s.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                onSelectSubmission(s.id);
                                            }
                                        }}
                                    >
                                        <div className={styles.tableCell}>
                                            <span className={styles.cellName}>
                                                {s.assessment_title}
                                            </span>
                                        </div>
                                        <div className={styles.tableCell}>
                                            <span className={styles.cellType}>—</span>
                                        </div>
                                        <div className={styles.tableCell}>
                                            <span className={styles.cellDate}>
                                                {s.submitted_at ? formatDate(s.submitted_at, locale) : '—'}
                                            </span>
                                        </div>
                                        <div className={styles.tableCell}>
                                            <span className={styles.cellPoints}>
                                                {s.correct_count}/{s.total_questions}
                                            </span>
                                        </div>
                                        <div className={styles.tableCell}>
                                            <span className={`${styles.badge} ${badgeClass}`}>
                                                {badgeLabel}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* ── History ─────────────────────────────────────────── */}
            {activeTab === 'history' && (
                <>
                    <div className={styles.filters}>
                        <span className={styles.filterLabel}>{tr('filterLabel')}</span>
                        {filters.map((f) => (
                            <button
                                key={f.id}
                                className={`${styles.filterPill} ${filter === f.id ? styles.filterPillActive : ''}`}
                                onClick={() => setFilter(f.id)}
                            >
                                {f.label} <span className={styles.filterCount}>{f.count}</span>
                            </button>
                        ))}
                    </div>

                    {submissionsLoading ? (
                        <div>
                            <div className={styles.skeleton} />
                            <div className={styles.skeleton} style={{ marginTop: 12 }} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className={styles.empty}>{tr('empty')}</div>
                    ) : (
                        <div className={styles.table}>
                            <div className={styles.tableHeader}>
                                <div className={styles.tableHeaderCell}>{tp('colName')}</div>
                                <div className={styles.tableHeaderCell}>{tp('colType')}</div>
                                <div className={styles.tableHeaderCell}>{tp('colDate')}</div>
                                <div className={styles.tableHeaderCell}>{tp('colPoints')}</div>
                                <div className={styles.tableHeaderCell}>{tp('colResult')}</div>
                            </div>

                            {filtered.map((s) => {
                                const passed = s.total_questions > 0
                                    && s.correct_count / s.total_questions >= 0.6;
                                const category = categoryOf(s.type);

                                return (
                                    <div
                                        key={s.id}
                                        className={styles.tableRow}
                                        onClick={() => onSelectSubmission(s.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                onSelectSubmission(s.id);
                                            }
                                        }}
                                    >
                                        <div className={styles.tableCell}>
                                            <span className={styles.cellName}>
                                                {s.assessment_title}
                                            </span>
                                        </div>
                                        <div className={styles.tableCell}>
                                            <span className={styles.cellType}>
                                                {category === 'certification'
                                                    ? tr('tagCertification')
                                                    : tr('tagTraining')}
                                            </span>
                                        </div>
                                        <div className={styles.tableCell}>
                                            <span className={styles.cellDate}>
                                                {s.submitted_at ? formatDate(s.submitted_at, locale) : ''}
                                            </span>
                                        </div>
                                        <div className={styles.tableCell}>
                                            <span className={styles.cellPoints}>
                                                {s.correct_count}/{s.total_questions}
                                            </span>
                                        </div>
                                        <div className={styles.tableCell}>
                                            <span className={`${styles.badge} ${passed ? styles.badgePass : styles.badgeFail}`}>
                                                {passed ? tr('passed') : tr('notPassed')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
