import { useFolderStore } from '@/stores/folderStore';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('folderStore', () => {
    beforeEach(() => {
        localStorage.clear();
        act(() => {
            useFolderStore.setState({
                folders: new Map(),
                expandedFolders: new Set(),
                _hasHydrated: true
            });
        });
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('initial state', () => {
        it('should have correct initial values', () => {
            const state = useFolderStore.getState();

            expect(state.folders.size).toBe(0);
            expect(state.expandedFolders.size).toBe(0);
        });
    });

    describe('createFolder', () => {
        it('should create a folder with default values', () => {
            let folderId: string;

            act(() => {
                folderId = useFolderStore.getState().createFolder({ name: 'Test Folder' });
            });

            const folder = useFolderStore.getState().folders.get(folderId!);
            expect(folder).toBeDefined();
            expect(folder?.name).toBe('Test Folder');
            expect(folder?.parentId).toBeNull();
            expect(folder?.color).toBeNull();
            expect(folder?.icon).toBeNull();
            expect(folder?.sortOrder).toBe(0);
        });

        it('should create a folder with custom options', () => {
            let folderId: string;

            act(() => {
                folderId = useFolderStore.getState().createFolder({
                    name: 'Custom Folder',
                    parentId: 'parent-123',
                    color: '#ff0000',
                    icon: 'star',
                    sortOrder: 5
                });
            });

            const folder = useFolderStore.getState().folders.get(folderId!);
            expect(folder?.name).toBe('Custom Folder');
            expect(folder?.parentId).toBe('parent-123');
            expect(folder?.color).toBe('#ff0000');
            expect(folder?.icon).toBe('star');
            expect(folder?.sortOrder).toBe(5);
        });

        it('should auto-expand parent folder when creating subfolder', () => {
            let parentId: string;

            act(() => {
                parentId = useFolderStore.getState().createFolder({ name: 'Parent' });
            });

            // Parent should not be expanded initially
            expect(useFolderStore.getState().isExpanded(parentId!)).toBe(false);

            act(() => {
                useFolderStore.getState().createFolder({
                    name: 'Child',
                    parentId: parentId!
                });
            });

            // Parent should be expanded after creating child
            expect(useFolderStore.getState().isExpanded(parentId!)).toBe(true);
        });
    });

    describe('addSyncedFolder', () => {
        it('should add a new synced folder', () => {
            act(() => {
                useFolderStore.getState().addSyncedFolder({
                    id: 'synced-1',
                    name: 'Synced Folder',
                    parentId: null,
                    color: '#00ff00',
                    icon: 'archive',
                    sortOrder: 1
                });
            });

            const folder = useFolderStore.getState().folders.get('synced-1');
            expect(folder).toBeDefined();
            expect(folder?.name).toBe('Synced Folder');
            expect(folder?.color).toBe('#00ff00');
            expect(folder?.icon).toBe('archive');
        });

        it('should update existing folder from sync', () => {
            act(() => {
                useFolderStore.getState().createFolder({ name: 'Original' });
                // Get the created folder's id
                const folderId = Array.from(useFolderStore.getState().folders.keys())[0]!;

                useFolderStore.getState().addSyncedFolder({
                    id: folderId,
                    name: 'Updated Name',
                    parentId: null,
                    color: '#0000ff',
                    icon: 'book',
                    sortOrder: 2
                });
            });

            const folders = useFolderStore.getState().folders;
            expect(folders.size).toBe(1);
            const folder = folders.values().next().value;
            expect(folder?.name).toBe('Updated Name');
            expect(folder?.color).toBe('#0000ff');
            expect(folder?.icon).toBe('book');
        });
    });

    describe('updateFolder', () => {
        it('should update folder name', () => {
            let folderId: string;

            act(() => {
                folderId = useFolderStore.getState().createFolder({ name: 'Original' });
                useFolderStore.getState().updateFolder(folderId, { name: 'Updated' });
            });

            const folder = useFolderStore.getState().folders.get(folderId!);
            expect(folder?.name).toBe('Updated');
        });

        it('should update folder color', () => {
            let folderId: string;

            act(() => {
                folderId = useFolderStore.getState().createFolder({ name: 'Folder' });
                useFolderStore.getState().updateFolder(folderId, { color: '#ff5500' });
            });

            const folder = useFolderStore.getState().folders.get(folderId!);
            expect(folder?.color).toBe('#ff5500');
        });

        it('should update folder icon', () => {
            let folderId: string;

            act(() => {
                folderId = useFolderStore.getState().createFolder({ name: 'Folder' });
                useFolderStore.getState().updateFolder(folderId, { icon: 'rocket' });
            });

            const folder = useFolderStore.getState().folders.get(folderId!);
            expect(folder?.icon).toBe('rocket');
        });

        it('should update folder parentId', () => {
            let folder1Id: string;
            let folder2Id: string;

            act(() => {
                folder1Id = useFolderStore.getState().createFolder({ name: 'Folder 1' });
                folder2Id = useFolderStore.getState().createFolder({ name: 'Folder 2' });
                useFolderStore.getState().updateFolder(folder2Id, { parentId: folder1Id });
            });

            const folder2 = useFolderStore.getState().folders.get(folder2Id!);
            expect(folder2?.parentId).toBe(folder1Id!);
        });

        it('should not update non-existent folder', () => {
            const initialState = useFolderStore.getState();

            act(() => {
                useFolderStore.getState().updateFolder('non-existent', { name: 'New Name' });
            });

            expect(useFolderStore.getState().folders.size).toBe(initialState.folders.size);
        });
    });

    describe('deleteFolder', () => {
        it('should delete a folder', () => {
            let folderId: string;

            act(() => {
                folderId = useFolderStore.getState().createFolder({ name: 'To Delete' });
            });

            expect(useFolderStore.getState().folders.size).toBe(1);

            act(() => {
                useFolderStore.getState().deleteFolder(folderId!);
            });

            expect(useFolderStore.getState().folders.size).toBe(0);
        });

        it('should delete folder and all descendants', () => {
            let parentId: string;
            let childId: string;
            let grandchildId: string;

            act(() => {
                parentId = useFolderStore.getState().createFolder({ name: 'Parent' });
                childId = useFolderStore.getState().createFolder({ name: 'Child', parentId: parentId });
                grandchildId = useFolderStore.getState().createFolder({ name: 'Grandchild', parentId: childId });
            });

            expect(useFolderStore.getState().folders.size).toBe(3);

            act(() => {
                useFolderStore.getState().deleteFolder(parentId!);
            });

            expect(useFolderStore.getState().folders.size).toBe(0);
            expect(useFolderStore.getState().folders.get(childId!)).toBeUndefined();
            expect(useFolderStore.getState().folders.get(grandchildId!)).toBeUndefined();
        });

        it('should remove folder from expanded set', () => {
            let folderId: string;

            act(() => {
                folderId = useFolderStore.getState().createFolder({ name: 'Folder' });
                useFolderStore.getState().setExpanded(folderId, true);
            });

            expect(useFolderStore.getState().isExpanded(folderId!)).toBe(true);

            act(() => {
                useFolderStore.getState().deleteFolder(folderId!);
            });

            expect(useFolderStore.getState().isExpanded(folderId!)).toBe(false);
        });
    });

    describe('expansion state', () => {
        describe('toggleExpanded', () => {
            it('should toggle folder expanded state', () => {
                let folderId: string;

                act(() => {
                    folderId = useFolderStore.getState().createFolder({ name: 'Folder' });
                });

                expect(useFolderStore.getState().isExpanded(folderId!)).toBe(false);

                act(() => {
                    useFolderStore.getState().toggleExpanded(folderId!);
                });

                expect(useFolderStore.getState().isExpanded(folderId!)).toBe(true);

                act(() => {
                    useFolderStore.getState().toggleExpanded(folderId!);
                });

                expect(useFolderStore.getState().isExpanded(folderId!)).toBe(false);
            });
        });

        describe('setExpanded', () => {
            it('should set folder as expanded', () => {
                let folderId: string;

                act(() => {
                    folderId = useFolderStore.getState().createFolder({ name: 'Folder' });
                    useFolderStore.getState().setExpanded(folderId, true);
                });

                expect(useFolderStore.getState().isExpanded(folderId!)).toBe(true);
            });

            it('should set folder as collapsed', () => {
                let folderId: string;

                act(() => {
                    folderId = useFolderStore.getState().createFolder({ name: 'Folder' });
                    useFolderStore.getState().setExpanded(folderId, true);
                    useFolderStore.getState().setExpanded(folderId, false);
                });

                expect(useFolderStore.getState().isExpanded(folderId!)).toBe(false);
            });
        });

        describe('expandAll', () => {
            it('should expand all folders', () => {
                let folder1Id: string;
                let folder2Id: string;

                act(() => {
                    folder1Id = useFolderStore.getState().createFolder({ name: 'Folder 1' });
                    folder2Id = useFolderStore.getState().createFolder({ name: 'Folder 2' });
                    useFolderStore.getState().expandAll();
                });

                expect(useFolderStore.getState().isExpanded(folder1Id!)).toBe(true);
                expect(useFolderStore.getState().isExpanded(folder2Id!)).toBe(true);
            });
        });

        describe('collapseAll', () => {
            it('should collapse all folders', () => {
                let folder1Id: string;
                let folder2Id: string;

                act(() => {
                    folder1Id = useFolderStore.getState().createFolder({ name: 'Folder 1' });
                    folder2Id = useFolderStore.getState().createFolder({ name: 'Folder 2' });
                    useFolderStore.getState().expandAll();
                    useFolderStore.getState().collapseAll();
                });

                expect(useFolderStore.getState().isExpanded(folder1Id!)).toBe(false);
                expect(useFolderStore.getState().isExpanded(folder2Id!)).toBe(false);
            });
        });
    });

    describe('getters', () => {
        describe('getFolder', () => {
            it('should return folder by id', () => {
                let folderId: string;

                act(() => {
                    folderId = useFolderStore.getState().createFolder({ name: 'Test' });
                });

                const folder = useFolderStore.getState().getFolder(folderId!);
                expect(folder?.name).toBe('Test');
            });

            it('should return undefined for non-existent folder', () => {
                const folder = useFolderStore.getState().getFolder('non-existent');
                expect(folder).toBeUndefined();
            });
        });

        describe('getRootFolders', () => {
            it('should return only root folders', () => {
                let parentId: string;

                act(() => {
                    parentId = useFolderStore.getState().createFolder({ name: 'Parent' });
                    useFolderStore.getState().createFolder({ name: 'Root 2' });
                    useFolderStore.getState().createFolder({ name: 'Child', parentId: parentId });
                });

                const rootFolders = useFolderStore.getState().getRootFolders();
                expect(rootFolders).toHaveLength(2);
                expect(rootFolders.every((f) => f.parentId === null)).toBe(true);
            });
        });

        describe('getChildFolders', () => {
            it('should return child folders', () => {
                let parentId: string;

                act(() => {
                    parentId = useFolderStore.getState().createFolder({ name: 'Parent' });
                    useFolderStore.getState().createFolder({ name: 'Child 1', parentId: parentId });
                    useFolderStore.getState().createFolder({ name: 'Child 2', parentId: parentId });
                    useFolderStore.getState().createFolder({ name: 'Other Root' });
                });

                const children = useFolderStore.getState().getChildFolders(parentId!);
                expect(children).toHaveLength(2);
                expect(children.every((f) => f.parentId === parentId)).toBe(true);
            });
        });

        describe('getFolderPath', () => {
            it('should return path from root to folder', () => {
                let parentId: string;
                let childId: string;
                let grandchildId: string;

                act(() => {
                    parentId = useFolderStore.getState().createFolder({ name: 'Parent' });
                    childId = useFolderStore.getState().createFolder({ name: 'Child', parentId: parentId });
                    grandchildId = useFolderStore.getState().createFolder({ name: 'Grandchild', parentId: childId });
                });

                const path = useFolderStore.getState().getFolderPath(grandchildId!);
                expect(path).toHaveLength(3);
                expect(path[0]?.name).toBe('Parent');
                expect(path[1]?.name).toBe('Child');
                expect(path[2]?.name).toBe('Grandchild');
            });
        });

        describe('getAllFolderIds', () => {
            it('should return all folder ids', () => {
                act(() => {
                    useFolderStore.getState().createFolder({ name: 'Folder 1' });
                    useFolderStore.getState().createFolder({ name: 'Folder 2' });
                    useFolderStore.getState().createFolder({ name: 'Folder 3' });
                });

                const ids = useFolderStore.getState().getAllFolderIds();
                expect(ids).toHaveLength(3);
            });
        });

        describe('getFoldersSorted', () => {
            it('should sort folders by sortOrder first', () => {
                act(() => {
                    useFolderStore.getState().createFolder({ name: 'B Folder', sortOrder: 2 });
                    useFolderStore.getState().createFolder({ name: 'A Folder', sortOrder: 1 });
                    useFolderStore.getState().createFolder({ name: 'C Folder', sortOrder: 0 });
                });

                const sorted = useFolderStore.getState().getFoldersSorted(null);
                expect(sorted[0]?.name).toBe('C Folder');
                expect(sorted[1]?.name).toBe('A Folder');
                expect(sorted[2]?.name).toBe('B Folder');
            });

            it('should sort by name when sortOrder is equal', () => {
                act(() => {
                    useFolderStore.getState().createFolder({ name: 'Zebra', sortOrder: 0 });
                    useFolderStore.getState().createFolder({ name: 'Apple', sortOrder: 0 });
                    useFolderStore.getState().createFolder({ name: 'Mango', sortOrder: 0 });
                });

                const sorted = useFolderStore.getState().getFoldersSorted(null);
                expect(sorted[0]?.name).toBe('Apple');
                expect(sorted[1]?.name).toBe('Mango');
                expect(sorted[2]?.name).toBe('Zebra');
            });
        });
    });

    describe('FOLDER_COLORS', () => {
        it('should have predefined colors', async () => {
            const { FOLDER_COLORS } = await import('@/stores/folderStore');

            expect(FOLDER_COLORS.length).toBeGreaterThan(0);
            expect(FOLDER_COLORS[0]).toHaveProperty('name');
            expect(FOLDER_COLORS[0]).toHaveProperty('value');
        });
    });

    describe('FOLDER_ICONS', () => {
        it('should have predefined icons', async () => {
            const { FOLDER_ICONS } = await import('@/stores/folderStore');

            expect(FOLDER_ICONS.length).toBeGreaterThan(0);
            expect(FOLDER_ICONS).toContain('folder');
            expect(FOLDER_ICONS).toContain('star');
            expect(FOLDER_ICONS).toContain('archive');
        });
    });
});
