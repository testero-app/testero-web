import { useEffect, useRef } from 'react';
import hljs from '../lib/highlight';

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

    // Badge for question status
    const isUnanswered = questionType === 'multiple' && isCorrect === null && selectedOptionIds.size === 0;
    let badgeClass = 'results-badge-pending';
    let badgeText = 'In attesa di correzione';
    if (isCorrect === true) {
        badgeClass = 'results-badge-correct';
        badgeText = 'Corretta';
    } else if (isCorrect === false) {
        badgeClass = 'results-badge-wrong';
        badgeText = 'Sbagliata';
    } else if (isUnanswered) {
        badgeText = 'Non data';
    }

    if (questionType === 'open') {
        const text = answerText || '';
        const hasAnswer = text.trim().length > 0;

        return (
            <div className={`recap-question results-question results-question-pending`}>
                <div className="recap-question-header">
                    <span className="recap-question-number">Domanda {displayIndex + 1} (Bonus)</span>
                    <span className={`recap-badge ${badgeClass}`}>{badgeText}</span>
                </div>
                <div className="recap-question-text">{questionText}</div>
                <div className={`recap-open-answer${hasAnswer ? '' : ' empty'}`}>
                    {hasAnswer ? text : 'Nessuna risposta'}
                </div>
            </div>
        );
    }

    const hasNessuna = Array.from(selectedOptionIds).some(id => id.endsWith('_e') || id.endsWith('_d'));
    const correctOptionIds = new Set(options.filter(o => o.isCorrect).map(o => o.id));

    return (
        <div className={`recap-question results-question ${isCorrect === true ? 'results-question-correct' : isCorrect === false ? 'results-question-wrong' : ''}`}>
            <div className="recap-question-header">
                <span className="recap-question-number">Domanda {displayIndex + 1}</span>
                <span className={`recap-badge ${badgeClass}`}>{badgeText}</span>
            </div>
            <div className="recap-question-text">{questionText}</div>

            {questionCode && (
                <div className="code-snippet">
                    <pre><code ref={codeRef} className="language-java">{questionCode}</code></pre>
                </div>
            )}

            <div className="recap-options">
                {options.map((opt, idx) => {
                    const isSelected = selectedOptionIds.has(opt.id);
                    const isCorrectOption = correctOptionIds.has(opt.id);

                    let optionClass = 'recap-option';
                    if (isSelected && isCorrectOption) {
                        optionClass += ' results-option-correct';
                    } else if (isSelected && !isCorrectOption) {
                        optionClass += ' results-option-wrong';
                    } else if (!isSelected && isCorrectOption) {
                        optionClass += ' results-option-missed';
                    }

                    return (
                        <div key={opt.id} className={optionClass}>
                            <span className="recap-option-letter">{LETTERS[idx]})</span>
                            <span className="results-option-text">{opt.text}</span>
                            {isSelected && isCorrectOption && <span className="results-icon">&#10003;</span>}
                            {isSelected && !isCorrectOption && <span className="results-icon results-icon-wrong">&#10007;</span>}
                            {!isSelected && isCorrectOption && <span className="results-icon results-icon-missed">&#10003;</span>}
                        </div>
                    );
                })}
            </div>

            {hasNessuna && motivation && (
                <div className="recap-motivation">
                    <strong>Motivazione:</strong> {motivation}
                </div>
            )}
        </div>
    );
}
