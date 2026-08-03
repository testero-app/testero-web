import { useTranslations } from 'use-intl';
import { Modal } from './ui';

interface FinalModalProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function FinalModal({ visible, onConfirm, onCancel }: FinalModalProps) {
    const t = useTranslations('modals');
    return (
        <Modal
            open={visible}
            onClose={onCancel}
            title="Consegnare il test?"
            actions={
                <>
                    <button className="ts-btn ts-btn--ghost" onClick={onCancel}>{t('cancel')}</button>
                    <button className="ts-btn ts-btn--dark" onClick={onConfirm}>{t('submit')}</button>
                </>
            }
        >
            <p>{t('finalConfirm')}</p>
        </Modal>
    );
}
