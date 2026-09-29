import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FolderOpen, Folder, FileCode2, FileJson, FileText, Terminal as TerminalIcon,
  ChevronRight, X, Plus, FolderPlus, Save, Play, RefreshCw, Trash2,
  Edit3, Cpu, Settings, Search
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useDevLab } from '../../context/DevLabContext';

// ─── Utilities ───────────────────────────────────────────────────────────────
const EXT_LANG = { js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx', py: 'python', json: 'json', css: 'css', html: 'html', md: 'markdown', cpp: 'cpp', c: 'c', java: 'java', sh: 'bash', txt: 'text' };
const getLanguage = (ext = '') => EXT_LANG[ext.toLowerCase()] || 'text';

function FileIcon({ ext }) {
  const e = (ext || '').toLowerCase();
  if (['js','jsx','ts','tsx'].includes(e)) return <FileCode2 style={{width:14,height:14,color:'#f0db4f',flexShrink:0}} />;
  if (e === 'json') return <FileJson style={{width:14,height:14,color:'#89d185',flexShrink:0}} />;
  if (['css','scss'].includes(e)) return <FileCode2 style={{width:14,height:14,color:'#ce9178',flexShrink:0}} />;
  if (e === 'py') return <FileCode2 style={{width:14,height:14,color:'#3572A5',flexShrink:0}} />;
  if (['html','htm'].includes(e)) return <FileCode2 style={{width:14,height:14,color:'#e44b23',flexShrink:0}} />;
  return <FileText style={{width:14,height:14,color:'#8a8a8a',flexShrink:0}} />;
}

// ─── Code Editor ─────────────────────────────────────────────────────────────
function CodeEditor({ code, language, onChange, onSave }) {
  const handleEditorChange = (value) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    // Add custom keybinding for save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave();
    });
    
    // Custom cyberpunk theme
    monaco.editor.defineTheme('zoro-cyberpunk', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { background: '1e1e1e' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.lineHighlightBackground': '#2a2a2a',
        'editorCursor.foreground': '#00e5ff',
        'editor.selectionBackground': '#00e5ff40',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#00e5ff',
      }
    });
    monaco.editor.setTheme('zoro-cyberpunk');
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#1e1e1e' }}>
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark" // overridden on mount
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
          lineHeight: 1.6,
          padding: { top: 12 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          formatOnPaste: true,
        }}
      />
    </div>
  );
}

// ─── File Tree Item ───────────────────────────────────────────────────────────
function FileTreeItem({ node, allNodes, level, contextMenuTarget, setContextMenuTarget }) {
  const { openFile, toggleFolder, expandedFolders, activeFileId, dirtyFiles } = useDevLab();
  const children = allNodes.filter(n => n.parentId === node.id);
  const isExpanded = expandedFolders.has(node.id);
  const isActive = activeFileId === node.id;
  const isDirty = dirtyFiles.has(node.id);

  const indent = level * 12;

  if (node.type === 'folder') {
    return (
      <div>
        <div
          onClick={() => toggleFolder(node.id)}
          onContextMenu={e => { e.preventDefault(); setContextMenuTarget({ x: e.clientX, y: e.clientY, node }); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px 3px 0',
            paddingLeft: `${indent + 4}px`,
            cursor: 'pointer', userSelect: 'none',
            fontSize: 13, fontFamily: 'system-ui, sans-serif',
            color: '#cccccc',
            borderRadius: 4,
          }}
          className="explorer-row"
        >
          <ChevronRight
            style={{
              width: 14, height: 14, flexShrink: 0,
              transform: isExpanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.15s ease',
              color: '#888'
            }}
          />
          {isExpanded
            ? <FolderOpen style={{ width: 15, height: 15, flexShrink: 0, color: '#e8c072' }} />
            : <Folder style={{ width: 15, height: 15, flexShrink: 0, color: '#e8c072' }} />
          }
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
        </div>
        {isExpanded && children.map(child => (
          <FileTreeItem
            key={child.id} node={child} allNodes={allNodes}
            level={level + 1}
            contextMenuTarget={contextMenuTarget}
            setContextMenuTarget={setContextMenuTarget}
          />
        ))}
      </div>
    );
  }

  // File
  return (
    <div
      onClick={() => openFile(node.id)}
      onContextMenu={e => { e.preventDefault(); setContextMenuTarget({ x: e.clientX, y: e.clientY, node }); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '3px 8px 3px 0',
        paddingLeft: `${indent + 20}px`,
        cursor: 'pointer', userSelect: 'none',
        fontSize: 13, fontFamily: 'system-ui, sans-serif',
        color: isActive ? '#00e5ff' : '#cccccc',
        background: isActive ? 'rgba(0,229,255,0.06)' : 'transparent',
        borderLeft: isActive ? '2px solid #00e5ff' : '2px solid transparent',
        borderRadius: '0 4px 4px 0',
        marginRight: 4,
      }}
      className="explorer-row"
    >
      <FileIcon ext={node.extension} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{node.name}</span>
      {isDirty && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f0a500', flexShrink: 0 }} />}
    </div>
  );
}

// ─── Context Menu ─────────────────────────────────────────────────────────────
function ContextMenu({ target, onClose }) {
  const { createFile, createFolder, deleteItem, renameItem } = useDevLab();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const items = target.node ? [
    target.node.type === 'folder' && {
      label: 'New File Here', icon: <Plus size={12} />,
      action: async () => {
        const name = window.prompt('File name:');
        if (name) { await createFile(name, target.node.id); onClose(); }
      }
    },
    target.node.type === 'folder' && {
      label: 'New Folder Here', icon: <FolderPlus size={12} />,
      action: async () => {
        const name = window.prompt('Folder name:');
        if (name) { await createFolder(name, target.node.id); onClose(); }
      }
    },
    { label: 'Rename', icon: <Edit3 size={12} />,
      action: () => {
        const name = window.prompt('New name:', target.node.name);
        if (name) { renameItem(target.node.id, name); onClose(); }
      }
    },
    { label: 'Delete', icon: <Trash2 size={12} />, danger: true,
      action: async () => {
        if (window.confirm(`Delete "${target.node.name}"?`)) {
          await deleteItem(target.node.id); onClose();
        }
      }
    },
  ].filter(Boolean) : [
    { label: 'New File', icon: <Plus size={12} />,
      action: async () => {
        const name = window.prompt('File name:');
        if (name) { await createFile(name, null); onClose(); }
      }
    },
    { label: 'New Folder', icon: <FolderPlus size={12} />,
      action: async () => {
        const name = window.prompt('Folder name:');
        if (name) { await createFolder(name, null); onClose(); }
      }
    },
  ];

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', top: target.y, left: target.x,
        background: '#252526', border: '1px solid #454545',
        borderRadius: 6, padding: '4px 0', zIndex: 9999,
        minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
        fontFamily: 'system-ui, sans-serif', fontSize: 13,
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          onClick={item.action}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', cursor: 'pointer',
            color: item.danger ? '#f48771' : '#cccccc',
          }}
          className="ctx-menu-item"
        >
          {item.icon} {item.label}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ZoroDevLab() {
  const {
    workspaceName, fileSystem, fileContents, dirtyFiles,
    openTabs, activeFileId, expandedFolders, 
    terminals, activeTerminalId, setActiveTerminalId, setTerminalCwd, 
    openFolder, openFile, closeFile, updateFileContent,
    saveFile, createFile, createFolder, addLog, clearTerminal,
    createTerminal, closeTerminal,
  } = useDevLab();

  const [cmdInput, setCmdInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [contextMenuTarget, setContextMenuTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('TERMINAL'); // TERMINAL | OUTPUT | PROBLEMS
  const terminalEndRef = useRef(null);
  const cmdInputRef = useRef(null);

  const activeNode = fileSystem.find(f => f.id === activeFileId);
  const rootNodes = fileSystem.filter(f => f.parentId === null);
  
  const activeTerminal = terminals.find(t => t.id === activeTerminalId) || terminals[0];
  const terminalLogs = activeTerminal ? activeTerminal.logs : [];
  const terminalCwd = activeTerminal ? activeTerminal.cwd : 'C:\\';

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // ── Real terminal execution ────────────────────────────────────────────
  const runCommand = useCallback(async (cmd) => {
    if (!cmd.trim()) return;

    // Local intercept: clear
    if (cmd.trim() === 'clear' || cmd.trim() === 'cls') {
      clearTerminal();
      return;
    }

    addLog(`$ ${cmd}`, 'cmd');
    setIsRunning(true);

    try {
      const res = await fetch('http://localhost:5000/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, cwd: terminalCwd }),
      });
      const data = await res.json();
      const lines = (data.output || '').split('\n');
      lines.forEach(line => addLog(line, data.success ? 'default' : 'error'));
    } catch (e) {
      addLog(`[ERROR] Cannot reach server: ${e.message}`, 'error');
    } finally {
      setIsRunning(false);
      setTimeout(() => cmdInputRef.current?.focus(), 100);
    }
  }, [terminalCwd, addLog, clearTerminal]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isRunning) {
      const cmd = cmdInput.trim();
      if (cmd) {
        setCmdInput('');
        runCommand(cmd);
      }
    }
  };

  const logColor = (type) => {
    switch(type) {
      case 'cmd': return '#00e5ff';
      case 'success': return '#4ec9b0';
      case 'error': return '#f48771';
      case 'warn': return '#dcdcaa';
      case 'system': return '#bb86fc';
      case 'info': return '#569cd6';
      default: return '#d4d4d4';
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      width: '100%', height: '100%', minHeight: 600,
      background: '#1e1e1e',
      border: '1px solid rgba(0,229,255,0.15)',
      borderRadius: 12,
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>

      {/* ── TITLE BAR ─────────────────────────────────────────────────── */}
      <div style={{
        height: 38, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 12px',
        background: '#323233', borderBottom: '1px solid #2d2d2d',
        flexShrink: 0,
      }}>
        {/* Left: Traffic lights + workspace name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#3c3c3c', padding: '3px 10px', borderRadius: 4,
            cursor: 'pointer',
          }}
            onClick={openFolder}
            title="Open Folder from PC"
          >
            <FolderOpen size={14} style={{ color: '#e8c072' }} />
            <span style={{ fontSize: 12, color: '#cccccc', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {workspaceName}
            </span>
          </div>
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={openFolder}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.3)',
              borderRadius: 5, padding: '4px 10px', cursor: 'pointer',
              color: '#00e5ff', fontSize: 12, fontWeight: 600,
            }}
          >
            <FolderOpen size={13} /> Open Folder
          </button>
          {activeFileId && dirtyFiles.has(activeFileId) && (
            <button
              onClick={() => saveFile(activeFileId)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(0,255,156,0.12)', border: '1px solid rgba(0,255,156,0.3)',
                borderRadius: 5, padding: '4px 10px', cursor: 'pointer',
                color: '#00ff9c', fontSize: 12, fontWeight: 600,
              }}
            >
              <Save size={13} /> Save
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN BODY ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── EXPLORER ──────────────────────────────────────────────── */}
        <div style={{
          width: 240, flexShrink: 0,
          background: '#252526',
          borderRight: '1px solid #2d2d2d',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
          onContextMenu={e => { if (e.target === e.currentTarget) { e.preventDefault(); setContextMenuTarget({ x: e.clientX, y: e.clientY, node: null }); }}}
        >
          {/* Explorer header */}
          <div style={{
            padding: '8px 12px 6px',
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
            color: '#bbbbbb', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <span>Explorer</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button title="New File" onClick={async () => { const n = window.prompt('File name:'); if (n) await createFile(n, null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 2 }}>
                <Plus size={14} />
              </button>
              <button title="New Folder" onClick={async () => { const n = window.prompt('Folder name:'); if (n) await createFolder(n, null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 2 }}>
                <FolderPlus size={14} />
              </button>
            </div>
          </div>

          {/* File tree */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {fileSystem.length === 0 ? (
              <div style={{
                padding: 20, textAlign: 'center', color: '#555',
                fontSize: 12, lineHeight: 1.6,
              }}>
                <FolderOpen size={36} style={{ color: '#444', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                No folder opened.<br />
                Click <strong style={{ color: '#00e5ff' }}>Open Folder</strong> above<br />to load your project.
              </div>
            ) : (
              rootNodes.map(node => (
                <FileTreeItem
                  key={node.id} node={node} allNodes={fileSystem}
                  level={0}
                  contextMenuTarget={contextMenuTarget}
                  setContextMenuTarget={setContextMenuTarget}
                />
              ))
            )}
          </div>
        </div>

        {/* ── CENTER: EDITOR + TERMINAL ────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Tabs */}
          <div style={{
            display: 'flex', alignItems: 'flex-end',
            background: '#252526', borderBottom: '1px solid #2d2d2d',
            height: 36, flexShrink: 0, overflowX: 'auto', overflowY: 'hidden',
          }}>
            {openTabs.map(tabId => {
              const node = fileSystem.find(f => f.id === tabId);
              if (!node) return null;
              const isActive = activeFileId === tabId;
              const isDirty = dirtyFiles.has(tabId);
              return (
                <div
                  key={tabId}
                  onClick={() => openFile(tabId)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '0 12px', height: '100%',
                    background: isActive ? '#1e1e1e' : 'transparent',
                    borderTop: isActive ? '1px solid #00e5ff' : '1px solid transparent',
                    borderRight: '1px solid #2d2d2d',
                    cursor: 'pointer', flexShrink: 0,
                    color: isActive ? '#ffffff' : '#969696',
                    fontSize: 13,
                  }}
                >
                  <FileIcon ext={node.extension} />
                  <span>{node.name}</span>
                  {isDirty && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f0a500' }} />}
                  <div
                    onClick={e => { e.stopPropagation(); closeFile(tabId); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 18, height: 18, borderRadius: 3, marginLeft: 2,
                      color: '#969696', cursor: 'pointer',
                    }}
                    className="tab-close-btn"
                  >
                    <X size={12} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Editor Area */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {activeFileId ? (
              <CodeEditor
                code={fileContents[activeFileId] ?? ''}
                language={getLanguage(activeNode?.extension)}
                onChange={val => updateFileContent(activeFileId, val)}
                onSave={() => saveFile(activeFileId)}
              />
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%',
                color: '#555', fontSize: 14, gap: 12,
              }}>
                <FolderOpen size={52} style={{ color: '#3c3c3c' }} />
                <span>Open a folder and select a file to edit</span>
                <button
                  onClick={openFolder}
                  style={{
                    background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)',
                    borderRadius: 6, padding: '8px 20px', cursor: 'pointer',
                    color: '#00e5ff', fontSize: 13, fontWeight: 600,
                  }}
                >
                  Open Folder
                </button>
              </div>
            )}
          </div>

          {/* ── PANEL: Terminal ──────────────────────────────────────── */}
          <div style={{
            height: 240, flexShrink: 0,
            background: '#1e1e1e',
            borderTop: '1px solid #2d2d2d',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Panel tabs */}
            <div style={{
              display: 'flex', alignItems: 'center',
              background: '#252526', borderBottom: '1px solid #2d2d2d',
              height: 30, padding: '0 8px', gap: 0, flexShrink: 0, overflowX: 'auto'
            }}>
              {terminals.map(term => (
                <div
                  key={term.id}
                  onClick={() => { setActiveTab('TERMINAL'); setActiveTerminalId(term.id); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 12px', cursor: 'pointer',
                    color: (activeTab === 'TERMINAL' && activeTerminalId === term.id) ? '#ffffff' : '#888',
                    fontSize: 11, fontWeight: (activeTab === 'TERMINAL' && activeTerminalId === term.id) ? 700 : 400,
                    borderBottom: (activeTab === 'TERMINAL' && activeTerminalId === term.id) ? '2px solid #00e5ff' : '2px solid transparent',
                  }}
                >
                  <TerminalIcon size={12} />
                  <span>{term.name}</span>
                  <div
                    onClick={(e) => { e.stopPropagation(); closeTerminal(term.id); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 16, height: 16, borderRadius: 3, marginLeft: 4,
                      color: '#888', cursor: 'pointer',
                    }}
                    className="tab-close-btn"
                  >
                    <X size={10} />
                  </div>
                </div>
              ))}
              <button onClick={() => { createTerminal(); setActiveTab('TERMINAL'); }} title="New Terminal"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px 8px', marginLeft: 4 }}>
                <Plus size={13} />
              </button>
              
              <div style={{ width: 1, height: 16, background: '#444', margin: '0 8px' }} />
              
              <button onClick={() => setActiveTab('OUTPUT')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px 12px', color: activeTab === 'OUTPUT' ? '#ffffff' : '#888',
                    fontSize: 11, fontWeight: activeTab === 'OUTPUT' ? 700 : 400,
                    borderBottom: activeTab === 'OUTPUT' ? '2px solid #00e5ff' : '2px solid transparent',
                  }}>OUTPUT</button>

              <div style={{ flex: 1 }} />
              <button onClick={() => clearTerminal(activeTerminalId)} title="Clear Terminal"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 4 }}>
                <Trash2 size={13} />
              </button>
            </div>

            {/* Terminal Workspace */}
            {activeTab === 'TERMINAL' ? (
              <>
                {/* CWD bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '4px 10px',
                  background: '#252526', borderBottom: '1px solid #2d2d2d',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>cwd:</span>
                  <input
                    value={terminalCwd}
                    onChange={e => setTerminalCwd(activeTerminalId, e.target.value)}
                    spellCheck={false}
                    placeholder="Paste project path e.g. C:\project\MyApp"
                    style={{
                      flex: 1, background: '#3c3c3c', border: '1px solid #555',
                      borderRadius: 4, padding: '2px 8px',
                      color: '#00e5ff', fontSize: 11, fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Terminal output */}
                <div style={{
                  flex: 1, overflowY: 'auto', overflowX: 'hidden',
                  padding: '8px 12px',
                  fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
                  fontSize: 12, lineHeight: 1.6,
                }}>
                  {terminalLogs.map((log, i) => {
                    const text = typeof log === 'string' ? log : log?.text ?? '';
                    const type = typeof log === 'string' ? 'default' : log?.type ?? 'default';
                    return (
                      <div key={i} style={{ color: logColor(type), whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {text}
                      </div>
                    );
                  })}
                  {isRunning && (
                    <div style={{ color: '#888' }}>
                      <span className="terminal-blink">▌</span> Running...
                    </div>
                  )}
                  <div ref={terminalEndRef} />
                </div>

                {/* Terminal input */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px',
                  background: '#252526', borderTop: '1px solid #2d2d2d',
                  flexShrink: 0,
                }}>
                  <span style={{ color: '#00e5ff', fontFamily: 'monospace', fontSize: 13, userSelect: 'none' }}>❯</span>
                  <input
                    ref={cmdInputRef}
                    value={cmdInput}
                    onChange={e => setCmdInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isRunning}
                    spellCheck={false}
                    autoComplete="off"
                    placeholder={isRunning ? 'Running...' : 'Type a command and press Enter'}
                    style={{
                      flex: 1, background: 'transparent', border: 'none',
                      color: '#d4d4d4', fontFamily: 'monospace', fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
              </>
            ) : (
              <div style={{ padding: 20, color: '#888', fontSize: 12 }}>
                {activeTab} is empty.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenuTarget && (
        <ContextMenu target={contextMenuTarget} onClose={() => setContextMenuTarget(null)} />
      )}

      {/* Inline styles for hover effects */}
      <style>{`
        .explorer-row:hover { background: rgba(255,255,255,0.04) !important; }
        .tab-close-btn:hover { background: rgba(255,255,255,0.12) !important; color: #fff !important; }
        .ctx-menu-item:hover { background: rgba(255,255,255,0.06) !important; }
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
        .terminal-blink { animation: blink 1s infinite; }
      `}</style>
    </div>
  );
}
