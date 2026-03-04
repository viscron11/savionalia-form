import { useRegistrations } from "../hooks/useRegistrations";
import { useOptions } from "../hooks/useOptions";
import { useFormConfig } from "../hooks/useFormConfig";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";

export default function AdminDashboard() {
    const { registrations, loading, error } = useRegistrations();
    const { options } = useOptions();
    const { config } = useFormConfig();

    const optionNameMap = {};
    options.forEach((opt) => {
        optionNameMap[opt.id] = opt.name;
    });

    const fields = config?.fields || [];

    const formatDate = (timestamp) => {
        if (!timestamp) return "—";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <AdminLayout activeTab="registrations">
            {/* Options Summary */}
            {options.length > 0 && (
                <div className="options-summary">
                    <h2 className="summary-title">Podsumowanie miejsc</h2>
                    <div className="summary-cards">
                        {options.map((opt) => {
                            const taken = opt.totalSpots - opt.spotsLeft;
                            const pct = opt.totalSpots > 0 ? (taken / opt.totalSpots) * 100 : 0;
                            return (
                                <div key={opt.id} className="summary-card">
                                    <span className="summary-name">{opt.name}</span>
                                    <div className="summary-bar-track">
                                        <div
                                            className={`summary-bar-fill ${pct >= 90 ? "critical" : pct >= 60 ? "warning" : ""}`}
                                            style={{ width: `${pct}%` }}
                                        ></div>
                                    </div>
                                    <span className="summary-numbers">
                                        <strong>{taken}</strong> / {opt.totalSpots} zajętych
                                        <span className="summary-left">(zostało {opt.spotsLeft})</span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="admin-error">⚠️ Błąd ładowania zgłoszeń: {error}</div>
            )}

            {/* Loading */}
            {loading && (
                <div className="admin-loading">
                    <div className="spinner"></div>
                    <span>Ładowanie zgłoszeń...</span>
                </div>
            )}

            {/* Empty */}
            {!loading && !error && registrations.length === 0 && (
                <div className="admin-empty">
                    <span className="empty-icon">📭</span>
                    <p>Brak zgłoszeń.</p>
                </div>
            )}

            {/* Table */}
            {!loading && !error && registrations.length > 0 && (
                <>
                    <p className="config-fields-label" style={{ marginBottom: "0.75rem" }}>
                        Zgłoszenia ({registrations.length})
                    </p>
                    <div className="table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    {fields.map((field) => (
                                        <th key={field.id}>{field.label}</th>
                                    ))}
                                    <th>Wybrana opcja</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.map((reg, index) => (
                                    <tr key={reg.id}>
                                        <td className="cell-num">{index + 1}</td>
                                        {fields.map((field) => (
                                            <td key={field.id}>
                                                {field.type === "email" ? (
                                                    <a href={`mailto:${reg[field.id] || ""}`}>
                                                        {reg[field.id] || "—"}
                                                    </a>
                                                ) : field.type === "tel" ? (
                                                    <a href={`tel:${reg[field.id] || ""}`}>
                                                        {reg[field.id] || "—"}
                                                    </a>
                                                ) : (
                                                    reg[field.id] || "—"
                                                )}
                                            </td>
                                        ))}
                                        <td className="cell-options">
                                            {reg.selectedOptions && reg.selectedOptions.length > 0 ? (
                                                <div className="option-tags">
                                                    {reg.selectedOptions.map((optId) => (
                                                        <span key={optId} className="option-tag">
                                                            {optionNameMap[optId] || optId}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="no-options">Brak</span>
                                            )}
                                        </td>
                                        <td className="cell-date">{formatDate(reg.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
