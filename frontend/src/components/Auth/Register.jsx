import { useState } from 'react';
import axios from 'axios';
import './Auth.css';
import './Auth_adapt.css';


const API_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:3001';

export default function Register({ onRegister, onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        login: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});

    // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validation rules:
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Hasła nie są zgodne');
            return;
        }

        if (formData.password.length < 6) {
            setError('Hasło musi zawierać co najmniej 6 znaków');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/register`, {
                login: formData.login,
                password: formData.password
            });
            
            alert('Rejestracja udana! Teraz zaloguj się do systemu.');
            onSwitchToLogin();
        } catch (error) {
            setError(error.response?.data?.error || 'Błąd rejestracji');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Rejestracja</h2>
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Login:</label>
                        <input
                            type="text"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            required
                            minLength="3"
                            placeholder="Wprowadź login (minimum 3 znaki)"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Hasło:</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                            placeholder="Wprowadź hasło (minimum 6 znaków)"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Potwierdzenie hasła:</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Powtórz hasło"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn-primary auth-btn"
                        disabled={loading}
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
    