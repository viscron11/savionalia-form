import { useState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useOptions } from "../hooks/useOptions";
import { useFormConfig } from "../hooks/useFormConfig";
import { submitRegistration } from "../services/submitRegistration";
import "./RegistrationForm.css";

// Replace with your invisible reCAPTCHA v2 site key
const RECAPTCHA_SITE_KEY = "6Lewz3osAAAAAOmsNbVOzHjtAjY2BREeS1T4n4Hi";

export default function RegistrationForm() {
    const { options, loading: optionsLoading, error: optionsError } = useOptions();
    const { config, loading: configLoading, error: configError } = useFormConfig();

    const [formData, setFormData] = useState({});
    const [selectedOption, setSelectedOption] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState(null);
    const captchaRef = useRef(null);

    // Initialize formData when config loads
    useEffect(() => {
        if (config && config.fields) {
            const initial = {};
            config.fields.forEach((field) => {
                initial[field.id] = "";
            });
            setFormData(initial);
        }
    }, [config]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOptionSelect = (optionId) => {
        setSelectedOption(optionId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!config || !config.fields) return;

        // Validate required fields
        for (const field of config.fields) {
            if (field.required && !formData[field.id]?.trim()) {
                setFormError(`Proszę wypełnić pole "${field.label}".`);
                return;
            }
        }

        if (!selectedOption) {
            setFormError("Proszę wybrać warsztat.");
            return;
        }

        // Trigger invisible reCAPTCHA — submission continues in onCaptchaChange
        captchaRef.current.execute();
    };

    const onCaptchaChange = async (token) => {
        if (!token) return;

        setSubmitting(true);

        try {
            await submitRegistration(formData, [selectedOption]);
            setSubmitted(true);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
            captchaRef.current.reset();
        }
    };

    const loading = configLoading || optionsLoading;
    const error = configError || optionsError;

    // Loading state
    if (loading) {
        return (
            <div className="form-container">
                <div className="form-card" style={{ textAlign: "center", padding: "3rem" }}>
                    <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
                    <p style={{ color: "#8a8580" }}>Ładowanie formularza...</p>
                </div>
            </div>
        );
    }

    // Config error
    if (configError) {
        return (
            <div className="form-container">
                <div className="form-card">
                    <div className="options-error">
                        Nie udało się załadować formularza: {configError}
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (submitted) {
        const displayName = config.fields?.[0]
            ? formData[config.fields[0].id]
            : "";

        return (
            <div className="form-container">
                <div className="success-card">
                    <div className="success-icon">✓</div>
                    <h2>Rejestracja zakończona!</h2>
                    <p>
                        Dziękujemy{displayName ? `, ${displayName}` : ""}! Twoje zgłoszenie
                        zostało wysłane.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setSubmitted(false);
                            const initial = {};
                            config.fields.forEach((f) => (initial[f.id] = ""));
                            setFormData(initial);
                            setSelectedOption(null);
                        }}
                    >
                        Wyślij kolejne zgłoszenie
                    </button>
                </div>
            </div>
        );
    }

    // Group fields: consecutive halfWidth fields are paired
    const fieldRows = [];
    const fields = config.fields || [];
    let i = 0;
    while (i < fields.length) {
        if (
            fields[i].halfWidth &&
            i + 1 < fields.length &&
            fields[i + 1].halfWidth
        ) {
            fieldRows.push([fields[i], fields[i + 1]]);
            i += 2;
        } else {
            fieldRows.push([fields[i]]);
            i += 1;
        }
    }

    return (
        <div className="form-container">
            <div className="form-card">
                <div className="form-header">
                    <h1>{config.title || "Formularz rejestracji"}</h1>
                    {config.subtitle && (
                        <p className="form-subtitle">{config.subtitle}</p>
                    )}
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Dynamic Fields */}
                    <div className="form-section">
                        <h2 className="section-title">
                            <span className="section-icon">👤</span>
                            Dane osobowe
                        </h2>

                        {fieldRows.map((row, rowIndex) => {
                            if (row.length === 2) {
                                return (
                                    <div className="fields-grid" key={rowIndex}>
                                        {row.map((field) => (
                                            <div className="field-group" key={field.id}>
                                                <label htmlFor={field.id}>{field.label}</label>
                                                <input
                                                    id={field.id}
                                                    name={field.id}
                                                    type={field.type || "text"}
                                                    placeholder={field.placeholder || ""}
                                                    value={formData[field.id] || ""}
                                                    onChange={handleInputChange}
                                                    required={field.required}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                            const field = row[0];
                            return (
                                <div className="field-group" key={field.id}>
                                    <label htmlFor={field.id}>{field.label}</label>
                                    <input
                                        id={field.id}
                                        name={field.id}
                                        type={field.type || "text"}
                                        placeholder={field.placeholder || ""}
                                        value={formData[field.id] || ""}
                                        onChange={handleInputChange}
                                        required={field.required}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Options Checklist */}
                    <div className="form-section">
                        <h2 className="section-title">
                            <span className="section-icon">📋</span>
                            Wybierz opcje
                        </h2>
                        <p className="section-description">
                            Wybierz opcje, na które chcesz się zapisać. Liczba miejsc jest
                            ograniczona!
                        </p>

                        {optionsError && (
                            <div className="options-error">
                                Nie udało się załadować opcji: {optionsError}
                            </div>
                        )}

                        {!optionsError && (
                            <div className="options-list">
                                {options.map((option) => {
                                    const isFull = option.spotsLeft <= 0;
                                    const isSelected = selectedOption === option.id;
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
                                                    type="radio"
                                                    name="workshop"
                                                    checked={isSelected}
                                                    disabled={isFull}
                                                    onChange={() => handleOptionSelect(option.id)}
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
                                                        : `${option.spotsLeft} ${option.spotsLeft === 1
                                                            ? "miejsce"
                                                            : option.spotsLeft < 5
                                                                ? "miejsca"
                                                                : "miejsc"
                                                        }`}
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

                    {/* Invisible reCAPTCHA */}
                    <ReCAPTCHA
                        ref={captchaRef}
                        sitekey={RECAPTCHA_SITE_KEY}
                        size="invisible"
                        onChange={onCaptchaChange}
                    />

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
