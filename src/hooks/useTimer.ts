import { useState, useEffect, useRef, useCallback } from 'react';

export function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export function useTimer(totalMinutes: number, onExpire: () => void) {
    const [remainingSeconds, setRemainingSeconds] = useState(totalMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [expired, setExpired] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const onExpireRef = useRef(onExpire);

    useEffect(() => {
        onExpireRef.current = onExpire;
    }, [onExpire]);

    const start = useCallback(() => {
        setRemainingSeconds(totalMinutes * 60);
        setExpired(false);
        setIsRunning(true);
    }, [totalMinutes]);

    const stop = useCallback(() => {
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!isRunning) return;

        intervalRef.current = setInterval(() => {
            setRemainingSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!);
                    intervalRef.current = null;
                    setIsRunning(false);
                    setExpired(true);
                    onExpireRef.current?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning]);

    const WARNING_THRESHOLD_SECONDS = 300;
    const warning = remainingSeconds <= WARNING_THRESHOLD_SECONDS;
    const display = formatTime(remainingSeconds);

    return { remainingSeconds, display, warning, expired, start, stop };
}
