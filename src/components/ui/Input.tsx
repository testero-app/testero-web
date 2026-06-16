import { InputHTMLAttributes, ReactNode, useState } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
}

export default function Input({
    label,
    error,
    icon,
    disabled,
    className,
    id,
    type,
    ...rest
}: InputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const wrapperClasses = [
        styles.wrapper,
        error && styles.error,
        disabled && styles.disabled,
        className,
    ].filter(Boolean).join(' ');

    const inputClasses = [
        styles.input,
        icon && styles.hasIcon,
        isPassword && styles.hasTrailing,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            {label && (
                <label className={styles.label} htmlFor={inputId}>
                    {label}
                </label>
            )}
            <div className={styles.inputWrap}>
                {icon && <span className={styles.icon}>{icon}</span>}
                <input
                    id={inputId}
                    className={inputClasses}
                    disabled={disabled}
                    type={isPassword && showPassword ? 'text' : type}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    {...rest}
                />
                {isPassword && (
                    <button
                        type="button"
                        className={styles.toggle}
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                    >
                        {showPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                                <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        )}
                    </button>
                )}
            </div>
            {error && (
                <span id={`${inputId}-error`} className={styles.helperText} role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
