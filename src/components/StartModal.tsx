import { Modal, Button } from './ui';

interface StartModalProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function StartModal({ visible, onConfirm, onCancel }: StartModalProps) {
    return (
        <Modal
            open={visible}
            onClose={onCancel}
            title="Conferma inizio test"
            actions={
                <>
                    <Button variant="ghost" onClick={onCancel}>Annulla</Button>
                    <Button variant="primary" onClick={onConfirm}>Inizia</Button>
                </>
            }
        >
            <p>Sei sicuro di voler iniziare il test? Il tempo partirà immediatamente.</p>
        </Modal>
    );
}
