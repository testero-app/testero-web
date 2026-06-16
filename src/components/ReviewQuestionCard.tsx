import { useEffect, useRef } from 'react';
import hljs from '../lib/highlight';
import styles from './ReviewQuestionCard.module.css';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

interface ReviewQuestionCardProps {
    questionText: string;
    questionCode?: string | null;
    questionType: string;
    displayIndex: number;
    isCorrect: boolean | null;
    options: { id: string; text: string; isCorrect: boolean }[];
    selectedOptionIds: Set<string>;
    answerText?: string;
    motivation?: string;
}

export default function ReviewQuestionCard({
    questionText,
    questionCode,
    questionType,
    displayIndex,
    isCorrect,
    options,
    selectedOptionIds,
    answerText,
    motivation,
}: ReviewQuestionCardProps) {
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current) {
            hljs.highlightElement(codeRef.current);
        }
    }, [questionCode]);

    const isUnanswered = questionType === 'multiple' && isCorrect === null && selectedOptionIds.size === 0;
    let badgeClass = styles.badgePending;
    let badgeText = 'In attesa';
    if (isCorrect === true) {
        badgeClass = styles.badgeCorrect;
        badgeText = 'Corretta';
    } else if (isCorrect === false) {
        badgeClass = styles.badgeWrong;
        badgeText = 'Sbagliata';
    } else if (isUnanswered) {
        badgeText = 'Non data';
    }

    const questionClass = [
        styles.question,
        isCorrect === true && styles.questionCorrect,
        isCorrect === false && styles.questionWrong,
    ].filter(Boolean).join(' ');

    if (questionType === 'open') {
        const text = answerText || '';
        const hasAnswer = text.trim().length > 0;
        return (
            <div className={questionClass}>
                <div className={styles.header}>
                    <span className={styles.number}>Domanda {displayIndex + 1} (Bonus)</span>
                    <span className={badgeClass}>{badgeText}</span>
                </div>
                <div className={styles.text}>{questionText}</div>
                <div className={`${styles.openAnswer} ${!hasAnswer ? styles.openAnswerEmpty : ''}`}>
                    {hasAnswer ? text : 'Nessuna risposta'}
                </div>
            </div>
        );
    }

    const correctOptionIds = new Set(options.filter(o => o.isCorrect).map(o => o.id));
    const hasNessuna = Array.from(selectedOptionIds).some(id => id.endsWith('_e') || id.endsWith('_d'));

    return (
        <div className={questionClass}>
            <div className={styles.header}>
                <span className={styles.number}>Domanda {displayIndex + 1}</span>
                <span className={badgeClass}>{badgeText}</span>
            </div>
            <div className={styles.text}>{questionText}</div>

            {questionCode && (
                <div className={styles.codeSnippet}>
                    <pre><code ref={codeRef} className="language-java">{questionCode}</code></pre>
                </div>
            )}

            <div className={styles.options}>
                {options.map((opt, idx) => {
                    const isSelected = selectedOptionIds.has(opt.id);
                    const isCorrectOpt = correctOptionIds.has(opt.id);

                    let optClass = styles.option;
                    let iconClass = '';
                    let icon = '';

                    if (isSelected && isCorrectOpt) {
                        optClass += ` ${styles.optionCorrect}`;
                        iconClass = styles.iconCorrect;
                        icon = '\u2713';
                    } else if (isSelected && !isCorrectOpt) {
                        optClass += ` ${styles.optionWrong}`;
                        iconClass = styles.iconWrong;
                        icon = '\u2717';
                    } else if (!isSelected && isCorrectOpt) {
                        optClass += ` ${styles.optionMissed}`;
                        iconClass = styles.iconMissed;
                        icon = '\u2713';
                    }

                    return (
                        <div key={opt.id} className={optClass}>
                            <span className={styles.letter}>{LETTERS[idx]})</span>
                            <span className={styles.optionText}>{opt.text}</span>
                            {icon && <span className={`${styles.icon} ${iconClass}`}>{icon}</span>}
                        </div>
                    );
                })}
            </div>

            {hasNessuna && motivation && (
                <div className={styles.motivation}>
                    <strong>Motivazione:</strong> {motivation}
                </div>
            )}
        </div>
    );
}
