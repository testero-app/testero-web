interface SubmitModalProps {
    visible: boolean;
    onReview: () => void;
    onCancel: () => void;
}

export default function SubmitModal({ visible, onReview, onCancel }: SubmitModalProps) {
    return (
        <div className={`modal-overlay${visible ? ' visible' : ''}`}>
            <div className="modal">
                <h3>Vuoi rivedere le risposte prima di consegnare?</h3>
                <p>Puoi visualizzare un riepilogo delle tue risposte prima di consegnare il test.</p>
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onCancel}>Annulla</button>
                    <button className="btn-confirm" onClick={onReview}>Rivedi risposte</button>
                </div>
            </div>
        </div>
    );
}
