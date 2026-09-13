import { useEffect, useRef, useState } from "react";
import { NotebookPen, Plus, Trash2 } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const STORAGE_KEY = "airtoolkit-scratchpad-notes";

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // localStorage unavailable (e.g. blocked site data) — notes just won't persist.
  }
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString();
}

export default function Scratchpad() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const loaded = loadNotes();
    setNotes(loaded);
    setActiveId(loaded[0]?.id ?? null);
    loadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    saveNotes(notes);
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeId) ?? null;

  const handleNew = () => {
    const note: Note = {
      id: crypto.randomUUID(),
      title: "Untitled note",
      content: "",
      updatedAt: Date.now(),
    };
    setNotes((current) => [note, ...current]);
    setActiveId(note.id);
  };

  const handleDelete = (id: string) => {
    setNotes((current) => current.filter((n) => n.id !== id));
    if (activeId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      setActiveId(remaining[0]?.id ?? null);
    }
  };

  const updateActive = (patch: Partial<Pick<Note, "title" | "content">>) => {
    if (!activeId) return;
    setNotes((current) =>
      current.map((n) =>
        n.id === activeId ? { ...n, ...patch, updatedAt: Date.now() } : n,
      ),
    );
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-64 flex flex-col overflow-hidden shrink-0 border-r border-border bg-card">
        <div className="flex items-center justify-between px-4 h-16 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <NotebookPen className="text-primary" size={20} />
            <h2 className="font-semibold text-text">Scratchpad</h2>
          </div>
          <button
            onClick={handleNew}
            title="New note"
            className="p-1.5 rounded-lg text-subText hover:bg-inputBg transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {notes.length === 0 ? (
            <p className="text-sm text-subText p-4">
              No notes yet. Click + to create one.
            </p>
          ) : (
            notes.map((note) => (
              <button
                key={note.id}
                onClick={() => setActiveId(note.id)}
                className={`w-full text-left px-4 py-3 border-b border-border transition-colors group ${
                  note.id === activeId ? "bg-inputBg" : "hover:bg-inputBg"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-text truncate">
                    {note.title || "Untitled note"}
                  </span>
                  <Trash2
                    size={14}
                    className="text-subText hover:text-danger transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                  />
                </div>
                <span className="text-xs text-subText">
                  {formatTimestamp(note.updatedAt)}
                </span>
              </button>
            ))
          )}
        </div>

        <p className="text-xs text-subText p-3 border-t border-border shrink-0">
          Stored locally on this machine only.
        </p>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeNote ? (
          <>
            <input
              value={activeNote.title}
              onChange={(e) => updateActive({ title: e.target.value })}
              placeholder="Note title..."
              className="px-6 h-16 border-b border-border shrink-0 bg-transparent text-lg font-semibold text-text outline-none placeholder:text-subText"
            />
            <textarea
              value={activeNote.content}
              onChange={(e) => updateActive({ content: e.target.value })}
              placeholder="Start typing..."
              spellCheck={false}
              className="flex-1 resize-none bg-transparent p-6 font-mono text-sm text-text outline-none placeholder:text-subText"
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-subText">
              Select a note or create a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
