import { useState } from 'react';
import axios from 'axios';
import './Auth.css';
import './Auth_adapt.css';

const API_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:3001';

export default function Login({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Validation fileds rules:
  const validateField = (name, value) => {
    switch (name) {
      case 'login':
        if (!value || value.trim() === '') {
          return 'Login jest wymagany';
        } else if (value.length < 3) {
          return 'Login musi mieć co najmniej 3 znaki';
        } else if (value.length > 30) {
          return 'Login nie może przekraczać 30 znaków';
        }
        return null;
        
      case 'password':
        if (!value || value.trim() === '') {
          return 'Hasło jest wymagane';
        } else if (value.length < 6) {
          return 'Hasło musi mieć co najmniej 6 znaków';
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
    
    setError('');

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
      password: true
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
      //Clear validation
      setError('');

      try {
        const response = await axios.post(`${API_URL}/login`, formData);
        const { token, user } = response.data;

        // Zapisujemy token w localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Ustawiamy nagłówek dla przyszłych żądań
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        onLogin(user);
      } catch (error) {
        setError(error.response?.data?.error || 'Błąd logowania');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Logowanie</h2>
        {error && <div className="error-message">{error}</div>}
        
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
              maxLength="30"
              placeholder="Wprowadź swój login (3-30 znaków)"
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
              placeholder="Wprowadź swoje hasło (min. 6 znaków)"
            />
            {renderFieldError('password')}
          </div>
          
          <button 
            type="submit" 
            className="btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? 'Logowanie...' : 'Zaloguj'}
          </button>
        </form>
        
        <div className="auth-switch">
          <p>Nie masz jeszcze konta? 
            <button onClick={onSwitchToRegister} className="link-btn">
              Zarejestruj się
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}