interface StartModalProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function StartModal({ visible, onConfirm, onCancel }: StartModalProps) {
    return (
        <div className={`modal-overlay${visible ? ' visible' : ''}`}>
            <div className="modal">
                <h3>Conferma inizio test</h3>
                <p>Sei sicuro di voler iniziare il test?</p>
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onCancel}>Annulla</button>
                    <button className="btn-confirm" onClick={onConfirm}>Inizia</button>
                </div>
            </div>
        </div>
    );
}
