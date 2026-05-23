interface TestHeaderProps {
    studentName: string;
    timerDisplay: string;
    timerWarning: boolean;
}

export default function TestHeader({ studentName, timerDisplay, timerWarning }: TestHeaderProps) {
    return (
        <header className="t-header">
            <span className="t-header-brand">
                <span className="t-brand-dot"></span>
                Testero
            </span>
            <div className="t-header-right">
                <span className="t-header-user">{studentName}</span>
                <span className={`t-header-timer${timerWarning ? ' t-timer-warn' : ''}`}>{timerDisplay}</span>
            </div>
        </header>
    );
}
