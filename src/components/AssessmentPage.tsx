import { TQuestion, TOption, TAnswer } from '../context/AssessmentContext';
import Sidebar from './Sidebar';
import QuestionCard from './QuestionCard';
import styles from './AssessmentPage.module.css';

interface AssessmentPageProps {
    shuffledQuestions: TQuestion[];
    shuffledOptions: TOption[][];
    currentIndex: number;
    answers: Record<string, TAnswer>;
    answeredSet: Set<number>;
    answeredCount: number;
    onGoTo: (index: number) => void;
    onPrev: () => void;
    onNext: () => void;
    onAnswer: (questionId: string, answer: TAnswer) => void;
    onSubmit: () => void;
}

export default function AssessmentPage({
    shuffledQuestions,
    shuffledOptions,
    currentIndex,
    answers,
    answeredSet,
    answeredCount,
    onGoTo,
    onPrev,
    onNext,
    onAnswer,
    onSubmit,
}: AssessmentPageProps) {
    const question = shuffledQuestions[currentIndex];
    const opts = shuffledOptions[currentIndex] || [];

    return (
        <main className={styles.container}>
            <div className={styles.layout}>
                <Sidebar
                    totalQuestions={shuffledQuestions.length}
                    currentIndex={currentIndex}
                    answeredSet={answeredSet}
                    answeredCount={answeredCount}
                    onGoTo={onGoTo}
                    onPrev={onPrev}
                    onNext={onNext}
                    onSubmit={onSubmit}
                />
                <div>
                    <QuestionCard
                        key={question.id}
                        question={question}
                        displayIndex={currentIndex}
                        shuffledOpts={opts}
                        answer={answers[question.id]}
                        onAnswer={onAnswer}
                    />
                </div>
            </div>
        </main>
    );
}
