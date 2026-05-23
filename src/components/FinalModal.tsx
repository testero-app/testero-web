interface FinalModalProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function FinalModal({ visible, onConfirm, onCancel }: FinalModalProps) {
    return (
        <div className={`modal-overlay${visible ? ' visible' : ''}`}>
            <div className="modal">
                <h3>Conferma consegna</h3>
                <p>Stai per consegnare il test. Verrà scaricato un file ZIP con le tue risposte. Sei sicuro?</p>
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onCancel}>Annulla</button>
                    <button className="btn-confirm" onClick={onConfirm}>Consegna</button>
                </div>
            </div>
        </div>
    );
}
