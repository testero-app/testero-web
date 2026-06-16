import styles from './SegmentedControl.module.css';

interface SegmentedControlOption {
    value: string;
    label: string;
}

interface SegmentedControlProps {
    options: SegmentedControlOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
    const classes = [styles.container, className].filter(Boolean).join(' ');

    return (
        <div className={classes} role="tablist">
            {options.map((option) => (
                <button
                    key={option.value}
                    className={`${styles.option} ${value === option.value ? styles.active : ''}`}
                    onClick={() => onChange(option.value)}
                    role="tab"
                    aria-selected={value === option.value}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
