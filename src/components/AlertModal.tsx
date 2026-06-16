import { Modal, Button } from './ui';

interface AlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
}

export default function AlertModal({ visible, title, message, onClose }: AlertModalProps) {
    return (
        <Modal
            open={visible}
            onClose={onClose}
            title={title}
            actions={<Button variant="primary" onClick={onClose}>OK</Button>}
        >
            <p>{message}</p>
        </Modal>
    );
}
