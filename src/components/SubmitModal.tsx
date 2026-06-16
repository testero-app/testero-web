import { Modal, Button } from './ui';

interface SubmitModalProps {
    visible: boolean;
    onReview: () => void;
    onCancel: () => void;
}

export default function SubmitModal({ visible, onReview, onCancel }: SubmitModalProps) {
    return (
        <Modal
            open={visible}
            onClose={onCancel}
            title="Vuoi rivedere le risposte?"
            actions={
                <>
                    <Button variant="ghost" onClick={onCancel}>Annulla</Button>
                    <Button variant="primary" onClick={onReview}>Rivedi risposte</Button>
                </>
            }
        >
            <p>Puoi visualizzare un riepilogo delle tue risposte prima di consegnare il test.</p>
        </Modal>
    );
}
