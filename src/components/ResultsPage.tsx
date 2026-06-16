import { useEffect } from 'react';
import { TQuestion, TOption, TAnswer, TAnswerResult } from '../context/AssessmentContext';
import { Button } from './ui';
import ReviewQuestionCard from './ReviewQuestionCard';
import styles from './ResultsPage.module.css';

interface ResultsPageProps {
    shuffledQuestions: TQuestion[];
    shuffledOptions: TOption[][];
    answers: Record<string, TAnswer>;
    answerResults: TAnswerResult[];
    onBackToAssessments: () => void;
    onRedownload: () => void;
    zipName?: string;
}

function DonutChart({ correct, wrong, unanswered, total }: { correct: number; wrong: number; unanswered: number; total: number }) {
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const gap = total > 0 ? 2 : 0;

    const pCorrect = total > 0 ? correct / total : 0;
    const pWrong = total > 0 ? wrong / total : 0;
    const pUnanswered = total > 0 ? unanswered / total : 0;

    const arcCorrect = pCorrect * circumference - gap;
    const arcWrong = pWrong * circumference - gap;
    const arcUnanswered = pUnanswered * circumference - gap;

    const offsetCorrect = 0;
    const offsetWrong = -(pCorrect * circumference);
    const offsetUnanswered = -((pCorrect + pWrong) * circumference);

    return (
        <div className={styles.donut}>
            <svg viewBox="0 0 120 120" width="120" height="120">
                {pCorrect > 0 && (
                    <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--m-teal)" strokeWidth="12"
                        strokeDasharray={`${arcCorrect} ${circumference}`}
                        strokeDashoffset={offsetCorrect}
                        strokeLinecap="round" transform="rotate(-90 60 60)" />
                )}
                {pWrong > 0 && (
                    <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--m-error)" strokeWidth="12"
                        strokeDasharray={`${arcWrong} ${circumference}`}
                        strokeDashoffset={offsetWrong}
                        strokeLinecap="round" transform="rotate(-90 60 60)" />
                )}
                {pUnanswered > 0 && (
                    <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--m-border)" strokeWidth="12"
                        strokeDasharray={`${arcUnanswered} ${circumference}`}
                        strokeDashoffset={offsetUnanswered}
                        strokeLinecap="round" transform="rotate(-90 60 60)" />
                )}
            </svg>
            <div className={styles.donutCenter}>
                <span className={styles.donutScore}>{correct}/{total}</span>
                <span className={styles.donutLabel}>corrette</span>
            </div>
        </div>
    );
}

export default function ResultsPage({
    shuffledQuestions,
    shuffledOptions,
    answers,
    answerResults,
    onBackToAssessments,
    onRedownload,
}: ResultsPageProps) {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const resultMap = new Map(answerResults.map(r => [r.question_snapshot_id, r]));

    const mcQuestions = shuffledQuestions.filter(q => q.type === 'multiple');
    const correctCount = mcQuestions.filter(q => resultMap.get(q.id)?.is_correct === true).length;
    const wrongCount = mcQuestions.filter(q => resultMap.get(q.id)?.is_correct === false).length;
    const unansweredCount = mcQuestions.length - correctCount - wrongCount;
    const total = mcQuestions.length;
    const pctCorrect = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const pctWrong = total > 0 ? Math.round((wrongCount / total) * 100) : 0;
    const pctUnanswered = total > 0 ? 100 - pctCorrect - pctWrong : 0;

    return (
        <div className={styles.page}>
            <div className={styles.summary}>
                <h2 className={styles.title}>Risultati del test</h2>

                <div className={styles.summaryTop}>
                    <DonutChart correct={correctCount} wrong={wrongCount} unanswered={unansweredCount} total={total} />
                    <div className={styles.stats}>
                        <div className={`${styles.stat} ${styles.statCorrect}`}>
                            <span className={styles.statNum}>{correctCount}</span>
                            <span className={styles.statLabel}>Corrette</span>
                        </div>
                        <div className={`${styles.stat} ${styles.statWrong}`}>
                            <span className={styles.statNum}>{wrongCount}</span>
                            <span className={styles.statLabel}>Sbagliate</span>
                        </div>
                        <div className={`${styles.stat} ${styles.statUnanswered}`}>
                            <span className={styles.statNum}>{unansweredCount}</span>
                            <span className={styles.statLabel}>Non date</span>
                        </div>
                    </div>
                </div>

                <div className={styles.bar}>
                    {pctCorrect > 0 && <div className={styles.barCorrect} style={{ width: `${pctCorrect}%` }} />}
                    {pctWrong > 0 && <div className={styles.barWrong} style={{ width: `${pctWrong}%` }} />}
                    {pctUnanswered > 0 && <div className={styles.barUnanswered} style={{ width: `${pctUnanswered}%` }} />}
                </div>
                <p className={styles.scoreLine}>
                    {correctCount} / {total} domande a risposta multipla
                </p>
            </div>

            <div>
                {shuffledQuestions.map((question, idx) => {
                    const opts = shuffledOptions[idx] || [];
                    const answer = answers[question.id];
                    const result = resultMap.get(question.id);
                    const correctOptionIds = new Set(result?.correct_option_snapshot_ids ?? []);
                    return (
                        <ReviewQuestionCard
                            key={question.id}
                            questionText={question.text}
                            questionCode={question.code}
                            questionType={question.type}
                            displayIndex={idx}
                            isCorrect={result?.is_correct ?? null}
                            options={opts.map(o => ({
                                id: o.id,
                                text: o.text,
                                isCorrect: correctOptionIds.has(o.id),
                            }))}
                            selectedOptionIds={new Set(answer?.selectedIds || [])}
                            answerText={answer?.text}
                            motivation={answer?.motivation}
                        />
                    );
                })}
            </div>

            <div className={styles.actions}>
                <Button variant="ghost" onClick={onRedownload}>Scarica di nuovo</Button>
                <Button variant="accent" onClick={onBackToAssessments}>Torna ai test</Button>
            </div>
        </div>
    );
}
