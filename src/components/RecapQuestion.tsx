import { useEffect, useRef } from 'react';
import hljs from '../lib/highlight';
import { TQuestion, TOption, TAnswer } from '../context/TestContext';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

interface RecapQuestionProps {
    question: TQuestion;
    displayIndex: number;
    shuffledOpts: TOption[];
    answer: TAnswer | undefined;
    isAnswered: boolean;
}

export default function RecapQuestion({ question, displayIndex, shuffledOpts, answer, isAnswered }: RecapQuestionProps) {
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
            <div className="recap-question">
                <div className="recap-question-header">
                    <span className="recap-question-number">Domanda {displayIndex + 1} (Bonus)</span>
                    <span className={`recap-badge ${hasAnswer ? 'answered' : 'unanswered'}`}>
                        {hasAnswer ? 'Risposta data' : 'Non data'}
                    </span>
                </div>
                <div className="recap-question-text">{question.text}</div>
                <div className={`recap-open-answer${hasAnswer ? '' : ' empty'}`}>
                    {hasAnswer ? answerText : 'Nessuna risposta'}
                </div>
            </div>
        );
    }

    const selectedIds = answer?.selectedIds || [];
    const motivation = answer?.motivation || '';
    const hasNessuna = selectedIds.some((id: string) => id.endsWith('_e'));    
    
    return (
        <div className="recap-question">
            <div className="recap-question-header">
                <span className="recap-question-number">Domanda {displayIndex + 1}</span>
                <span className={`recap-badge ${isAnswered ? 'answered' : 'unanswered'}`}>
                    {isAnswered ? 'Risposta data' : 'Non data'}
                </span>
            </div>
            <div className="recap-question-text">{question.text}</div>

            {question.code && (
                <div className="code-snippet">
                    <pre><code ref={codeRef} className="language-java">{question.code}</code></pre>
                </div>
            )}

            <div className="recap-options">
                {shuffledOpts.map((opt, idx) => {
                    const isSelected = selectedIds.includes(opt.id);
                    return (
                        <div key={opt.id} className={`recap-option${isSelected ? ' selected' : ''}`}>
                            <span className="recap-option-letter">{LETTERS[idx]})</span>
                            <span>{opt.text}</span>
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
