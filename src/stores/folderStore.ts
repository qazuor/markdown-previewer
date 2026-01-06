import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Frontend Folder type - extends SyncFolder with local state
 */
export interface Folder {
    id: string;
    name: string;
    parentId: string | null;
    color: string | null;
    icon: string | null;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    syncedAt?: Date | null;
}

export interface CreateFolderOptions {
    name: string;
    parentId?: string | null;
    color?: string | null;
    icon?: string | null;
    sortOrder?: number;
}

export interface SyncedFolderData {
    id: string;
    name: string;
    parentId: string | null;
    color: string | null;
    icon: string | null;
    sortOrder: number;
    createdAt?: Date;
    updatedAt?: Date;
    syncedAt?: Date | null;
}

/**
 * Predefined folder colors
 */
export const FOLDER_COLORS = [
    { name: 'red', value: '#ef4444' },
    { name: 'orange', value: '#f97316' },
    { name: 'amber', value: '#f59e0b' },
    { name: 'yellow', value: '#eab308' },
    { name: 'lime', value: '#84cc16' },
    { name: 'green', value: '#22c55e' },
    { name: 'emerald', value: '#10b981' },
    { name: 'teal', value: '#14b8a6' },
    { name: 'cyan', value: '#06b6d4' },
    { name: 'sky', value: '#0ea5e9' },
    { name: 'blue', value: '#3b82f6' },
    { name: 'indigo', value: '#6366f1' },
    { name: 'violet', value: '#8b5cf6' },
    { name: 'purple', value: '#a855f7' },
    { name: 'fuchsia', value: '#d946ef' },
    { name: 'pink', value: '#ec4899' },
    { name: 'rose', value: '#f43f5e' }
] as const;

/**
 * Predefined folder icons (lucide-react icon names)
 */
export const FOLDER_ICONS = [
    'folder',
    'archive',
    'book',
    'bookmark',
    'briefcase',
    'calendar',
    'camera',
    'code',
    'coffee',
    'cog',
    'database',
    'file-text',
    'film',
    'gamepad-2',
    'gift',
    'globe',
    'graduation-cap',
    'heart',
    'home',
    'image',
    'inbox',
    'laptop',
    'layers',
    'library',
    'lightbulb',
    'mail',
    'map',
    'music',
    'package',
    'pen-tool',
    'rocket',
    'search',
    'settings',
    'shield',
    'shopping-bag',
    'star',
    'tag',
    'target',
    'terminal',
    'trophy',
    'user',
    'wallet',
    'zap'
] as const;

export type FolderIconName = (typeof FOLDER_ICONS)[number];

interface FolderState {
    folders: Map<string, Folder>;
    expandedFolders: Set<string>;
    _hasHydrated: boolean;

    // Folder operations
    createFolder: (options: CreateFolderOptions) => string;
    addSyncedFolder: (data: SyncedFolderData) => void;
    updateFolder: (id: string, updates: Partial<Pick<Folder, 'name' | 'parentId' | 'color' | 'icon' | 'sortOrder'>>) => void;
    deleteFolder: (id: string) => void;

    // Expansion state
    toggleExpanded: (id: string) => void;
    setExpanded: (id: string, expanded: boolean) => void;
    expandAll: () => void;
    collapseAll: () => void;

    // Getters
    getFolder: (id: string) => Folder | undefined;
    getRootFolders: () => Folder[];
    getChildFolders: (parentId: string) => Folder[];
    getFolderPath: (id: string) => Folder[];
    isExpanded: (id: string) => boolean;
    getAllFolderIds: () => string[];

    // Utility
    getFoldersSorted: (parentId: string | null) => Folder[];
}

const generateId = () => crypto.randomUUID();

export const useFolderStore = create<FolderState>()(
    devtools(
        persist(
            (set, get) => ({
                folders: new Map(),
                expandedFolders: new Set(),
                _hasHydrated: false,

                createFolder: (options) => {
                    const id = generateId();
                    const folder: Folder = {
                        id,
                        name: options.name,
                        parentId: options.parentId ?? null,
                        color: options.color ?? null,
                        icon: options.icon ?? null,
                        sortOrder: options.sortOrder ?? 0,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    set((state) => {
                        const newFolders = new Map(state.folders);
                        newFolders.set(id, folder);

                        // Auto-expand parent if creating inside a folder
                        const newExpanded = new Set(state.expandedFolders);
                        if (options.parentId) {
                            newExpanded.add(options.parentId);
                        }

                        return { folders: newFolders, expandedFolders: newExpanded };
                    });

                    return id;
                },

                addSyncedFolder: (data) => {
                    const existing = get().folders.get(data.id);

                    if (existing) {
                        // Update existing folder
                        set((state) => {
                            const newFolders = new Map(state.folders);
                            newFolders.set(data.id, {
                                ...existing,
                                name: data.name,
                                parentId: data.parentId,
                                color: data.color,
                                icon: data.icon,
                                sortOrder: data.sortOrder,
                                syncedAt: data.syncedAt,
                                updatedAt: data.updatedAt || new Date()
                            });
                            return { folders: newFolders };
                        });
                        return;
                    }

                    // Create new folder from sync
                    const folder: Folder = {
                        id: data.id,
                        name: data.name,
                        parentId: data.parentId,
                        color: data.color,
                        icon: data.icon,
                        sortOrder: data.sortOrder,
                        createdAt: data.createdAt || new Date(),
                        updatedAt: data.updatedAt || new Date(),
                        syncedAt: data.syncedAt
                    };

                    set((state) => {
                        const newFolders = new Map(state.folders);
                        newFolders.set(data.id, folder);
                        return { folders: newFolders };
                    });
                },

                updateFolder: (id, updates) => {
                    set((state) => {
                        const folder = state.folders.get(id);
                        if (!folder) return state;

                        const newFolders = new Map(state.folders);
                        newFolders.set(id, {
                            ...folder,
                            ...updates,
                            updatedAt: new Date()
                        });
                        return { folders: newFolders };
                    });
                },

                deleteFolder: (id) => {
                    set((state) => {
                        const newFolders = new Map(state.folders);
                        const newExpanded = new Set(state.expandedFolders);

                        // Delete the folder
                        newFolders.delete(id);
                        newExpanded.delete(id);

                        // Also delete all child folders recursively
                        const deleteChildren = (parentId: string) => {
                            for (const [folderId, folder] of newFolders) {
                                if (folder.parentId === parentId) {
                                    newFolders.delete(folderId);
                                    newExpanded.delete(folderId);
                                    deleteChildren(folderId);
                                }
                            }
                        };
                        deleteChildren(id);

                        return { folders: newFolders, expandedFolders: newExpanded };
                    });
                },

                toggleExpanded: (id) => {
                    set((state) => {
                        const newExpanded = new Set(state.expandedFolders);
                        if (newExpanded.has(id)) {
                            newExpanded.delete(id);
                        } else {
                            newExpanded.add(id);
                        }
                        return { expandedFolders: newExpanded };
                    });
                },

                setExpanded: (id, expanded) => {
                    set((state) => {
                        const newExpanded = new Set(state.expandedFolders);
                        if (expanded) {
                            newExpanded.add(id);
                        } else {
                            newExpanded.delete(id);
                        }
                        return { expandedFolders: newExpanded };
                    });
                },

                expandAll: () => {
                    set((state) => {
                        const allIds = Array.from(state.folders.keys());
                        return { expandedFolders: new Set(allIds) };
                    });
                },

                collapseAll: () => {
                    set({ expandedFolders: new Set() });
                },

                getFolder: (id) => {
                    return get().folders.get(id);
                },

                getRootFolders: () => {
                    const state = get();
                    return state.getFoldersSorted(null);
                },

                getChildFolders: (parentId) => {
                    const state = get();
                    return state.getFoldersSorted(parentId);
                },

                getFolderPath: (id) => {
                    const state = get();
                    const path: Folder[] = [];
                    let current = state.folders.get(id);

                    while (current) {
                        path.unshift(current);
                        current = current.parentId ? state.folders.get(current.parentId) : undefined;
                    }

                    return path;
                },

                isExpanded: (id) => {
                    return get().expandedFolders.has(id);
                },

                getAllFolderIds: () => {
                    return Array.from(get().folders.keys());
                },

                getFoldersSorted: (parentId) => {
                    const folders = Array.from(get().folders.values()).filter((f) => f.parentId === parentId);

                    return folders.sort((a, b) => {
                        // First by sortOrder
                        if (a.sortOrder !== b.sortOrder) {
                            return a.sortOrder - b.sortOrder;
                        }
                        // Then by name
                        return a.name.localeCompare(b.name);
                    });
                }
            }),
            {
                name: 'markview:folders',
                partialize: (state) => ({
                    folders: Array.from(state.folders.entries()),
                    expandedFolders: Array.from(state.expandedFolders)
                }),
                merge: (persisted, current) => {
                    const persistedState = persisted as {
                        folders?: [string, Folder][];
                        expandedFolders?: string[];
                    };

                    // Rehydrate Date objects from persisted strings
                    const rehydratedFolders = (persistedState.folders ?? []).map(([id, folder]) => {
                        const rehydrated: Folder = {
                            ...folder,
                            icon: folder.icon ?? null, // Ensure icon field exists for old data
                            createdAt: folder.createdAt ? new Date(folder.createdAt) : new Date(),
                            updatedAt: folder.updatedAt ? new Date(folder.updatedAt) : new Date(),
                            syncedAt: folder.syncedAt ? new Date(folder.syncedAt) : null
                        };
                        return [id, rehydrated] as [string, Folder];
                    });

                    return {
                        ...current,
                        folders: new Map(rehydratedFolders),
                        expandedFolders: new Set(persistedState.expandedFolders ?? [])
                    };
                },
                onRehydrateStorage: () => {
                    return (_state, error) => {
                        if (!error) {
                            useFolderStore.setState({ _hasHydrated: true });
                        }
                    };
                }
            }
        ),
        { name: 'FolderStore' }
    )
);

// Also mark as hydrated immediately if localStorage is empty (no data to hydrate)
if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('markview:folders');
    if (!stored) {
        // No persisted data, mark as hydrated immediately
        useFolderStore.setState({ _hasHydrated: true });
    }
}
