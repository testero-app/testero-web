import { TQuestion, TOption, TAnswer } from '../context/AssessmentContext';
import { isQuestionAnswered } from '../lib/questionUtils';
import { Button } from './ui';
import RecapQuestion from './RecapQuestion';
import styles from './RecapPage.module.css';

interface RecapPageProps {
    shuffledQuestions: TQuestion[];
    shuffledOptions: TOption[][];
    answers: Record<string, TAnswer>;
    answeredCount: number;
    totalQuestions: number;
    timerExpired: boolean;
    onBackToAssessment: () => void;
    onFinalSubmit: () => void;
}

export default function RecapPage({
    shuffledQuestions,
    shuffledOptions,
    answers,
    answeredCount,
    totalQuestions,
    timerExpired,
    onBackToAssessment,
    onFinalSubmit,
}: RecapPageProps) {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Riepilogo risposte</h2>
                <p className={styles.counter}>
                    <span className={styles.counterStrong}>{answeredCount}</span> / {totalQuestions} risposte date
                </p>
            </div>
            <div>
                {shuffledQuestions.map((question, idx) => {
                    const opts = shuffledOptions[idx] || [];
                    const answer = answers[question.id];
                    const answered = isQuestionAnswered(question, answer);
                    return (
                        <RecapQuestion
                            key={question.id}
                            question={question}
                            displayIndex={idx}
                            shuffledOpts={opts}
                            answer={answer}
                            isAnswered={answered}
                        />
                    );
                })}
            </div>
            <div className={styles.actions}>
                {!timerExpired && (
                    <Button variant="ghost" onClick={onBackToAssessment}>&larr; Torna al test</Button>
                )}
                <Button variant="primary" onClick={onFinalSubmit}>
                    {timerExpired ? 'Scarica risposte' : 'Conferma e consegna'}
                </Button>
            </div>
        </div>
    );
}
