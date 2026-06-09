import { TQuestion, TOption, TAnswer } from '../context/AssessmentContext';
import { isQuestionAnswered } from '../lib/questionUtils';
import RecapQuestion from './RecapQuestion';
interface RecapPageProps {
    shuffledQuestions: TQuestion[];
    shuffledOptions: TOption[][];
    answers: Record<string, TAnswer>;
    answeredCount: number;
    totalQuestions: number;
    timerExpired: boolean;
    onBackToTest: () => void;
    onFinalSubmit: () => void;
}

export default function RecapPage({
    shuffledQuestions,
    shuffledOptions,
    answers,
    answeredCount,
    totalQuestions,
    timerExpired,
    onBackToTest,
    onFinalSubmit
}: RecapPageProps) {
    return (
        <div className="recap-page visible">
            <div className="recap-header">
                <h2 className="recap-title">Riepilogo risposte</h2>
                <p className="recap-counter">
                    <strong>{answeredCount}</strong> / {totalQuestions} risposte date
                </p>
            </div>
            <div>
                {shuffledQuestions.map((question, idx) => {
                    const opts = shuffledOptions[idx] || [];
                    const answer = answers[question.id];
                    const isAnswered = getIsAnswered(question, answer);

                    return (
                        <RecapQuestion
                            key={question.id}
                            question={question}
                            displayIndex={idx}
                            shuffledOpts={opts}
                            answer={answer}
                            isAnswered={isAnswered}
                        />
                    );
                })}
            </div>
            <div className="recap-actions">
                {!timerExpired && (
                    <button className="btn-back" onClick={onBackToTest}>← Torna al test</button>
                )}
                <button className="btn-final-submit" onClick={onFinalSubmit}>
                    {timerExpired ? 'Scarica risposte' : 'Conferma e consegna'}
                </button>
            </div>
        </div>
    );
}


function getIsAnswered(question: TQuestion, answer: TAnswer | undefined): boolean {
    return isQuestionAnswered(question, answer);
}



