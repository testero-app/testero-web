import JSZip from 'jszip';
import { FIVE_OPTION_COUNT, FALLBACK_SUFFIX_E, FALLBACK_SUFFIX_D } from './questionUtils';

export function collectAnswers(studentName, shuffledQuestions, answers, assessmentId) {
    const timestamp = new Date().toISOString();
    const answersObj = {};

    shuffledQuestions.forEach(question => {
        const questionId = question.id;

        if (question.type === 'open') {
            const answer = answers[questionId];
            const answerText = answer ? answer.text || '' : '';
            answersObj[questionId] = {
                type: 'open',
                answer: answerText || null
            };
        } else {
            const answer = answers[questionId];
            const selectedIds = answer ? (answer.selectedIds || []) : [];

            const suffix = question.options.length === FIVE_OPTION_COUNT
                ? FALLBACK_SUFFIX_E : FALLBACK_SUFFIX_D;
            const hasNessuna = selectedIds.length === 1 && selectedIds[0].endsWith(suffix);
            const motivation = answer ? (answer.motivation || '') : '';

            if (hasNessuna && motivation) {
                answersObj[questionId] = {
                    selectedIds: selectedIds,
                    motivation: motivation
                };
            } else {
                answersObj[questionId] = selectedIds.length > 0 ? { selectedIds: selectedIds } : null;
            }
        }
    });

    return {
        assessmentId,
        student: studentName,
        submittedAt: timestamp,
        answers: answersObj
    };
}

export function generateMarkdown(data, title, questions) {
    const lines = [];
    lines.push(`# ${title}`);
    lines.push('');
    lines.push(`**Studente:** ${data.student}`);
    lines.push(`**Data consegna:** ${new Date(data.submittedAt).toLocaleString('it-IT')}`);
    lines.push(`**Assessment ID:** ${data.assessmentId}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    questions.forEach((question, idx) => {
        const qLabel = question.type === 'open' ? `## Domanda ${idx + 1} (Bonus)` : `## Domanda ${idx + 1}`;
        lines.push(qLabel);
        lines.push('');
        lines.push(question.text);
        lines.push('');

        if (question.code) {
            lines.push('```python');
            lines.push(question.code);
            lines.push('```');
            lines.push('');
        }

        const answer = data.answers[question.id];

        if (question.type === 'open') {
            if (answer && answer.answer) {
                lines.push(`> ${answer.answer}`);
            } else {
                lines.push('*Nessuna risposta*');
            }
        } else {
            const selectedIds = answer ? (answer.selectedIds || []) : [];

            question.options.forEach((option, optIdx) => {
                const isSelected = selectedIds.includes(option.id);
                const letter = letters[optIdx];
                if (isSelected) {
                    lines.push(`- **${letter}) ${option.text} <<**`);
                } else {
                    lines.push(`- ${letter}) ${option.text}`);
                }
            });

            if (answer && answer.motivation) {
                lines.push('');
                lines.push(`> **Motivazione:** ${answer.motivation}`);
            }

            if (selectedIds.length === 0) {
                lines.push('');
                lines.push('*Nessuna risposta selezionata*');
            }
        }

        lines.push('');
        lines.push('---');
        lines.push('');
    });

    return lines.join('\n');
}

export async function generateEncryptedZip(studentName, shuffledQuestions, answers, assessmentId, title) {
    const data = collectAnswers(studentName, shuffledQuestions, answers, assessmentId);
    const jsonContent = JSON.stringify(data, null, 2);

    const safeName = data.student.replace(/\s+/g, '_').toUpperCase();
    const fileName = `${safeName}_${assessmentId}.json`;
    const zipName = `${safeName}_${assessmentId}.zip`;

    const mdContent = generateMarkdown(data, title, shuffledQuestions);
    const mdFileName = `${safeName}_${assessmentId}.md`;

    const zip = new JSZip();
    zip.file(fileName, jsonContent);
    zip.file(mdFileName, mdContent);

    const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { zipName, fileName, mdFileName };
}
