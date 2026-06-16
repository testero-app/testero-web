import { Modal } from './ui';

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
                    <button className="ts-btn ts-btn--ghost" onClick={onCancel}>Annulla</button>
                    <button className="ts-btn ts-btn--dark" onClick={onConfirm}>Consegna</button>
                </>
            }
        >
            <p>Stai per consegnare il test. Dopo la consegna non potrai più modificare le risposte.</p>
        </Modal>
    );
}
