import { Modal, Button } from './ui';

interface FinalModalProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function FinalModal({ visible, onConfirm, onCancel }: FinalModalProps) {
    return (
        <Modal
            open={visible}
            onClose={onCancel}
            title="Consegnare il test?"
            actions={
                <>
                    <Button variant="ghost" onClick={onCancel}>Annulla</Button>
                    <Button variant="primary" onClick={onConfirm}>Consegna</Button>
                </>
            }
        >
            <p>Stai per consegnare il test. Dopo la consegna non potrai più modificare le risposte.</p>
        </Modal>
    );
}
