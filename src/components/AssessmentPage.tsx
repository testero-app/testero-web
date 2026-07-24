import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import hljs from '../lib/highlight';
import { TQuestion, TOption, TAnswer } from '../context/AssessmentContext';
import styles from './AssessmentPage.module.css';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

interface AssessmentPageProps {
    shuffledQuestions: TQuestion[];
    shuffledOptions: TOption[][];
    currentIndex: number;
    answers: Record<string, TAnswer>;
    flagged: Record<string, boolean>;
    answeredSet: Set<number>;
    answeredCount: number;
    onGoTo: (index: number) => void;
    onPrev: () => void;
    onNext: () => void;
    onAnswer: (questionId: string, answer: TAnswer) => void;
    onToggleFlag: (questionId: string) => void;
    onSubmit: () => void;
}

/* ── Flag toggle ("Segna da rivedere") ────────────────────────────── */

function FlagToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
    if (active) {
        return (
            <button className={styles.flagPill} onClick={onToggle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c47308" strokeWidth="2">
                    <path d="M5 21V4h11l-1.5 4L16 12H5" />
                </svg>
                Da rivedere
            </button>
        );
    }
    return (
        <button className={styles.flag} onClick={onToggle}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8696a6" strokeWidth="2">
                <path d="M5 21V4h11l-1.5 4L16 12H5" />
            </svg>
            Segna da rivedere
        </button>
    );
}

/* ── Shared options renderer (radio style) ─────────────────────────── */

function Options({
    question, shuffledOpts, answer, onAnswer, variantClass,
}: {
    question: TQuestion; shuffledOpts: TOption[];
    answer: TAnswer | undefined; onAnswer: (qid: string, a: TAnswer) => void;
    variantClass?: string;
}) {
    const t = useTranslations('assessment');
    if (question.type === 'open') {
        const text = answer?.text || '';
        return (
            <textarea
                className={styles.openTextarea}
                placeholder={t('answerPlaceholder')}
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
                        placeholder={t('motivationPlaceholder')}
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
        <div className={styles.navFooter}>
            <button
                onClick={onPrev}
                disabled={isFirst}
                className={`${styles.btnGhost} ${isFirst ? styles.btnDisabled : ''}`}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" /></svg>
                Precedente
            </button>

            {isLast ? (
                <button onClick={onSubmit} className={styles.btnNavy}>
                    Consegna
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M9 6l6 6-6 6" /></svg>
                </button>
            ) : (
                <button onClick={onNext} className={styles.btnNavy}>
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
    isFlagged, onToggleFlag,
    onPrev, onNext, onSubmit,
}: {
    question: TQuestion; displayIndex: number; total: number;
    shuffledOpts: TOption[];
    answer: TAnswer | undefined; onAnswer: (qid: string, a: TAnswer) => void;
    isFlagged: boolean; onToggleFlag: () => void;
    onPrev: () => void; onNext: () => void; onSubmit: () => void;
}) {
    const t = useTranslations('assessment');
    return (
        <div className={styles.bodyE}>
            {/* Head row */}
            <div className={styles.headE}>
                <span className={styles.eyebrow}>
                    {t('questionCounter', { n: displayIndex + 1, total })}
                </span>
                <FlagToggle active={isFlagged} onToggle={onToggleFlag} />
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
    isFlagged, onToggleFlag,
    onPrev, onNext, onSubmit,
}: {
    question: TQuestion; displayIndex: number; total: number;
    shuffledOpts: TOption[];
    answer: TAnswer | undefined; onAnswer: (qid: string, a: TAnswer) => void;
    isFlagged: boolean; onToggleFlag: () => void;
    onPrev: () => void; onNext: () => void; onSubmit: () => void;
}) {
    const t = useTranslations('assessment');
    const codeRef = useRef<HTMLElement>(null);
    // Tablet only: the code panel can be folded away to give the question the
    // full width. Starts expanded so a student who touches nothing still sees
    // the stimulus.
    const [codeCollapsed, setCodeCollapsed] = useState(false);

    useEffect(() => {
        if (codeRef.current) {
            codeRef.current.removeAttribute('data-highlighted');
            hljs.highlightElement(codeRef.current);
        }
    }, [question.code, codeCollapsed]);

    const codeLines = (question.code || '').split('\n');

    return (
        <div className={`${styles.splitF} ${codeCollapsed ? styles.codeFolded : ''}`}>
            {/* Left — code panel */}
            <div className={styles.codePanel}>
                <div className={styles.codePanelBar}>
                    <span className={styles.codeDot} style={{ background: '#ff5f57' }} />
                    <span className={styles.codeDot} style={{ background: '#febc2e' }} />
                    <span className={styles.codeDot} style={{ background: '#28c840' }} />
                    <span className={styles.codeFile}>{t('codeFileName')}</span>
                    <span className={styles.codeTag}>{t('stimulus')}</span>
                    <button
                        type="button"
                        className={styles.codeToggle}
                        onClick={() => setCodeCollapsed((v) => !v)}
                        aria-expanded={!codeCollapsed}
                    >
                        {codeCollapsed ? t('showCode') : t('hideCode')}
                    </button>
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
                        {t('questionCounterOf', { n: displayIndex + 1, total })}
                    </span>
                    <FlagToggle active={isFlagged} onToggle={onToggleFlag} />
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
    shuffledQuestions, shuffledOptions, currentIndex, answers, flagged,
    answeredSet, answeredCount, onGoTo, onPrev, onNext, onAnswer, onToggleFlag, onSubmit,
}: AssessmentPageProps) {
    const question = shuffledQuestions[currentIndex];
    const opts = shuffledOptions[currentIndex] || [];
    const total = shuffledQuestions.length;
    const isFlagged = !!flagged[question.id];

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
                    isFlagged={isFlagged}
                    onToggleFlag={() => onToggleFlag(question.id)}
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
                    isFlagged={isFlagged}
                    onToggleFlag={() => onToggleFlag(question.id)}
                    onPrev={onPrev}
                    onNext={onNext}
                    onSubmit={onSubmit}
                />
            )}
        </main>
    );
}
