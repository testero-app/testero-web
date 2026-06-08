import { TQuestion, TAnswer } from '../context/AssessmentContext';

/**
 * Controlla se la sola opzione selezionata è "Nessuna delle precedenti".
 * Java ha 5 opzioni (ultima finisce con _e), Python ha 4 (ultima finisce con _d).
 */
export function checkIfJavaOrPython(question: TQuestion, selectedIds: string[]): boolean {
    
    if (!question) return false;

    if ((question.options?.length ?? 0) === 5) {
        return selectedIds.length === 1 && selectedIds[0].endsWith('_e');
    } else {
        return selectedIds.length === 1 && selectedIds[0].endsWith('_d');
    }
}

