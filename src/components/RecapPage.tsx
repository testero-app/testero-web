import { useTranslations } from 'next-intl';
import { TQuestion, TOption, TAnswer } from '../context/AssessmentContext';
import { isQuestionAnswered } from '../lib/questionUtils';
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
    const t = useTranslations('recap');
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t('title')}</h2>
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

            {/* Sticky submit bar */}
            <div className={styles.submitBar}>
                <span className={styles.submitBarCounter}>
                    {answeredCount} / {totalQuestions} risposte date
                </span>
                <div className={styles.submitBarActions}>
                    {!timerExpired && (
                        <button className="ts-btn ts-btn--secondary" onClick={onBackToAssessment}>
                            Torna al test
                        </button>
                    )}
                    <button className="ts-btn ts-btn--dark" onClick={onFinalSubmit}>
                        {timerExpired ? t('download') : t('confirmSubmit')}
                    </button>
                </div>
            </div>
        </div>
    );
}
