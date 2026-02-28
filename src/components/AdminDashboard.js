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
                        <h1>Registrations</h1>
                        <p className="admin-subtitle">
                            {loading
                                ? "Loading..."
                                : `${registrations.length} total registration${registrations.length !== 1 ? "s" : ""
                                }`}
                        </p>
                    </div>
                    <a href="/" className="btn btn-back">
                        ← Back to Form
                    </a>
                </div>

                {/* Options Summary */}
                {options.length > 0 && (
                    <div className="options-summary">
                        <h2 className="summary-title">Spots Overview</h2>
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
                                            <strong>{taken}</strong> / {opt.totalSpots} taken
                                            <span className="summary-left">
                                                ({opt.spotsLeft} left)
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
                        ⚠️ Error loading registrations: {error}
                        <br />
                        <small>
                            Make sure Firestore rules allow reading registrations for this
                            page.
                        </small>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="admin-loading">
                        <div className="spinner"></div>
                        <span>Loading registrations...</span>
                    </div>
                )}

                {/* Table */}
                {!loading && !error && registrations.length === 0 && (
                    <div className="admin-empty">
                        <span className="empty-icon">📭</span>
                        <p>No registrations yet.</p>
                    </div>
                )}

                {!loading && !error && registrations.length > 0 && (
                    <div className="table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Selected Options</th>
                                    <th>Date</th>
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
                                                <span className="no-options">None</span>
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
