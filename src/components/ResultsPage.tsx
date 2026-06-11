import { useEffect } from 'react';
import { TQuestion, TOption, TAnswer, TAnswerResult } from '../context/AssessmentContext';
import ReviewQuestionCard from './ReviewQuestionCard';

interface ResultsPageProps {
    shuffledQuestions: TQuestion[];
    shuffledOptions: TOption[][];
    answers: Record<string, TAnswer>;
    answerResults: TAnswerResult[];
    onBackToAssessments: () => void;
    onRedownload: () => void;
    zipName?: string;
}

export default function ResultsPage({
    shuffledQuestions,
    shuffledOptions,
    answers,
    answerResults,
    onBackToAssessments,
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
                    const correctOptionIds = new Set(result?.correct_option_ids ?? []);

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

            <div className="recap-actions">
                <button className="btn-back" onClick={onRedownload}>
                    Scarica di nuovo
                </button>
                <button
                    className="btn-final-submit"
                    onClick={onBackToAssessments}
                    style={{ background: 'var(--accent)' }}
                >
                    Torna ai test
                </button>
            </div>
        </div>
    );
}
