import { useEffect, useRef } from 'react';
import hljs from '../lib/highlight';
import { TQuestion, TOption, TAnswer } from '../context/TestContext';

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
            <div className="question active" data-type="open" data-question-id={question.id}>
                <div className="question-header">
                    <span className="question-number">Domanda {displayIndex + 1}</span>
                </div>
                <div className="question-text">{question.text}</div>
                <div className="open-answer-container">
                    <textarea
                        className="open-answer-textarea"
                        placeholder="Scrivi qui la tua risposta..."
                        value={text}
                        onChange={(e) => onAnswer(question.id, { text: e.target.value })}
                    />
                </div>
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
            motivation: newHasNessuna ? motivation : ''
        });
    };

    const handleMotivationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onAnswer(question.id, {
            selectedIds,
            motivation: e.target.value
        });
    };

    return (
        <div className="question active" data-question-id={question.id}>
            <div className="question-header">
                <span className="question-number">Domanda {displayIndex + 1}</span>
            </div>
            <div className="question-text">{question.text}</div>

            {question.code && (
                <div className="code-snippet">
                    <pre><code ref={codeRef} className="language-java">{question.code}</code></pre>
                </div>
            )}

            <div className="options">
                {shuffledOpts.map((opt, idx) => {
                    const isSelected = selectedIds.includes(opt.id);
                    return (
                        <div
                            key={opt.id}
                            className={`option${isSelected ? ' selected' : ''}`}
                            onClick={() => handleOptionClick(opt.id)}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                            />
                            <span className="option-letter">{LETTERS[idx]}</span>
                            <span className="option-text">{opt.text}</span>
                        </div>
                    );
                })}
            </div>

            <div className={`motivation-container${hasNessuna ? ' visible' : ''}`}>
                <input
                    type="text"
                    className="motivation-input"
                    placeholder="Motiva brevemente..."
                    value={motivation}
                    onChange={handleMotivationChange}
                />
            </div>
        </div>
    );
}
