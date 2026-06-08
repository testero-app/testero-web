interface AssessmentHeaderProps {
    studentName: string;
    timerDisplay: string;
    timerWarning: boolean;
}

export default function AssessmentHeader({ studentName, timerDisplay, timerWarning }: AssessmentHeaderProps) {
    return (
        <header className="a-header">
            <span className="a-header-brand">
                <span className="a-brand-dot"></span>
                Testero
            </span>
            <div className="a-header-right">
                <span className="a-header-user">{studentName}</span>
                <span className={`a-header-timer${timerWarning ? ' a-timer-warn' : ''}`}>{timerDisplay}</span>
            </div>
        </header>
    );
}
