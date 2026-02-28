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
            setFormError("Please fill in your first and last name.");
            return;
        }
        if (!formData.email.trim()) {
            setFormError("Please provide your email address.");
            return;
        }
        if (!formData.phone.trim()) {
            setFormError("Please provide your phone number.");
            return;
        }
        if (selectedOptions.length === 0) {
            setFormError("Please select at least one option.");
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
                    <h2>Registration Successful!</h2>
                    <p>Thank you, {formData.firstName}! Your registration has been submitted.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setSubmitted(false);
                            setFormData({ firstName: "", lastName: "", email: "", phone: "" });
                            setSelectedOptions([]);
                        }}
                    >
                        Submit Another Response
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="form-container">
            <div className="form-card">
                <div className="form-header">
                    <h1>Registration Form</h1>
                    <p className="form-subtitle">Fill in your details and choose your options</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Personal Info */}
                    <div className="form-section">
                        <h2 className="section-title">
                            <span className="section-icon">👤</span>
                            Personal Information
                        </h2>

                        <div className="fields-grid">
                            <div className="field-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    placeholder="Enter your first name"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="field-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    placeholder="Enter your last name"
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
                            <label htmlFor="phone">Phone Number</label>
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
                            Choose Your Options
                        </h2>
                        <p className="section-description">
                            Select the options you'd like to register for. Spots are limited!
                        </p>

                        {loading && (
                            <div className="options-loading">
                                <div className="spinner"></div>
                                <span>Loading available options...</span>
                            </div>
                        )}

                        {error && (
                            <div className="options-error">
                                Failed to load options: {error}
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
                                                        ? "FULL"
                                                        : `${option.spotsLeft} spot${option.spotsLeft !== 1 ? "s" : ""
                                                        } available`}
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
                                Submitting...
                            </>
                        ) : (
                            "Submit Registration"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
