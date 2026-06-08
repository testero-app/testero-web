import { TQuestion, TOption, TAnswer } from '../context/AssessmentContext';
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
    if (question.type === 'open') {
        return (answer?.text?.trim().length ?? 0) > 0;
    }
    const selectedIds = answer?.selectedIds ?? [];
    if (selectedIds.length === 0) return false;
   
    //suffix either _e or _d nonsense
    
    // se è stata selezionata 1 opzione          e  quell'opzione finisce con _e o _d
    let onlyNessuna
    if (question.options){
        if (question.options.length == 5) {
        onlyNessuna = selectedIds.length === 1 && selectedIds[0].endsWith("_e");
    } else {
        onlyNessuna = selectedIds.length === 1 && selectedIds[0].endsWith("_d");
    }
    }
    if (onlyNessuna) {
        return (answer?.motivation || '').trim().length > 0;
    }
    //se è stata selezionata 1 opzione e finisce con _e o _d ritorna la motivazione della risposta, se questa è null quindi se l'id non è _e ritorna ''
    if (onlyNessuna) return (answer?.motivation ?? '').trim().length > 0;
    return true;
}



