import { useTranslations } from 'next-intl';
import { Modal, Button } from './ui';

interface StartModalProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function StartModal({ visible, onConfirm, onCancel }: StartModalProps) {
    const t = useTranslations('modals');
    return (
        <Modal
            open={visible}
            onClose={onCancel}
            title="Conferma inizio test"
            actions={
                <>
                    <Button variant="ghost" onClick={onCancel}>{t('cancel')}</Button>
                    <Button variant="primary" onClick={onConfirm}>{t('start')}</Button>
                </>
            }
        >
            <p>{t('startConfirm')}</p>
        </Modal>
    );
}
