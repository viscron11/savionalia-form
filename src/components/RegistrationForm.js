import { useState } from "react";
import { useOptions } from "../hooks/useOptions";
import { submitRegistration } from "../services/submitRegistration";
import "./RegistrationForm.css";

export default function RegistrationForm() {
    const { options, loading, error } = useOptions();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    const [selectedOptions, setSelectedOptions] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOptionToggle = (optionId) => {
        setSelectedOptions((prev) =>
            prev.includes(optionId)
                ? prev.filter((id) => id !== optionId)
                : [...prev, optionId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        // Validation
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setFormError("Proszę podać imię i nazwisko.");
            return;
        }
        if (!formData.email.trim()) {
            setFormError("Proszę podać adres e-mail.");
            return;
        }
        if (!formData.phone.trim()) {
            setFormError("Proszę podać numer telefonu.");
            return;
        }
        if (selectedOptions.length === 0) {
            setFormError("Proszę wybrać przynajmniej jedną opcję.");
            return;
        }

        setSubmitting(true);

        try {
            await submitRegistration(formData, selectedOptions);
            setSubmitted(true);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="form-container">
                <div className="success-card">
                    <div className="success-icon">✓</div>
                    <h2>Rejestracja zakończona!</h2>
                    <p>Dziękujemy, {formData.firstName}! Twoje zgłoszenie zostało wysłane.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setSubmitted(false);
                            setFormData({ firstName: "", lastName: "", email: "", phone: "" });
                            setSelectedOptions([]);
                        }}
                    >
                        Wyślij kolejne zgłoszenie
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="form-container">
            <div className="form-card">
                <div className="form-header">
                    <h1>Formularz rejestracji</h1>
                    <p className="form-subtitle">Wypełnij dane i wybierz swoje opcje</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Personal Info */}
                    <div className="form-section">
                        <h2 className="section-title">
                            <span className="section-icon">👤</span>
                            Dane osobowe
                        </h2>

                        <div className="fields-grid">
                            <div className="field-group">
                                <label htmlFor="firstName">Imię</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    placeholder="Wpisz swoje imię"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="field-group">
                                <label htmlFor="lastName">Nazwisko</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    placeholder="Wpisz swoje nazwisko"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="field-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="field-group">
                            <label htmlFor="phone">Numer telefonu</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+48 123 456 789"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Options Checklist */}
                    <div className="form-section">
                        <h2 className="section-title">
                            <span className="section-icon">📋</span>
                            Wybierz opcje
                        </h2>
                        <p className="section-description">
                            Wybierz opcje, na które chcesz się zapisać. Liczba miejsc jest ograniczona!
                        </p>

                        {loading && (
                            <div className="options-loading">
                                <div className="spinner"></div>
                                <span>Ładowanie dostępnych opcji...</span>
                            </div>
                        )}

                        {error && (
                            <div className="options-error">
                                Nie udało się załadować opcji: {error}
                            </div>
                        )}

                        {!loading && !error && (
                            <div className="options-list">
                                {options.map((option) => {
                                    const isFull = option.spotsLeft <= 0;
                                    const isSelected = selectedOptions.includes(option.id);
                                    const spotsPercent =
                                        option.totalSpots > 0
                                            ? (option.spotsLeft / option.totalSpots) * 100
                                            : 0;

                                    return (
                                        <label
                                            key={option.id}
                                            className={`option-card ${isSelected ? "selected" : ""} ${isFull ? "full" : ""
                                                }`}
                                        >
                                            <div className="option-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    disabled={isFull && !isSelected}
                                                    onChange={() => handleOptionToggle(option.id)}
                                                />
                                                <span className="checkmark"></span>
                                            </div>

                                            <div className="option-info">
                                                <span className="option-name">{option.name}</span>
                                                <div className="spots-bar-container">
                                                    <div
                                                        className={`spots-bar ${spotsPercent <= 20
                                                            ? "critical"
                                                            : spotsPercent <= 50
                                                                ? "warning"
                                                                : ""
                                                            }`}
                                                        style={{ width: `${spotsPercent}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="spots-badge-wrapper">
                                                <span
                                                    className={`spots-badge ${isFull
                                                        ? "badge-full"
                                                        : option.spotsLeft <= 5
                                                            ? "badge-critical"
                                                            : option.spotsLeft <= 10
                                                                ? "badge-warning"
                                                                : ""
                                                        }`}
                                                >
                                                    {isFull
                                                        ? "BRAK MIEJSC"
                                                        : `${option.spotsLeft} ${option.spotsLeft === 1 ? "miejsce" : option.spotsLeft < 5 ? "miejsca" : "miejsc"}`}
                                                </span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {formError && (
                        <div className="form-error" role="alert">
                            <span className="error-icon">⚠️</span>
                            {formError}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-submit"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="btn-spinner"></span>
                                Wysyłanie...
                            </>
                        ) : (
                            "Wyślij zgłoszenie"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
