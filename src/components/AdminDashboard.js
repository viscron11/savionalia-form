import { useRegistrations } from "../hooks/useRegistrations";
import { useOptions } from "../hooks/useOptions";
import "./AdminDashboard.css";

export default function AdminDashboard() {
    const { registrations, loading, error } = useRegistrations();
    const { options } = useOptions();

    // Build a map of option IDs → names for display
    const optionNameMap = {};
    options.forEach((opt) => {
        optionNameMap[opt.id] = opt.name;
    });

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
        <div className="admin-container">
            <div className="admin-card">
                <div className="admin-header">
                    <div>
                        <h1>Zgłoszenia</h1>
                        <p className="admin-subtitle">
                            {loading
                                ? "Ładowanie..."
                                : `${registrations.length} ${registrations.length === 1 ? "zgłoszenie" : registrations.length < 5 ? "zgłoszenia" : "zgłoszeń"}`}
                        </p>
                    </div>
                    <a href="/" className="btn btn-back">
                        ← Wróć do formularza
                    </a>
                </div>

                {/* Options Summary */}
                {options.length > 0 && (
                    <div className="options-summary">
                        <h2 className="summary-title">Podsumowanie miejsc</h2>
                        <div className="summary-cards">
                            {options.map((opt) => {
                                const taken = opt.totalSpots - opt.spotsLeft;
                                const pct =
                                    opt.totalSpots > 0
                                        ? (taken / opt.totalSpots) * 100
                                        : 0;
                                return (
                                    <div key={opt.id} className="summary-card">
                                        <span className="summary-name">{opt.name}</span>
                                        <div className="summary-bar-track">
                                            <div
                                                className={`summary-bar-fill ${pct >= 90 ? "critical" : pct >= 60 ? "warning" : ""
                                                    }`}
                                                style={{ width: `${pct}%` }}
                                            ></div>
                                        </div>
                                        <span className="summary-numbers">
                                            <strong>{taken}</strong> / {opt.totalSpots} zajętych
                                            <span className="summary-left">
                                                (zostało {opt.spotsLeft})
                                            </span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="admin-error">
                        ⚠️ Błąd ładowania zgłoszeń: {error}
                        <br />
                        <small>
                            Upewnij się, że reguły Firestore pozwalają na odczyt zgłoszeń.
                        </small>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="admin-loading">
                        <div className="spinner"></div>
                        <span>Ładowanie zgłoszeń...</span>
                    </div>
                )}

                {/* Table */}
                {!loading && !error && registrations.length === 0 && (
                    <div className="admin-empty">
                        <span className="empty-icon">📭</span>
                        <p>Brak zgłoszeń.</p>
                    </div>
                )}

                {!loading && !error && registrations.length > 0 && (
                    <div className="table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Imię i nazwisko</th>
                                    <th>E-mail</th>
                                    <th>Telefon</th>
                                    <th>Wybrane opcje</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.map((reg, index) => (
                                    <tr key={reg.id}>
                                        <td className="cell-num">{index + 1}</td>
                                        <td className="cell-name">
                                            {reg.firstName} {reg.lastName}
                                        </td>
                                        <td className="cell-email">
                                            <a href={`mailto:${reg.email}`}>{reg.email}</a>
                                        </td>
                                        <td className="cell-phone">
                                            <a href={`tel:${reg.phone}`}>{reg.phone}</a>
                                        </td>
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
                )}
            </div>
        </div>
    );
}
