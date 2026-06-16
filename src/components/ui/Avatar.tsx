import styles from './Avatar.module.css';

interface AvatarProps {
    name: string;
    size?: 'sm' | 'md';
    className?: string;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.slice(0, 2);
}

export default function Avatar({ name, size = 'md', className }: AvatarProps) {
    const classes = [styles.avatar, styles[size], className].filter(Boolean).join(' ');
    return (
        <div className={classes} aria-label={name} title={name}>
            {getInitials(name)}
        </div>
    );
}
