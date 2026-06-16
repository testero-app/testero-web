import { ReactNode, useEffect, useRef, useCallback } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
    open: boolean;
    onClose?: () => void;
    title?: string;
    children: ReactNode;
    actions?: ReactNode;
}

export default function Modal({ open, onClose, title, children, actions }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (!open) return;
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        modalRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, handleKeyDown]);

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
            <div
                className={styles.modal}
                ref={modalRef}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
            >
                {title && <h2 className={styles.title}>{title}</h2>}
                <div className={styles.body}>{children}</div>
                {actions && <div className={styles.actions}>{actions}</div>}
            </div>
        </div>
    );
}
