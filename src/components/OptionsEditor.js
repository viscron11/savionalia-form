import { useState } from "react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useOptions } from "../hooks/useOptions";

export default function OptionsEditor() {
    const { options, loading } = useOptions();
    const [isEditing, setIsEditing] = useState(false);
    const [editOptions, setEditOptions] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState(null);
    const [deletedIds, setDeletedIds] = useState([]);

    const displayOptions = isEditing ? editOptions : options;

    const startEditing = () => {
        setEditOptions(options.map((o) => ({ ...o })));
        setDeletedIds([]);
        setSaveMsg(null);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setEditOptions(null);
        setDeletedIds([]);
        setSaveMsg(null);
        setIsEditing(false);
    };

    const updateOption = (index, key, value) => {
        const updated = [...editOptions];
        if (key === "totalSpots" || key === "spotsLeft") {
            updated[index] = { ...updated[index], [key]: parseInt(value, 10) || 0 };
        } else {
            updated[index] = { ...updated[index], [key]: value };
        }
        setEditOptions(updated);
    };

    const addOption = () => {
        const newId = `option_${Date.now()}`;
        setEditOptions([
            ...editOptions,
            { id: newId, name: "", totalSpots: 20, spotsLeft: 20, isNew: true },
        ]);
    };

    const removeOption = (index) => {
        const opt = editOptions[index];
        if (!opt.isNew && opt.id) {
            setDeletedIds((prev) => [...prev, opt.id]);
        }
        setEditOptions(editOptions.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        // Validate
        for (const opt of editOptions) {
            if (!opt.name.trim()) {
                setSaveMsg({ type: "error", text: "Każda opcja musi mieć nazwę." });
                return;
            }
            if (!opt.id.trim()) {
                setSaveMsg({ type: "error", text: "Każda opcja musi mieć ID." });
                return;
            }
            if (opt.totalSpots < 0 || opt.spotsLeft < 0) {
                setSaveMsg({ type: "error", text: "Liczba miejsc nie może być ujemna." });
                return;
            }
        }

        const ids = editOptions.map((o) => o.id);
        if (new Set(ids).size !== ids.length) {
            setSaveMsg({ type: "error", text: "ID opcji muszą być unikalne." });
            return;
        }

        setSaving(true);
        setSaveMsg(null);

        try {
            // Delete removed options
            for (const id of deletedIds) {
                await deleteDoc(doc(db, "options", id));
            }

            // Save all current options
            for (const opt of editOptions) {
                const { isNew, ...data } = opt;
                await setDoc(doc(db, "options", opt.id), {
                    name: data.name,
                    totalSpots: data.totalSpots,
                    spotsLeft: data.spotsLeft,
                });
            }

            setSaveMsg({ type: "success", text: "Zapisano!" });
            setIsEditing(false);
            setEditOptions(null);
            setDeletedIds([]);
        } catch (err) {
            setSaveMsg({ type: "error", text: `Błąd zapisu: ${err.message}` });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="config-section">
                <p className="config-loading">Ładowanie opcji...</p>
            </div>
        );
    }

    return (
        <div className="config-section">
            <div className="config-header">
                <h2 className="summary-title">Opcje / Warsztaty</h2>
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

            <div className="config-fields-list">
                <p className="config-fields-label">
                    Opcje ({displayOptions.length})
                </p>

                {displayOptions.map((opt, index) => (
                    <div key={opt.id + index} className="config-field-row">
                        {isEditing ? (
                            <>
                                <div className="config-field-inputs">
                                    <div className="config-input-group">
                                        <label>ID</label>
                                        <input
                                            type="text"
                                            value={opt.id}
                                            onChange={(e) => updateOption(index, "id", e.target.value)}
                                            className="input-sm"
                                            disabled={!opt.isNew}
                                        />
                                    </div>
                                    <div className="config-input-group">
                                        <label>Nazwa</label>
                                        <input
                                            type="text"
                                            value={opt.name}
                                            onChange={(e) =>
                                                updateOption(index, "name", e.target.value)
                                            }
                                            className="input-sm"
                                        />
                                    </div>
                                    <div className="config-input-group config-input-narrow">
                                        <label>Wszystkie</label>
                                        <input
                                            type="number"
                                            value={opt.totalSpots}
                                            onChange={(e) =>
                                                updateOption(index, "totalSpots", e.target.value)
                                            }
                                            className="input-sm"
                                            min="0"
                                        />
                                    </div>
                                    <div className="config-input-group config-input-narrow">
                                        <label>Wolne</label>
                                        <input
                                            type="number"
                                            value={opt.spotsLeft}
                                            onChange={(e) =>
                                                updateOption(index, "spotsLeft", e.target.value)
                                            }
                                            className="input-sm"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="config-field-actions">
                                    <button
                                        className="btn-icon btn-icon-danger"
                                        onClick={() => removeOption(index)}
                                        title="Usuń"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="config-field-display">
                                <span className="field-label">{opt.name}</span>
                                <span className="field-meta">
                                    {opt.id} · {opt.totalSpots - opt.spotsLeft}/{opt.totalSpots}{" "}
                                    zajętych · {opt.spotsLeft} wolnych
                                </span>
                            </div>
                        )}
                    </div>
                ))}

                {isEditing && (
                    <button className="btn-small btn-add-field" onClick={addOption}>
                        + Dodaj opcję
                    </button>
                )}
            </div>
        </div>
    );
}
