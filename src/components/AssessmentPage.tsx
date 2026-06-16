import { useEffect, useRef } from 'react';
import hljs from '../lib/highlight';
import { TQuestion, TOption, TAnswer } from '../context/AssessmentContext';
import styles from './AssessmentPage.module.css';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

interface AssessmentPageProps {
    shuffledQuestions: TQuestion[];
    shuffledOptions: TOption[][];
    currentIndex: number;
    answers: Record<string, TAnswer>;
    answeredSet: Set<number>;
    answeredCount: number;
    onGoTo: (index: number) => void;
    onPrev: () => void;
    onNext: () => void;
    onAnswer: (questionId: string, answer: TAnswer) => void;
    onSubmit: () => void;
}

/* ── Shared options renderer (radio style) ─────────────────────────── */

function Options({
    question, shuffledOpts, answer, onAnswer, variantClass,
}: {
    question: TQuestion; shuffledOpts: TOption[];
    answer: TAnswer | undefined; onAnswer: (qid: string, a: TAnswer) => void;
    variantClass?: string;
}) {
    if (question.type === 'open') {
        const text = answer?.text || '';
        return (
            <textarea
                className={styles.openTextarea}
                placeholder="Scrivi qui la tua risposta..."
                value={text}
                onChange={(e) => onAnswer(question.id, { text: e.target.value })}
            />
        );
    }

    const selectedIds = answer?.selectedIds || [];
    const motivation = answer?.motivation || '';
    const hasNessuna = selectedIds.some((id: string) => {
        const opt = question.options?.find((o: TOption) => o.id === id);
        return opt?.isFallback;
    });

    const handleOptionClick = (optionId: string) => {
        const newSelectedIds = selectedIds.includes(optionId)
            ? selectedIds.filter((id: string) => id !== optionId)
            : [...selectedIds, optionId];
        const newHasNessuna = newSelectedIds.some((id: string) => {
            const opt = question.options?.find((o: TOption) => o.id === id);
            return opt?.isFallback;
        });
        onAnswer(question.id, {
            selectedIds: newSelectedIds,
            motivation: newHasNessuna ? motivation : '',
        });
    };

    return (
        <>
            <div className={variantClass || styles.optsE}>
                {shuffledOpts.map((opt, idx) => {
                    const sel = selectedIds.includes(opt.id);
                    return (
                        <div
                            key={opt.id}
                            className={`${styles.opt} ${sel ? styles.optSelected : ''}`}
                            onClick={() => handleOptionClick(opt.id)}
                        >
                            <span className={styles.optRadio}>
                                <span className={styles.optRadioDot} />
                            </span>
                            <span className={styles.optKey}>{LETTERS[idx]}</span>
                            <span className={styles.optTxt}>{opt.text}</span>
                        </div>
                    );
                })}
            </div>
            {hasNessuna && (
                <div className={styles.motivation}>
                    <input
                        type="text"
                        className={styles.motivationInput}
                        placeholder="Motiva brevemente..."
                        value={motivation}
                        onChange={(e) => onAnswer(question.id, { selectedIds, motivation: e.target.value })}
                    />
                </div>
            )}
        </>
    );
}

/* ── Navigation buttons (shared) ───────────────────────────────────── */

function NavFooter({
    currentIndex, total, onPrev, onNext, onSubmit,
}: {
    currentIndex: number; total: number;
    onPrev: () => void; onNext: () => void; onSubmit: () => void;
}) {
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === total - 1;

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
                onClick={onPrev}
                disabled={isFirst}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 9,
                    padding: '14px 22px', borderRadius: 13,
                    border: '1.5px solid #e1e6ec', background: '#fff',
                    fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15,
                    color: isFirst ? '#c3ccd6' : '#102a43',
                    cursor: isFirst ? 'default' : 'pointer',
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" /></svg>
                Precedente
            </button>

            {isLast ? (
                <button
                    onClick={onSubmit}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 9,
                        padding: '15px 24px', borderRadius: 13,
                        border: 'none', background: '#102a43', color: '#fff',
                        fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15,
                        cursor: 'pointer',
                    }}
                >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.6"><path d="M5 12l5 5L20 6" /></svg>
                    Consegna test
                </button>
            ) : (
                <button
                    onClick={onNext}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 9,
                        padding: '15px 24px', borderRadius: 13,
                        border: 'none', background: '#102a43', color: '#fff',
                        fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15,
                        cursor: 'pointer',
                    }}
                >
                    Successiva
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M9 6l6 6-6 6" /></svg>
                </button>
            )}
        </div>
    );
}

/* ── Variant E — Inline snippet (no code, or short code ≤ 4 lines) ── */

function VariantE({
    question, displayIndex, total, shuffledOpts, answer, onAnswer,
    onPrev, onNext, onSubmit,
}: {
    question: TQuestion; displayIndex: number; total: number;
    shuffledOpts: TOption[];
    answer: TAnswer | undefined; onAnswer: (qid: string, a: TAnswer) => void;
    onPrev: () => void; onNext: () => void; onSubmit: () => void;
}) {
    return (
        <div className={styles.bodyE}>
            {/* Head row */}
            <div className={styles.headE}>
                <span className={styles.eyebrow}>
                    Domanda {displayIndex + 1} di {total}
                </span>
                <span className={styles.autosave}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8696a6" strokeWidth="2.2"><path d="M5 12l5 5L20 6" /></svg>
                    Salvataggio automatico
                </span>
            </div>

            {/* Question title */}
            <h2 className={styles.qTitle}>{question.text}</h2>

            {/* Options (no code in this variant — code goes to split F) */}
            <Options
                question={question}
                shuffledOpts={shuffledOpts}
                answer={answer}
                onAnswer={onAnswer}
                variantClass={styles.optsE}
            />

            {/* Footer */}
            <div className={styles.footE}>
                <NavFooter currentIndex={displayIndex} total={total} onPrev={onPrev} onNext={onNext} onSubmit={onSubmit} />
            </div>
        </div>
    );
}

/* ── Variant F — Split stimolo (long code always visible) ──────────── */

function VariantF({
    question, displayIndex, total, shuffledOpts, answer, onAnswer,
    onPrev, onNext, onSubmit,
}: {
    question: TQuestion; displayIndex: number; total: number;
    shuffledOpts: TOption[];
    answer: TAnswer | undefined; onAnswer: (qid: string, a: TAnswer) => void;
    onPrev: () => void; onNext: () => void; onSubmit: () => void;
}) {
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current) {
            codeRef.current.removeAttribute('data-highlighted');
            hljs.highlightElement(codeRef.current);
        }
    }, [question.code]);

    const codeLines = (question.code || '').split('\n');

    return (
        <div className={styles.splitF}>
            {/* Left — code panel */}
            <div className={styles.codePanel}>
                <div className={styles.codePanelBar}>
                    <span className={styles.codeDot} style={{ background: '#ff5f57' }} />
                    <span className={styles.codeDot} style={{ background: '#febc2e' }} />
                    <span className={styles.codeDot} style={{ background: '#28c840' }} />
                    <span className={styles.codeFile}>Main.java</span>
                    <span className={styles.codeTag}>CODICE</span>
                </div>
                <div className={styles.codePanelBody}>
                    <div style={{ display: 'flex', gap: 18 }}>
                        {/* Line numbers */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            userSelect: 'none',
                            color: '#3d5a75',
                            fontSize: 'inherit',
                            lineHeight: 'inherit',
                            fontFamily: 'inherit',
                        }}>
                            {codeLines.map((_, i) => (
                                <span key={i}>{i + 1}</span>
                            ))}
                        </div>
                        <pre style={{ margin: 0, background: 'transparent', flex: 1 }}>
                            <code ref={codeRef} className="language-java" style={{
                                background: 'transparent',
                                padding: 0,
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                color: '#dbe7f0',
                            }}>{question.code}</code>
                        </pre>
                    </div>
                </div>
                <div className={styles.noteF}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7f97a8" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                    Leggi attentamente il codice prima di rispondere
                </div>
            </div>

            {/* Right — question panel */}
            <div className={styles.questionPanel}>
              <div className={styles.questionInner}>
                <div className={styles.splitHead}>
                    <span className={styles.eyebrow}>
                        Domanda {displayIndex + 1} di {total}
                    </span>
                    <span className={styles.autosave}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8696a6" strokeWidth="2.2"><path d="M5 12l5 5L20 6" /></svg>
                        Salvataggio automatico
                    </span>
                </div>

                <h2 className={styles.qTitle}>{question.text}</h2>

                <Options
                    question={question}
                    shuffledOpts={shuffledOpts}
                    answer={answer}
                    onAnswer={onAnswer}
                    variantClass={styles.optsF}
                />

                {/* Footer */}
                <div className={styles.footF}>
                    <NavFooter currentIndex={displayIndex} total={total} onPrev={onPrev} onNext={onNext} onSubmit={onSubmit} />
                </div>
              </div>
            </div>
        </div>
    );
}

/* ── Main ───────────────────────────────────────────────────────────── */

export default function AssessmentPage({
    shuffledQuestions, shuffledOptions, currentIndex, answers,
    answeredSet, answeredCount, onGoTo, onPrev, onNext, onAnswer, onSubmit,
}: AssessmentPageProps) {
    const question = shuffledQuestions[currentIndex];
    const opts = shuffledOptions[currentIndex] || [];
    const total = shuffledQuestions.length;

    // Decide variant: has code → ALWAYS split (F), no code → simple (E)
    const useSplit = !!question.code;

    return (
        <main style={{ minHeight: 'calc(100vh - 60px)', background: 'var(--ts-app-bg)' }}>
            {useSplit ? (
                <VariantF
                    key={question.id}
                    question={question}
                    displayIndex={currentIndex}
                    total={total}
                    shuffledOpts={opts}
                    answer={answers[question.id]}
                    onAnswer={onAnswer}
                    onPrev={onPrev}
                    onNext={onNext}
                    onSubmit={onSubmit}
                />
            ) : (
                <VariantE
                    key={question.id}
                    question={question}
                    displayIndex={currentIndex}
                    total={total}
                    shuffledOpts={opts}
                    answer={answers[question.id]}
                    onAnswer={onAnswer}
                    onPrev={onPrev}
                    onNext={onNext}
                    onSubmit={onSubmit}
                />
            )}
        </main>
    );
}
