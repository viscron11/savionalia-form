import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useFormConfig } from "../hooks/useFormConfig";

const FIELD_TYPES = [
    { value: "text", label: "Tekst" },
    { value: "email", label: "E-mail" },
    { value: "tel", label: "Telefon" },
    { value: "number", label: "Numer" },
];

export default function FormConfigEditor() {
    const { config, loading } = useFormConfig();
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState(null);
    const [editFields, setEditFields] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editSubtitle, setEditSubtitle] = useState("");

    // Initialize local state when config loads
    const fields =
        editFields !== null ? editFields : config?.fields || [];
    const title = editFields !== null ? editTitle : config?.title || "";
    const subtitle =
        editFields !== null ? editSubtitle : config?.subtitle || "";

    const startEditing = () => {
        setEditFields([...(config?.fields || [])]);
        setEditTitle(config?.title || "");
        setEditSubtitle(config?.subtitle || "");
        setSaveMsg(null);
    };

    const cancelEditing = () => {
        setEditFields(null);
        setSaveMsg(null);
    };

    const isEditing = editFields !== null;

    const updateField = (index, key, value) => {
        const updated = [...editFields];
        if (key === "required" || key === "halfWidth") {
            updated[index] = { ...updated[index], [key]: value === "true" };
        } else {
            updated[index] = { ...updated[index], [key]: value };
        }
        setEditFields(updated);
    };

    const addField = () => {
        setEditFields([
            ...editFields,
            {
                id: `field_${Date.now()}`,
                label: "",
                type: "text",
                placeholder: "",
                required: false,
                halfWidth: false,
            },
        ]);
    };

    const removeField = (index) => {
        setEditFields(editFields.filter((_, i) => i !== index));
    };

    const moveField = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= editFields.length) return;
        const updated = [...editFields];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        setEditFields(updated);
    };

    const handleSave = async () => {
        // Validate
        for (const field of editFields) {
            if (!field.id.trim() || !field.label.trim()) {
                setSaveMsg({ type: "error", text: "Każde pole musi mieć ID i etykietę." });
                return;
            }
        }

        const ids = editFields.map((f) => f.id);
        if (new Set(ids).size !== ids.length) {
            setSaveMsg({ type: "error", text: "ID pól muszą być unikalne." });
            return;
        }

        setSaving(true);
        setSaveMsg(null);

        try {
            await updateDoc(doc(db, "config", "form"), {
                title: editTitle,
                subtitle: editSubtitle,
                fields: editFields,
            });
            setSaveMsg({ type: "success", text: "Zapisano!" });
            setEditFields(null);
        } catch (err) {
            setSaveMsg({
                type: "error",
                text: `Błąd zapisu: ${err.message}`,
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="config-section">
                <p className="config-loading">Ładowanie konfiguracji...</p>
            </div>
        );
    }

    return (
        <div className="config-section">
            <div className="config-header">
                <h2 className="summary-title">Konfiguracja formularza</h2>
                {!isEditing ? (
                    <button className="btn-small btn-edit" onClick={startEditing}>
                        ✏️ Edytuj
                    </button>
                ) : (
                    <div className="config-actions">
                        <button
                            className="btn-small btn-save"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? "Zapisywanie..." : "💾 Zapisz"}
                        </button>
                        <button className="btn-small btn-cancel" onClick={cancelEditing}>
                            Anuluj
                        </button>
                    </div>
                )}
            </div>

            {saveMsg && (
                <div
                    className={`config-msg ${saveMsg.type === "error" ? "config-msg-error" : "config-msg-success"
                        }`}
                >
                    {saveMsg.text}
                </div>
            )}

            {/* Title & Subtitle */}
            <div className="config-meta">
                <div className="config-meta-field">
                    <label>Tytuł formularza</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                        />
                    ) : (
                        <span>{title}</span>
                    )}
                </div>
                <div className="config-meta-field">
                    <label>Podtytuł</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editSubtitle}
                            onChange={(e) => setEditSubtitle(e.target.value)}
                        />
                    ) : (
                        <span>{subtitle}</span>
                    )}
                </div>
            </div>

            {/* Fields */}
            <div className="config-fields-list">
                <p className="config-fields-label">Pola formularza ({fields.length})</p>
                {fields.map((field, index) => (
                    <div key={field.id + index} className="config-field-row">
                        {isEditing ? (
                            <>
                                <div className="config-field-inputs">
                                    <div className="config-input-group">
                                        <label>ID</label>
                                        <input
                                            type="text"
                                            value={field.id}
                                            onChange={(e) =>
                                                updateField(index, "id", e.target.value)
                                            }
                                            className="input-sm"
                                        />
                                    </div>
                                    <div className="config-input-group">
                                        <label>Etykieta</label>
                                        <input
                                            type="text"
                                            value={field.label}
                                            onChange={(e) =>
                                                updateField(index, "label", e.target.value)
                                            }
                                            className="input-sm"
                                        />
                                    </div>
                                    <div className="config-input-group">
                                        <label>Typ</label>
                                        <select
                                            value={field.type}
                                            onChange={(e) =>
                                                updateField(index, "type", e.target.value)
                                            }
                                            className="input-sm"
                                        >
                                            {FIELD_TYPES.map((t) => (
                                                <option key={t.value} value={t.value}>
                                                    {t.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="config-input-group">
                                        <label>Placeholder</label>
                                        <input
                                            type="text"
                                            value={field.placeholder || ""}
                                            onChange={(e) =>
                                                updateField(index, "placeholder", e.target.value)
                                            }
                                            className="input-sm"
                                        />
                                    </div>
                                    <div className="config-input-group config-input-narrow">
                                        <label>Wymagane</label>
                                        <select
                                            value={String(field.required)}
                                            onChange={(e) =>
                                                updateField(index, "required", e.target.value)
                                            }
                                            className="input-sm"
                                        >
                                            <option value="true">Tak</option>
                                            <option value="false">Nie</option>
                                        </select>
                                    </div>
                                    <div className="config-input-group config-input-narrow">
                                        <label>Pół szer.</label>
                                        <select
                                            value={String(field.halfWidth)}
                                            onChange={(e) =>
                                                updateField(index, "halfWidth", e.target.value)
                                            }
                                            className="input-sm"
                                        >
                                            <option value="true">Tak</option>
                                            <option value="false">Nie</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="config-field-actions">
                                    <button
                                        className="btn-icon"
                                        onClick={() => moveField(index, -1)}
                                        disabled={index === 0}
                                        title="W górę"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={() => moveField(index, 1)}
                                        disabled={index === fields.length - 1}
                                        title="W dół"
                                    >
                                        ↓
                                    </button>
                                    <button
                                        className="btn-icon btn-icon-danger"
                                        onClick={() => removeField(index)}
                                        title="Usuń"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="config-field-display">
                                <span className="field-label">{field.label}</span>
                                <span className="field-meta">
                                    {field.type} · {field.id}
                                    {field.required && " · wymagane"}
                                    {field.halfWidth && " · pół szer."}
                                </span>
                            </div>
                        )}
                    </div>
                ))}

                {isEditing && (
                    <button className="btn-small btn-add-field" onClick={addField}>
                        + Dodaj pole
                    </button>
                )}
            </div>
        </div>
    );
}
