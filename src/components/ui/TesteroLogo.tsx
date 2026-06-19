interface TesteroLogoProps {
    size?: number;
}

export default function TesteroLogo({ size = 28 }: TesteroLogoProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="11" fill="#fff" />
            <path
                d="M17 17 L11 24 L17 31"
                stroke="#14b8a6"
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M31 17 L37 24 L31 31"
                stroke="#14b8a6"
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M20.5 24.5 L23 27 L28 20"
                stroke="#102a43"
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
