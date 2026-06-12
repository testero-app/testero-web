interface AlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
}

export default function AlertModal({ visible, title, message, onClose }: AlertModalProps) {
    return (
        <div className={`modal-overlay${visible ? ' visible' : ''}`}>
            <div className="modal">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="btn-confirm" onClick={onClose}>OK</button>
                </div>
            </div>
        </div>
    );
}
