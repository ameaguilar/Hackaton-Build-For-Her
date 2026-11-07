import { useState } from "react";
import { Button } from "../components/Button";
import { ActionSheet } from "../components/ActionSheet";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { FormField } from "../components/FormField";
import { Icon } from "../components/Icon";
import { TopBar } from "../components/TopBar";
import { seedNotes, type NoteItem } from "../data/seed";
import { usePersistentState } from "../lib/storage";
import type { Screen } from "../types";

function Notes({
  navigate,
  notify,
}: {
  navigate: (screen: Screen) => void;
  notify: (message: string) => void;
}) {
  const [filter, setFilter] = useState("Todas");
  const [newNote, setNewNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDetail, setNoteDetail] = useState("");
  const [notePriority, setNotePriority] = useState<NoteItem["priority"]>("Media");
  const [notes, setNotes] = usePersistentState<NoteItem[]>("notes:items", seedNotes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailNote, setDetailNote] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  return (
    <div className="screen">
      <TopBar
        title="Notas importantes"
        subtitle="INFORMACIÓN QUE CUIDA"
        onProfile={() => navigate("admin")}
        onPoints={() => navigate("points")}
      />
      <main className="content">
        <div className="notes-intro">
          <span className="notes-icon">
            <Icon name="lock" />
          </span>
          <div>
            <h2>Información sensible</h2>
            <p>Visible según los permisos de cada familiar.</p>
          </div>
        </div>
        <div className="filter-row">
          {["Todas", "Alta", "Media", "Informativa"].map((f) => (
            <button
              className={`filter-chip ${filter === f ? "active" : ""}`}
              key={f}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        {notes
          .filter((note) => filter === "Todas" || note.priority === filter)
          .map((note) => (
            <button
              key={note.id}
              className={`note-card ${
                note.priority === "Alta"
                  ? "high-border"
                  : note.priority === "Media"
                    ? "mid-border"
                    : "info-border"
              }`}
              onClick={() => setDetailNote(note.id)}
            >
              <div className="note-head">
                <span
                  className={`priority ${
                    note.priority === "Alta"
                      ? "high"
                      : note.priority === "Media"
                        ? "mid"
                        : "info"
                  }`}
                >
                  {note.priority}
                </span>
                {note.priority === "Alta" ? (
                  <Icon name="lock" size={17} />
                ) : (
                  <Icon name="users" size={17} />
                )}
              </div>
              <h3>{note.title}</h3>
              <p>{note.detail}</p>
              <div className="note-meta">
                <span>{note.meta}</span>
                <span>{note.scope}</span>
              </div>
            </button>
          ))}
        {notes.filter((note) => filter === "Todas" || note.priority === filter).length === 0 && (
          <div className="covered">
            <span className="covered-art">
              <Icon name="check" />
            </span>
            <div>
              <strong>Nada por aquí</strong>
              <small>No hay notas con esta prioridad. Crea una con «Nueva nota».</small>
            </div>
          </div>
        )}
      </main>
      <Button className="floating-action" icon="plus" onClick={() => setNewNote(true)}>
        Nueva nota
      </Button>
      {newNote && (
        <ActionSheet
          title={editingId ? "Editar nota importante" : "Nueva nota importante"}
          subtitle="INFORMACIÓN SENSIBLE"
          close={() => {
            setNewNote(false);
            setEditingId(null);
          }}
        >
          <div className="sheet-form">
            <FormField
              label="Título"
              value={noteTitle}
              onChange={setNoteTitle}
              placeholder="Ej. Rutina de descanso"
            />
            <FormField
              label="Detalle"
              value={noteDetail}
              onChange={setNoteDetail}
              placeholder="Información para la familia"
            />
            <label className="form-field">
              <span>Prioridad</span>
              <select
                value={notePriority}
                onChange={(event) => setNotePriority(event.target.value as NoteItem["priority"])}
              >
                <option>Alta</option>
                <option>Media</option>
                <option>Informativa</option>
              </select>
            </label>
            <label className="toggle-row">
              <span>
                <strong>Nota sensible</strong>
                <small>Solo administradores</small>
              </span>
              <input type="checkbox" />
            </label>
            <Button
              icon="lock"
              onClick={() => {
                if (!noteTitle.trim() || !noteDetail.trim()) {
                  notify("Completa título y detalle antes de guardar");
                  return;
                }
                const stamp = new Intl.DateTimeFormat("es-MX", {
                  day: "numeric",
                  month: "long",
                }).format(new Date());
                const author = `Guardada por Ana · ${stamp} (demo)`;
                if (editingId === null) {
                  setNotes((current) => [
                    ...current,
                    {
                      id: `nota-${Date.now()}`,
                      title: noteTitle.trim(),
                      detail: noteDetail.trim(),
                      priority: notePriority,
                      scope: notePriority === "Alta" ? "Solo administradores" : "Toda la familia",
                      meta: `Guardada por Ana · ${stamp}`,
                    },
                  ]);
                  notify("Nota guardada con sus permisos");
                } else {
                  setNotes((current) =>
                    current.map((note) =>
                      note.id === editingId
                        ? {
                            ...note,
                            title: noteTitle.trim(),
                            detail: noteDetail.trim(),
                            priority: notePriority,
                            scope:
                              notePriority === "Alta" ? "Solo administradores" : "Toda la familia",
                            meta: author,
                          }
                        : note,
                    ),
                  );
                  notify("Nota actualizada");
                }
                setNewNote(false);
                setEditingId(null);
                setNoteTitle("");
                setNoteDetail("");
              }}
            >
              Guardar nota
            </Button>
          </div>
        </ActionSheet>
      )}
      {detailNote && (
        <ActionSheet
          title={notes.find((note) => note.id === detailNote)?.title ?? "Nota"}
          subtitle="DETALLE DE LA NOTA"
          close={() => setDetailNote(null)}
        >
          <div className="sheet-form">
            <p className="sheet-description">
              {notes.find((note) => note.id === detailNote)?.detail ??
                "Esta información está compartida con los usuarios autorizados."}
            </p>
            <p className="sheet-description">
              Esta información está compartida con los usuarios autorizados y puede actualizarse
              cuando sea necesario.
            </p>
            <Button
              icon="edit"
              onClick={() => {
                const note = notes.find((item) => item.id === detailNote);
                if (note) {
                  setEditingId(note.id);
                  setNoteTitle(note.title);
                  setNoteDetail(note.detail);
                  setNotePriority(note.priority);
                }
                setDetailNote(null);
                setNewNote(true);
              }}
            >
              Editar nota
            </Button>
            <Button
              variant="danger"
              icon="close"
              onClick={() => {
                setDeleteId(detailNote);
                setDetailNote(null);
              }}
            >
              Eliminar nota
            </Button>
          </div>
        </ActionSheet>
      )}
      {deleteId && (
        <ConfirmDialog
          title="¿Eliminar esta nota?"
          message="La información dejará de estar disponible para toda la familia. Esta acción no se puede deshacer."
          confirmLabel="Eliminar nota"
          onConfirm={() => {
            setNotes((current) => current.filter((note) => note.id !== deleteId));
            setDeleteId(null);
            notify("Nota eliminada");
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}

export default Notes;
