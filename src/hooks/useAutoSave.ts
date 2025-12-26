/**
 * Auto-save hook for documents
 */

import { type SaveStatus, cancelAutoSave, immediateSave, scheduleAutoSave } from '@/services/storage/autoSave';
import { useSettingsStore } from '@/stores/settingsStore';
import type { Document } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions {
    enabled?: boolean;
    onSave?: (docId: string) => void;
    onError?: (error: string) => void;
}

interface UseAutoSaveReturn {
    status: SaveStatus;
    lastSaved: Date | null;
    save: () => void;
    isSaving: boolean;
}

export function useAutoSave(document: Document | null, options: UseAutoSaveOptions = {}): UseAutoSaveReturn {
    const { enabled = true, onSave, onError } = options;

    const [status, setStatus] = useState<SaveStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const autoSaveEnabled = useSettingsStore((s) => s.autoSave);
    const docRef = useRef(document);
    docRef.current = document;

    // Schedule auto-save on content change
    useEffect(() => {
        if (!enabled || !autoSaveEnabled || !document?.isModified) {
            return;
        }

        scheduleAutoSave(document, {
            onStatusChange: setStatus,
            onSave: (docId) => {
                setLastSaved(new Date());
                onSave?.(docId);
            },
            onError
        });

        return () => {
            cancelAutoSave(document.id);
        };
    }, [enabled, autoSaveEnabled, document, onSave, onError]);

    // Manual save
    const save = useCallback(() => {
        const doc = docRef.current;
        if (!doc) return;

        const success = immediateSave(doc, {
            onStatusChange: setStatus,
            onSave: (docId) => {
                setLastSaved(new Date());
                onSave?.(docId);
            },
            onError
        });

        if (success) {
            setLastSaved(new Date());
        }
    }, [onSave, onError]);

    return {
        status,
        lastSaved,
        save,
        isSaving: status === 'saving'
    };
}
