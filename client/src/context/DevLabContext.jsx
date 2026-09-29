import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const DevLabContext = createContext();

// ─── Helpers ────────────────────────────────────────────────────────────────
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

const IGNORED_NAMES = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', '__pycache__', '.DS_Store', 'venv', '.env'
]);

// Recursively read a real DirectoryHandle into a flat list of nodes
async function readDirectoryHandle(handle, parentId = null, depth = 0) {
  if (depth > 8) return []; // Safety cap, not a strict limit
  const nodes = [];
  const id = generateId();

  nodes.push({
    id,
    name: handle.name,
    type: 'folder',
    parentId,
    handle, // Store the actual FileSystemDirectoryHandle
  });

  try {
    for await (const [name, childHandle] of handle.entries()) {
      if (IGNORED_NAMES.has(name)) continue;

      if (childHandle.kind === 'directory') {
        const children = await readDirectoryHandle(childHandle, id, depth + 1);
        nodes.push(...children);
      } else if (childHandle.kind === 'file') {
        const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : 'txt';
        nodes.push({
          id: generateId(),
          name,
          type: 'file',
          parentId: id,
          extension: ext,
          handle: childHandle, // Store FileSystemFileHandle
        });
      }
    }
  } catch (e) {
    console.warn('Could not read dir:', handle.name, e);
  }

  return nodes;
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function DevLabProvider({ children }) {
  const [workspaceName, setWorkspaceName] = useState('No Folder Opened');
  const [workspacePath, setWorkspacePath] = useState('');
  const [fileSystem, setFileSystem] = useState([]);
  const [fileContents, setFileContents] = useState({});      // id -> string content
  const [dirtyFiles, setDirtyFiles] = useState(new Set());   // unsaved file ids
  const [openTabs, setOpenTabs] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [terminals, setTerminals] = useState([{
    id: 'term-1',
    name: 'Terminal 1',
    cwd: 'C:\\',
    logs: [
      { text: '[ZORO DEVLAB] Ready. Open a folder to start.', type: 'default', ts: Date.now() },
      { text: 'Type a command below. Paste your project path in the CWD box first.', type: 'default', ts: Date.now() }
    ]
  }]);
  const [activeTerminalId, setActiveTerminalId] = useState('term-1');
  const rootHandle = useRef(null); // the top-level DirectoryHandle

  // ── Open real local folder ───────────────────────────────────────────────
  const openFolder = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      addLog('[ERROR] Your browser does not support the File System Access API. Use Chrome or Edge.', 'error');
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      addLog(`[SYSTEM] Opening folder: ${handle.name} ...`, 'system');
      rootHandle.current = handle;
      setWorkspaceName(handle.name);

      const nodes = await readDirectoryHandle(handle, null);
      setFileSystem(nodes);
      setFileContents({});
      setOpenTabs([]);
      setActiveFileId(null);
      setExpandedFolders(new Set([nodes[0]?.id])); // expand root by default

      addLog(`[SUCCESS] Loaded ${nodes.length} items from "${handle.name}"`, 'success');
      addLog(`[TIP] Paste the absolute path of this folder in the CWD box to run commands inside it.`, 'info');
    } catch (e) {
      if (e.name !== 'AbortError') {
        addLog(`[ERROR] Could not open folder: ${e.message}`, 'error');
      }
    }
  }, []);

  // ── Read file content from real handle ───────────────────────────────────
  const openFile = useCallback(async (fileId) => {
    const node = fileSystem.find(f => f.id === fileId);
    if (!node || node.type !== 'file') return;

    // Switch active tab
    setActiveFileId(fileId);
    setOpenTabs(prev => prev.includes(fileId) ? prev : [...prev, fileId]);

    // Only fetch content if not already loaded
    if (fileContents[fileId] !== undefined) return;

    try {
      if (node.handle) {
        const file = await node.handle.getFile();
        const text = await file.text();
        setFileContents(prev => ({ ...prev, [fileId]: text }));
      } else {
        setFileContents(prev => ({ ...prev, [fileId]: '' }));
      }
    } catch (e) {
      setFileContents(prev => ({ ...prev, [fileId]: `// Error reading file: ${e.message}` }));
    }
  }, [fileSystem, fileContents]);

  // ── Update content (mark dirty) ──────────────────────────────────────────
  const updateFileContent = useCallback((fileId, newContent) => {
    setFileContents(prev => ({ ...prev, [fileId]: newContent }));
    setDirtyFiles(prev => new Set(prev).add(fileId));
  }, []);

  // ── Save file back to real disk ──────────────────────────────────────────
  const saveFile = useCallback(async (fileId) => {
    const node = fileSystem.find(f => f.id === fileId);
    if (!node?.handle) return;

    try {
      const writable = await node.handle.createWritable();
      await writable.write(fileContents[fileId] ?? '');
      await writable.close();
      setDirtyFiles(prev => { const s = new Set(prev); s.delete(fileId); return s; });
      addLog(`[SAVED] ${node.name}`, 'success');
    } catch (e) {
      addLog(`[ERROR] Could not save ${node.name}: ${e.message}`, 'error');
    }
  }, [fileSystem, fileContents]);

  // ── Close tab ────────────────────────────────────────────────────────────
  const closeFile = useCallback((fileId) => {
    setOpenTabs(prev => {
      const next = prev.filter(id => id !== fileId);
      setActiveFileId(cur => cur === fileId ? (next[next.length - 1] ?? null) : cur);
      return next;
    });
  }, []);

  // ── Folder expand/collapse ───────────────────────────────────────────────
  const toggleFolder = useCallback((id) => {
    setExpandedFolders(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }, []);

  // ── Create new file inside real folder ───────────────────────────────────
  const createFile = useCallback(async (name, parentId) => {
    const parentNode = parentId ? fileSystem.find(f => f.id === parentId) : { handle: rootHandle.current };
    if (!parentNode?.handle) {
      addLog('[ERROR] Open a folder first to create files.', 'error');
      return;
    }
    try {
      const fileHandle = await parentNode.handle.getFileHandle(name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write('');
      await writable.close();

      const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : 'txt';
      const id = generateId();
      setFileSystem(prev => [...prev, { id, name, type: 'file', parentId, extension: ext, handle: fileHandle }]);
      setFileContents(prev => ({ ...prev, [id]: '' }));
      setOpenTabs(prev => [...prev, id]);
      setActiveFileId(id);
      addLog(`[CREATED] ${name}`, 'success');
    } catch (e) {
      addLog(`[ERROR] ${e.message}`, 'error');
    }
  }, [fileSystem]);

  // ── Create new folder ────────────────────────────────────────────────────
  const createFolder = useCallback(async (name, parentId) => {
    const parentNode = parentId ? fileSystem.find(f => f.id === parentId) : { handle: rootHandle.current };
    if (!parentNode?.handle) {
      addLog('[ERROR] Open a folder first to create folders.', 'error');
      return;
    }
    try {
      const dirHandle = await parentNode.handle.getDirectoryHandle(name, { create: true });
      const id = generateId();
      setFileSystem(prev => [...prev, { id, name, type: 'folder', parentId, handle: dirHandle }]);
      setExpandedFolders(prev => new Set(prev).add(parentId ?? id));
      addLog(`[CREATED] folder: ${name}`, 'success');
    } catch (e) {
      addLog(`[ERROR] ${e.message}`, 'error');
    }
  }, [fileSystem]);

  // ── Delete item (real) ───────────────────────────────────────────────────
  const deleteItem = useCallback(async (id) => {
    const node = fileSystem.find(f => f.id === id);
    if (!node) return;

    const parentNode = node.parentId ? fileSystem.find(f => f.id === node.parentId) : { handle: rootHandle.current };
    try {
      if (parentNode?.handle) {
        await parentNode.handle.removeEntry(node.name, { recursive: true });
      }
    } catch (e) {
      addLog(`[WARN] Could not delete from disk: ${e.message}`, 'warn');
    }

    // Remove from state (children too)
    const toDelete = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      fileSystem.forEach(f => {
        if (toDelete.has(f.parentId) && !toDelete.has(f.id)) {
          toDelete.add(f.id); changed = true;
        }
      });
    }
    setFileSystem(prev => prev.filter(f => !toDelete.has(f.id)));
    setOpenTabs(prev => {
      const next = prev.filter(t => !toDelete.has(t));
      setActiveFileId(cur => toDelete.has(cur) ? (next[next.length - 1] ?? null) : cur);
      return next;
    });
    addLog(`[DELETED] ${node.name}`, 'warn');
  }, [fileSystem]);

  // ── Rename (real) ────────────────────────────────────────────────────────
  // File System Access API does not support rename natively; we copy+delete
  const renameItem = useCallback((id, newName) => {
    // For now just update UI name (real rename via copy-delete is complex)
    setFileSystem(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
  }, []);

  // ── Terminal log helper ──────────────────────────────────────────────────
  function addLog(msg, type = 'default', terminalId = activeTerminalId) {
    setTerminals(prev => prev.map(t => 
      t.id === terminalId 
        ? { ...t, logs: [...t.logs, { text: msg, type, ts: Date.now() }] } 
        : t
    ));
  }

  const clearTerminal = useCallback((terminalId = activeTerminalId) => {
    setTerminals(prev => prev.map(t => 
      t.id === terminalId ? { ...t, logs: [] } : t
    ));
  }, [activeTerminalId]);

  const createTerminal = useCallback(() => {
    const newId = generateId();
    setTerminals(prev => {
      const newName = `Terminal ${prev.length + 1}`;
      const activeCwd = prev.find(t => t.id === activeTerminalId)?.cwd || 'C:\\';
      return [...prev, { id: newId, name: newName, cwd: activeCwd, logs: [] }];
    });
    setActiveTerminalId(newId);
  }, [activeTerminalId]);

  const closeTerminal = useCallback((terminalId) => {
    setTerminals(prev => {
      const next = prev.filter(t => t.id !== terminalId);
      if (next.length === 0) {
        // Prevent 0 terminals, always keep at least one
        const newId = generateId();
        setActiveTerminalId(newId);
        return [{ id: newId, name: 'Terminal 1', cwd: 'C:\\', logs: [] }];
      }
      if (activeTerminalId === terminalId) {
        setActiveTerminalId(next[next.length - 1].id);
      }
      return next;
    });
  }, [activeTerminalId]);

  const setTerminalCwd = useCallback((terminalId, cwd) => {
    setTerminals(prev => prev.map(t => t.id === terminalId ? { ...t, cwd } : t));
  }, []);

  return (
    <DevLabContext.Provider value={{
      workspaceName,
      workspacePath,
      fileSystem,
      fileContents,
      dirtyFiles,
      openTabs,
      activeFileId,
      expandedFolders,
      terminals,
      activeTerminalId,
      setActiveTerminalId,
      setTerminalCwd,
      openFolder,
      openFile,
      closeFile,
      toggleFolder,
      updateFileContent,
      saveFile,
      createFile,
      createFolder,
      deleteItem,
      renameItem,
      addLog,
      clearTerminal,
      createTerminal,
      closeTerminal,
    }}>
      {children}
    </DevLabContext.Provider>
  );
}

export function useDevLab() {
  return useContext(DevLabContext);
}
