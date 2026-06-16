import styles from './Skeleton.module.css';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circle' | 'rect';
    className?: string;
}

export default function Skeleton({
    width = '100%',
    height,
    variant = 'text',
    className,
}: SkeletonProps) {
    const classes = [styles.skeleton, styles[variant], className].filter(Boolean).join(' ');

    return (
        <div
            className={classes}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
            }}
            aria-hidden="true"
        />
    );
}
