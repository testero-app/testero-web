import { useEffect, useRef } from 'react';
import hljs from '../lib/highlight';
import { TQuestion, TOption, TAnswer, TAnswerResult } from '../context/AssessmentContext';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

interface ResultsPageProps {
    shuffledQuestions: TQuestion[];
    shuffledOptions: TOption[][];
    answers: Record<string, TAnswer>;
    answerResults: TAnswerResult[];
    onBackToTests: () => void;
    onRedownload: () => void;
    zipName?: string;
}

export default function ResultsPage({
    shuffledQuestions,
    shuffledOptions,
    answers,
    answerResults,
    onBackToTests,
    onRedownload,
    zipName,
}: ResultsPageProps) {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const resultMap = new Map(answerResults.map(r => [r.question_id, r]));

    const mcQuestions = shuffledQuestions.filter(q => q.type === 'multiple');
    const correctCount = mcQuestions.filter(q => resultMap.get(q.id)?.is_correct === true).length;
    const wrongCount = mcQuestions.filter(q => resultMap.get(q.id)?.is_correct === false).length;
    const unansweredCount = mcQuestions.length - correctCount - wrongCount;
    const total = mcQuestions.length;
    const pctCorrect = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const pctWrong = total > 0 ? Math.round((wrongCount / total) * 100) : 0;
    const pctUnanswered = total > 0 ? 100 - pctCorrect - pctWrong : 0;

    return (
        <div className="recap-page visible">
            <div className="results-summary">
                <h2 className="recap-title">Risultati del test</h2>
                <div className="results-stats">
                    <div className="results-stat results-stat-correct">
                        <span className="results-stat-num">{correctCount}</span>
                        <span className="results-stat-label">Corrette</span>
                        <span className="results-stat-pct">{pctCorrect}%</span>
                    </div>
                    <div className="results-stat results-stat-wrong">
                        <span className="results-stat-num">{wrongCount}</span>
                        <span className="results-stat-label">Sbagliate</span>
                        <span className="results-stat-pct">{pctWrong}%</span>
                    </div>
                    <div className="results-stat results-stat-unanswered">
                        <span className="results-stat-num">{unansweredCount}</span>
                        <span className="results-stat-label">Non date</span>
                        <span className="results-stat-pct">{pctUnanswered}%</span>
                    </div>
                </div>
                <div className="results-bar">
                    {pctCorrect > 0 && (
                        <div className="results-bar-segment results-bar-correct" style={{ width: `${pctCorrect}%` }} />
                    )}
                    {pctWrong > 0 && (
                        <div className="results-bar-segment results-bar-wrong" style={{ width: `${pctWrong}%` }} />
                    )}
                    {pctUnanswered > 0 && (
                        <div className="results-bar-segment results-bar-unanswered" style={{ width: `${pctUnanswered}%` }} />
                    )}
                </div>
                <p className="results-score-line">
                    {correctCount} / {total} domande a risposta multipla
                </p>
            </div>

            <div>
                {shuffledQuestions.map((question, idx) => {
                    const opts = shuffledOptions[idx] || [];
                    const answer = answers[question.id];
                    const result = resultMap.get(question.id);

                    return (
                        <ResultQuestion
                            key={question.id}
                            question={question}
                            displayIndex={idx}
                            shuffledOpts={opts}
                            answer={answer}
                            result={result}
                        />
                    );
                })}
            </div>

            <div className="recap-actions">
                <button className="btn-back" onClick={onRedownload}>
                    Scarica di nuovo
                </button>
                <button
                    className="btn-final-submit"
                    onClick={onBackToTests}
                    style={{ background: 'var(--accent)' }}
                >
                    Torna ai test
                </button>
            </div>
        </div>
    );
}

// ─── Single Question Result ──────────────────────────────────────────────────

interface ResultQuestionProps {
    question: TQuestion;
    displayIndex: number;
    shuffledOpts: TOption[];
    answer: TAnswer | undefined;
    result: TAnswerResult | undefined;
}

function ResultQuestion({ question, displayIndex, shuffledOpts, answer, result }: ResultQuestionProps) {
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current) {
            hljs.highlightElement(codeRef.current);
        }
    }, [question.code]);

    const isCorrect = result?.is_correct;
    const correctOptionIds = new Set(result?.correct_option_ids ?? []);

    // Badge for question status
    let badgeClass = 'results-badge-pending';
    let badgeText = 'In attesa di correzione';
    if (isCorrect === true) {
        badgeClass = 'results-badge-correct';
        badgeText = 'Corretta';
    } else if (isCorrect === false) {
        badgeClass = 'results-badge-wrong';
        badgeText = 'Sbagliata';
    }

    if (question.type === 'open') {
        const answerText = answer?.text || '';
        const hasAnswer = answerText.trim().length > 0;

        return (
            <div className={`recap-question results-question results-question-pending`}>
                <div className="recap-question-header">
                    <span className="recap-question-number">Domanda {displayIndex + 1} (Bonus)</span>
                    <span className={`recap-badge ${badgeClass}`}>{badgeText}</span>
                </div>
                <div className="recap-question-text">{question.text}</div>
                <div className={`recap-open-answer${hasAnswer ? '' : ' empty'}`}>
                    {hasAnswer ? answerText : 'Nessuna risposta'}
                </div>
            </div>
        );
    }

    const selectedIds = new Set(answer?.selectedIds || []);
    const motivation = answer?.motivation || '';
    const hasNessuna = Array.from(selectedIds).some(id => id.endsWith('_e') || id.endsWith('_d'));

    return (
        <div className={`recap-question results-question ${isCorrect === true ? 'results-question-correct' : isCorrect === false ? 'results-question-wrong' : ''}`}>
            <div className="recap-question-header">
                <span className="recap-question-number">Domanda {displayIndex + 1}</span>
                <span className={`recap-badge ${badgeClass}`}>{badgeText}</span>
            </div>
            <div className="recap-question-text">{question.text}</div>

            {question.code && (
                <div className="code-snippet">
                    <pre><code ref={codeRef} className="language-java">{question.code}</code></pre>
                </div>
            )}

            <div className="recap-options">
                {shuffledOpts.map((opt, idx) => {
                    const isSelected = selectedIds.has(opt.id);
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
