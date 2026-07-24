import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import hljs from '../lib/highlight';
import { TQuestion, TOption, TAnswer } from '../context/AssessmentContext';
import { Badge } from './ui';
import styles from './RecapQuestion.module.css';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

interface RecapQuestionProps {
    question: TQuestion;
    displayIndex: number;
    shuffledOpts: TOption[];
    answer: TAnswer | undefined;
    isAnswered: boolean;
}

export default function RecapQuestion({ question, displayIndex, shuffledOpts, answer, isAnswered }: RecapQuestionProps) {
    const t = useTranslations('recap');
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current) {
            hljs.highlightElement(codeRef.current);
        }
    }, [question.code]);

    if (question.type === 'open') {
        const answerText = answer?.text || '';
        const hasAnswer = answerText.trim().length > 0;
        return (
            <div className={styles.question}>
                <div className={styles.header}>
                    <span className={styles.number}>Domanda {displayIndex + 1} (Bonus)</span>
                    <Badge variant={hasAnswer ? 'avvia' : 'scaduto'}>
                        {hasAnswer ? t('answered') : t('notAnswered')}
                    </Badge>
                </div>
                <div className={styles.text}>{question.text}</div>
                <div className={`${styles.openAnswer} ${!hasAnswer ? styles.openAnswerEmpty : ''}`}>
                    {hasAnswer ? answerText : t('noAnswer')}
                </div>
            </div>
        );
    }

    const selectedIds = answer?.selectedIds || [];
    const motivation = answer?.motivation || '';
    const hasNessuna = selectedIds.some((id: string) => id.endsWith('_e'));

    return (
        <div className={styles.question}>
            <div className={styles.header}>
                <span className={styles.number}>Domanda {displayIndex + 1}</span>
                <Badge variant={isAnswered ? 'avvia' : 'scaduto'}>
                    {isAnswered ? t('answered') : t('notAnswered')}
                </Badge>
            </div>
            <div className={styles.text}>{question.text}</div>

            {question.code && (
                <div className={styles.codeSnippet}>
                    <pre><code ref={codeRef} className="language-java">{question.code}</code></pre>
                </div>
            )}

            <div className={styles.options}>
                {shuffledOpts.map((opt, idx) => {
                    const isSelected = selectedIds.includes(opt.id);
                    return (
                        <div key={opt.id} className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}>
                            <span className={styles.letter}>{LETTERS[idx]})</span>
                            <span>{opt.text}</span>
                        </div>
                    );
                })}
            </div>

            {hasNessuna && motivation && (
                <div className={styles.motivation}>
                    <strong>{t('motivation')}</strong> {motivation}
                </div>
            )}
        </div>
    );
}
