import { useEffect, useRef } from 'react';
import hljs from '../lib/highlight';
import { TQuestion, TOption, TAnswer } from '../context/AssessmentContext';
import styles from './QuestionCard.module.css';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

interface QuestionCardProps {
    question: TQuestion;
    displayIndex: number;
    shuffledOpts: TOption[];
    answer: TAnswer | undefined;
    onAnswer: (questionId: string, answer: TAnswer) => void;
}

export default function QuestionCard({ question, displayIndex, shuffledOpts, answer, onAnswer }: QuestionCardProps) {
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current) {
            hljs.highlightElement(codeRef.current);
        }
    }, [question.code]);

    if (question.type === 'open') {
        const text = answer?.text || '';
        return (
            <div className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.number}>Domanda {displayIndex + 1}</span>
                </div>
                <div className={styles.text}>{question.text}</div>
                <textarea
                    className={styles.openTextarea}
                    placeholder="Scrivi qui la tua risposta..."
                    value={text}
                    onChange={(e) => onAnswer(question.id, { text: e.target.value })}
                />
            </div>
        );
    }

    const selectedIds = answer?.selectedIds || [];
    const motivation = answer?.motivation || '';
    const hasNessuna = selectedIds.some((id: string) => {
        const opt = question.options?.find((o: TOption) => o.id === id);
        return opt?.isFallback;
    });

    const handleOptionClick = (optionId: string) => {
        let newSelectedIds: string[];
        if (selectedIds.includes(optionId)) {
            newSelectedIds = selectedIds.filter((id: string) => id !== optionId);
        } else {
            newSelectedIds = [...selectedIds, optionId];
        }

        const newHasNessuna = newSelectedIds.some((id: string) => {
            const opt = question.options?.find((o: TOption) => o.id === id);
            return opt?.isFallback;
        });

        onAnswer(question.id, {
            selectedIds: newSelectedIds,
            motivation: newHasNessuna ? motivation : '',
        });
    };

    const handleMotivationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onAnswer(question.id, {
            selectedIds,
            motivation: e.target.value,
        });
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.number}>Domanda {displayIndex + 1}</span>
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
                        <div
                            key={opt.id}
                            className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                            onClick={() => handleOptionClick(opt.id)}
                        >
                            <div className={`${styles.checkbox} ${isSelected ? styles.checkboxSelected : ''}`}>
                                <svg className={styles.checkmark} viewBox="0 0 12 12" fill="none">
                                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className={styles.letter}>{LETTERS[idx]}</span>
                            <span className={styles.optionText}>{opt.text}</span>
                        </div>
                    );
                })}
            </div>

            <div className={`${styles.motivationContainer} ${hasNessuna ? styles.motivationVisible : ''}`}>
                <input
                    type="text"
                    className={styles.motivationInput}
                    placeholder="Motiva brevemente..."
                    value={motivation}
                    onChange={handleMotivationChange}
                />
            </div>
        </div>
    );
}
