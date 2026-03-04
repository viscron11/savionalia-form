import { useAuth } from "../hooks/useAuth";
import "./AdminDashboard.css";

/**
 * Wraps admin pages with authentication gating and tab navigation.
 * Shows login screen if not authenticated, access denied if not admin.
 */
export default function AdminLayout({ children, activeTab }) {
    const { user, isAdmin, loading, error, login, logout } = useAuth();

    // Loading
    if (loading) {
        return (
            <div className="admin-container">
                <div className="admin-card" style={{ textAlign: "center", padding: "3rem" }}>
                    <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
                    <p style={{ color: "#8a8580" }}>Sprawdzanie uprawnień...</p>
                </div>
            </div>
        );
    }

    // Not logged in
    if (!user) {
        return (
            <div className="admin-container">
                <div className="login-card">
                    <div className="login-icon">🔒</div>
                    <h2>Panel administracyjny</h2>
                    <p>Zaloguj się kontem Google, aby uzyskać dostęp.</p>
                    {error && <div className="login-error">{error}</div>}
                    <button className="btn btn-google" onClick={login}>
                        <svg viewBox="0 0 24 24" width="18" height="18" className="google-icon">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Zaloguj się przez Google
                    </button>
                    <a href="#/" className="login-back-link">← Wróć do formularza</a>
                </div>
            </div>
        );
    }

    // Not admin
    if (!isAdmin) {
        return (
            <div className="admin-container">
                <div className="login-card">
                    <div className="login-icon">⛔</div>
                    <h2>Brak dostępu</h2>
                    <p>Konto <strong>{user.email}</strong> nie ma uprawnień administratora.</p>
                    <button className="btn btn-secondary" onClick={logout}>Wyloguj się</button>
                    <a href="#/" className="login-back-link">← Wróć do formularza</a>
                </div>
            </div>
        );
    }

    // Admin — show layout with tabs
    return (
        <div className="admin-container">
            <div className="admin-card">
                <div className="admin-header">
                    <div>
                        <h1>Panel administracyjny</h1>
                        <p className="admin-subtitle">Zalogowano jako {user.email}</p>
                    </div>
                    <div className="header-actions">
                        <a href="#/" className="btn btn-back">← Formularz</a>
                        <button className="btn btn-back" onClick={logout}>Wyloguj</button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="admin-tabs">
                    <a
                        href="#/admin"
                        className={`admin-tab ${activeTab === "registrations" ? "active" : ""}`}
                    >
                        📋 Zgłoszenia
                    </a>
                    <a
                        href="#/admin/config"
                        className={`admin-tab ${activeTab === "config" ? "active" : ""}`}
                    >
                        ⚙️ Konfiguracja
                    </a>
                </div>

                {children}
            </div>
        </div>
    );
}
