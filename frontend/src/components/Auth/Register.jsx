import { useState } from 'react';
import axios from 'axios';
import './Auth.css';
import './Auth_adapt.css';
import '../Validation.css';

const API_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:3001';

export default function Register({ onRegister, onSwitchToLogin, onError }) {
    const [formData, setFormData] = useState({
        login: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});

    // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validation fileds rules:
    const validateField = (name, value) => {
        switch (name) {
            case 'login':
                if (!value || value.trim() === '') {
                    return 'Email jest wymagany';
                } else if (!validateEmail(value)) {
                    return 'Proszę wprowadzić poprawny adres email';
                } else if (value.length > 100) {
                    return 'Email nie może przekraczać 100 znaków';
                }
                return null;
                
            case 'password':
                if (!value || value.trim() === '') {
                    return 'Hasło jest wymagane';
                } else if (value.length < 6) {
                    return 'Hasło musi mieć co najmniej 6 znaków';
                } else if (value.length > 50) {
                    return 'Hasło nie może przekraczać 50 znaków';
                }
                return null;
                
            case 'confirmPassword':
                if (!value || value.trim() === '') {
                    return 'Potwierdzenie hasła jest wymagane';
                } else if (value !== formData.password) {
                    return 'Hasła nie są zgodne';
                }
                return null;
                
            default:
                return null;
        }
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Real-time validation (touched)
        if (touchedFields[name]) {
            const error = validateField(name, value);
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                if (error) {
                    newErrors[name] = error;
                } else {
                    delete newErrors[name];
                }
                return newErrors;
            });
        }
    };

    // Validate field on blur
    const handleFieldBlurError = (field) => {
        setTouchedFields(prev => ({
            ...prev,
            [field]: true
        }));

        const error = validateField(field, formData[field]);
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[field] = error;
            } else {
                delete newErrors[field];
            }
            return newErrors;
        });
    };

    // Field error rendering
    const renderFieldError = (field) => {
        if (validationErrors[field] && touchedFields[field]) {
            return <div className="field-error">{validationErrors[field]}</div>;
        }
        return null;
    };

    // error class for field
    const getFieldClassName = (field) => {
        return validationErrors[field] && touchedFields[field] ? 'error' : '';
    };
    
    // Check form before submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Mark all fields as touched
        const allTouched = {
            login: true,
            password: true,
            confirmPassword: true
        };
        setTouchedFields(allTouched);
        
        // Validate all fields
        const errors = {};
        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                errors[field] = error;
            }
        });
        
        setValidationErrors(errors);
        
        // If no errors:
        if (Object.keys(errors).length === 0) {
            setLoading(true);

            try {
                const response = await axios.post(`${API_URL}/register`, {
                    login: formData.login,
                    password: formData.password
                });
                
                alert('Rejestracja udana! Teraz zaloguj się do systemu.');
                onSwitchToLogin();
            } catch (error) {
                const errorMsg = error.response?.data?.message || 'Błąd rejestracji';
                
                // Send critical errors to global handler
                if (error.response?.status === 500 || error.response?.status >= 400) {
                    onError(errorMsg);
                } else {
                    // Network errors
                    onError('Problem z połączeniem. Spróbuj ponownie.');
                }
            } finally {
                setLoading(false);
            }
        }
    };

    // Check if there are any errors
    const hasValidationErrors = () => {
        return Object.values(validationErrors).some(error => error !== null);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Rejestracja</h2>
                
                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="form-group">
                        <label>Login: *</label>
                        <input
                            type="text"
                            name="login"
                            value={formData.login}
                            onChange={handleFieldChange}
                            onBlur={() => handleFieldBlurError('login')}
                            required
                            minLength="3"
                            placeholder="Wprowadź login (3-30 znaków)"
                            maxLength="30"
                            className={getFieldClassName('login')}
                        />
                        {renderFieldError('login')}
                    </div>
                    
                    <div className="form-group">
                        <label>Hasło: *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleFieldChange}
                            onBlur={() => handleFieldBlurError('password')}
                            required
                            minLength="6"
                            maxLength="50"
                            placeholder="Wprowadź hasło (minimum 6 znaków)"
                            className={getFieldClassName('password')}
                        />
                        {renderFieldError('password')}
                    </div>
                    
                    <div className="form-group">
                        <label>Potwierdzenie hasła: *</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleFieldChange}
                            onBlur={() => handleFieldBlurError('confirmPassword')}
                            required
                            placeholder="Powtórz hasło"
                            className={getFieldClassName('confirmPassword')}
                        />
                        {renderFieldError('confirmPassword')}
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn-primary auth-btn"
                        disabled={loading || hasValidationErrors()}
                    >
                        {loading ? 'Rejestracja...' : 'Zarejestruj się'}
                    </button>
                </form>
                
                <div className="auth-switch">
                    <p>Masz już konto? 
                        <button onClick={onSwitchToLogin} className="link-btn">
                            Zaloguj się
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
    